-- ============================================================================
-- Migration 0000 — Bootstrap public.profiles (fresh projects only)
-- ============================================================================
-- Run this FIRST, always — it is safe on both a brand-new Supabase project
-- and an existing InnoVibe Chat project.
--
-- If InnoVibe Chat already has a `profiles` table (the normal case — this
-- module is meant to reuse it), every statement below is a no-op: `create
-- table if not exists` skips, and the policies/trigger use `drop ... if
-- exists` before creating, so re-running this file never touches existing
-- data or duplicates policies.
--
-- If you are starting from a brand-new, empty Supabase project (no chat app
-- deployed yet), this creates a minimal `profiles` table so migrations 0001
-- onward — which assume `profiles` exists — have something to build on.
-- ============================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- New signups get a profile row automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Backfill: if you created user accounts (Authentication → Users) BEFORE
-- running this migration, the trigger above did not fire for them yet.
-- This catches them up. Safe to run every time — it only inserts rows that
-- are missing, never touches existing profiles.
-- ---------------------------------------------------------------------------
insert into public.profiles (id, full_name)
select u.id, split_part(u.email, '@', 1)
  from auth.users u
 where u.id not in (select id from public.profiles);

-- Confirm every auth user now has a profile:
select u.email, (p.id is not null) as has_profile
  from auth.users u
  left join public.profiles p on p.id = u.id
 order by u.created_at;
