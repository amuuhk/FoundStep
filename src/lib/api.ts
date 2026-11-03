import { supabase } from './supabase';
import type {
  Business,
  CountrySettings,
  DailyEntry,
  CustomerConversation,
  CoachMessage,
  GateUnlock,
  Task,
  BusinessProgress,
  UnlockGateResult,
  InsertEntryResult,
} from './types';

export async function fetchCountrySettings(country: string): Promise<CountrySettings | null> {
  const { data, error } = await supabase
    .from('country_settings')
    .select('*')
    .eq('country', country)
    .maybeSingle();

  if (error) {
    console.error('fetchCountrySettings error:', error.message);
    return null;
  }
  return data as CountrySettings | null;
}

export async function fetchBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchBusinesses error:', error.message);
    return [];
  }
  return (data ?? []) as Business[];
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('fetchBusinessById error:', error.message);
    return null;
  }
  return data as Business | null;
}

export async function createBusiness(input: {
  name: string;
  sector: string;
  description: string;
  stage: 'idea' | 'selling' | 'earning';
  start_date: string;
  cac_registered: boolean;
  cac_number?: string;
  country: string;
}): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .insert(input)
    .select()
    .maybeSingle();

  if (error) {
    console.error('createBusiness error:', error.message);
    return null;
  }
  return data as Business | null;
}

export async function fetchBusinessProgress(businessId: string): Promise<BusinessProgress | null> {
  const { data, error } = await supabase.rpc('get_business_progress', {
    p_business_id: businessId,
  });

  if (error) {
    console.error('fetchBusinessProgress error:', error.message);
    return null;
  }
  return data as BusinessProgress | null;
}

export async function attemptGateUnlock(businessId: string, gate: number): Promise<UnlockGateResult> {
  const { data, error } = await supabase.rpc('unlock_gate', {
    p_business_id: businessId,
    p_gate: gate,
  });

  if (error) {
    console.error('attemptGateUnlock error:', error.message);
    return { success: false, unlocked: false, error: error.message };
  }
  return data as UnlockGateResult;
}

export async function insertDailyEntry(input: {
  business_id: string;
  entry_date: string;
  result: 'WIN' | 'LOSS';
  new_customers: number;
  revenue: number;
  costs: number;
  note?: string;
}): Promise<InsertEntryResult> {
  const { data, error } = await supabase.rpc('insert_daily_entry', {
    p_business_id: input.business_id,
    p_entry_date: input.entry_date,
    p_result: input.result,
    p_new_customers: input.new_customers,
    p_revenue: input.revenue,
    p_costs: input.costs,
    p_note: input.note ?? null,
  });

  if (error) {
    console.error('insertDailyEntry error:', error.message);
    return { success: false, error: error.message };
  }
  return data as InsertEntryResult;
}

export async function fetchDailyEntries(businessId: string, limit = 90): Promise<DailyEntry[]> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('business_id', businessId)
    .order('entry_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchDailyEntries error:', error.message);
    return [];
  }
  return (data ?? []) as DailyEntry[];
}

export async function fetchDailyEntryForDate(businessId: string, date: string): Promise<DailyEntry | null> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('business_id', businessId)
    .eq('entry_date', date)
    .maybeSingle();

  if (error) {
    console.error('fetchDailyEntryForDate error:', error.message);
    return null;
  }
  return data as DailyEntry | null;
}

export async function fetchConversations(businessId: string): Promise<CustomerConversation[]> {
  const { data, error } = await supabase
    .from('customer_conversations')
    .select('*')
    .eq('business_id', businessId)
    .order('conversation_date', { ascending: false });

  if (error) {
    console.error('fetchConversations error:', error.message);
    return [];
  }
  return (data ?? []) as CustomerConversation[];
}

export async function addConversation(input: {
  business_id: string;
  person_name?: string;
  note: string;
  outcome?: string;
}): Promise<boolean> {
  const { error } = await supabase.from('customer_conversations').insert({
    business_id: input.business_id,
    person_name: input.person_name ?? null,
    note: input.note,
    outcome: input.outcome ?? null,
  });
  if (error) {
    console.error('addConversation error:', error.message);
    return false;
  }
  return true;
}

export async function fetchGateUnlocks(businessId: string): Promise<GateUnlock[]> {
  const { data, error } = await supabase
    .from('gate_unlocks')
    .select('*')
    .eq('business_id', businessId)
    .order('gate', { ascending: true });

  if (error) {
    console.error('fetchGateUnlocks error:', error.message);
    return [];
  }
  return (data ?? []) as GateUnlock[];
}

export async function fetchTasks(businessId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchTasks error:', error.message);
    return [];
  }
  return (data ?? []) as Task[];
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) {
    console.error('updateTaskStatus error:', error.message);
    return false;
  }
  return true;
}

export async function updateProfile(updates: {
  language?: string;
  country?: string;
  state?: string;
  phone?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '');

  if (error) {
    console.error('updateProfile error:', error.message);
    return false;
  }
  return true;
}

export async function acceptEquityAgreement(): Promise<boolean> {
  const { error } = await supabase.rpc('accept_equity_agreement');

  if (error) {
    console.error('acceptEquityAgreement error:', error.message);
    return false;
  }
  return true;
}

export async function fetchCoachMessages(businessId: string, limit = 200): Promise<CoachMessage[]> {
  const { data, error } = await supabase
    .from('coach_messages')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('fetchCoachMessages error:', error.message);
    return [];
  }
  return (data ?? []) as CoachMessage[];
}

export async function sendCoachMessage(
  businessId: string,
  body: string,
): Promise<CoachMessage | null> {
  const { data, error } = await supabase
    .from('coach_messages')
    .insert({ business_id: businessId, sender: 'founder', body })
    .select()
    .maybeSingle();

  if (error) {
    console.error('sendCoachMessage error:', error.message);
    return null;
  }
  return data as CoachMessage | null;
}
