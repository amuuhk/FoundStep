import { useEffect, useState, useCallback } from 'react';
import { fetchBusinessById, fetchDailyEntries, fetchDailyEntryForDate, insertDailyEntry, addConversation, fetchConversations } from '@/lib/api';
import type { Business, DailyEntry, CustomerConversation, InsertEntryResult } from '@/lib/types';
import { todayISO, formatDateShort } from '@/lib/format';
import { LoadingSpinner, ErrorState } from '@/components/States';
import { Trophy, XCircle, Lock, Calendar, MessageCircle, Plus, X, CheckCircle2 } from 'lucide-react';

export function DailyEntry({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [conversations, setConversations] = useState<CustomerConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [existingEntry, setExistingEntry] = useState<DailyEntry | null>(null);
  const [result, setResult] = useState<'WIN' | 'LOSS'>('WIN');
  const [newCustomers, setNewCustomers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [costs, setCosts] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<InsertEntryResult | null>(null);
  const [showConvoModal, setShowConvoModal] = useState(false);

  // Conversation form
  const [convoName, setConvoName] = useState('');
  const [convoNote, setConvoNote] = useState('');
  const [convoOutcome, setConvoOutcome] = useState('');
  const [convoLoading, setConvoLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    const [biz, ents, convos] = await Promise.all([
      fetchBusinessById(businessId),
      fetchDailyEntries(businessId, 90),
      fetchConversations(businessId),
    ]);

    if (!biz) {
      setError(true);
      setLoading(false);
      return;
    }

    setBusiness(biz);
    setEntries(ents);
    setConversations(convos);
    setLoading(false);
  }, [businessId]);

  const checkExisting = useCallback(async (date: string) => {
    const existing = await fetchDailyEntryForDate(businessId, date);
    setExistingEntry(existing);
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    checkExisting(selectedDate);
    setSubmitResult(null);
  }, [selectedDate, checkExisting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    const res = await insertDailyEntry({
      business_id: businessId,
      entry_date: selectedDate,
      result,
      new_customers: newCustomers,
      revenue: revenue * 100,
      costs: costs * 100,
      note: note.trim() || undefined,
    });

    setSubmitResult(res);
    setSubmitting(false);

    if (res.success) {
      await loadData();
      await checkExisting(selectedDate);
      setNote('');
      setNewCustomers(0);
      setRevenue(0);
      setCosts(0);
    }
  };

  const handleAddConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convoNote.trim()) return;
    setConvoLoading(true);
    const success = await addConversation({
      business_id: businessId,
      person_name: convoName.trim() || undefined,
      note: convoNote.trim(),
      outcome: convoOutcome.trim() || undefined,
    });
    setConvoLoading(false);
    if (success) {
      setShowConvoModal(false);
      setConvoName('');
      setConvoNote('');
      setConvoOutcome('');
      await loadData();
    }
  };

  if (loading) return <LoadingSpinner message="Loading daily entries..." />;
  if (error || !business) return <ErrorState message="Could not load daily entries." onRetry={loadData} />;

  const calendarDays = buildCalendar(entries);
  const isToday = selectedDate === todayISO();

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text sm:text-2xl">Daily Entry</h1>
        <p className="mt-0.5 text-sm text-muted">
          Log a WIN or LOSS with real numbers. Once submitted, an entry is locked forever.
        </p>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Calendar className="h-4 w-4 text-primary" />
            Last 35 days
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${
                day === null
                  ? 'bg-bg'
                  : day.result === 'WIN'
                  ? 'bg-growth/15 text-growth'
                  : 'bg-danger/15 text-danger'
              }`}
              title={day ? `${day.date}: ${day.result}` : ''}
            >
              {day ? (
                <span className="flex flex-col items-center leading-none">
                  <span>{day.dayNum}</span>
                  <span className="mt-0.5 text-[9px] font-bold">{day.result === 'WIN' ? 'W' : 'L'}</span>
                </span>
              ) : ''}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-growth/15" /> WIN
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-danger/15" /> LOSS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-border" /> No entry
          </span>
        </div>
      </div>

      {/* Conversation log */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
            <MessageCircle className="h-4 w-4 text-primary" />
            Customer Conversations
          </h3>
          <button
            onClick={() => setShowConvoModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted">
            No conversations logged yet. Gate 0 needs 10 real customer conversations.
          </p>
        ) : (
          <div className="space-y-2">
            {conversations.slice(0, 5).map((c) => (
              <div key={c.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text">{c.person_name ?? 'Conversation'}</p>
                  <p className="text-xs text-muted">{formatDateShort(c.conversation_date)}</p>
                </div>
                <p className="mt-1 text-xs text-muted">{c.note}</p>
                {c.outcome && <p className="mt-1 text-xs text-muted">Outcome: {c.outcome}</p>}
              </div>
            ))}
            <p className="pt-1 text-xs text-muted">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} logged
            </p>
          </div>
        )}
      </div>

      {/* Entry form or locked message */}
      {existingEntry ? (
        <div className="card">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted" />
            <div>
              <p className="text-sm font-semibold text-text">
                Entry for {formatDateShort(existingEntry.entry_date)} is locked
              </p>
              <p className="text-xs text-muted">
                Result: {existingEntry.result} · {existingEntry.new_customers} customers · ₦{Math.floor(existingEntry.revenue / 100).toLocaleString()} revenue
              </p>
              {existingEntry.note && <p className="mt-1 text-xs text-muted">"{existingEntry.note}"</p>}
              <p className="mt-2 text-xs text-muted">
                Entries cannot be edited. To correct, submit a new entry referencing this one.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">
              {isToday ? "Today's Entry" : `Entry for ${formatDateShort(selectedDate)}`}
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-border px-2 py-1 text-xs text-muted focus:border-primary focus:outline-none"
              max={todayISO()}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* WIN / LOSS toggle */}
            <div>
              <label className="label-text">Was today a WIN or a LOSS?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResult('WIN')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    result === 'WIN'
                      ? 'border-growth bg-growth/10 text-growth'
                      : 'border-border text-muted hover:border-border/90'
                  }`}
                >
                  <Trophy className="h-5 w-5" />
                  <span className="text-sm font-semibold">WIN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResult('LOSS')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    result === 'LOSS'
                      ? 'border-danger bg-danger/10 text-danger'
                      : 'border-border text-muted hover:border-border/90'
                  }`}
                >
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm font-semibold">LOSS</span>
                </button>
              </div>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="label-text" htmlFor="newCustomers">New customers</label>
                <input
                  id="newCustomers"
                  type="number"
                  min={0}
                  value={newCustomers}
                  onChange={(e) => setNewCustomers(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label-text" htmlFor="revenue">Revenue (₦)</label>
                <input
                  id="revenue"
                  type="number"
                  min={0}
                  value={revenue}
                  onChange={(e) => setRevenue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label-text" htmlFor="costs">Costs (₦)</label>
                <input
                  id="costs"
                  type="number"
                  min={0}
                  value={costs}
                  onChange={(e) => setCosts(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="label-text" htmlFor="note">Note (optional)</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field min-h-[72px] resize-none"
                placeholder="What happened today? What did you learn?"
                maxLength={500}
              />
            </div>

            {/* Warning */}
            <div className="rounded-xl border border-attention/30 bg-attention/10 p-3">
              <p className="text-xs text-attention">
                Once you submit, this entry is locked. You cannot edit it. To correct a mistake,
                submit a new entry that references this one.
              </p>
            </div>

            {submitResult && !submitResult.success && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {submitResult.error ?? 'Could not save entry. Try again.'}
              </div>
            )}

            {submitResult?.success && (
              <div className="flex items-center gap-2 rounded-xl border border-growth/30 bg-growth/10 px-4 py-3 text-sm text-growth">
                <CheckCircle2 className="h-4 w-4" />
                Entry locked and saved. Well done.
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Locking entry...' : 'Lock this entry'}
            </button>
          </form>
        </div>
      )}

      {/* Conversation modal */}
      {showConvoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-text/40 p-0 sm:p-4" onClick={() => setShowConvoModal(false)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-surface p-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Log a customer conversation</h3>
              <button onClick={() => setShowConvoModal(false)} className="text-muted hover:text-muted/90">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddConversation} className="space-y-3">
              <div>
                <label className="label-text" htmlFor="convoName">Person name (optional)</label>
                <input
                  id="convoName"
                  type="text"
                  value={convoName}
                  onChange={(e) => setConvoName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Chidi from the market"
                />
              </div>
              <div>
                <label className="label-text" htmlFor="convoNote">What did you talk about?</label>
                <textarea
                  id="convoNote"
                  value={convoNote}
                  onChange={(e) => setConvoNote(e.target.value)}
                  className="input-field min-h-[72px] resize-none"
                  placeholder="e.g. Asked about their needs, showed them my product, they said they would think about it."
                  maxLength={500}
                  required
                />
              </div>
              <div>
                <label className="label-text" htmlFor="convoOutcome">Outcome (optional)</label>
                <input
                  id="convoOutcome"
                  type="text"
                  value={convoOutcome}
                  onChange={(e) => setConvoOutcome(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Will follow up next week"
                />
              </div>
              <button type="submit" disabled={convoLoading} className="btn-primary w-full">
                {convoLoading ? 'Saving...' : 'Save conversation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type CalendarDay = { date: string; dayNum: number; result: 'WIN' | 'LOSS' } | null;

function buildCalendar(entries: DailyEntry[]): CalendarDay[] {
  const entryMap = new Map(entries.map((e) => [e.entry_date, e.result]));
  const days: CalendarDay[] = [];
  const today = new Date();

  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const result = entryMap.get(dateStr);

    if (result) {
      days.push({ date: dateStr, dayNum: d.getDate(), result });
    } else {
      days.push(null);
    }
  }

  return days;
}
