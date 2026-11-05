import { Logo } from '@/components/Logo';
import { EcosystemDiagram } from '@/components/EcosystemDiagram';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

const LEGAL_LINKS = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Your ideas and data', href: '/ideas-and-data' },
];

export function LandingPage({ onSignUp, onSignIn }: LandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center sm:px-8">
        <div className="animate-fade-in flex w-full max-w-xl flex-col items-center">
          <Logo size="lg" />
          <h1 className="mt-8 text-3xl font-bold leading-[1.2] tracking-tight text-text sm:text-4xl">
            Build with discipline. Prove every step.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            FoundStep gives early founders structure, daily discipline and guidance.
          </p>

          <div className="mt-10 w-full">
            <EcosystemDiagram />
          </div>

          <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:flex-row sm:max-w-none sm:justify-center">
            <button onClick={onSignUp} className="btn-primary w-full sm:w-auto sm:px-8">
              Sign up
            </button>
            <button
              onClick={onSignIn}
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text shadow-sm transition-all hover:bg-bg active:scale-[0.98] sm:w-auto sm:px-8"
            >
              Sign in
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-5 py-6 sm:px-8">
        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          {LEGAL_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="font-medium text-muted hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="mt-4 text-center text-xs text-muted">
          © 2026 [COMPANY NAME]. FoundStep and the FoundStep logo are trademarks of [COMPANY NAME].
        </p>
      </footer>
    </div>
  );
}
