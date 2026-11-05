import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center">
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-bg p-6 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="max-w-xs text-sm text-muted">{message}</p>
      {action}
    </div>
  );
}
