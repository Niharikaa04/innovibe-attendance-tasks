-- Migration 0008: Permissions for authenticated users

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.attendance TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.tasks TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.task_comments TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.task_activity TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.notifications TO authenticated;

GRANT SELECT, UPDATE
ON public.iv_work_settings TO authenticated;

-- Function permissions

GRANT EXECUTE ON FUNCTION public.iv_check_in(text)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_check_out(text)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_team_attendance(date)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_attendance_overview(date)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_task_overview(uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_mark_notifications_read(uuid[])
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_sweep_due_tasks()
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_today()
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_role(uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_is_manager(uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_is_admin(uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_can_view_task(uuid, uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.iv_display_name(uuid)
TO authenticated;