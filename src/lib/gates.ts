import { GATE_NAMES, GATE_ORDER } from './constants';
import type { BusinessProgress, CountrySettings, MissingRequirement } from './types';

export function getGateName(gate: number): string {
  return GATE_NAMES[gate] ?? 'Unknown';
}

export function getNextGate(currentGate: number): number | null {
  if (currentGate >= GATE_ORDER.length - 1) return null;
  return currentGate + 1;
}

export function getGateTargets(
  settings: CountrySettings | null,
  gate: number,
): Record<string, number | boolean> | null {
  if (!settings) return null;
  const key = `gate_${gate}`;
  const targets = settings.gate_targets[key];
  return targets ?? null;
}

export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    conversations: 'customer conversations',
    customers: 'paying customers',
    revenue: 'revenue',
    margin: 'profit margin',
    team_size: 'team members',
  };
  return labels[field] ?? field;
}

export function formatMissingMessage(missing: MissingRequirement[], settings: CountrySettings | null): string[] {
  return missing.map((m) => {
    const label = getFieldLabel(m.field);
    if (m.field === 'revenue' && settings) {
      const major = Math.floor(m.shortfall / 100);
      const sym = settings.currency_symbol;
      return `You have ${formatCurrencyCurrent(m.current, settings)} in ${label}. You need ${sym}${major.toLocaleString()} more.`;
    }
    return `You have ${m.current.toLocaleString()}/${m.required.toLocaleString()} ${label}. You need ${m.shortfall.toLocaleString()} more.`;
  });
}

function formatCurrencyCurrent(amount: number, settings: CountrySettings | null): string {
  if (!settings) return amount.toLocaleString();
  const major = Math.floor(amount / 100);
  return `${settings.currency_symbol}${major.toLocaleString()}`;
}

export function computeProgressPct(current: number, required: number): number {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((current / required) * 100));
}

export function getProgressForGate(
  progress: BusinessProgress | null,
  settings: CountrySettings | null,
  gate: number,
): { label: string; current: number; required: number; pct: number }[] {
  if (!progress || !settings) return [];
  const targets = getGateTargets(settings, gate);
  if (!targets) return [];

  const items: { label: string; current: number; required: number; pct: number }[] = [];

  if (targets.conversations !== undefined) {
    items.push({
      label: 'Customer conversations',
      current: progress.conversation_count,
      required: targets.conversations as number,
      pct: computeProgressPct(progress.conversation_count, targets.conversations as number),
    });
  }
  if (targets.customers !== undefined) {
    items.push({
      label: 'Paying customers',
      current: progress.total_customers,
      required: targets.customers as number,
      pct: computeProgressPct(progress.total_customers, targets.customers as number),
    });
  }
  if (targets.revenue !== undefined) {
    items.push({
      label: 'Revenue',
      current: progress.total_revenue,
      required: targets.revenue as number,
      pct: computeProgressPct(progress.total_revenue, targets.revenue as number),
    });
  }
  if (targets.margin !== undefined) {
    items.push({
      label: 'Profit margin (%)',
      current: progress.margin_pct,
      required: targets.margin as number,
      pct: computeProgressPct(progress.margin_pct, targets.margin as number),
    });
  }

  return items;
}
