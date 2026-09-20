-- ============================================================================
-- Migration 0005 — Task comments, activity feed, event triggers
-- ============================================================================

create table if not exists public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null check (length(btrim(content)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_comments_task_idx on public.task_comments (task_id, created_at);

drop trigger if exists task_comments_touch on public.task_comments;
create trigger task_comments_touch
  before update on public.task_comments
  for each row execute function public.iv_touch_updated_at();

create table if not exists public.task_activity (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  action     text not null,          -- created | status_changed | priority_changed | reassigned | due_date_changed | edited | commented | completed
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists task_activity_task_idx on public.task_activity (task_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.task_comments enable row level security;
alter table public.task_activity enable row level security;

drop policy if exists task_comments_select on public.task_comments;
create policy task_comments_select on public.task_comments
  for select to authenticated using (public.iv_can_view_task(task_id));

drop policy if exists task_comments_insert on public.task_comments;
create policy task_comments_insert on public.task_comments
  for insert to authenticated
  with check (user_id = auth.uid() and public.iv_can_view_task(task_id));

drop policy if exists task_comments_update on public.task_comments;
create policy task_comments_update on public.task_comments
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists task_comments_delete on public.task_comments;
create policy task_comments_delete on public.task_comments
  for delete to authenticated
  using (user_id = auth.uid() or public.iv_is_admin());

drop policy if exists task_activity_select on public.task_activity;
create policy task_activity_select on public.task_activity
  for select to authenticated using (public.iv_can_view_task(task_id));

-- No client insert policy: the activity log is written by triggers only.

-- ---------------------------------------------------------------------------
-- Helper: display name for message text
-- ---------------------------------------------------------------------------
create or replace function public.iv_display_name(uid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(btrim(p.full_name), ''),
    split_part(u.email, '@', 1),
    'Someone')
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = uid;
$$;

grant execute on function public.iv_display_name(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Task insert → activity + "assigned to you" notification
-- ---------------------------------------------------------------------------
create or replace function public.iv_tasks_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_activity (task_id, user_id, action, metadata)
  values (new.id, new.created_by, 'created',
          jsonb_build_object('title', new.title, 'assigned_to', new.assigned_to));

  perform public.iv_notify(
    new.assigned_to, new.created_by, 'task_assigned',
    public.iv_display_name(new.created_by) || ' assigned you a task',
    new.title,
    '/tasks/' || new.id,
    jsonb_build_object('task_id', new.id, 'priority', new.priority));

  return null;
end;
$$;

drop trigger if exists tasks_after_insert on public.tasks;
create trigger tasks_after_insert
  after insert on public.tasks
  for each row execute function public.iv_tasks_after_insert();

-- ---------------------------------------------------------------------------
-- Task update → one activity row per meaningful change + targeted notices
-- ---------------------------------------------------------------------------
create or replace function public.iv_tasks_after_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := coalesce(auth.uid(), new.created_by);
  v_who   text := public.iv_display_name(coalesce(auth.uid(), new.created_by));
begin
  if new.status is distinct from old.status then
    insert into public.task_activity (task_id, user_id, action, metadata)
    values (new.id, v_actor,
            case when new.status = 'completed' then 'completed' else 'status_changed' end,
            jsonb_build_object('from', old.status, 'to', new.status));

    -- The person who owns the task wants to know; so does the assignee if a
    -- manager moved it. Nobody else is disturbed.
    perform public.iv_notify(new.created_by, v_actor,
      case when new.status = 'completed' then 'task_completed' else 'task_status_changed' end,
      v_who || (case when new.status = 'completed' then ' completed a task' else ' moved a task' end),
      new.title, '/tasks/' || new.id,
      jsonb_build_object('task_id', new.id, 'from', old.status, 'to', new.status));

    perform public.iv_notify(new.assigned_to, v_actor, 'task_status_changed',
      v_who || ' moved your task', new.title, '/tasks/' || new.id,
      jsonb_build_object('task_id', new.id, 'from', old.status, 'to', new.status));
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.task_activity (task_id, user_id, action, metadata)
    values (new.id, v_actor, 'reassigned',
            jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to));

    perform public.iv_notify(new.assigned_to, v_actor, 'task_assigned',
      v_who || ' assigned you a task', new.title, '/tasks/' || new.id,
      jsonb_build_object('task_id', new.id));

    perform public.iv_notify(old.assigned_to, v_actor, 'task_reassigned',
      v_who || ' reassigned a task away from you', new.title, '/tasks/' || new.id,
      jsonb_build_object('task_id', new.id));
  end if;

  if new.priority is distinct from old.priority then
    insert into public.task_activity (task_id, user_id, action, metadata)
    values (new.id, v_actor, 'priority_changed',
            jsonb_build_object('from', old.priority, 'to', new.priority));

    perform public.iv_notify(new.assigned_to, v_actor, 'task_priority_changed',
      v_who || ' set priority to ' || new.priority, new.title, '/tasks/' || new.id,
      jsonb_build_object('task_id', new.id));
  end if;

  if new.due_date is distinct from old.due_date then
    insert into public.task_activity (task_id, user_id, action, metadata)
    values (new.id, v_actor, 'due_date_changed',
            jsonb_build_object('from', old.due_date, 'to', new.due_date));

    perform public.iv_notify(new.assigned_to, v_actor, 'task_due_changed',
      v_who || ' changed the due date', new.title, '/tasks/' || new.id,
      jsonb_build_object('task_id', new.id, 'due_date', new.due_date));
  end if;

  if new.title is distinct from old.title or new.description is distinct from old.description then
    insert into public.task_activity (task_id, user_id, action, metadata)
    values (new.id, v_actor, 'edited', jsonb_build_object('title', new.title));
  end if;

  return null;
end;
$$;

drop trigger if exists tasks_after_update on public.tasks;
create trigger tasks_after_update
  after update on public.tasks
  for each row execute function public.iv_tasks_after_update();

-- ---------------------------------------------------------------------------
-- Comment insert → activity + notify the other side of the task
-- ---------------------------------------------------------------------------
create or replace function public.iv_comments_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t    public.tasks;
  v_who text := public.iv_display_name(new.user_id);
  v_preview text := left(new.content, 140);
begin
  select * into t from public.tasks where id = new.task_id;

  insert into public.task_activity (task_id, user_id, action, metadata)
  values (new.task_id, new.user_id, 'commented',
          jsonb_build_object('comment_id', new.id, 'preview', v_preview));

  perform public.iv_notify(t.assigned_to, new.user_id, 'task_comment',
    v_who || ' commented on a task', v_preview, '/tasks/' || t.id,
    jsonb_build_object('task_id', t.id, 'comment_id', new.id));

  perform public.iv_notify(t.created_by, new.user_id, 'task_comment',
    v_who || ' commented on a task', v_preview, '/tasks/' || t.id,
    jsonb_build_object('task_id', t.id, 'comment_id', new.id));

  return null;
end;
$$;

drop trigger if exists task_comments_after_insert on public.task_comments;
create trigger task_comments_after_insert
  after insert on public.task_comments
  for each row execute function public.iv_comments_after_insert();

-- ---------------------------------------------------------------------------
-- Due-soon / overdue sweep. Call from a Supabase scheduled job (pg_cron) or
-- an Edge Function on a timer — see docs/SETUP_GUIDE.md, step 9.
-- ---------------------------------------------------------------------------
create or replace function public.iv_sweep_due_tasks()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  r record;
begin
  for r in
    select t.id, t.title, t.assigned_to, t.due_date, t.created_by
      from public.tasks t
     where t.status <> 'completed'
       and t.assigned_to is not null
       and t.due_date is not null
       and t.due_date <= public.iv_today() + 1
       and not exists (
         select 1 from public.notifications n
          where n.user_id = t.assigned_to
            and n.type in ('task_due_soon','task_overdue')
            and (n.data ->> 'task_id')::uuid = t.id
            and n.created_at::date = public.iv_today())
  loop
    perform public.iv_notify(
      r.assigned_to, r.created_by,
      case when r.due_date < public.iv_today() then 'task_overdue' else 'task_due_soon' end,
      case when r.due_date < public.iv_today() then 'Task is overdue' else 'Task is due soon' end,
      r.title, '/tasks/' || r.id,
      jsonb_build_object('task_id', r.id, 'due_date', r.due_date));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

grant execute on function public.iv_sweep_due_tasks() to authenticated;
