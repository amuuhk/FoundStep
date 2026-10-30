import { useState, useEffect } from 'react';
import { DISCIPLINE_FOCUS_DURATION_HOURS, APP_NAME } from '@/lib/constants';
import { Zap, X } from 'lucide-react';

interface DisciplineModeProps {
  skippedCount: number;
  onExit: () => void;
}

export function DisciplineMode({ skippedCount, onExit }: DisciplineModeProps) {
  const [secondsLeft, setSecondsLeft] = useState(DISCIPLINE_FOCUS_DURATION_HOURS * 3600);
  const [canExit, setCanExit] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setCanExit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900 px-6 text-center text-white">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-500 animate-pulse-soft">
        <Zap className="h-8 w-8 text-white" />
      </div>

      <h1 className="text-2xl font-bold">Discipline Mode</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-300">
        You skipped {skippedCount} daily tasks in a row. This focus screen stays for {DISCIPLINE_FOCUS_DURATION_HOURS} hours.
        Use this time to get back on track.
      </p>

      <div className="my-8 text-5xl font-bold tabular-nums tracking-tight">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="max-w-sm space-y-3 rounded-2xl border border-neutral-700 bg-neutral-800 p-5 text-left">
        <p className="text-sm font-semibold text-white">What to do now:</p>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>1. Log today's entry — WIN or LOSS, with real numbers.</li>
          <li>2. Reach out to one customer or potential customer.</li>
          <li>3. Complete one task you skipped.</li>
        </ul>
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        This is not a punishment. It is a reminder that consistency builds businesses.
      </p>

      {canExit && (
        <button
          onClick={onExit}
          className="mt-6 flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          <X className="h-4 w-4" />
          Exit focus mode
        </button>
      )}

      {!canExit && (
        <p className="mt-6 text-xs text-neutral-500">
          You can exit when the timer finishes. Stay strong.
        </p>
      )}

      <p className="mt-8 text-xs text-neutral-600">{APP_NAME}</p>
    </div>
  );
}
