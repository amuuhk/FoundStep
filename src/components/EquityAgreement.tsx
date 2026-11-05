import { useState } from 'react';
import { FileSignature, Loader2, Percent } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const TERMS = [
  'FoundStep charges no monthly payment, subscription or upgrade fee to startups.',
  'FoundStep takes 5% equity in each startup it builds. This is FoundStep\'s only revenue from startups.',
  'The equity covers the structure, guidance, gate system and data FoundStep provides to take the startup to production.',
  'All numbers you enter into FoundStep are self-reported by you.',
];

interface EquityAgreementStepProps {
  onAccept: () => void;
  onBack?: () => void;
  onViewPrivacy?: () => void;
  loading: boolean;
  error: string | null;
  submitLabel: string;
}

export function EquityAgreementStep({
  onAccept,
  onBack,
  onViewPrivacy,
  loading,
  error,
  submitLabel,
}: EquityAgreementStepProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-growth/10">
          <Percent className="h-5 w-5 text-growth" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">Equity agreement</h2>
          <p className="text-sm text-muted">Please read the terms before you continue.</p>
        </div>
      </div>

      <div className="card space-y-4">
        <p className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-solid">
          No Premium. No Upgrade Fees. We grow when you grow — 5% Equity.
        </p>
        <ul className="space-y-2.5 text-sm leading-relaxed text-text">
          {TERMS.map((term) => (
            <li key={term} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-growth" />
              <span>{term}</span>
            </li>
          ))}
        </ul>
        {onViewPrivacy && (
          <p className="text-xs text-muted">
            Read how we handle your information in the{' '}
            <button type="button" onClick={onViewPrivacy} className="font-semibold text-primary hover:text-primary/90">
              privacy notice
            </button>
            .
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm leading-relaxed text-text">
          I accept the 5% equity agreement for {APP_NAME} and understand the terms above.
        </span>
      </label>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {onBack && (
          <button type="button" onClick={onBack} disabled={loading} className="btn-secondary w-full sm:w-auto">
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onAccept}
          disabled={!agreed || loading}
          className="btn-primary w-full flex-1"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
