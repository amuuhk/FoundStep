import { APP_NAME } from '@/lib/constants';

export function Logo({ size = 'md', markOnly = false }: { size?: 'sm' | 'md' | 'lg'; markOnly?: boolean }) {
  const dimensions = {
    sm: { box: 'h-8 w-8', text: 'text-lg' },
    md: { box: 'h-10 w-10', text: 'text-xl' },
    lg: { box: 'h-14 w-14', text: 'text-2xl' },
  };
  const d = dimensions[size];

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/images/Screenshot_(271).png"
        alt={`${APP_NAME} logo`}
        className={`${d.box} rounded-xl object-cover shadow-sm`}
      />
      {!markOnly && <span className={`${d.text} font-bold tracking-tight text-neutral-950`}>{APP_NAME}</span>}
    </div>
  );
}
