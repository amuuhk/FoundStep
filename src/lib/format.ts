import type { CountrySettings } from './types';

export function formatCurrency(amount: number, settings: CountrySettings | null): string {
  if (!settings) return `${amount.toLocaleString()}`;
  const major = Math.floor(amount / 100);
  return `${settings.currency_symbol}${major.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.floor((e - s) / (1000 * 60 * 60 * 24));
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
