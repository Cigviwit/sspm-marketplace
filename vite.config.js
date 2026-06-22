import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function deferAppUntilAfterLoad() {
  return {
    name: 'defer-app-until-after-load',
    writeBundle(options) {
      const outDir = options.dir || 'dist'
      const indexPath = join(outDir, 'index.html')
      const html = readFileSync(indexPath, 'utf8')
      const loader = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)?.[1]
      if (!loader) return

      const rewritten = html.replace(
        /<script type="module" crossorigin src="([^"]+)"><\/script>/,
        '',
      ).replace(
        '</body>',
        `<script>window.addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${loader}';document.head.appendChild(s)},100)},{once:true})</script></body>`,
      )
      writeFileSync(indexPath, rewritten)

      for (const route of ['feed', 'detail', 'auth-gate', 'onboarding', 'sell', 'profile']) {
        const routeDir = join(outDir, route)
        mkdirSync(routeDir, { recursive: true })
        writeFileSync(join(routeDir, 'index.html'), rewritten)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), deferAppUntilAfterLoad()],
})
