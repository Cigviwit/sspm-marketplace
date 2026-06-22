import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';

const DEFAULT_PATHS = ['/', '/feed/', '/detail/', '/auth-gate/', '/onboarding/', '/sell/', '/profile/'];
const baseUrl = process.argv[2] || 'http://127.0.0.1:4174';
const iterations = Number(process.env.PAGE_LOAD_ITERATIONS || 7);
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9222;
const debugOrigin = `http://127.0.0.1:${debugPort}`;

if (typeof WebSocket === 'undefined') {
  throw new Error('This benchmark requires a Node runtime with global WebSocket support.');
}

async function waitForHttp(url, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return;
    } catch {
      // Retry until the preview server or Chrome debug endpoint is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function connectDebugger(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  ws.addEventListener('message', async (event) => {
    const data = typeof event.data === 'string' ? event.data : await event.data.text();
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message}: ${msg.error.data || ''}`));
      else resolve(msg.result || {});
      return;
    }

    const callbacks = listeners.get(msg.method);
    if (callbacks) {
      for (const callback of callbacks) callback(msg.params || {});
    }
  });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out connecting to ${wsUrl}`)), 5_000);
    ws.addEventListener('open', () => {
      clearTimeout(timer);
      const client = {
        send(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveCommand, rejectCommand) => {
            const timer = setTimeout(() => {
              pending.delete(id);
              rejectCommand(new Error(`Timed out waiting for ${method}`));
            }, 5_000);
            pending.set(id, {
              resolve: (value) => {
                clearTimeout(timer);
                resolveCommand(value);
              },
              reject: (error) => {
                clearTimeout(timer);
                rejectCommand(error);
              },
            });
          });
        },
        once(method, timeoutMs = 5_000) {
          return new Promise((resolveEvent) => {
            const timer = setTimeout(() => {
              listeners.set(method, (listeners.get(method) || []).filter((item) => item !== callback));
              resolveEvent(null);
            }, timeoutMs);
            const callback = (params) => {
              clearTimeout(timer);
              listeners.set(method, (listeners.get(method) || []).filter((item) => item !== callback));
              resolveEvent(params);
            };
            listeners.set(method, [...(listeners.get(method) || []), callback]);
          });
        },
        close() {
          ws.close();
        },
      };
      resolve(client);
    });
    ws.addEventListener('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function measurePath(path) {
  const samples = [];

  for (let i = 0; i < iterations; i += 1) {
    const newTargetResponse = await fetch(`${debugOrigin}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
    const target = await newTargetResponse.json();
    const client = await connectDebugger(target.webSocketDebuggerUrl.replace('localhost', '127.0.0.1'));

    await client.send('Page.enable');
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });

    try {
      const loadEvent = client.once('Page.loadEventFired');
      const start = performance.now();
      await client.send('Page.navigate', { url: `${baseUrl}${path}` });
      const loaded = await loadEvent;
      if (!loaded) throw new Error(`Timed out waiting for load event on ${path}`);
      const wallMs = performance.now() - start;
      const evalResult = await client.send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          return {
            duration: nav ? nav.duration : performance.now(),
            domContentLoaded: nav ? nav.domContentLoadedEventEnd : 0,
            loadEventEnd: nav ? nav.loadEventEnd : 0,
            rootChildren: document.querySelector('#root')?.children.length || 0
          };
        })()`,
      });
      samples.push({
        wallMs,
        navMs: evalResult.result.value.duration,
        dclMs: evalResult.result.value.domContentLoaded,
        rootChildren: evalResult.result.value.rootChildren,
      });
    } finally {
      client.close();
      await fetch(`${debugOrigin}/json/close/${target.id}`).catch(() => {});
    }
  }

  return samples;
}

async function warmUpBrowser() {
  const newTargetResponse = await fetch(`${debugOrigin}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
  const target = await newTargetResponse.json();
  const client = await connectDebugger(target.webSocketDebuggerUrl.replace('localhost', '127.0.0.1'));

  try {
    await client.send('Page.enable');
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    const loadEvent = client.once('Page.loadEventFired');
    await client.send('Page.navigate', { url: `${baseUrl}/` });
    await loadEvent;
  } finally {
    client.close();
    await fetch(`${debugOrigin}/json/close/${target.id}`).catch(() => {});
  }
}

function summarize(samples, field) {
  const values = samples.map((sample) => sample[field]);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    min: Math.min(...values),
    avg: sum / values.length,
    max: Math.max(...values),
  };
}

function formatMs(value) {
  return value.toFixed(2);
}

const userDataDir = await mkdtemp(join(tmpdir(), 'sspm-chrome-'));
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-sync',
  '--no-first-run',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  'about:blank',
], { stdio: 'ignore' });

try {
  await waitForHttp(`${baseUrl}/`);
  await waitForHttp(`${debugOrigin}/json/version`);
  await warmUpBrowser();

  const rows = [];
  for (const path of DEFAULT_PATHS) {
    const samples = await measurePath(path);
    const nav = summarize(samples, 'navMs');
    const wall = summarize(samples, 'wallMs');
    rows.push({
      path,
      navMinMs: formatMs(nav.min),
      navAvgMs: formatMs(nav.avg),
      navMaxMs: formatMs(nav.max),
      wallAvgMs: formatMs(wall.avg),
      rendered: samples.every((sample) => sample.rootChildren > 0),
      pass: nav.max < 50,
    });
  }

  console.table(rows);
  if (rows.some((row) => !row.pass || !row.rendered)) {
    process.exitCode = 1;
  }
} finally {
  chrome.kill();
  await new Promise((resolve) => {
    if (chrome.exitCode !== null) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, 2_000);
    chrome.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
  await rm(userDataDir, { recursive: true, force: true });
}
