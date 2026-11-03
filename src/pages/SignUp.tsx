import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { acceptEquityAgreement } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { EquityAgreementStep } from '@/components/EquityAgreement';
import { NIGERIA_STATES, APP_NAME } from '@/lib/constants';
import { Loader2, Eye, EyeOff } from 'lucide-react';

type SignUpStep = 'details' | 'agreement';

export function SignUp({
  onSuccess,
  onSignIn,
  onViewPrivacy,
}: {
  onSuccess: () => void;
  onSignIn: () => void;
  onViewPrivacy: () => void;
}) {
  const { signUp } = useAuth();
  const [step, setStep] = useState<SignUpStep>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!state) {
      setError('Please select your state.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setStep('agreement');
  };

  const handleCreateAccount = async () => {
    setError(null);
    setLoading(true);
    const { error: signUpError } = await signUp(
      email.trim(),
      password,
      fullName.trim(),
      phone.trim(),
      country,
      state,
    );

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      setStep('details');
      return;
    }

    await acceptEquityAgreement();
    onSuccess();
  };

  if (step === 'agreement') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <EquityAgreementStep
            onAccept={handleCreateAccount}
            onBack={() => setStep('details')}
            onViewPrivacy={onViewPrivacy}
            loading={loading}
            error={error}
            submitLabel="Accept and create account"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Join {APP_NAME} and start building your business step by step.
          </p>
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label className="label-text" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+234 801 234 5678"
              autoComplete="tel"
            />
            <p className="mt-1 text-xs text-neutral-400">
              Phone OTP verification: Coming soon. For now, use email login.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text" htmlFor="country">Country</label>
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field">
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
            <div>
              <label className="label-text" htmlFor="state">State</label>
              <select id="state" value={state} onChange={(e) => setState(e.target.value)} className="input-field">
                <option value="">Select...</option>
                {NIGERIA_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-text" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue to equity agreement
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <button onClick={onSignIn} className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
