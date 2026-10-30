import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-error-200 bg-error-50 p-6 text-center">
      <p className="text-sm font-medium text-error-700">{message}</p>
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
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
      {icon && <div className="text-neutral-400">{icon}</div>}
      <p className="text-sm font-semibold text-neutral-700">{title}</p>
      <p className="max-w-xs text-sm text-neutral-500">{message}</p>
      {action}
    </div>
  );
}
