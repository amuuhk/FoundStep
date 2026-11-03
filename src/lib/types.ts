export type Role = 'founder' | 'mentor' | 'admin';

export type BusinessStage = 'idea' | 'selling' | 'earning';

export type TaskOwnerType = 'FOUNDER' | 'AI_DRAFT' | 'AUTO' | 'HUMAN';
export type TaskStatus = 'suggested' | 'approved' | 'sent' | 'done';

export type EntryResult = 'WIN' | 'LOSS';

export type GateTargets = Record<string, {
  conversations?: number;
  customers?: number;
  revenue?: number;
  margin?: number;
  team_size?: number;
  review_required?: boolean;
}>;

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone: string | null;
  email: string | null;
  country: string;
  state: string | null;
  language: string;
  equity_agreement_accepted_at: string | null;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  sector: string;
  description: string;
  stage: BusinessStage;
  start_date: string;
  cac_registered: boolean;
  cac_number: string | null;
  country: string;
  current_gate: number;
  created_at: string;
}

export interface CountrySettings {
  country: string;
  currency: string;
  currency_symbol: string;
  gate_targets: GateTargets;
}

export interface DailyEntry {
  id: string;
  business_id: string;
  entry_date: string;
  result: EntryResult;
  new_customers: number;
  revenue: number;
  costs: number;
  note: string | null;
  entry_hash: string;
  previous_hash: string | null;
  created_at: string;
}

export interface CustomerConversation {
  id: string;
  business_id: string;
  conversation_date: string;
  person_name: string | null;
  note: string;
  outcome: string | null;
  created_at: string;
}

export type CoachMessageSender = 'founder' | 'coach';

export interface CoachMessage {
  id: string;
  business_id: string;
  sender: CoachMessageSender;
  body: string;
  created_at: string;
}

export interface GateUnlock {
  id: string;
  business_id: string;
  gate: number;
  unlocked_at: string;
  snapshot: Record<string, unknown>;
}

export interface Task {
  id: string;
  business_id: string;
  title: string;
  owner_type: TaskOwnerType;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
}

export interface BusinessProgress {
  total_customers: number;
  total_revenue: number;
  total_costs: number;
  margin_pct: number;
  conversation_count: number;
  entry_count: number;
  latest_entry_date: string | null;
}

export interface MissingRequirement {
  field: string;
  current: number;
  required: number;
  shortfall: number;
}

export interface UnlockGateResult {
  success: boolean;
  unlocked: boolean;
  missing?: MissingRequirement[];
  progress?: BusinessProgress;
  error?: string;
  gate?: number;
}

export interface InsertEntryResult {
  success: boolean;
  entry_id?: string;
  entry_hash?: string;
  error?: string;
}
