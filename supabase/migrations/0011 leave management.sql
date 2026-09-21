-- ============================================================================
-- Migration 0010 — Leave Management
-- ============================================================================
-- Purely additive, same pattern as attendance/tasks: SECURITY DEFINER RPCs
-- for writes that need server-side validation, RLS for reads, realtime on
-- the table, and iv_notify for the two events that matter (applied,
-- reviewed). Nothing here touches attendance, tasks, chat, or auth.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'iv_leave_type') then
    create type public.iv_leave_type as enum ('sick', 'casual', 'earned', 'unpaid');
  end if;
  if not exists (select 1 from pg_type where typname = 'iv_leave_status') then
    create type public.iv_leave_status as enum ('pending', 'approved', 'rejected', 'cancelled');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Annual allocation per leave type (single row per type, admin-editable).
-- Used only to compute "days remaining" — it does not gate whether someone
-- can apply; a manager can still approve past the allocation if they choose.
-- ---------------------------------------------------------------------------
create table if not exists public.iv_leave_policy (
  leave_type   public.iv_leave_type primary key,
  annual_days  int not null default 12,
  updated_at   timestamptz not null default now()
);

insert into public.iv_leave_policy (leave_type, annual_days) values
  ('sick', 8), ('casual', 8), ('earned', 12), ('unpaid', 0)
on conflict (leave_type) do nothing;

alter table public.iv_leave_policy enable row level security;

drop policy if exists iv_leave_policy_read on public.iv_leave_policy;
create policy iv_leave_policy_read on public.iv_leave_policy
  for select to authenticated using (true);

drop policy if exists iv_leave_policy_write on public.iv_leave_policy;
create policy iv_leave_policy_write on public.iv_leave_policy
  for update to authenticated
  using (public.iv_is_admin()) with check (public.iv_is_admin());

-- ---------------------------------------------------------------------------
-- Leave requests
-- ---------------------------------------------------------------------------
create table if not exists public.leaves (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  leave_type   public.iv_leave_type not null,
  start_date   date not null,
  end_date     date not null,
  days         int  not null,
  reason       text,
  status       public.iv_leave_status not null default 'pending',
  reviewed_by  uuid references auth.users(id) on delete set null,
  reviewed_at  timestamptz,
  review_note  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint leaves_date_order check (end_date >= start_date),
  constraint leaves_days_positive check (days > 0)
);

create index if not exists leaves_user_idx   on public.leaves (user_id, start_date desc);
create index if not exists leaves_status_idx on public.leaves (status);

drop trigger if exists leaves_touch on public.leaves;
create trigger leaves_touch
  before update on public.leaves
  for each row execute function public.iv_touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.leaves enable row level security;

drop policy if exists leaves_select on public.leaves;
create policy leaves_select on public.leaves
  for select to authenticated
  using (user_id = auth.uid() or public.iv_is_manager());

-- No direct insert/update policy for regular writes — those go through the
-- SECURITY DEFINER RPCs below so status transitions are validated server
-- side (an employee cannot self-approve, cannot edit a reviewed request).
drop policy if exists leaves_admin_all on public.leaves;
create policy leaves_admin_all on public.leaves
  for all to authenticated
  using (public.iv_is_admin()) with check (public.iv_is_admin());

-- ---------------------------------------------------------------------------
-- Apply for leave
-- ---------------------------------------------------------------------------
create or replace function public.iv_apply_leave(
  p_leave_type public.iv_leave_type,
  p_start_date date,
  p_end_date   date,
  p_reason     text default null
)
returns public.leaves
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_days int;
  v_row  public.leaves;
  v_who  text;
begin
  if v_uid is null then
    raise exception 'You must be signed in to apply for leave.' using errcode = '28000';
  end if;
  if p_end_date < p_start_date then
    raise exception 'End date cannot be before the start date.' using errcode = 'P0001';
  end if;

  v_days := (p_end_date - p_start_date) + 1;

  insert into public.leaves (user_id, leave_type, start_date, end_date, days, reason, status)
  values (v_uid, p_leave_type, p_start_date, p_end_date, v_days, p_reason, 'pending')
  returning * into v_row;

  v_who := public.iv_display_name(v_uid);

  -- Notify every manager/admin — small team, no single "manager of record".
  perform public.iv_notify(m.id, v_uid, 'leave_applied',
    v_who || ' requested leave',
    p_leave_type::text || ' · ' || v_days || (case when v_days = 1 then ' day' else ' days' end),
    '/leaves/' || v_row.id,
    jsonb_build_object('leave_id', v_row.id))
  from public.profiles m
  where public.iv_is_manager(m.id) and m.id <> v_uid;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Review (approve / reject) — manager/admin only, enforced here not just UI
-- ---------------------------------------------------------------------------
create or replace function public.iv_review_leave(
  p_leave_id uuid,
  p_decision public.iv_leave_status,   -- 'approved' or 'rejected'
  p_note     text default null
)
returns public.leaves
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.leaves;
begin
  if not public.iv_is_manager(v_uid) then
    raise exception 'Only a manager can review leave requests.' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected.' using errcode = 'P0001';
  end if;

  select * into v_row from public.leaves where id = p_leave_id for update;
  if not found then
    raise exception 'Leave request not found.' using errcode = 'P0002';
  end if;
  if v_row.status <> 'pending' then
    raise exception 'This request was already reviewed.' using errcode = 'P0001';
  end if;

  update public.leaves
     set status = p_decision, reviewed_by = v_uid, reviewed_at = now(), review_note = p_note
   where id = p_leave_id
  returning * into v_row;

  perform public.iv_notify(v_row.user_id, v_uid,
    case when p_decision = 'approved' then 'leave_approved' else 'leave_rejected' end,
    public.iv_display_name(v_uid) || ' ' || p_decision || ' your leave request',
    v_row.leave_type::text || ' · ' || v_row.days || (case when v_row.days = 1 then ' day' else ' days' end)
      || coalesce(' — ' || p_note, ''),
    '/leaves/' || v_row.id,
    jsonb_build_object('leave_id', v_row.id));

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Cancel — the requester can withdraw their own request while still pending
-- ---------------------------------------------------------------------------
create or replace function public.iv_cancel_leave(p_leave_id uuid)
returns public.leaves
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.leaves;
begin
  select * into v_row from public.leaves where id = p_leave_id for update;
  if not found then
    raise exception 'Leave request not found.' using errcode = 'P0002';
  end if;
  if v_row.user_id <> v_uid and not public.iv_is_admin(v_uid) then
    raise exception 'You can only cancel your own leave requests.' using errcode = '42501';
  end if;
  if v_row.status <> 'pending' then
    raise exception 'Only a pending request can be cancelled.' using errcode = 'P0001';
  end if;

  update public.leaves set status = 'cancelled' where id = p_leave_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.iv_apply_leave(public.iv_leave_type, date, date, text) to authenticated;
grant execute on function public.iv_review_leave(uuid, public.iv_leave_status, text)      to authenticated;
grant execute on function public.iv_cancel_leave(uuid)                                    to authenticated;

-- ---------------------------------------------------------------------------
-- Balance summary for the signed-in user: allocation, used (approved, this
-- calendar year), pending, remaining — one row per leave type.
-- ---------------------------------------------------------------------------
create or replace function public.iv_leave_balance(p_user uuid default null)
returns table (
  leave_type   public.iv_leave_type,
  annual_days  int,
  used_days    int,
  pending_days int,
  remaining    int
)
language sql
stable
security definer
set search_path = public
as $$
  with target as (
    select coalesce(p_user, auth.uid()) as uid
  ),
  guard as (
    select case when (select uid from target) = auth.uid() or public.iv_is_manager()
                then (select uid from target) else auth.uid() end as uid
  )
  select
    pol.leave_type,
    pol.annual_days,
    coalesce(sum(l.days) filter (
      where l.status = 'approved'
        and extract(year from l.start_date) = extract(year from public.iv_today())
    ), 0)::int,
    coalesce(sum(l.days) filter (where l.status = 'pending'), 0)::int,
    pol.annual_days - coalesce(sum(l.days) filter (
      where l.status = 'approved'
        and extract(year from l.start_date) = extract(year from public.iv_today())
    ), 0)::int
  from public.iv_leave_policy pol
  left join public.leaves l
    on l.leave_type = pol.leave_type and l.user_id = (select uid from guard)
  group by pol.leave_type, pol.annual_days
  order by pol.leave_type;
$$;

grant execute on function public.iv_leave_balance(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Team overview for managers: who's on leave today/upcoming, pending count
-- ---------------------------------------------------------------------------
create or replace function public.iv_leave_overview()
returns table (
  pending_count int,
  on_leave_today int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.leaves where status = 'pending')::int,
    (select count(*) from public.leaves
      where status = 'approved'
        and public.iv_today() between start_date and end_date)::int;
$$;

grant execute on function public.iv_leave_overview() to authenticated;

-- ---------------------------------------------------------------------------
-- Grants (same reasoning as migration 0008 — "automatically expose new
-- tables" is off, so this is needed for the table to be reachable at all)
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.leaves           to authenticated;
grant select, update               on public.iv_leave_policy   to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter table public.leaves replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leaves'
  ) then
    execute 'alter publication supabase_realtime add table public.leaves';
  end if;
end $$;
