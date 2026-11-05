import { useEffect, useState, useCallback } from 'react';
import {
  fetchBusinessById,
  fetchBusinessProgress,
  fetchCountrySettings,
  fetchGateUnlocks,
  attemptGateUnlock,
} from '@/lib/api';
import type { Business, BusinessProgress, CountrySettings, GateUnlock, UnlockGateResult } from '@/lib/types';
import { GATE_ORDER } from '@/lib/constants';
import { getGateName, getNextGate, getProgressForGate, formatMissingMessage } from '@/lib/gates';
import { formatCurrency, formatNumber } from '@/lib/format';
import { LoadingSpinner, ErrorState } from '@/components/States';
import { Lock, Unlock, CheckCircle2 } from 'lucide-react';

export function GateScreen({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [progress, setProgress] = useState<BusinessProgress | null>(null);
  const [settings, setSettings] = useState<CountrySettings | null>(null);
  const [unlocks, setUnlocks] = useState<GateUnlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState<number | null>(null);
  const [unlockResults, setUnlockResults] = useState<Record<number, UnlockGateResult>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    const [biz, prog, unlcks] = await Promise.all([
      fetchBusinessById(businessId),
      fetchBusinessProgress(businessId),
      fetchGateUnlocks(businessId),
    ]);

    if (!biz) {
      setError(true);
      setLoading(false);
      return;
    }

    setBusiness(biz);
    setProgress(prog);
    setUnlocks(unlcks);

    const cs = await fetchCountrySettings(biz.country);
    setSettings(cs);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAttemptUnlock = async (gate: number) => {
    setUnlockLoading(gate);
    const result = await attemptGateUnlock(businessId, gate);
    setUnlockResults((prev) => ({ ...prev, [gate]: result }));
    setUnlockLoading(null);
    if (result.unlocked) {
      await loadData();
    }
  };

  if (loading) return <LoadingSpinner message="Loading gates..." />;
  if (error || !business) return <ErrorState message="Could not load gate information." onRetry={loadData} />;

  const nextGate = getNextGate(business.current_gate);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text sm:text-2xl">Your Gates</h1>
        <p className="mt-0.5 text-sm text-muted">
          Move through six gates by proving real numbers. Each gate unlocks when you meet the targets.
        </p>
      </div>

      <div className="space-y-3">
        {GATE_ORDER.map((gate) => {
          const isUnlocked = gate <= business.current_gate;
          const isNext = gate === nextGate;
          const isLocked = !isUnlocked && !isNext;
          const gateProgress = progress && settings ? getProgressForGate(progress, settings, gate) : [];
          const result = unlockResults[gate];

          return (
            <div
              key={gate}
              className={`card transition-all ${
                isUnlocked
                  ? 'border-growth/30 bg-growth/10'
                  : isNext
                  ? 'border-primary/50 bg-surface ring-2 ring-primary/15'
                  : 'opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isUnlocked
                        ? 'bg-growth/15 text-growth'
                        : isNext
                        ? 'bg-primary/15 text-primary'
                        : 'bg-border text-muted'
                    }`}
                  >
                    {isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      Gate {gate}: {getGateName(gate)}
                    </p>
                    {isUnlocked && (
                      <p className="text-xs text-growth">
                        Unlocked{unlocks.find((u) => u.gate === gate) ? ` · ${new Date(unlocks.find((u) => u.gate === gate)!.unlocked_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                      </p>
                    )}
                    {isNext && <p className="text-xs text-primary">Your next gate</p>}
                    {isLocked && <p className="text-xs text-muted">Locked</p>}
                  </div>
                </div>

                {isUnlocked && <CheckCircle2 className="h-5 w-5 text-growth" />}
              </div>

              {/* Progress for next gate */}
              {isNext && gateProgress.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {gateProgress.map((item, i) => (
                    <div key={i}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted">{item.label}</span>
                        <span className="font-semibold text-text">
                          {item.label.includes('Revenue') && settings
                            ? `${formatCurrency(item.current, settings)} / ${formatCurrency(item.required, settings)}`
                            : `${formatNumber(item.current)} / ${formatNumber(item.required)}`}
                        </span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAttemptUnlock(gate)}
                    disabled={unlockLoading === gate}
                    className="btn-primary w-full text-sm"
                  >
                    {unlockLoading === gate ? 'Checking requirements...' : `Try to unlock Gate ${gate}`}
                  </button>

                  {result && !result.unlocked && result.missing && (
                    <div className="space-y-1.5 rounded-xl border border-attention/30 bg-attention/10 p-3">
                      <p className="text-xs font-semibold text-attention">Not yet. Here is what is missing:</p>
                      {formatMissingMessage(result.missing, settings).map((msg, i) => (
                        <p key={i} className="text-xs text-attention">{msg}</p>
                      ))}
                    </div>
                  )}

                  {result?.unlocked && (
                    <div className="flex items-center gap-2 rounded-xl border border-growth/30 bg-growth/10 p-3">
                      <CheckCircle2 className="h-4 w-4 text-growth" />
                      <p className="text-sm font-semibold text-growth">
                        Gate {gate} unlocked! Well done.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Locked gates show requirements without interaction */}
              {isLocked && progress && settings && getProgressForGate(progress, settings, gate).length > 0 && (
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted">Requirements:</p>
                  {getProgressForGate(progress, settings, gate).map((item, i) => (
                    <p key={i} className="text-xs text-muted">
                      {item.label.includes('Revenue') && settings
                        ? `${formatCurrency(item.required, settings)} ${item.label.toLowerCase()}`
                        : `${formatNumber(item.required)} ${item.label.toLowerCase()}`}
                    </p>
                  ))}
                </div>
              )}

              {gate === 5 && isLocked && (
                <p className="mt-3 text-xs text-muted">
                  Reached after Gate 4 proof is reviewed by a mentor.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
