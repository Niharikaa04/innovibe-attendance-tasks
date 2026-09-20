-- ============================================================================
-- Migration 0010 — Security hardening
-- ============================================================================
-- Run the WHOLE file once in Supabase -> SQL Editor. It is safe to run again.
-- It changes rules only; it does not touch any of your rows.
--
-- Before running: in VS Code press Ctrl+Shift+F and search for
--   iv_notify      and      iv_sweep_due_tasks
-- If either name appears in a .ts or .tsx file, do NOT run SECTION 3 (the
-- last block) until you have told me, because it stops the browser from
-- calling those two functions.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- SECTION 1 — Only an admin can change a role
-- ---------------------------------------------------------------------------
-- Without this, the "profiles_update_own" rule lets any signed-in person run
--   update profiles set role = 'ceo' where id = <their own id>
-- from the browser and become a CEO (which unlocks every manager and admin
-- rule in the app).
--
-- auth.uid() is null in the SQL Editor and for the service role, so admin
-- scripts such as migration 0007 keep working.
-- ---------------------------------------------------------------------------
create or replace function public.iv_profiles_guard_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.iv_is_admin(auth.uid()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'employee';
  elsif new.role is distinct from old.role then
    raise exception 'Only an admin can change roles.' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before insert or update on public.profiles
  for each row execute function public.iv_profiles_guard_role();


-- ---------------------------------------------------------------------------
-- SECTION 2 — Employees cannot hand tasks to other people
-- ---------------------------------------------------------------------------
-- Before: an employee could create a task for themselves, then change
-- "assigned_to" to a colleague (or change "created_by") because the person
-- who created a task was allowed to edit every column.
-- Now: only a manager can assign to someone else or change the creator.
-- ---------------------------------------------------------------------------
create or replace function public.iv_tasks_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service role: trusted.
  if auth.uid() is null then
    return new;
  end if;

  if public.iv_is_manager() then
    return new;
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'Only a manager can change who created a task.'
      using errcode = '42501';
  end if;

  if new.assigned_to is distinct from old.assigned_to
     and new.assigned_to is distinct from auth.uid() then
    raise exception 'You can only assign tasks to yourself. Ask a manager to assign it to someone else.'
      using errcode = '42501';
  end if;

  -- The person who made the task may edit everything else about it.
  if old.created_by = auth.uid() then
    return new;
  end if;

  -- An assignee who did not create it may change the status only.
  if new.title       is distinct from old.title
  or new.description is distinct from old.description
  or new.assigned_to is distinct from old.assigned_to
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
-- SECTION 3 — Who may call which database function
-- ---------------------------------------------------------------------------
-- Postgres lets everyone (including people who are not signed in and only
-- have your public key) run a function unless that is switched off.
-- (a) every iv_ function: signed-in users only.
-- (b) iv_notify and iv_sweep_due_tasks: nobody from the browser. They are
--     called by database triggers and scheduled jobs, which do not need this
--     permission. Left open, any signed-in person could send fake
--     notifications to anyone, in anyone's name.
-- ---------------------------------------------------------------------------
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname like 'iv\_%'
       and p.prorettype <> 'pg_catalog.trigger'::regtype
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;

revoke all on function public.iv_notify(uuid, uuid, text, text, text, text, jsonb)
  from public, anon, authenticated;

revoke all on function public.iv_sweep_due_tasks()
  from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- CHECK — expected result: anon_can_run is false on every row;
-- signed_in_can_run is false for iv_notify and iv_sweep_due_tasks only.
-- ---------------------------------------------------------------------------
select p.proname                                         as function_name,
       has_function_privilege('anon', p.oid, 'execute')          as anon_can_run,
       has_function_privilege('authenticated', p.oid, 'execute') as signed_in_can_run
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname like 'iv\_%'
   and p.prorettype <> 'pg_catalog.trigger'::regtype
 order by p.proname;