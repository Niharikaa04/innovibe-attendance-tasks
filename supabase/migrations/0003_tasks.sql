-- ============================================================================
-- Migration 0003 — Tasks
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'iv_task_priority') then
    create type public.iv_task_priority as enum ('low','medium','high','urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'iv_task_status') then
    create type public.iv_task_status as enum ('todo','in_progress','blocked','completed');
  end if;
end $$;

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (length(btrim(title)) between 1 and 200),
  description  text,
  assigned_to  uuid references auth.users(id) on delete set null,
  created_by   uuid not null references auth.users(id) on delete cascade,
  priority     public.iv_task_priority not null default 'medium',
  status       public.iv_task_status   not null default 'todo',
  due_date     date,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists tasks_assigned_idx on public.tasks (assigned_to, status);
create index if not exists tasks_creator_idx  on public.tasks (created_by);
create index if not exists tasks_due_idx      on public.tasks (due_date);
create index if not exists tasks_status_idx   on public.tasks (status);

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch
  before update on public.tasks
  for each row execute function public.iv_touch_updated_at();

-- Keep completed_at consistent with status, whoever writes the row.
create or replace function public.iv_tasks_sync_completion()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and coalesce(old.status, 'todo') <> 'completed' then
    new.completed_at := now();
  elsif new.status <> 'completed' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_sync_completion on public.tasks;
create trigger tasks_sync_completion
  before insert or update on public.tasks
  for each row execute function public.iv_tasks_sync_completion();

-- ---------------------------------------------------------------------------
-- Visibility helper (SECURITY DEFINER, used by comments/activity policies)
-- ---------------------------------------------------------------------------
create or replace function public.iv_can_view_task(p_task uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tasks t
     where t.id = p_task
       and (t.assigned_to = uid or t.created_by = uid or public.iv_is_manager(uid))
  );
$$;

grant execute on function public.iv_can_view_task(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.tasks enable row level security;

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select to authenticated
  using (assigned_to = auth.uid() or created_by = auth.uid() or public.iv_is_manager());

-- Managers create work for anyone; an employee may only create a task for
-- themselves (a personal to-do).
drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and (public.iv_is_manager() or assigned_to = auth.uid())
  );

-- Assignees may touch their own task rows, but the guard trigger below limits
-- *which columns* they can actually change.
drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks
  for update to authenticated
  using (assigned_to = auth.uid() or created_by = auth.uid() or public.iv_is_manager())
  with check (assigned_to = auth.uid() or created_by = auth.uid() or public.iv_is_manager());

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks
  for delete to authenticated
  using (created_by = auth.uid() or public.iv_is_manager());

-- ---------------------------------------------------------------------------
-- Column-level guard: an assignee who is not a manager and not the creator
-- can change status only. Everything else is rejected in the database, not
-- merely hidden in the UI.
-- ---------------------------------------------------------------------------
create or replace function public.iv_tasks_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.iv_is_manager() or old.created_by = auth.uid() then
    return new;
  end if;

  if new.title       is distinct from old.title
  or new.description is distinct from old.description
  or new.assigned_to is distinct from old.assigned_to
  or new.created_by  is distinct from old.created_by
  or new.priority    is distinct from old.priority
  or new.due_date    is distinct from old.due_date then
    raise exception 'Only the task owner or a manager can change task details. You can update the status.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_guard_update on public.tasks;
create trigger tasks_guard_update
  before update on public.tasks
  for each row execute function public.iv_tasks_guard_update();

-- ---------------------------------------------------------------------------
-- Task counts for the Office Dashboard
-- ---------------------------------------------------------------------------
create or replace function public.iv_task_overview(p_user uuid default null)
returns table (
  total       int,
  todo        int,
  in_progress int,
  blocked     int,
  completed   int,
  overdue     int,
  due_today   int
)
language sql
stable
set search_path = public
as $$
  -- Runs as the caller, so RLS on tasks already limits what is counted.
  with t as (
    select * from public.tasks
     where p_user is null or assigned_to = p_user
  )
  select
    count(*)::int,
    count(*) filter (where status = 'todo')::int,
    count(*) filter (where status = 'in_progress')::int,
    count(*) filter (where status = 'blocked')::int,
    count(*) filter (where status = 'completed')::int,
    count(*) filter (where status <> 'completed' and due_date < public.iv_today())::int,
    count(*) filter (where status <> 'completed' and due_date = public.iv_today())::int
  from t;
$$;

grant execute on function public.iv_task_overview(uuid) to authenticated;
