import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SystemDiagram } from '@/components/SystemDiagram';
import { APP_NAME } from '@/lib/constants';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-primary-900">
      <header className="border-b border-primary-900/10 bg-neutral-50/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button
              onClick={onSignIn}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-900/5"
            >
              Sign In
            </button>
            <button onClick={onGetStarted} className="btn-primary px-4 py-2 text-sm">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div
            className={`transition-all duration-700 ease-out ${
              ready ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-primary-900 sm:text-5xl lg:text-6xl">
              We Build Startups To Production.{' '}
              <span className="text-secondary-700">We Take 5% Equity, Not Monthly Fees.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              {APP_NAME} brings structure, guidance and clear levels to every founder, from the first idea
              to a business that is production-ready and open to investment.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button onClick={onGetStarted} className="btn-primary group w-full sm:w-auto">
                Sign Up
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex w-full items-center justify-center rounded-xl border border-primary-200 bg-white px-5 py-3 text-sm font-semibold text-primary-900 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] sm:w-auto"
              >
                Sign In
              </button>
            </div>
          </div>

          <div
            className={`rounded-3xl bg-primary-900 p-6 shadow-xl shadow-primary-900/20 transition-all duration-700 delay-150 ease-out sm:p-10 ${
              ready ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            <SystemDiagram />
          </div>
        </div>
      </main>

      <footer className="border-t border-primary-900/10 px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-6xl text-center text-xs text-neutral-500 sm:text-left">
          {APP_NAME} — Founders sell. We do the structure.
        </p>
      </footer>
    </div>
  );
}
