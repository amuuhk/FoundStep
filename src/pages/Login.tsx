import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { APP_NAME } from '@/lib/constants';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function Login({ onSwitchToSignUp, onSuccess }: { onSwitchToSignUp: () => void; onSuccess: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Sign in to continue building with {APP_NAME}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text" htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="loginPassword">Password</label>
            <div className="relative">
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                placeholder="Your password"
                autoComplete="current-password"
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          New to {APP_NAME}?{' '}
          <button onClick={onSwitchToSignUp} className="font-semibold text-primary-600 hover:text-primary-700">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
