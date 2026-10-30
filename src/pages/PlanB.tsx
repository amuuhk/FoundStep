import { AlertTriangle, RefreshCw } from 'lucide-react';
import { PLAN_B_NO_PROGRESS_DAYS } from '@/lib/constants';

interface PlanBProps {
  daysSinceProgress: number;
  onLogEntry: () => void;
}

export function PlanB({ daysSinceProgress, onLogEntry }: PlanBProps) {
  const actions = [
    'Call or message your last 5 customers. Ask what they need right now.',
    'Reach out to 10 people who showed interest but did not buy.',
    'Review your prices. Are they too high or too low for your customers?',
    'Pick one thing you sell that makes the most money. Sell more of that.',
    'Ask one customer for a referral or a review.',
    'Look at your costs. Cut one thing you do not need.',
    'Post about your product on one social media platform today.',
    'Visit where your customers are — a market, a group, a community.',
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card border-error-200 bg-error-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 shrink-0 text-error-600" />
          <div>
            <h1 className="text-lg font-bold text-error-800">Plan B is active</h1>
            <p className="mt-1 text-sm text-error-700">
              You have not logged progress for {daysSinceProgress} days.
              This is an emergency action list to help you get moving again.
            </p>
            <p className="mt-2 text-xs text-error-600">
              No automatic demotion happens. You are still at your current gate.
              But the longer you wait, the harder it gets.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Do these this week</h3>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <label
              key={i}
              className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{action}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card flex flex-col items-center gap-3 text-center">
        <RefreshCw className="h-8 w-8 text-primary-500" />
        <div>
          <p className="text-sm font-semibold text-neutral-700">Log today's entry to exit Plan B</p>
          <p className="mt-1 text-xs text-neutral-400">
            Even a LOSS counts. The point is to start moving again.
          </p>
        </div>
        <button onClick={onLogEntry} className="btn-primary text-sm">
          Log an entry now
        </button>
      </div>

      <p className="text-center text-xs text-neutral-400">
        Plan B activates after {PLAN_B_NO_PROGRESS_DAYS} days of no logged entries.
      </p>
    </div>
  );
}
