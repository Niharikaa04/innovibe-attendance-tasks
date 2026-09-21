-- ============================================================================
-- Migration 0013 — Leave management enhancements
-- ============================================================================
-- Requires 0012 to have been run first (and finished).
-- Safe to run again. Does not delete or rewrite any existing leave rows
-- (days is widened from int to numeric(5,1); existing values are preserved).
--
-- Summary
--   * cancellation workflow: approved + not-yet-finished leave -> employee
--     requests cancellation -> manager approves/rejects (iv_review_cancellation)
--   * rejection requires a note (enforced in SQL)
--   * half-day leave, overlap check, max consecutive days, unpaid on/off,
--     optional auto-approval, holidays excluded from the day count
--   * carry-forward + monthly accrual in the balance
--   * leave_activity audit log, iv_holidays, iv_leave_carryforward
--   * HR can manage policy (iv_is_hr_admin)
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Role helper: CEO / admin / HR can configure leave policy
-- ---------------------------------------------------------------------------
create or replace function public.iv_is_hr_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.iv_role(uid) in ('ceo','admin','hr'), false);
$$;

revoke all on function public.iv_is_hr_admin(uuid) from public, anon;
grant execute on function public.iv_is_hr_admin(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- 2. Policy table: new settings + HR may edit
-- ---------------------------------------------------------------------------
alter table public.iv_leave_policy
  alter column annual_days type numeric(5,1);

alter table public.iv_leave_policy
  add column if not exists allocation_frequency text    not null default 'yearly',
  add column if not exists carry_forward_days   numeric(5,1) not null default 0,
  add column if not exists max_consecutive_days int,            -- null = no limit
  add column if not exists half_day_allowed     boolean not null default true,
  add column if not exists approval_required    boolean not null default true,
  add column if not exists unpaid_allowed       boolean not null default true; -- only read on the 'unpaid' row

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'iv_leave_policy_frequency_chk') then
    alter table public.iv_leave_policy
      add constraint iv_leave_policy_frequency_chk
      check (allocation_frequency in ('yearly','monthly'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'iv_leave_policy_nonneg_chk') then
    alter table public.iv_leave_policy
      add constraint iv_leave_policy_nonneg_chk
      check (annual_days >= 0 and carry_forward_days >= 0
             and (max_consecutive_days is null or max_consecutive_days > 0));
  end if;
end $$;

drop policy if exists iv_leave_policy_write on public.iv_leave_policy;
create policy iv_leave_policy_write on public.iv_leave_policy
  for update to authenticated
  using (public.iv_is_hr_admin()) with check (public.iv_is_hr_admin());


-- ---------------------------------------------------------------------------
-- 3. leaves: cancellation columns + half-day
-- ---------------------------------------------------------------------------
alter table public.leaves
  alter column days type numeric(5,1);

alter table public.leaves
  add column if not exists is_half_day         boolean not null default false,
  add column if not exists cancel_requested_by uuid references auth.users(id) on delete set null,
  add column if not exists cancel_requested_at timestamptz,
  add column if not exists cancel_reviewed_by  uuid references auth.users(id) on delete set null,
  add column if not exists cancel_reviewed_at  timestamptz,
  add column if not exists cancel_review_note  text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leaves_half_day_chk') then
    alter table public.leaves
      add constraint leaves_half_day_chk
      check (not is_half_day or (start_date = end_date and days = 0.5));
  end if;
end $$;

create index if not exists leaves_overlap_idx on public.leaves (user_id, start_date, end_date);


-- ---------------------------------------------------------------------------
-- 4. New tables: holidays, carry-forward, activity log
-- ---------------------------------------------------------------------------
create table if not exists public.iv_holidays (
  id           uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  name         text not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.iv_leave_carryforward (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  leave_type public.iv_leave_type not null,
  year       int  not null,                 -- the year the days are carried INTO
  days       numeric(5,1) not null check (days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, leave_type, year)
);

drop trigger if exists iv_leave_carryforward_touch on public.iv_leave_carryforward;
create trigger iv_leave_carryforward_touch
  before update on public.iv_leave_carryforward
  for each row execute function public.iv_touch_updated_at();

create table if not exists public.leave_activity (
  id         uuid primary key default gen_random_uuid(),
  leave_id   uuid not null references public.leaves(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,   -- the actor
  action     text not null,   -- applied | auto_approved | approved | rejected | withdrawn | cancellation_requested | cancellation_approved | cancellation_rejected
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leave_activity_leave_idx on public.leave_activity (leave_id, created_at desc);

alter table public.iv_holidays          enable row level security;
alter table public.iv_leave_carryforward enable row level security;
alter table public.leave_activity       enable row level security;

drop policy if exists iv_holidays_read on public.iv_holidays;
create policy iv_holidays_read on public.iv_holidays
  for select to authenticated using (true);

drop policy if exists iv_holidays_write on public.iv_holidays;
create policy iv_holidays_write on public.iv_holidays
  for all to authenticated
  using (public.iv_is_hr_admin()) with check (public.iv_is_hr_admin());

drop policy if exists iv_leave_carryforward_select on public.iv_leave_carryforward;
create policy iv_leave_carryforward_select on public.iv_leave_carryforward
  for select to authenticated
  using (user_id = auth.uid() or public.iv_is_manager());

drop policy if exists iv_leave_carryforward_write on public.iv_leave_carryforward;
create policy iv_leave_carryforward_write on public.iv_leave_carryforward
  for all to authenticated
  using (public.iv_is_hr_admin()) with check (public.iv_is_hr_admin());

-- Same idea as task_activity: readable by whoever can read the leave, written
-- only by the RPCs below (no insert policy).
drop policy if exists leave_activity_select on public.leave_activity;
create policy leave_activity_select on public.leave_activity
  for select to authenticated
  using (
    public.iv_is_manager()
    or exists (select 1 from public.leaves l where l.id = leave_id and l.user_id = auth.uid())
  );

grant select, insert, update, delete on public.iv_holidays           to authenticated;
grant select, insert, update, delete on public.iv_leave_carryforward to authenticated;
grant select                         on public.leave_activity        to authenticated;


-- ---------------------------------------------------------------------------
-- 5. Apply for leave (replaces the 4-arg version)
-- ---------------------------------------------------------------------------
-- Old signature must go, otherwise PostgREST sees two candidates for a call
-- that omits p_half_day.
drop function if exists public.iv_apply_leave(public.iv_leave_type, date, date, text);

create or replace function public.iv_apply_leave(
  p_leave_type public.iv_leave_type,
  p_start_date date,
  p_end_date   date,
  p_reason     text    default null,
  p_half_day   boolean default false
)
returns public.leaves
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_days    numeric(5,1);
  v_row     public.leaves;
  v_who     text;
  v_pol     public.iv_leave_policy;
  v_status  public.iv_leave_status;
  v_hols    int;
  v_txt     text;
begin
  if v_uid is null then
    raise exception 'You must be signed in to apply for leave.' using errcode = '28000';
  end if;
  if p_end_date < p_start_date then
    raise exception 'End date cannot be before the start date.' using errcode = 'P0001';
  end if;

  select * into v_pol from public.iv_leave_policy where leave_type = p_leave_type;
  if not found then
    raise exception 'No leave policy is configured for %.', p_leave_type using errcode = 'P0001';
  end if;

  if p_leave_type = 'unpaid' and not v_pol.unpaid_allowed then
    raise exception 'Unpaid leave is not enabled.' using errcode = 'P0001';
  end if;

  -- Day count: calendar days inclusive, minus configured holidays in range.
  select count(*) into v_hols
    from public.iv_holidays
   where holiday_date between p_start_date and p_end_date;

  if p_half_day then
    if not v_pol.half_day_allowed then
      raise exception 'Half-day leave is not allowed for % leave.', p_leave_type using errcode = 'P0001';
    end if;
    if p_start_date <> p_end_date then
      raise exception 'A half-day leave must be a single date.' using errcode = 'P0001';
    end if;
    if v_hols > 0 then
      raise exception 'That date is a holiday.' using errcode = 'P0001';
    end if;
    v_days := 0.5;
  else
    v_days := (p_end_date - p_start_date) + 1 - v_hols;
    if v_days <= 0 then
      raise exception 'The selected dates are all holidays.' using errcode = 'P0001';
    end if;
  end if;

  if v_pol.max_consecutive_days is not null and v_days > v_pol.max_consecutive_days then
    raise exception '% leave is limited to % consecutive days per request.',
      p_leave_type, v_pol.max_consecutive_days using errcode = 'P0001';
  end if;

  -- Overlap with the user's own live requests. Two half-days on the same
  -- date would double-book the day, so those are blocked too.
  if exists (
    select 1 from public.leaves l
     where l.user_id = v_uid
       and l.status in ('pending', 'approved', 'cancellation_requested')
       and l.start_date <= p_end_date
       and l.end_date   >= p_start_date
  ) then
    raise exception 'You already have a leave request that overlaps these dates.' using errcode = 'P0001';
  end if;

  v_status := case when v_pol.approval_required then 'pending' else 'approved' end;

  insert into public.leaves
    (user_id, leave_type, start_date, end_date, days, is_half_day, reason, status,
     reviewed_at, review_note)
  values
    (v_uid, p_leave_type, p_start_date, p_end_date, v_days, p_half_day, p_reason, v_status,
     case when v_status = 'approved' then now() end,
     case when v_status = 'approved' then 'Auto-approved (no approval required for this leave type)' end)
  returning * into v_row;

  insert into public.leave_activity (leave_id, user_id, action, metadata)
  values (v_row.id, v_uid,
          case when v_status = 'approved' then 'auto_approved' else 'applied' end,
          jsonb_build_object('leave_type', p_leave_type, 'days', v_days,
                             'start_date', p_start_date, 'end_date', p_end_date,
                             'half_day', p_half_day));

  v_who := public.iv_display_name(v_uid);
  v_txt := p_leave_type::text || ' · ' || trim_scale(v_days)::text
           || (case when v_days = 1 then ' day' else ' days' end);

  perform public.iv_notify(m.id, v_uid, 'leave_applied',
    v_who || case when v_status = 'approved' then ' took leave (auto-approved)' else ' requested leave' end,
    v_txt,
    '/leaves/' || v_row.id,
    jsonb_build_object('leave_id', v_row.id))
  from public.profiles m
  where public.iv_is_manager(m.id) and m.id <> v_uid;

  return v_row;
end;
$$;

revoke all on function public.iv_apply_leave(public.iv_leave_type, date, date, text, boolean) from public, anon;
grant execute on function public.iv_apply_leave(public.iv_leave_type, date, date, text, boolean) to authenticated;


-- ---------------------------------------------------------------------------
-- 6. Review a pending request — rejection now needs a reason
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
  v_uid  uuid := auth.uid();
  v_row  public.leaves;
  v_note text := nullif(btrim(p_note), '');
begin
  if not public.iv_is_manager(v_uid) then
    raise exception 'Only a manager can review leave requests.' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected.' using errcode = 'P0001';
  end if;
  if p_decision = 'rejected' and v_note is null then
    raise exception 'Please give a reason when rejecting a leave request.' using errcode = 'P0001';
  end if;

  select * into v_row from public.leaves where id = p_leave_id for update;
  if not found then
    raise exception 'Leave request not found.' using errcode = 'P0002';
  end if;
  if v_row.status <> 'pending' then
    raise exception 'This request was already reviewed.' using errcode = 'P0001';
  end if;

  update public.leaves
     set status = p_decision, reviewed_by = v_uid, reviewed_at = now(), review_note = v_note
   where id = p_leave_id
  returning * into v_row;

  insert into public.leave_activity (leave_id, user_id, action, metadata)
  values (v_row.id, v_uid, p_decision::text, jsonb_build_object('note', v_note));

  perform public.iv_notify(v_row.user_id, v_uid,
    case when p_decision = 'approved' then 'leave_approved' else 'leave_rejected' end,
    public.iv_display_name(v_uid) || ' ' || p_decision || ' your leave request',
    v_row.leave_type::text || ' · ' || trim_scale(v_row.days)::text
      || (case when v_row.days = 1 then ' day' else ' days' end)
      || coalesce(' — ' || v_note, ''),
    '/leaves/' || v_row.id,
    jsonb_build_object('leave_id', v_row.id));

  return v_row;
end;
$$;


-- ---------------------------------------------------------------------------
-- 7. Cancel — same name/signature, so the frontend call is unchanged
--      pending                      -> cancelled straight away (withdrawn)
--      approved, not fully in past  -> cancellation_requested (manager decides)
--      approved, already finished   -> blocked
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

  if v_row.status = 'pending' then
    update public.leaves set status = 'cancelled' where id = p_leave_id
    returning * into v_row;

    insert into public.leave_activity (leave_id, user_id, action)
    values (v_row.id, v_uid, 'withdrawn');

  elsif v_row.status = 'approved' then
    if v_row.end_date < public.iv_today() then
      raise exception 'This leave has already been taken and can no longer be cancelled.'
        using errcode = 'P0001';
    end if;

    update public.leaves
       set status = 'cancellation_requested',
           cancel_requested_by = v_uid,
           cancel_requested_at = now(),
           cancel_reviewed_by = null,
           cancel_reviewed_at = null,
           cancel_review_note = null
     where id = p_leave_id
    returning * into v_row;

    insert into public.leave_activity (leave_id, user_id, action)
    values (v_row.id, v_uid, 'cancellation_requested');

    perform public.iv_notify(m.id, v_uid, 'leave_cancellation_requested',
      public.iv_display_name(v_row.user_id) || ' asked to cancel approved leave',
      v_row.leave_type::text || ' · ' || v_row.start_date || case when v_row.end_date <> v_row.start_date then ' → ' || v_row.end_date else '' end,
      '/leaves/' || v_row.id,
      jsonb_build_object('leave_id', v_row.id))
    from public.profiles m
    where public.iv_is_manager(m.id) and m.id <> v_row.user_id;

  elsif v_row.status = 'cancellation_requested' then
    raise exception 'A cancellation request is already waiting for a manager.' using errcode = 'P0001';
  else
    raise exception 'This request is already % and cannot be cancelled.', v_row.status using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;


-- ---------------------------------------------------------------------------
-- 8. Manager decision on a cancellation request (new)
--      'approved' -> leave becomes cancelled, days are freed
--      'rejected' -> leave goes back to approved (reason required)
-- ---------------------------------------------------------------------------
create or replace function public.iv_review_cancellation(
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
  v_uid  uuid := auth.uid();
  v_row  public.leaves;
  v_note text := nullif(btrim(p_note), '');
begin
  if not public.iv_is_manager(v_uid) then
    raise exception 'Only a manager can review cancellation requests.' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected.' using errcode = 'P0001';
  end if;
  if p_decision = 'rejected' and v_note is null then
    raise exception 'Please give a reason when rejecting a cancellation request.' using errcode = 'P0001';
  end if;

  select * into v_row from public.leaves where id = p_leave_id for update;
  if not found then
    raise exception 'Leave request not found.' using errcode = 'P0002';
  end if;
  if v_row.status <> 'cancellation_requested' then
    raise exception 'This leave has no pending cancellation request.' using errcode = 'P0001';
  end if;

  update public.leaves
     set status = case when p_decision = 'approved' then 'cancelled'::public.iv_leave_status
                       else 'approved'::public.iv_leave_status end,
         cancel_reviewed_by = v_uid,
         cancel_reviewed_at = now(),
         cancel_review_note = v_note
   where id = p_leave_id
  returning * into v_row;

  insert into public.leave_activity (leave_id, user_id, action, metadata)
  values (v_row.id, v_uid,
          case when p_decision = 'approved' then 'cancellation_approved' else 'cancellation_rejected' end,
          jsonb_build_object('note', v_note));

  perform public.iv_notify(v_row.user_id, v_uid,
    case when p_decision = 'approved' then 'leave_cancellation_approved' else 'leave_cancellation_rejected' end,
    public.iv_display_name(v_uid) || ' ' || p_decision || ' your cancellation request',
    v_row.leave_type::text || ' · ' || trim_scale(v_row.days)::text
      || (case when v_row.days = 1 then ' day' else ' days' end)
      || coalesce(' — ' || v_note, ''),
    '/leaves/' || v_row.id,
    jsonb_build_object('leave_id', v_row.id));

  return v_row;
end;
$$;

revoke all on function public.iv_review_cancellation(uuid, public.iv_leave_status, text) from public, anon;
grant execute on function public.iv_review_cancellation(uuid, public.iv_leave_status, text) to authenticated;
-- iv_review_leave / iv_cancel_leave keep their existing grants (create or replace preserves them).


-- ---------------------------------------------------------------------------
-- 9. Balance — output columns change, so drop + recreate
--    used     = approved + cancellation_requested (days stay "used" until a
--               manager actually approves the cancellation)
--    accrued  = annual_days (yearly) or annual_days * month/12 (monthly)
--    remaining = accrued + carried_forward - used
-- ---------------------------------------------------------------------------
drop function if exists public.iv_leave_balance(uuid);

create or replace function public.iv_leave_balance(p_user uuid default null)
returns table (
  leave_type      public.iv_leave_type,
  annual_days     numeric,
  accrued_days    numeric,
  carried_forward numeric,
  used_days       numeric,
  pending_days    numeric,
  remaining       numeric
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
  ),
  yr as (
    select extract(year  from public.iv_today())::int as y,
           extract(month from public.iv_today())::int as m
  )
  select
    pol.leave_type,
    pol.annual_days::numeric,
    acc.accrued,
    cf.days,
    u.used,
    u.pend,
    acc.accrued + cf.days - u.used
  from public.iv_leave_policy pol
  cross join yr
  cross join guard g
  cross join lateral (
    select case when pol.allocation_frequency = 'monthly'
                then round(pol.annual_days * yr.m / 12.0, 1)
                else pol.annual_days::numeric end as accrued
  ) acc
  cross join lateral (
    select coalesce(sum(c.days), 0)::numeric as days
      from public.iv_leave_carryforward c
     where c.user_id = g.uid and c.leave_type = pol.leave_type and c.year = yr.y
  ) cf
  cross join lateral (
    select
      coalesce(sum(l.days) filter (where l.status in ('approved', 'cancellation_requested')), 0)::numeric as used,
      coalesce(sum(l.days) filter (where l.status = 'pending'), 0)::numeric as pend
    from public.leaves l
    where l.user_id = g.uid
      and l.leave_type = pol.leave_type
      and extract(year from l.start_date) = yr.y
  ) u
  order by pol.leave_type;
$$;

revoke all on function public.iv_leave_balance(uuid) from public, anon;
grant execute on function public.iv_leave_balance(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- 10. Team overview — adds cancellation_requested_count
--     Someone with a cancellation request open is still on leave until a
--     manager approves it, so they stay in on_leave_today.
-- ---------------------------------------------------------------------------
drop function if exists public.iv_leave_overview();

create or replace function public.iv_leave_overview()
returns table (
  pending_count                int,
  cancellation_requested_count int,
  on_leave_today               int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.leaves where status = 'pending')::int,
    (select count(*) from public.leaves where status = 'cancellation_requested')::int,
    (select count(*) from public.leaves
      where status in ('approved', 'cancellation_requested')
        and public.iv_today() between start_date and end_date)::int;
$$;

revoke all on function public.iv_leave_overview() from public, anon;
grant execute on function public.iv_leave_overview() to authenticated;


-- ---------------------------------------------------------------------------
-- 11. Year-end carry-forward (HR / admin runs it once, e.g. in January)
--     select public.iv_run_carryforward();      -- carries last year -> this year
--     select public.iv_run_carryforward(2025);  -- carries 2025 -> 2026
--     Re-running overwrites the same rows, so it is safe to repeat.
-- ---------------------------------------------------------------------------
create or replace function public.iv_run_carryforward(p_from_year int default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from  int := coalesce(p_from_year, extract(year from public.iv_today())::int - 1);
  v_count int;
begin
  if auth.uid() is not null and not public.iv_is_hr_admin() then
    raise exception 'Only HR or an admin can run carry-forward.' using errcode = '42501';
  end if;

  insert into public.iv_leave_carryforward (user_id, leave_type, year, days)
  select p.id, pol.leave_type, v_from + 1,
         least(
           pol.carry_forward_days,
           greatest(
             pol.annual_days
               + coalesce((select c.days from public.iv_leave_carryforward c
                            where c.user_id = p.id and c.leave_type = pol.leave_type and c.year = v_from), 0)
               - coalesce((select sum(l.days) from public.leaves l
                            where l.user_id = p.id and l.leave_type = pol.leave_type
                              and l.status in ('approved', 'cancellation_requested')
                              and extract(year from l.start_date) = v_from), 0),
             0))
    from public.profiles p
   cross join public.iv_leave_policy pol
   where pol.carry_forward_days > 0
  on conflict (user_id, leave_type, year)
  do update set days = excluded.days;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.iv_run_carryforward(int) from public, anon;
grant execute on function public.iv_run_carryforward(int) to authenticated;


-- ---------------------------------------------------------------------------
-- 12. Realtime for the activity log
-- ---------------------------------------------------------------------------
alter table public.leave_activity replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leave_activity'
  ) then
    execute 'alter publication supabase_realtime add table public.leave_activity';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- CHECK — every row should show anon_can_run = false, signed_in_can_run = true
-- ---------------------------------------------------------------------------
select p.proname as function_name,
       has_function_privilege('anon', p.oid, 'execute')          as anon_can_run,
       has_function_privilege('authenticated', p.oid, 'execute') as signed_in_can_run
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('iv_apply_leave','iv_review_leave','iv_cancel_leave','iv_review_cancellation',
                     'iv_leave_balance','iv_leave_overview','iv_run_carryforward','iv_is_hr_admin')
 order by p.proname;