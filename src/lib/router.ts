import { useEffect, useState } from 'react';
import type { Page } from '@/components/AppShell';

export const PAGE_PATHS: Record<Page, string> = {
  dashboard: '/dashboard',
  chat: '/coach',
  daily: '/daily',
  gate: '/gates',
  settings: '/settings',
};

export const COMING_SOON_PATHS = ['/readiness', '/pitch'] as const;

export function pageFromPath(pathname: string): Page | null {
  const match = (Object.keys(PAGE_PATHS) as Page[]).find((key) => PAGE_PATHS[key] === pathname);
  return match ?? null;
}

export function navigate(path: string, replace = false) {
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return pathname;
}
