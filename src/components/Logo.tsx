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
      <picture>
        <source srcSet="/images/FoundStep_logo_on_dark.svg" media="(prefers-color-scheme: dark)" />
        <img
          src="/images/FoundStep_logo_on_light.svg"
          alt={`${APP_NAME} logo`}
          className={`${d.box} shrink-0`}
        />
      </picture>
      {!markOnly && <span className={`${d.text} font-bold tracking-tight text-primary`}>{APP_NAME}</span>}
    </div>
  );
}
