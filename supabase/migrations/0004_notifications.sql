-- ============================================================================
-- Migration 0004 — Notifications
-- ============================================================================
-- If public.notifications already exists in the InnoVibe project it is REUSED.
-- We only add the columns this module needs, with IF NOT EXISTS, so nothing
-- existing is renamed, dropped or rewritten.
-- ============================================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.notifications add column if not exists type       text;
alter table public.notifications add column if not exists title      text;
alter table public.notifications add column if not exists body       text;
alter table public.notifications add column if not exists link       text;
alter table public.notifications add column if not exists data       jsonb default '{}'::jsonb;
alter table public.notifications add column if not exists is_read    boolean default false;
alter table public.notifications add column if not exists actor_id   uuid;
alter table public.notifications add column if not exists created_at timestamptz default now();

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own on public.notifications
  for delete to authenticated using (user_id = auth.uid());

-- Nobody inserts notifications from the client. Only the SECURITY DEFINER
-- helper below (called by triggers) writes them.

-- ---------------------------------------------------------------------------
-- iv_notify — single entry point for module notifications
-- ---------------------------------------------------------------------------
-- Deliberately swallows its own errors: if the pre-existing notifications
-- table has a shape we cannot satisfy, a task update must still succeed. The
-- failure is raised as a warning in the Postgres logs instead.
-- ---------------------------------------------------------------------------
create or replace function public.iv_notify(
  p_user_id  uuid,
  p_actor_id uuid,
  p_type     text,
  p_title    text,
  p_body     text,
  p_link     text default null,
  p_data     jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then return; end if;
  if p_user_id = p_actor_id then return; end if;   -- never notify yourself

  insert into public.notifications (user_id, actor_id, type, title, body, link, data, is_read)
  values (p_user_id, p_actor_id, p_type, p_title, p_body, p_link, coalesce(p_data,'{}'::jsonb), false);
exception
  when others then
    raise warning 'iv_notify skipped (%): %', sqlstate, sqlerrm;
end;
$$;

grant execute on function public.iv_notify(uuid, uuid, text, text, text, text, jsonb) to authenticated;

-- Mark-all-read convenience
create or replace function public.iv_mark_notifications_read(p_ids uuid[] default null)
returns int
language sql
security invoker
set search_path = public
as $$
  with upd as (
    update public.notifications
       set is_read = true
     where user_id = auth.uid()
       and is_read is distinct from true
       and (p_ids is null or id = any(p_ids))
    returning 1
  )
  select count(*)::int from upd;
$$;

grant execute on function public.iv_mark_notifications_read(uuid[]) to authenticated;
