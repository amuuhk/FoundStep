import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { APP_NAME } from '@/lib/constants';

export function PrivacyNotice({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-bg px-5 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="card">
          <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90">
            <ArrowLeft className="h-4 w-4" /> Back to sign up
          </button>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Privacy notice</h1>
              <p className="text-sm text-muted">How {APP_NAME} handles your information.</p>
            </div>
          </div>
          <div className="space-y-5 text-sm leading-7 text-muted">
            <section>
              <h2 className="font-semibold text-text">What we collect</h2>
              <p>We collect your account details, business profile, daily entries, gate progress, and messages you choose to save in FoundStep.</p>
            </section>
            <section>
              <h2 className="font-semibold text-text">Why we use it</h2>
              <p>We use this information to show your dashboard, calculate your self-reported progress, and keep your founder workspace working for you.</p>
            </section>
            <section>
              <h2 className="font-semibold text-text">Your responsibility</h2>
              <p>Do not enter passwords, bank details, BVN, identity numbers, or other sensitive information into notes or messages. All numbers you enter are self-reported.</p>
            </section>
            <section>
              <h2 className="font-semibold text-text">Your choices</h2>
              <p>You can stop using FoundStep at any time. Features that need a future service connection will be marked Coming soon before they are available.</p>
            </section>
            <p className="border-t border-border pt-5 text-xs text-muted">This notice is a plain-language product notice, not legal advice. {APP_NAME} will provide updated details as the product grows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
