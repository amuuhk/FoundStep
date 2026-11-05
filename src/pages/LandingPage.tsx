import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SystemDiagram } from '@/components/SystemDiagram';
import { APP_NAME } from '@/lib/constants';

const LANDING_PHOTO_URL =
  'https://images.pexels.com/photos/7414216/pexels-photo-7414216.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

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
    <div className="flex min-h-screen flex-col bg-bg text-primary">
      <header className="border-b border-primary/10 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button
              onClick={onSignIn}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
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
            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-primary sm:text-5xl lg:text-6xl">
              We Build Startups To Production.{' '}
              <span className="text-growth">We Take 5% Equity, Not Monthly Fees.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
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
                className="inline-flex w-full items-center justify-center rounded-xl border border-primary/30 bg-surface px-5 py-3 text-sm font-semibold text-primary shadow-sm transition-all hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] sm:w-auto"
              >
                Sign In
              </button>
            </div>
          </div>

          <div
            className={`relative overflow-hidden rounded-3xl bg-primary shadow-xl shadow-primary/20 transition-all duration-700 delay-150 ease-out ${
              ready ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            <img
              src={LANDING_PHOTO_URL}
              alt="Founders planning a growing business together"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-growth/60" />
            <div className="relative p-6 sm:p-10">
              <SystemDiagram />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-primary/10 px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-6xl text-center text-xs text-muted sm:text-left">
          {APP_NAME} — Founders sell. We do the structure.
        </p>
      </footer>
    </div>
  );
}
