import { useState } from 'react';
import { ArrowLeft, Loader2, LockKeyhole, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
import { signInWithGoogle } from '../firebaseClient';

export default function AuthGate({ onBack }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    try {
      const signInPromise = signInWithGoogle();
      setIsAuthenticating(true);
      await signInPromise;
    } catch (error) {
      console.error('Google login failed:', error);
      setErrorMsg(error.message || 'Google Sign-In failed. Please try again.');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5ef]">
      <header className="border-b border-primary/10 bg-[#f4f5ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary shadow-sm transition hover:border-primary/25 hover:bg-primary hover:text-white active:scale-[0.98]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-dark">Secure sign in</p>
            <h1 className="text-lg font-black text-gray-950">SSPM Market</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-65px)] max-w-5xl items-center gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_420px] lg:px-8">
        <section className="hidden md:block">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/15">
            <ShoppingBag size={26} />
          </div>
          <h2 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-gray-950">
            A cleaner way to trade with students on your own campus.
          </h2>
          <p className="mt-4 max-w-lg text-base font-medium leading-7 text-gray-600">
            Sign in once, complete your student profile, then contact sellers or post your own listings with verified campus identity.
          </p>
          <div className="mt-6 grid max-w-lg grid-cols-2 gap-3">
            <div className="market-card rounded-lg p-4">
              <ShieldCheck size={22} className="text-primary" />
              <p className="mt-3 text-sm font-black text-gray-950">Verified profiles</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">Student details stay attached to every listing.</p>
            </div>
            <div className="market-card rounded-lg p-4">
              <Users size={22} className="text-primary" />
              <p className="mt-3 text-sm font-black text-gray-950">Campus handoffs</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">Meet at library, canteen, hostel gate, or department.</p>
            </div>
          </div>
        </section>

        <section className="market-card rounded-lg p-5 sm:p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-accent-light text-accent-dark">
              <LockKeyhole size={25} />
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-950">Continue to SSPM Market</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
              Use Google sign-in to verify your account and keep trading limited to SSPM students.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 animate-fade-in">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-primary/10 bg-white px-4 py-3.5 text-sm font-black text-gray-800 shadow-sm transition hover:border-primary/25 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60"
          >
            {isAuthenticating ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isAuthenticating ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="mt-5 rounded-lg border border-primary/10 bg-accent-light p-4">
            <div className="flex gap-3">
              <ShieldCheck size={19} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-sm font-medium leading-6 text-primary/75">
                No marketplace password is stored. Google handles authentication and SSPM Market stores only your trading profile.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
