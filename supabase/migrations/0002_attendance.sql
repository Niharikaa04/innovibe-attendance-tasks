-- ============================================================================
-- Migration 0002 — Attendance
-- ============================================================================

create table if not exists public.attendance (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  work_date             date not null,
  check_in              timestamptz,
  check_out             timestamptz,
  status                text not null default 'not_checked_in'
                        check (
                          status in (
                            'not_checked_in',
                            'working',
                            'checked_out',
                            'absent',
                            'on_leave'
                          )
                        ),
  total_working_minutes int not null default 0,
  is_late               boolean not null default false,
  is_early_departure    boolean not null default false,
  note                  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint attendance_one_row_per_day unique (user_id, work_date)
);

create index if not exists attendance_user_date_idx
  on public.attendance (user_id, work_date desc);

create index if not exists attendance_date_idx
  on public.attendance (work_date desc);

create index if not exists attendance_status_idx
  on public.attendance (status);

drop trigger if exists attendance_touch on public.attendance;

create trigger attendance_touch
  before update on public.attendance
  for each row execute function public.iv_touch_updated_at();


-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.attendance enable row level security;

drop policy if exists attendance_select on public.attendance;

create policy attendance_select
on public.attendance
for select
to authenticated
using (
  user_id = auth.uid()
  or public.iv_is_manager()
);


drop policy if exists attendance_admin_insert on public.attendance;

create policy attendance_admin_insert
on public.attendance
for insert
to authenticated
with check (
  public.iv_is_admin()
);


drop policy if exists attendance_admin_update on public.attendance;

create policy attendance_admin_update
on public.attendance
for update
to authenticated
using (
  public.iv_is_admin()
)
with check (
  public.iv_is_admin()
);


drop policy if exists attendance_admin_delete on public.attendance;

create policy attendance_admin_delete
on public.attendance
for delete
to authenticated
using (
  public.iv_is_admin()
);


-- ============================================================================
-- Check in
-- Server clock + server-side lateness
-- ============================================================================

create or replace function public.iv_check_in(
  p_note text default null
)
returns public.attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  s        public.iv_work_settings;
  v_uid    uuid := auth.uid();
  v_now    timestamptz := now();
  v_local  timestamp;
  v_date   date;
  v_late   boolean;
  v_row    public.attendance;
begin

  if v_uid is null then
    raise exception 'You must be signed in to check in.'
      using errcode = '28000';
  end if;

  select *
  into s
  from public.iv_work_settings
  where id = 1;

  v_local := v_now at time zone s.timezone;
  v_date  := v_local::date;

  v_late :=
    v_local::time >
    (
      s.work_start
      + make_interval(mins => s.late_grace_minutes)
    );

  select *
  into v_row
  from public.attendance
  where user_id = v_uid
    and work_date = v_date;

  if found and v_row.check_in is not null then
    raise exception 'You have already checked in today.'
      using errcode = 'P0001';
  end if;

  insert into public.attendance (
    user_id,
    work_date,
    check_in,
    status,
    is_late,
    note
  )
  values (
    v_uid,
    v_date,
    v_now,
    'working',
    v_late,
    p_note
  )
  on conflict (user_id, work_date)
  do update
  set
    check_in   = excluded.check_in,
    status     = 'working',
    is_late    = excluded.is_late,
    note       = coalesce(excluded.note, attendance.note),
    updated_at = now()
  returning *
  into v_row;

  return v_row;

end;
$$;


-- ============================================================================
-- Check out
-- Employees can check out any time during the same calendar day,
-- including after the normal 6:30 PM work end time, up to 11:59 PM.
-- After midnight, the previous day's record cannot be checked out normally.
-- ============================================================================

create or replace function public.iv_check_out(
  p_note text default null
)
returns public.attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  s       public.iv_work_settings;
  v_uid   uuid := auth.uid();
  v_now   timestamptz := now();
  v_local timestamp;
  v_date  date;
  v_row   public.attendance;
  v_mins  int;
begin

  if v_uid is null then
    raise exception 'You must be signed in to check out.'
      using errcode = '28000';
  end if;

  select *
  into s
  from public.iv_work_settings
  where id = 1;

  v_local := v_now at time zone s.timezone;
  v_date  := v_local::date;

  select *
  into v_row
  from public.attendance
  where user_id = v_uid
    and work_date = v_date
  for update;

  if not found or v_row.check_in is null then
    raise exception 'Check in first — there is no open session for today.'
      using errcode = 'P0001';
  end if;

  if v_row.check_out is not null then
    raise exception 'You have already checked out today.'
      using errcode = 'P0001';
  end if;

  v_mins :=
    greatest(
      0,
      (
        extract(
          epoch from (v_now - v_row.check_in)
        ) / 60
      )::int
    );

  update public.attendance
  set
    check_out             = v_now,
    status                = 'checked_out',
    total_working_minutes = v_mins,
    is_early_departure    = v_local::time < s.work_end,
    note                  = coalesce(p_note, note),
    updated_at            = now()
  where id = v_row.id
  returning *
  into v_row;

  return v_row;

end;
$$;


revoke all on function public.iv_check_in(text)
from public;

revoke all on function public.iv_check_out(text)
from public;

grant execute on function public.iv_check_in(text)
to authenticated;

grant execute on function public.iv_check_out(text)
to authenticated;


-- ============================================================================
-- Attendance Overview
--
-- Effective status:
--
--   checkout exists                       -> checked_out
--   no checkout + selected date is today  -> working
--   no checkout + selected date is past   -> missing_checkout
--   no attendance row                     -> not_checked_in
--
-- NOTE:
-- missing_checkout is calculated only for display/reporting.
-- The actual attendance row remains status='working'.
-- ============================================================================

create or replace function public.iv_attendance_overview(
  p_date date default null
)
returns table (
  total_employees   int,
  present           int,
  working           int,
  checked_out       int,
  absent            int,
  late_arrivals     int,
  attendance_percent numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with selected_day as (
    select coalesce(
      p_date,
      public.iv_today()
    ) as day
  ),

  staff as (
    select id
    from public.profiles
  ),

  attendance_for_day as (
    select
      a.*,
      d.day,

      case
        when a.check_out is not null
          then 'checked_out'

        when a.check_in is not null
             and a.check_out is null
             and a.work_date < public.iv_today()
          then 'missing_checkout'

        when a.check_in is not null
             and a.check_out is null
          then 'working'

        else 'not_checked_in'
      end as effective_status

    from public.attendance a
    cross join selected_day d
    where a.work_date = d.day
  )

  select
    (select count(*) from staff)::int,

    (
      select count(*)
      from attendance_for_day
      where effective_status in (
        'working',
        'checked_out'
      )
    )::int,

    (
      select count(*)
      from attendance_for_day
      where effective_status = 'working'
    )::int,

    (
      select count(*)
      from attendance_for_day
      where effective_status = 'checked_out'
    )::int,

    (
      (select count(*) from staff)
      -
      (
        select count(*)
        from attendance_for_day
        where effective_status in (
          'working',
          'checked_out'
        )
      )
    )::int,

    (
      select count(*)
      from attendance_for_day
      where is_late
    )::int,

    case
      when (select count(*) from staff) = 0
        then 0

      else round(
        (
          select count(*)
          from attendance_for_day
          where effective_status in (
            'working',
            'checked_out'
          )
        )::numeric
        * 100
        /
        (select count(*) from staff),
        1
      )
    end;
$$;


grant execute
on function public.iv_attendance_overview(date)
to authenticated;


-- ============================================================================
-- Team Attendance
--
-- This is the important part.
--
-- Today:
--   check in + no checkout -> working
--
-- Past date:
--   check in + no checkout -> missing_checkout
--
-- Any date:
--   checkout exists -> checked_out
--
-- No attendance:
--   not_checked_in
-- ============================================================================

create or replace function public.iv_team_attendance(
  p_date date default null
)
returns table (
  user_id                 uuid,
  full_name               text,
  avatar_url              text,
  role                    text,
  status                  text,
  check_in                timestamptz,
  check_out               timestamptz,
  total_working_minutes   int,
  is_late                 boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with selected_day as (
    select coalesce(
      p_date,
      public.iv_today()
    ) as day
  )

  select
    p.id,

    coalesce(
      p.full_name,
      split_part(u.email, '@', 1)
    ),

    p.avatar_url,

    coalesce(
      p.role,
      'employee'
    ),

    case

      -- Employee checked out
      when a.check_out is not null
        then 'checked_out'

      -- Previous day with no checkout
      when a.check_in is not null
           and a.check_out is null
           and a.work_date < public.iv_today()
        then 'missing_checkout'

      -- Today with no checkout
      when a.check_in is not null
           and a.check_out is null
        then 'working'

      -- No attendance record
      else 'not_checked_in'

    end as status,

    a.check_in,

    a.check_out,

    coalesce(
      a.total_working_minutes,
      0
    ),

    coalesce(
      a.is_late,
      false
    )

  from public.profiles p

  join auth.users u
    on u.id = p.id

  cross join selected_day d

  left join public.attendance a
    on a.user_id = p.id
   and a.work_date = d.day

  where public.iv_is_manager()
     or p.id = auth.uid()

  order by

    case

      when a.check_in is not null
           and a.check_out is null
           and a.work_date = public.iv_today()
        then 1

      when a.check_out is not null
        then 2

      when a.check_in is not null
           and a.check_out is null
           and a.work_date < public.iv_today()
        then 3

      else 4

    end,

    a.check_in nulls last,

    coalesce(
      p.full_name,
      ''
    );
$$;


grant execute
on function public.iv_team_attendance(date)
to authenticated;