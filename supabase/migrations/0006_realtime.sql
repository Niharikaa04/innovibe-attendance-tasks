-- ============================================================================
-- Migration 0006 — Realtime
-- ============================================================================
-- Adds the five module tables to the supabase_realtime publication. Existing
-- chat tables already in the publication are untouched.
-- REPLICA IDENTITY FULL is required so DELETE events and RLS filtering on
-- UPDATE payloads work correctly.
-- ============================================================================

alter table public.attendance    replica identity full;
alter table public.tasks         replica identity full;
alter table public.task_comments replica identity full;
alter table public.task_activity replica identity full;
alter table public.notifications replica identity full;

do $$
declare
  t text;
begin
  foreach t in array array['attendance','tasks','task_comments','task_activity','notifications']
  loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Verify with:
--   select tablename from pg_publication_tables where pubname = 'supabase_realtime';
