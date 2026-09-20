-- ============================================================================
-- InnoVibe Office · Attendance & Task modules
-- Migration 0001 — core helpers, roles, work settings
-- ============================================================================
-- SAFE TO RUN ON THE EXISTING PROJECT.
-- This migration is purely additive. It does not rename, drop or truncate any
-- existing table, and it does not touch auth, chat, channels, DMs or Jitsi.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Make sure profiles has a role column (existing profiles table is reused)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text;

-- Anyone without a role yet becomes a normal employee.
update public.profiles set role = 'employee' where role is null;

alter table public.profiles
  alter column role set default 'employee';

-- Allowed roles. Added as NOT VALID so pre-existing rows can never block the
-- migration; validate it after you have reviewed the data.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_allowed'
  ) then
    alter table public.profiles
      add constraint profiles_role_allowed
      check (lower(role) in ('ceo','admin','manager','hr','lead','employee','intern'))
      not valid;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Role helpers (SECURITY DEFINER → no recursive RLS on profiles)
-- ---------------------------------------------------------------------------
-- These read profiles with the owner's rights, so an RLS policy on attendance
-- or tasks can call them without re-entering profiles' own policies.

create or replace function public.iv_role(uid uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(p.role, 'employee'))
  from public.profiles p
  where p.id = uid;
$$;

create or replace function public.iv_is_manager(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.iv_role(uid) in ('ceo','admin','manager','hr','lead'), false);
$$;

create or replace function public.iv_is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.iv_role(uid) in ('ceo','admin'), false);
$$;

revoke all on function public.iv_role(uuid)       from public;
revoke all on function public.iv_is_manager(uuid) from public;
revoke all on function public.iv_is_admin(uuid)   from public;
grant execute on function public.iv_role(uuid)       to authenticated;
grant execute on function public.iv_is_manager(uuid) to authenticated;
grant execute on function public.iv_is_admin(uuid)   to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.iv_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Office working-hours settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.iv_work_settings (
  id                  smallint primary key default 1,
  timezone            text        not null default 'Asia/Kolkata',
  work_start          time        not null default '09:30',
  work_end            time        not null default '18:30',
  late_grace_minutes  int         not null default 15,
  full_day_minutes    int         not null default 480,
  half_day_minutes    int         not null default 240,
  updated_at          timestamptz not null default now(),
  constraint iv_work_settings_single_row check (id = 1)
);

insert into public.iv_work_settings (id) values (1)
on conflict (id) do nothing;

drop trigger if exists iv_work_settings_touch on public.iv_work_settings;
create trigger iv_work_settings_touch
  before update on public.iv_work_settings
  for each row execute function public.iv_touch_updated_at();

alter table public.iv_work_settings enable row level security;

drop policy if exists iv_work_settings_read on public.iv_work_settings;
create policy iv_work_settings_read on public.iv_work_settings
  for select to authenticated using (true);

drop policy if exists iv_work_settings_write on public.iv_work_settings;
create policy iv_work_settings_write on public.iv_work_settings
  for update to authenticated
  using (public.iv_is_admin()) with check (public.iv_is_admin());

-- Convenience: "what date is it in office time right now"
create or replace function public.iv_today()
returns date
language sql
stable
as $$
  select ((now() at time zone (select timezone from public.iv_work_settings where id = 1)))::date;
$$;

grant execute on function public.iv_today() to authenticated;
