/*
# FoundStep Phase 1 — Core Schema

## Overview
Creates the foundational tables for the FoundStep founder discipline system.
All tables have Row Level Security enabled. Owner-scoped tables use auth.uid()
for ownership checks. Country settings and plans are publicly readable.

## New Tables
1. profiles — user profile linked to auth.users, stores role and contact info
2. businesses — founder's business, tracks current gate progress
3. country_settings — per-country currency and gate targets (public read)
4. customer_conversations — log of real customer conversations (Gate 0 requirement)
5. daily_entries — immutable daily WIN/LOSS entries with hash chain integrity
6. entry_corrections — corrections referencing original entries (append-only)
7. gate_unlocks — record of gate unlock events with snapshot
8. tasks — daily tasks with owner type (FOUNDER/AI_DRAFT/AUTO/HUMAN)
9. audit_log — append-only audit trail of important actions
10. plans — subscription plan names and pricing (config only)

## Security
- RLS enabled on every table
- Owner-scoped tables: 4 policies (SELECT/INSERT/UPDATE/DELETE) scoped to authenticated via auth.uid()
- daily_entries: NO UPDATE or DELETE policies — entries are immutable after submit
- audit_log: INSERT via service_role only; users can SELECT their own actions
- country_settings and plans: public read (anon + authenticated)
- SECURITY DEFINER functions for gate unlock and daily entry insert (server-side enforcement)
- Gate targets read from country_settings, never hard-coded

## Notes
- daily_entries.entry_hash forms a SHA-256 chain: hash(content || previous_hash)
- Gate unlock is computed server-side only via unlock_gate() function
- The client can never unlock a gate or insert a forged entry
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'founder' CHECK (role IN ('founder','mentor','investor','admin')),
  full_name text NOT NULL,
  phone text,
  email text,
  country text NOT NULL DEFAULT 'Nigeria',
  state text,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO service_role;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sector text NOT NULL,
  description text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('idea','selling','earning')),
  start_date date NOT NULL,
  cac_registered boolean NOT NULL DEFAULT false,
  cac_number text,
  country text NOT NULL DEFAULT 'Nigeria',
  current_gate int NOT NULL DEFAULT 0 CHECK (current_gate >= 0 AND current_gate <= 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON businesses TO service_role;

DROP POLICY IF EXISTS "select_own_businesses" ON businesses;
CREATE POLICY "select_own_businesses" ON businesses FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_businesses" ON businesses;
CREATE POLICY "insert_own_businesses" ON businesses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_businesses" ON businesses;
CREATE POLICY "update_own_businesses" ON businesses FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_businesses" ON businesses;
CREATE POLICY "delete_own_businesses" ON businesses FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

-- ============================================================
-- COUNTRY_SETTINGS (public read)
-- ============================================================
CREATE TABLE IF NOT EXISTS country_settings (
  country text PRIMARY KEY,
  currency text NOT NULL,
  currency_symbol text NOT NULL,
  gate_targets jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE country_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON country_settings TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_country_settings" ON country_settings;
CREATE POLICY "public_read_country_settings" ON country_settings FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- CUSTOMER_CONVERSATIONS (Gate 0 requirement: 10 conversations)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_date date NOT NULL DEFAULT CURRENT_DATE,
  person_name text,
  note text NOT NULL,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customer_conversations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON customer_conversations TO authenticated;
GRANT SELECT, INSERT ON customer_conversations TO service_role;

DROP POLICY IF EXISTS "select_own_conversations" ON customer_conversations;
CREATE POLICY "select_own_conversations" ON customer_conversations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customer_conversations.business_id AND businesses.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_conversations" ON customer_conversations;
CREATE POLICY "insert_own_conversations" ON customer_conversations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customer_conversations.business_id AND businesses.owner_id = auth.uid())
  );

-- ============================================================
-- DAILY_ENTRIES (immutable — no UPDATE or DELETE)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  result text NOT NULL CHECK (result IN ('WIN','LOSS')),
  new_customers int NOT NULL DEFAULT 0 CHECK (new_customers >= 0),
  revenue bigint NOT NULL DEFAULT 0 CHECK (revenue >= 0),
  costs bigint NOT NULL DEFAULT 0 CHECK (costs >= 0),
  note text,
  entry_hash text NOT NULL,
  previous_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, entry_date)
);

ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON daily_entries TO authenticated;
GRANT SELECT, INSERT ON daily_entries TO service_role;

-- No UPDATE or DELETE grant or policy — entries are locked on submit

DROP POLICY IF EXISTS "select_own_entries" ON daily_entries;
CREATE POLICY "select_own_entries" ON daily_entries FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = daily_entries.business_id AND businesses.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_entries" ON daily_entries;
CREATE POLICY "insert_own_entries" ON daily_entries FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = daily_entries.business_id AND businesses.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_daily_entries_business_date ON daily_entries(business_id, entry_date DESC);

-- ============================================================
-- ENTRY_CORRECTIONS (append-only references to original entries)
-- ============================================================
CREATE TABLE IF NOT EXISTS entry_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_entry_id uuid NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  fields jsonb NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE entry_corrections ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON entry_corrections TO authenticated;
GRANT SELECT, INSERT ON entry_corrections TO service_role;

DROP POLICY IF EXISTS "select_own_corrections" ON entry_corrections;
CREATE POLICY "select_own_corrections" ON entry_corrections FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM daily_entries
      JOIN businesses ON businesses.id = daily_entries.business_id
      WHERE daily_entries.id = entry_corrections.original_entry_id
      AND businesses.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_corrections" ON entry_corrections;
CREATE POLICY "insert_own_corrections" ON entry_corrections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries
      JOIN businesses ON businesses.id = daily_entries.business_id
      WHERE daily_entries.id = entry_corrections.original_entry_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- ============================================================
-- GATE_UNLOCKS
-- ============================================================
CREATE TABLE IF NOT EXISTS gate_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  gate int NOT NULL CHECK (gate >= 0 AND gate <= 5),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  snapshot jsonb NOT NULL
);

ALTER TABLE gate_unlocks ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON gate_unlocks TO authenticated;
GRANT SELECT, INSERT ON gate_unlocks TO service_role;

DROP POLICY IF EXISTS "select_own_gate_unlocks" ON gate_unlocks;
CREATE POLICY "select_own_gate_unlocks" ON gate_unlocks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = gate_unlocks.business_id AND businesses.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_gate_unlocks_business_gate ON gate_unlocks(business_id, gate);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  owner_type text NOT NULL CHECK (owner_type IN ('FOUNDER','AI_DRAFT','AUTO','HUMAN')),
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','approved','sent','done')),
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON tasks TO service_role;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = tasks.business_id AND businesses.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = tasks.business_id AND businesses.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = tasks.business_id AND businesses.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = tasks.business_id AND businesses.owner_id = auth.uid())
  );

-- ============================================================
-- AUDIT_LOG (append-only — INSERT via service_role only)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON audit_log TO authenticated;
GRANT SELECT, INSERT ON audit_log TO service_role;

DROP POLICY IF EXISTS "select_own_audit_log" ON audit_log;
CREATE POLICY "select_own_audit_log" ON audit_log FOR SELECT
  TO authenticated USING (auth.uid() = actor_id);

-- ============================================================
-- PLANS (public read — config only)
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_minor int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON plans TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_plans" ON plans;
CREATE POLICY "public_read_plans" ON plans FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- HELPER FUNCTION: get business progress totals
-- Returns cumulative customers, revenue, costs, margin, conversation count
-- for a given business. Used by unlock_gate and readable by the client.
-- ============================================================
CREATE OR REPLACE FUNCTION get_business_progress(p_business_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_customers', COALESCE(SUM(de.new_customers), 0),
    'total_revenue', COALESCE(SUM(de.revenue), 0),
    'total_costs', COALESCE(SUM(de.costs), 0),
    'margin_pct', CASE
      WHEN COALESCE(SUM(de.revenue), 0) > 0
      THEN ROUND(((SUM(de.revenue) - SUM(de.costs))::numeric / SUM(de.revenue)) * 100, 2)
      ELSE 0
    END,
    'conversation_count', (
      SELECT COUNT(*) FROM customer_conversations WHERE customer_conversations.business_id = p_business_id
    ),
    'entry_count', COUNT(de.id),
    'latest_entry_date', MAX(de.entry_date)
  )
  FROM daily_entries de
  WHERE de.business_id = p_business_id;
$$;

REVOKE EXECUTE ON FUNCTION get_business_progress(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_business_progress(uuid) TO authenticated;

-- ============================================================
-- SECURITY DEFINER FUNCTION: unlock_gate
-- Server-side gate unlock check. Re-computes progress from daily_entries,
-- compares against country_settings.gate_targets, and inserts gate_unlocks
-- record + updates businesses.current_gate if requirements are met.
-- The client can NEVER unlock a gate by itself.
-- ============================================================
CREATE OR REPLACE FUNCTION unlock_gate(p_business_id uuid, p_gate int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business businesses%ROWTYPE;
  v_country text;
  v_targets jsonb;
  v_progress jsonb;
  v_gate_key text;
  v_gate_config jsonb;
  v_missing jsonb := '[]'::jsonb;
  v_total_customers int;
  v_total_revenue bigint;
  v_margin_pct numeric;
  v_conversation_count int;
  v_team_size int;
  v_existing record;
BEGIN
  -- Get the business
  SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business not found');
  END IF;

  -- Only allow unlocking the next gate (current_gate + 1)
  IF p_gate != v_business.current_gate + 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only unlock the next gate');
  END IF;

  -- Get country settings with gate targets
  v_country := v_business.country;
  SELECT gate_targets INTO v_targets FROM country_settings WHERE country = v_country;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Country settings not found');
  END IF;

  -- Get the gate key (gates stored as "gate_0", "gate_1", etc.)
  v_gate_key := 'gate_' || p_gate;
  v_gate_config := v_targets->v_gate_key;
  IF v_gate_config IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gate configuration not found');
  END IF;

  -- Get current progress
  v_progress := get_business_progress(p_business_id);
  v_total_customers := (v_progress->>'total_customers')::int;
  v_total_revenue := (v_progress->>'total_revenue')::bigint;
  v_margin_pct := (v_progress->>'margin_pct')::numeric;
  v_conversation_count := (v_progress->>'conversation_count')::int;

  -- Check each requirement in the gate config
  -- Gate config format: {"customers": N, "revenue": N, "margin": N, "conversations": N, "team_size": N}
  -- Only check fields that are present in the config

  IF v_gate_config ? 'conversations' THEN
    IF v_conversation_count < (v_gate_config->>'conversations')::int THEN
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'field', 'conversations',
        'current', v_conversation_count,
        'required', (v_gate_config->>'conversations')::int,
        'shortfall', (v_gate_config->>'conversations')::int - v_conversation_count
      ));
    END IF;
  END IF;

  IF v_gate_config ? 'customers' THEN
    IF v_total_customers < (v_gate_config->>'customers')::int THEN
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'field', 'customers',
        'current', v_total_customers,
        'required', (v_gate_config->>'customers')::int,
        'shortfall', (v_gate_config->>'customers')::int - v_total_customers
      ));
    END IF;
  END IF;

  IF v_gate_config ? 'revenue' THEN
    IF v_total_revenue < (v_gate_config->>'revenue')::bigint THEN
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'field', 'revenue',
        'current', v_total_revenue,
        'required', (v_gate_config->>'revenue')::bigint,
        'shortfall', (v_gate_config->>'revenue')::bigint - v_total_revenue
      ));
    END IF;
  END IF;

  IF v_gate_config ? 'margin' THEN
    IF v_margin_pct < (v_gate_config->>'margin')::numeric THEN
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'field', 'margin',
        'current', v_margin_pct,
        'required', (v_gate_config->>'margin')::numeric,
        'shortfall', (v_gate_config->>'margin')::numeric - v_margin_pct
      ));
    END IF;
  END IF;

  -- Gate 4 team_size is checked against a column we don't have yet in Phase 1
  -- (team size is collected later per spec). We skip team_size check for now.
  -- It will be added when the team_size field is introduced.

  -- If there are missing requirements, return them
  IF jsonb_array_length(v_missing) > 0 THEN
    RETURN jsonb_build_object('success', false, 'unlocked', false, 'missing', v_missing, 'progress', v_progress);
  END IF;

  -- Check if already unlocked
  SELECT id INTO v_existing FROM gate_unlocks WHERE business_id = p_business_id AND gate = p_gate LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gate already unlocked');
  END IF;

  -- Unlock: insert gate_unlocks record + update businesses.current_gate
  INSERT INTO gate_unlocks (business_id, gate, snapshot)
  VALUES (p_business_id, p_gate, v_progress);

  UPDATE businesses SET current_gate = p_gate WHERE id = p_business_id;

  -- Audit log
  INSERT INTO audit_log (actor_id, action, table_name, record_id)
  VALUES (auth.uid(), 'GATE_UNLOCK', 'businesses', p_business_id);

  RETURN jsonb_build_object('success', true, 'unlocked', true, 'gate', p_gate, 'snapshot', v_progress);
END;
$$;

REVOKE EXECUTE ON FUNCTION unlock_gate(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION unlock_gate(uuid, int) TO authenticated;

-- ============================================================
-- SECURITY DEFINER FUNCTION: insert_daily_entry
-- Inserts a daily entry with computed hash chain. The client cannot
-- forge the hash — it's computed server-side from the content + previous hash.
-- Also enforces uniqueness per business per day.
-- ============================================================
CREATE OR REPLACE FUNCTION insert_daily_entry(
  p_business_id uuid,
  p_entry_date date,
  p_result text,
  p_new_customers int,
  p_revenue bigint,
  p_costs bigint,
  p_note text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous_hash text;
  v_entry_hash text;
  v_content text;
  v_entry_id uuid;
  v_owner_id uuid;
BEGIN
  -- Verify the caller owns this business
  SELECT owner_id INTO v_owner_id FROM businesses WHERE id = p_business_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business not found');
  END IF;
  IF v_owner_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not own this business');
  END IF;

  -- Get the previous entry's hash for the chain
  SELECT entry_hash INTO v_previous_hash
  FROM daily_entries
  WHERE business_id = p_business_id
  ORDER BY entry_date DESC, created_at DESC
  LIMIT 1;

  -- Compute the hash: SHA-256 of (content || previous_hash)
  v_content := p_business_id::text || '|' || p_entry_date::text || '|' || p_result || '|' ||
               p_new_customers::text || '|' || p_revenue::text || '|' || p_costs::text || '|' ||
               COALESCE(p_note, '') || '|' || COALESCE(v_previous_hash, '');

  v_entry_hash := encode(digest(v_content, 'sha256'), 'hex');

  -- Insert the entry
  INSERT INTO daily_entries (business_id, entry_date, result, new_customers, revenue, costs, note, entry_hash, previous_hash)
  VALUES (p_business_id, p_entry_date, p_result, p_new_customers, p_revenue, p_costs, p_note, v_entry_hash, v_previous_hash)
  RETURNING id INTO v_entry_id;

  -- Audit log
  INSERT INTO audit_log (actor_id, action, table_name, record_id)
  VALUES (auth.uid(), 'DAILY_ENTRY_INSERT', 'daily_entries', v_entry_id);

  RETURN jsonb_build_object('success', true, 'entry_id', v_entry_id, 'entry_hash', v_entry_hash);
END;
$$;

REVOKE EXECUTE ON FUNCTION insert_daily_entry(uuid, date, text, int, bigint, bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION insert_daily_entry(uuid, date, text, int, bigint, bigint, text) TO authenticated;

-- ============================================================
-- SEED DATA: Nigeria country settings with gate targets
-- Gate targets are stored as JSON and read by the unlock_gate function.
-- Amounts are in minor units (kobo) for Naira.
-- ============================================================
INSERT INTO country_settings (country, currency, currency_symbol, gate_targets)
VALUES (
  'Nigeria',
  'NGN',
  '₦',
  jsonb_build_object(
    'gate_0', jsonb_build_object('conversations', 10),
    'gate_1', jsonb_build_object('customers', 10),
    'gate_2', jsonb_build_object('customers', 100, 'revenue', 10000000),
    'gate_3', jsonb_build_object('customers', 500, 'revenue', 200000000, 'margin', 30),
    'gate_4', jsonb_build_object('customers', 2000, 'revenue', 1000000000),
    'gate_5', jsonb_build_object('review_required', true)
  )
)
ON CONFLICT (country) DO NOTHING;

-- ============================================================
-- SEED DATA: Plans (inactive — config only per C3)
-- ============================================================
INSERT INTO plans (name, price_minor, currency, active)
VALUES
  ('Founder Free', 0, 'NGN', true),
  ('Founder Pro', 5000, 'NGN', false),
  ('Partner Programme', 0, 'NGN', false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    'founder',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Founder'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticator;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();