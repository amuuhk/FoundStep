import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { APP_NAME } from '@/lib/constants';

export function PrivacyNotice({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50 px-5 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="card">
          <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-4 w-4" /> Back to sign up
          </button>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Privacy notice</h1>
              <p className="text-sm text-neutral-500">How {APP_NAME} handles your information.</p>
            </div>
          </div>
          <div className="space-y-5 text-sm leading-7 text-neutral-600">
            <section>
              <h2 className="font-semibold text-neutral-900">What we collect</h2>
              <p>We collect your account details, business profile, daily entries, gate progress, and messages you choose to save in FoundStep.</p>
            </section>
            <section>
              <h2 className="font-semibold text-neutral-900">Why we use it</h2>
              <p>We use this information to show your dashboard, calculate your self-reported progress, and keep your founder workspace working for you.</p>
            </section>
            <section>
              <h2 className="font-semibold text-neutral-900">Your responsibility</h2>
              <p>Do not enter passwords, bank details, BVN, identity numbers, or other sensitive information into notes or messages. All numbers you enter are self-reported.</p>
            </section>
            <section>
              <h2 className="font-semibold text-neutral-900">Your choices</h2>
              <p>You can stop using FoundStep at any time. Features that need a future service connection will be marked Coming soon before they are available.</p>
            </section>
            <p className="border-t border-neutral-100 pt-5 text-xs text-neutral-400">This notice is a plain-language product notice, not legal advice. {APP_NAME} will provide updated details as the product grows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
