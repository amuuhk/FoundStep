import { Layers } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function Logo({ size = 'md', markOnly = false }: { size?: 'sm' | 'md' | 'lg'; markOnly?: boolean }) {
  const dimensions = {
    sm: { box: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-lg' },
    md: { box: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-xl' },
    lg: { box: 'h-14 w-14', icon: 'h-7 w-7', text: 'text-2xl' },
  };
  const d = dimensions[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        role="img"
        aria-label={`${APP_NAME} logo`}
        className={`${d.box} flex shrink-0 items-center justify-center rounded-xl bg-primary-900 shadow-sm ring-1 ring-inset ring-primary-700`}
      >
        <Layers className={`${d.icon} text-secondary-500`} strokeWidth={2.25} />
      </div>
      {!markOnly && <span className={`${d.text} font-bold tracking-tight text-primary-900`}>{APP_NAME}</span>}
    </div>
  );
}
