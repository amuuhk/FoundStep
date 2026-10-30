/*
# Coach Messages — WhatsApp-style founder-coach chat for Gate 0

## Overview
Replaces the manual "customer conversation" logging with a simple chat interface
between the founder and a coach. Messages are stored in a new `coach_messages` table.
The `get_business_progress` function is updated to count coach messages (from the
founder) as the Gate 0 "conversation_count", so the existing gate-unlock logic
works without changes on the frontend.

## New Table
- `coach_messages`
  - `id` (uuid, primary key)
  - `business_id` (uuid, FK to businesses, ON DELETE CASCADE)
  - `sender` (text, 'founder' or 'coach')
  - `body` (text, the message content)
  - `created_at` (timestamptz, defaults to now())

## Security
- RLS enabled on `coach_messages`
- Founders can SELECT and INSERT their own messages (ownership via businesses table)
- `service_role` gets SELECT + INSERT for edge-function use (Termii webhook)
- `get_business_progress` updated to count founder messages as conversation_count

## Notes
- The old `customer_conversations` table is kept for backward compatibility
- When Termii is integrated, an edge function will insert coach messages from
  SMS replies; the service_role grant supports that
*/

-- ============================================================
-- COACH_MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS coach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('founder', 'coach')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON coach_messages TO authenticated;
GRANT SELECT, INSERT ON coach_messages TO service_role;

DROP POLICY IF EXISTS "select_own_coach_messages" ON coach_messages;
CREATE POLICY "select_own_coach_messages" ON coach_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = coach_messages.business_id AND businesses.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_coach_messages" ON coach_messages;
CREATE POLICY "insert_own_coach_messages" ON coach_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = coach_messages.business_id AND businesses.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_coach_messages_business_created ON coach_messages(business_id, created_at ASC);

-- ============================================================
-- UPDATE get_business_progress to count coach messages
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
      SELECT COUNT(*) FROM coach_messages
      WHERE coach_messages.business_id = p_business_id
        AND coach_messages.sender = 'founder'
    ),
    'entry_count', COUNT(de.id),
    'latest_entry_date', MAX(de.entry_date)
  )
  FROM daily_entries de
  WHERE de.business_id = p_business_id;
$$;

REVOKE EXECUTE ON FUNCTION get_business_progress(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_business_progress(uuid) TO authenticated;

-- Enable realtime for coach_messages
ALTER PUBLICATION supabase_realtime ADD TABLE coach_messages;