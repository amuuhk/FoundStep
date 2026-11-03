/*
# Equity agreement acceptance and MVP cleanup

## Overview
Records when a founder accepts the 5% equity agreement, removes the investor
role from the MVP, and removes the premium plan from pricing configuration.

## Changes
1. profiles.equity_agreement_accepted_at (timestamptz, nullable): when the founder accepted the 5% equity agreement.
2. Function accept_equity_agreement(): sets that timestamp for the signed-in user only. The first acceptance is kept; later calls do not overwrite it.
3. profiles.role: investor accounts are moved to founder, and the investor role is removed from the allowed values.
4. plans: the "Founder Pro" premium plan row is deleted. The table itself and the other plans are unchanged.

## Security
- Browsers cannot write equity_agreement_accepted_at directly; it can only be set through accept_equity_agreement().
- The function is callable by signed-in users only (EXECUTE revoked from PUBLIC and anon).
- Existing profile rows and business data are not deleted.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equity_agreement_accepted_at timestamptz;

UPDATE profiles SET role = 'founder' WHERE role = 'investor';

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('founder', 'mentor', 'admin'));

DELETE FROM plans WHERE name = 'Founder Pro';

CREATE OR REPLACE FUNCTION accept_equity_agreement()
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_accepted_at timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to accept the equity agreement';
  END IF;

  UPDATE profiles
  SET equity_agreement_accepted_at = COALESCE(equity_agreement_accepted_at, now())
  WHERE id = auth.uid()
  RETURNING equity_agreement_accepted_at INTO v_accepted_at;

  RETURN v_accepted_at;
END;
$$;

REVOKE EXECUTE ON FUNCTION accept_equity_agreement() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION accept_equity_agreement() TO authenticated;
