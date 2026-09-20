-- ============================================================================
-- ROLLBACK — removes the Attendance & Task modules only.
-- Chat, channels, DMs, profiles and auth are untouched.
-- Run in reverse order. This DOES delete attendance and task data.
-- ============================================================================

drop trigger if exists task_comments_after_insert on public.task_comments;
drop trigger if exists tasks_after_update        on public.tasks;
drop trigger if exists tasks_after_insert        on public.tasks;
drop trigger if exists tasks_guard_update        on public.tasks;
drop trigger if exists tasks_sync_completion     on public.tasks;
drop trigger if exists tasks_touch               on public.tasks;
drop trigger if exists attendance_touch          on public.attendance;

drop function if exists public.iv_sweep_due_tasks();
drop function if exists public.iv_comments_after_insert();
drop function if exists public.iv_tasks_after_update();
drop function if exists public.iv_tasks_after_insert();
drop function if exists public.iv_tasks_guard_update();
drop function if exists public.iv_tasks_sync_completion();
drop function if exists public.iv_task_overview(uuid);
drop function if exists public.iv_can_view_task(uuid, uuid);
drop function if exists public.iv_team_attendance(date);
drop function if exists public.iv_attendance_overview(date);
drop function if exists public.iv_check_out(text);
drop function if exists public.iv_check_in(text);
drop function if exists public.iv_mark_notifications_read(uuid[]);
drop function if exists public.iv_notify(uuid, uuid, text, text, text, text, jsonb);
drop function if exists public.iv_display_name(uuid);
drop function if exists public.iv_today();

drop table if exists public.task_activity;
drop table if exists public.task_comments;
drop table if exists public.tasks;
drop table if exists public.attendance;
drop table if exists public.iv_work_settings;

drop type if exists public.iv_task_status;
drop type if exists public.iv_task_priority;

-- Notifications is intentionally NOT dropped — it may pre-date this module.
-- profiles, its trigger, and handle_new_user() from 0000 are also kept —
-- if this project's profiles table came from InnoVibe Chat rather than 0000,
-- dropping it here would take chat's user profiles down with it. If you
-- bootstrapped profiles via 0000 on a project that has nothing else in it,
-- and genuinely want it gone too:
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop function if exists public.handle_new_user();
--   drop table if exists public.profiles;
-- Role helpers are kept too, in case other code started using them:
--   drop function if exists public.iv_is_admin(uuid);
--   drop function if exists public.iv_is_manager(uuid);
--   drop function if exists public.iv_role(uuid);
--   drop function if exists public.iv_touch_updated_at();
