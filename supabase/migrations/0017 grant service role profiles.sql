-- ============================================================================
-- Migration 0017 — Grant service_role access to profiles
-- ============================================================================
-- Run the WHOLE file once in Supabase -> SQL Editor. Safe to run again.
--
-- Fixes: the create-employee edge function's service-role client getting
--   "permission denied for table profiles" (Postgres 42501)
-- when it looks up the caller's role.
--
-- Why this happens: Postgres checks the table-level GRANT before it ever
-- evaluates Row Level Security. service_role's BYPASSRLS attribute skips RLS
-- policies, but it does NOT skip the grant check — if service_role was never
-- explicitly granted access to a table, it gets the same "permission denied"
-- error an ungranted role would. Migration 0008 granted `authenticated` on
-- profiles but never granted `service_role` — this migration adds that.
--
-- This does not change any RLS policy, any existing grant, or any row of
-- data. service_role already has BYPASSRLS, so this only restores the
-- table-level access it needs to use that bypass at all.
-- ============================================================================

grant usage on schema public to service_role;

grant select, insert, update, delete
  on public.profiles to service_role;

-- ---------------------------------------------------------------------------
-- Confirm the fix: expect service_role_can_select = true.
-- ---------------------------------------------------------------------------
select has_table_privilege('service_role', 'public.profiles', 'select') as service_role_can_select;