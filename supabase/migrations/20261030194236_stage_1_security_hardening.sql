/*
# Stage 1 security hardening

## Overview
Tightens the founders-only MVP so browser requests cannot change gate progress,
forge daily-entry integrity fields, or write coach messages as the coach.

## Modified tables and access
- `profiles`: authenticated users can read their own profile and update only profile details.
- `businesses`: authenticated users can read and create their own business and update only editable business details; gate state and ownership are not browser-writable.
- `country_settings`: public read-only configuration.
- `customer_conversations`: authenticated owners can read and add their own records.
- `daily_entries`: authenticated owners can read only; new entries are inserted only through the server function; no update or delete access.
- `entry_corrections`: authenticated owners can read and add correction records.
- `gate_unlocks`: authenticated owners can read only; unlock records are inserted only by the server function.
- `tasks`: authenticated owners can read and update task status only.
- `audit_log`: authenticated users can read their own audit records; inserts remain service-side only.
- `plans`: public read-only configuration.
- `coach_messages`: authenticated owners can read and add founder messages only; coach messages remain service-side only.

## Function changes
- `get_business_progress` returns data only for the authenticated owner of the requested business.
- `unlock_gate` rejects calls for businesses the caller does not own.
- `insert_daily_entry` remains the only normal insert path for daily entries and continues to compute hashes server-side.
- `handle_new_user` is callable only by the auth trigger role.

## Security notes
1. Row Level Security remains enabled on every table.
2. Anonymous table access is removed except for intentional read-only configuration tables.
3. Browser writes are column-restricted where a column controls ownership, gate state, integrity, or moderation history.
4. No existing rows are deleted or changed by this migration.
*/

REVOKE ALL ON profiles, businesses, country_settings, customer_conversations,
  daily_entries, entry_corrections, gate_unlocks, tasks, audit_log, plans, coach_messages
  FROM anon, authenticated;

GRANT SELECT ON TABLE profiles TO authenticated;
GRANT UPDATE (full_name, phone, email, country, state, language) ON TABLE profiles TO authenticated;

GRANT SELECT ON TABLE businesses TO authenticated;
GRANT INSERT (name, sector, description, stage, start_date, cac_registered, cac_number, country) ON TABLE businesses TO authenticated;
GRANT UPDATE (name, sector, description, stage, start_date, cac_registered, cac_number, country) ON TABLE businesses TO authenticated;

GRANT SELECT ON TABLE country_settings TO anon, authenticated;
GRANT SELECT ON TABLE plans TO anon, authenticated;

GRANT SELECT ON TABLE customer_conversations TO authenticated;
GRANT INSERT (business_id, person_name, note, outcome) ON TABLE customer_conversations TO authenticated;

GRANT SELECT ON TABLE daily_entries TO authenticated;

GRANT SELECT ON TABLE entry_corrections TO authenticated;
GRANT INSERT (original_entry_id, fields, reason) ON TABLE entry_corrections TO authenticated;

GRANT SELECT ON TABLE gate_unlocks TO authenticated;

GRANT SELECT ON TABLE tasks TO authenticated;
GRANT UPDATE (status) ON TABLE tasks TO authenticated;

GRANT SELECT ON TABLE audit_log TO authenticated;

GRANT SELECT ON TABLE coach_messages TO authenticated;
GRANT INSERT (business_id, sender, body) ON TABLE coach_messages TO authenticated;

DROP POLICY IF EXISTS "insert_own_coach_messages" ON coach_messages;
CREATE POLICY "insert_own_founder_messages" ON coach_messages FOR INSERT
  TO authenticated WITH CHECK (
    sender = 'founder'
    AND EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = coach_messages.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

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
      SELECT COUNT(*) FROM coach_messages
      WHERE coach_messages.business_id = p_business_id
        AND coach_messages.sender = 'founder'
    ),
    'entry_count', COUNT(de.id),
    'latest_entry_date', MAX(de.entry_date)
  )
  FROM daily_entries de
  WHERE de.business_id = p_business_id
    AND EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = p_business_id
        AND businesses.owner_id = auth.uid()
    );
$$;

REVOKE EXECUTE ON FUNCTION get_business_progress(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_business_progress(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION unlock_gate(p_business_id uuid, p_gate int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business businesses%ROWTYPE;
  v_targets jsonb;
  v_progress jsonb;
  v_gate_key text;
  v_gate_config jsonb;
  v_missing jsonb := '[]'::jsonb;
  v_total_customers int;
  v_total_revenue bigint;
  v_margin_pct numeric;
  v_conversation_count int;
  v_existing record;
BEGIN
  SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
  IF NOT FOUND OR v_business.owner_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business not found');
  END IF;

  IF p_gate != v_business.current_gate + 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only unlock the next gate');
  END IF;

  SELECT gate_targets INTO v_targets FROM country_settings WHERE country = v_business.country;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Country settings not found');
  END IF;

  v_gate_key := 'gate_' || p_gate;
  v_gate_config := v_targets->v_gate_key;
  IF v_gate_config IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gate configuration not found');
  END IF;

  v_progress := get_business_progress(p_business_id);
  v_total_customers := (v_progress->>'total_customers')::int;
  v_total_revenue := (v_progress->>'total_revenue')::bigint;
  v_margin_pct := (v_progress->>'margin_pct')::numeric;
  v_conversation_count := (v_progress->>'conversation_count')::int;

  IF v_gate_config ? 'conversations' AND v_conversation_count < (v_gate_config->>'conversations')::int THEN
    v_missing := v_missing || jsonb_build_array(jsonb_build_object(
      'field', 'conversations', 'current', v_conversation_count,
      'required', (v_gate_config->>'conversations')::int,
      'shortfall', (v_gate_config->>'conversations')::int - v_conversation_count
    ));
  END IF;

  IF v_gate_config ? 'customers' AND v_total_customers < (v_gate_config->>'customers')::int THEN
    v_missing := v_missing || jsonb_build_array(jsonb_build_object(
      'field', 'customers', 'current', v_total_customers,
      'required', (v_gate_config->>'customers')::int,
      'shortfall', (v_gate_config->>'customers')::int - v_total_customers
    ));
  END IF;

  IF v_gate_config ? 'revenue' AND v_total_revenue < (v_gate_config->>'revenue')::bigint THEN
    v_missing := v_missing || jsonb_build_array(jsonb_build_object(
      'field', 'revenue', 'current', v_total_revenue,
      'required', (v_gate_config->>'revenue')::bigint,
      'shortfall', (v_gate_config->>'revenue')::bigint - v_total_revenue
    ));
  END IF;

  IF v_gate_config ? 'margin' AND v_margin_pct < (v_gate_config->>'margin')::numeric THEN
    v_missing := v_missing || jsonb_build_array(jsonb_build_object(
      'field', 'margin', 'current', v_margin_pct,
      'required', (v_gate_config->>'margin')::numeric,
      'shortfall', (v_gate_config->>'margin')::numeric - v_margin_pct
    ));
  END IF;

  IF jsonb_array_length(v_missing) > 0 THEN
    RETURN jsonb_build_object('success', false, 'unlocked', false, 'missing', v_missing, 'progress', v_progress);
  END IF;

  SELECT id INTO v_existing FROM gate_unlocks WHERE business_id = p_business_id AND gate = p_gate LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gate already unlocked');
  END IF;

  INSERT INTO gate_unlocks (business_id, gate, snapshot)
  VALUES (p_business_id, p_gate, v_progress);

  UPDATE businesses SET current_gate = p_gate WHERE id = p_business_id AND owner_id = auth.uid();

  INSERT INTO audit_log (actor_id, action, table_name, record_id)
  VALUES (auth.uid(), 'GATE_UNLOCK', 'businesses', p_business_id);

  RETURN jsonb_build_object('success', true, 'unlocked', true, 'gate', p_gate, 'snapshot', v_progress);
END;
$$;

REVOKE EXECUTE ON FUNCTION unlock_gate(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION unlock_gate(uuid, int) TO authenticated;

REVOKE EXECUTE ON FUNCTION insert_daily_entry(uuid, date, text, int, bigint, bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION insert_daily_entry(uuid, date, text, int, bigint, bigint, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticator;