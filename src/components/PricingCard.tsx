import { Check, Percent } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const POINTS = [
  'No monthly payment for startups.',
  'FoundStep takes 5% equity per startup. This is our only revenue from startups.',
  'We structure, guide and level up each business until it reaches production.',
];

export function PricingCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-growth/10">
          <Percent className="h-5 w-5 text-growth" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-primary">Pricing</h2>
          <p className="text-xs text-muted">How {APP_NAME} earns.</p>
        </div>
      </div>

      <p className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold leading-relaxed text-on-solid">
        No Premium. No Upgrade Fees. We grow when you grow — 5% Equity.
      </p>

      <ul className="space-y-2.5">
        {POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-text">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-growth" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
