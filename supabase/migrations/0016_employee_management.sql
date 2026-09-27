-- ============================================================================
-- Migration 0016 — Employee management (Employee Directory + Add Employee)
-- ============================================================================
-- Run the WHOLE file once in Supabase -> SQL Editor. Safe to run again.
--
-- Everything this feature needs already exists from earlier migrations:
--   - public.profiles.role            (0001)
--   - public.profiles.employee_id     (0015, unique per person)
--   - public.iv_is_manager() / iv_is_admin()   (0001)
--   - "only an admin can change role" trigger  (0010, SECTION 1)
--
-- The only thing genuinely missing is somewhere to show a person's email and
-- account status in the Employee Directory (today that lives only in
-- auth.users, which the browser cannot query directly). This migration adds
-- two nullable/defaulted columns to the EXISTING profiles table — no new
-- table, no data loss, no change to any existing column or row.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. New columns on the existing profiles table
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists status text not null default 'active';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_status_allowed'
  ) then
    alter table public.profiles
      add constraint profiles_status_allowed
      check (status in ('active', 'disabled'));
  end if;
end $$;

-- One email per person (case-insensitive), same style as the employee_id
-- unique index in 0015. Only enforced once email is actually set, so it
-- never blocks existing rows that predate this column.
create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email))
  where email is not null;

-- ---------------------------------------------------------------------------
-- 2. Backfill email for every account that already exists, from auth.users
--    (read-only lookup, run once — harmless to re-run).
-- ---------------------------------------------------------------------------
update public.profiles p
   set email = u.email
  from auth.users u
 where p.id = u.id
   and p.email is null;

-- ---------------------------------------------------------------------------
-- Confirm the result:
-- ---------------------------------------------------------------------------
select employee_id, full_name, role, email, status, created_at
  from public.profiles
 order by created_at;
