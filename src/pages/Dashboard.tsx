import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import {
  fetchBusinessById,
  fetchBusinessProgress,
  fetchCountrySettings,
  fetchDailyEntries,
  fetchTasks,
  attemptGateUnlock,
} from '@/lib/api';
import type { Business, BusinessProgress, CountrySettings, DailyEntry, Task, UnlockGateResult } from '@/lib/types';
import { GATE_NAMES, TASK_OWNER_LABELS, TASK_STATUS_LABELS, APP_NAME } from '@/lib/constants';
import { getGateName, getNextGate, getProgressForGate } from '@/lib/gates';
import { formatCurrency, formatNumber, todayISO } from '@/lib/format';
import { LoadingSpinner, ErrorState } from '@/components/States';
import { StartupPipeline } from '@/components/StartupPipeline';
import { TrendingUp, Flame, CheckCircle2, Circle, Lock, Unlock, Zap, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  businessId: string;
  onNavigate: (page: 'dashboard' | 'daily' | 'gate' | 'settings') => void;
}

export function Dashboard({ businessId, onNavigate }: DashboardProps) {
  const { profile } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [progress, setProgress] = useState<BusinessProgress | null>(null);
  const [settings, setSettings] = useState<CountrySettings | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unlockResult, setUnlockResult] = useState<UnlockGateResult | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    const [biz, prog, ents, tks] = await Promise.all([
      fetchBusinessById(businessId),
      fetchBusinessProgress(businessId),
      fetchDailyEntries(businessId, 30),
      fetchTasks(businessId),
    ]);

    if (!biz) {
      setError(true);
      setLoading(false);
      return;
    }

    setBusiness(biz);
    setProgress(prog);
    setEntries(ents);
    setTasks(tks);

    const cs = await fetchCountrySettings(biz.country);
    setSettings(cs);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const todayEntry = entries.find((e) => e.entry_date === todayISO());
  const streak = computeStreak(entries);
  const nextGate = business ? getNextGate(business.current_gate) : null;
  const gateProgress = progress && settings && nextGate !== null
    ? getProgressForGate(progress, settings, nextGate)
    : [];

  const skippedTasks = tasks.filter((t) => t.status !== 'done' && t.due_date && t.due_date < todayISO()).length;
  const showDiscipline = skippedTasks >= 3;

  const lastEntryDate = entries[0]?.entry_date;
  const daysSinceProgress = lastEntryDate
    ? Math.floor((Date.now() - new Date(lastEntryDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const showPlanB = daysSinceProgress !== null && daysSinceProgress >= 30;

  const handleAttemptUnlock = async () => {
    if (!business || nextGate === null) return;
    setUnlockLoading(true);
    const result = await attemptGateUnlock(business.id, nextGate);
    setUnlockResult(result);
    setUnlockLoading(false);
    if (result.unlocked) {
      await loadData();
    }
  };

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;
  if (error || !business) return <ErrorState message="Could not load your dashboard." onRetry={loadData} />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-text sm:text-2xl">
          Hello, {profile?.full_name?.split(' ')[0] ?? 'Founder'}
        </h1>
        <p className="mt-0.5 text-sm text-muted">{business.name}</p>
      </div>

      <StartupPipeline business={business} />

      {/* Alerts */}
      {showDiscipline && (
        <div
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-attention/30 bg-attention/10 p-4 animate-pulse-soft"
          onClick={() => onNavigate('daily')}
        >
          <Zap className="h-5 w-5 shrink-0 text-attention" />
          <div>
            <p className="text-sm font-semibold text-attention">Discipline Mode is on</p>
            <p className="text-xs text-attention">
              You skipped {skippedTasks} tasks in a row. Tap to start your focus session.
            </p>
          </div>
        </div>
      )}

      {showPlanB && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Plan B is active</p>
            <p className="text-xs text-danger">
              No progress logged for {daysSinceProgress} days. Check your emergency action list.
            </p>
          </div>
        </div>
      )}

      {/* Current Gate Card */}
      <div className="card bg-gradient-to-br from-primary to-primary text-on-solid">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-primary/15">Current Gate</p>
            <h2 className="mt-1 text-2xl font-bold">
              Gate {business.current_gate}: {getGateName(business.current_gate)}
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface/15">
            <Unlock className="h-6 w-6" />
          </div>
        </div>

        {nextGate !== null && gateProgress.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium text-primary/15">
              Next: Gate {nextGate} — {GATE_NAMES[nextGate]}
            </p>
            {gateProgress.map((item, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-primary/15">{item.label}</span>
                  <span className="font-semibold text-on-solid">
                    {item.label.includes('Revenue') && settings
                      ? `${formatCurrency(item.current, settings)} / ${formatCurrency(item.required, settings)}`
                      : `${formatNumber(item.current)} / ${formatNumber(item.required)}`}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface/20">
                  <div
                    className="h-full rounded-full bg-surface transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleAttemptUnlock}
              disabled={unlockLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              {unlockLoading ? (
                <span>Checking...</span>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Try to unlock Gate {nextGate}
                </>
              )}
            </button>

            {unlockResult && !unlockResult.unlocked && unlockResult.missing && (
              <div className="mt-2 space-y-1 rounded-xl bg-surface/10 p-3">
                <p className="text-xs font-semibold text-attention">Not yet. Here is what is missing:</p>
                {unlockResult.missing.map((m, i) => (
                  <p key={i} className="text-xs text-primary/15">
                    {m.field === 'revenue' && settings
                      ? `You have ${formatCurrency(m.current, settings)} in revenue. You need ${formatCurrency(m.shortfall, settings)} more.`
                      : `You have ${formatNumber(m.current)}/${formatNumber(m.required)} ${m.field}. You need ${formatNumber(m.shortfall)} more.`}
                  </p>
                ))}
              </div>
            )}

            {unlockResult?.unlocked && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-growth/30 p-3">
                <CheckCircle2 className="h-4 w-4 text-growth" />
                <p className="text-sm font-semibold text-growth">
                  Gate {unlockResult.gate} unlocked! Well done.
                </p>
              </div>
            )}
          </div>
        )}

        {nextGate === null && (
          <p className="mt-3 text-sm text-primary/15">
            You have reached the highest gate. Amazing work.
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          label="Customers"
          value={formatNumber(progress?.total_customers ?? 0)}
        />
        <StatCard
          icon={<span className="text-base font-bold text-growth">₦</span>}
          label="Revenue"
          value={settings ? formatCurrency(progress?.total_revenue ?? 0, settings) : '—'}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-attention" />}
          label="Streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
        />
        <StatCard
          icon={<span className="text-sm font-bold text-muted">{progress?.conversation_count ?? 0}</span>}
          label="Conversations"
          value={formatNumber(progress?.conversation_count ?? 0)}
        />
      </div>

      {/* Today's task */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-text">Today's Task</h3>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted">
            No tasks yet. Your daily tasks will appear here as you progress.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                {task.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-growth" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-border" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'text-muted line-through' : 'text-text'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted">
                    {TASK_OWNER_LABELS[task.owner_type]} · {TASK_STATUS_LABELS[task.status]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's entry status */}
      <div className="card flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">Today's Entry</h3>
          <p className="mt-0.5 text-xs text-muted">
            {todayEntry
              ? `Logged as ${todayEntry.result} · ${todayEntry.new_customers} new customers`
              : 'You have not logged today yet.'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('daily')}
          className={todayEntry ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
        >
          {todayEntry ? 'View' : 'Log now'}
        </button>
      </div>

      <p className="pt-2 text-center text-xs text-muted">
        {APP_NAME} — Founders sell. We do the structure.
      </p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-border">
        {icon}
      </div>
      <p className="text-lg font-bold text-text">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function computeStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  const today = todayISO();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sorted[0].entry_date !== today && sorted[0].entry_date !== yesterday) return 0;

  let streak = 0;
  let expected = sorted[0].entry_date === today ? today : yesterday;

  for (const entry of sorted) {
    if (entry.entry_date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else if (entry.entry_date < expected) {
      break;
    }
  }

  return streak;
}
