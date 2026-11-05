import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchCoachMessages, sendCoachMessage } from '@/lib/api';
import type { CoachMessage } from '@/lib/types';
import { LoadingSpinner, ErrorState } from '@/components/States';
import { Send, Loader2, MessageCircle, Sparkles } from 'lucide-react';

export function CoachChat({ businessId }: { businessId: string }) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendingError, setSendingError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(false);
    const msgs = await fetchCoachMessages(businessId);
    setMessages(msgs);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(`coach_messages:${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_messages',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === (payload.new as CoachMessage).id)
              ? prev
              : [...prev, payload.new as CoachMessage],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setSendingError(null);
    const msg = await sendCoachMessage(businessId, trimmed);

    if (!msg) {
      setSendingError('Could not save your message. Try again.');
      setSending(false);
      return;
    }

    setInput('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <LoadingSpinner message="Loading chat..." />;
  if (error) return <ErrorState message="Could not load chat." onRetry={loadMessages} />;

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-text">Your Coach</h1>
          <p className="text-xs text-muted">
            {messages.filter((m) => m.sender === 'founder').length}/10 messages to unlock Gate 1
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-2.5 overflow-y-auto rounded-2xl border border-border bg-bg p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <p className="max-w-xs text-sm font-semibold text-text">Coach: Coming soon</p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              A real guided coach conversation arrives in a later update. For now, any message you
              save here is stored on your timeline and counts toward Gate 1.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isFounder = msg.sender === 'founder';
          return (
            <div
              key={msg.id}
              className={`flex ${isFounder ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isFounder
                    ? 'rounded-br-md bg-primary text-on-solid'
                    : 'rounded-bl-md bg-surface text-text'
                }`}
              >
                <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isFounder ? 'text-primary/30' : 'text-muted'
                  }`}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-on-solid shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3">
        {sendingError && (
          <div className="mb-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {sendingError}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a note for your timeline..."
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-text placeholder-muted focus:outline-none"
            style={{ minHeight: '2.5rem' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-solid transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
