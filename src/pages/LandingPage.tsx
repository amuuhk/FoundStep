import { ArrowRight, Check, MessageCircle, ShieldCheck, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { APP_NAME } from '@/lib/constants';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const steps = [
  {
    icon: Target,
    number: '01',
    title: 'Choose your next gate',
    description: 'Know exactly what proof your business needs next, without guesswork or noise.',
  },
  {
    icon: MessageCircle,
    number: '02',
    title: 'Talk through the work',
    description: 'Keep notes on every customer conversation so real learning becomes momentum.',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Log the numbers',
    description: 'Track daily wins, losses, customers, revenue, and costs so progress becomes visible.',
  },
];

const promises = [
  'A clear path from idea to earning',
  'Coach support when the next move feels unclear',
  'Progress gates based on real business proof',
  'Daily structure that keeps you moving',
];

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaf7] text-neutral-900">
      <header className="relative z-10 border-b border-neutral-900/10 bg-[#fbfaf7]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <button onClick={onSignIn} className="hidden rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-900/5 sm:inline-flex">
              Sign in
            </button>
            <button onClick={onGetStarted} className="rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-800">
              Start building
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-neutral-900/10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_15%,rgba(238,109,39,0.16),transparent_31%),radial-gradient(circle_at_10%_80%,rgba(18,92,121,0.11),transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-28">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-300/70 bg-orange-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-800">
                <Sparkles className="h-3.5 w-3.5" />
                Built for founders in motion
              </div>
              <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.055em] text-neutral-950 sm:text-6xl lg:text-7xl">
                Build your business with <span className="text-orange-600">proof, not pressure.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-600 sm:text-xl">
                {APP_NAME} gives ambitious founders a clear path, a private workspace, and the daily structure to turn an idea into a business that earns.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={onGetStarted} className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-neutral-950/15 transition-all hover:-translate-y-1 hover:bg-neutral-800">
                  Start your founder journey
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={onSignIn} className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white/70 px-6 py-3.5 text-sm font-bold text-neutral-800 transition-colors hover:border-neutral-500 hover:bg-white">
                  I already have an account
                </button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-700" /> Founder-first</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-700" /> Start free</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-700" /> Built for real numbers</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
              <div className="absolute -inset-5 rounded-[38px] bg-orange-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[30px] border border-neutral-900/10 bg-neutral-950 p-3 shadow-2xl shadow-neutral-950/20">
                <div className="rounded-[22px] border border-white/10 bg-[#f3f1eb] p-5 sm:p-7">
                  <div className="flex items-center justify-between border-b border-neutral-900/10 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Your next proof</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950">Gate 0: Idea</h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                      <Target className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">Customer conversations</p>
                        <p className="mt-1 text-xs text-neutral-500">Have 10 real conversations</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">6<span className="text-sm text-neutral-400">/10</span></p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full w-[60%] rounded-full bg-orange-500" /></div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-[#dcefe8] p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white"><Target className="h-4 w-4" /></div>
                      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-900">Self-reported</p><p className="mt-1 text-sm leading-6 text-teal-950">Every number here is entered by the founder. FoundStep shows your own progress back to you.</p></div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs font-semibold text-neutral-500"><span>Daily discipline</span><span className="text-teal-700">On track</span></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">A simpler operating system</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-5xl">Less noise. More proof that your business is moving.</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return <div key={step.number} className="group rounded-3xl border border-neutral-900/10 bg-white p-7 transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-950/5">
                <div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f2f0] text-teal-800"><Icon className="h-5 w-5" /></div><span className="text-sm font-bold text-neutral-300">{step.number}</span></div>
                <h3 className="mt-8 text-xl font-bold tracking-tight text-neutral-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{step.description}</p>
              </div>;
            })}
          </div>
        </section>

        <section className="border-y border-neutral-900/10 bg-[#103f4c] text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12 lg:py-24">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Designed for the long game</p><h2 className="mt-4 max-w-lg text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">Your business deserves a system that keeps showing up.</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">{promises.map((promise) => <div key={promise} className="flex gap-3 rounded-2xl border border-white/15 bg-white/5 p-4"><Check className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" /><span className="text-sm leading-6 text-teal-50">{promise}</span></div>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Start where you are</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-5xl">Clarity for today. Momentum for what comes next.</h2>
          <button onClick={onGetStarted} className="group mt-8 inline-flex items-center gap-2 rounded-full bg-orange-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-orange-600/20 transition-all hover:-translate-y-1 hover:bg-orange-700">Create your founder account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
        </section>
      </main>

      <footer className="border-t border-neutral-900/10 px-5 py-7 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row"><Logo size="sm" /><p className="text-xs text-neutral-500">{APP_NAME} — Founders sell. We do the structure.</p></div></footer>
    </div>
  );
}
