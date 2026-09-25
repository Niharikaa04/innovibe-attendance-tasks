-- ============================================================================
-- Migration 0015 — User ID login
-- ============================================================================
-- Run the WHOLE file once in Supabase -> SQL Editor. Safe to run again.
--
-- What this does:
--   1. Adds ONE nullable column (employee_id) to the EXISTING public.profiles
--      table. No new table is created.
--   2. Backfills employee_id for the 5 current accounts, matched by their
--      existing Supabase Auth email (their email/password login is untouched).
--   3. Adds a single lookup function the login screen calls to turn a typed
--      User ID into the matching Auth email, so sign-in can still use
--      Supabase's normal email/password check. The function is SECURITY
--      DEFINER (it can see auth.users) but only ever returns the email for
--      an exact User ID match — it is never used to list or browse accounts.
--
-- Nothing here touches auth.users, existing passwords, roles, RLS policies
-- on other tables, or the password-recovery flow.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. New column on the existing profiles table
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists employee_id text;

-- One User ID per person (case-insensitive), only enforced once it's set.
create unique index if not exists profiles_employee_id_unique_idx
  on public.profiles (lower(employee_id))
  where employee_id is not null;

-- ---------------------------------------------------------------------------
-- 2. Backfill the 5 current accounts.
--    To add a new hire later, add one more row to this VALUES list (or run
--    a one-line update the same way) — no code change is needed for that.
-- ---------------------------------------------------------------------------
update public.profiles p
   set employee_id = v.employee_id
  from (values
        ('ceo@innovibemobility.com',         'SriHari.ceo'),
        ('niharikahari94@gmail.com',         'Niharika.it'),
        ('greeshmasatyasridasari@gmail.com', 'Greeshma.it'),
        ('yaminibattula26@gmail.com',        'Yamini.rd'),
        ('mail2laasya@gmail.com',            'Laasya.data')
       ) as v(email, employee_id)
  join auth.users u on lower(u.email) = lower(v.email)
 where p.id = u.id;

-- ---------------------------------------------------------------------------
-- 3. Lookup function used ONLY by the sign-in and forgot-password screens,
--    before a session exists.
--
--    Security notes:
--    - It takes a User ID and returns the matching Auth email (or NULL) —
--      nothing else about the account.
--    - The client never displays this value; it is used only in memory, to
--      immediately call supabase.auth.signInWithPassword(...) or
--      supabase.auth.resetPasswordForEmail(...), then discarded.
--    - It does not distinguish "wrong User ID" from "wrong password" —
--      the app shows the same generic error either way.
-- ---------------------------------------------------------------------------
create or replace function public.get_auth_email_for_employee_id(p_employee_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.email
    from public.profiles p
    join auth.users u on u.id = p.id
   where lower(p.employee_id) = lower(trim(p_employee_id))
   limit 1;
$$;

revoke all on function public.get_auth_email_for_employee_id(text) from public;
-- Must be callable by a signed-out visitor — that's the whole point of a
-- login screen — so anon needs execute here, same as any login endpoint.
grant execute on function public.get_auth_email_for_employee_id(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Confirm the mapping:
-- ---------------------------------------------------------------------------
select p.employee_id, p.full_name, p.role, u.email
  from public.profiles p
  join auth.users u on u.id = p.id
 where p.employee_id is not null
 order by p.employee_id;
