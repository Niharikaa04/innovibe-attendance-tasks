-- =========================================================================
-- TMS & Employee Portal Backend Architecture - Row Level Security (RLS)
-- Migration: 20260816000002_rls_policies.sql
-- =========================================================================

-- Enable RLS on all public tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_session_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get Current User's Profile Role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
DECLARE
    u_role TEXT;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(u_role, 'EMPLOYEE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. DEPARTMENTS POLICIES
CREATE POLICY "Allow authenticated users to read departments"
    ON public.departments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow management to insert/update departments"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.get_auth_user_role() IN ('CEO', 'COO', 'HR', 'ADMIN'));

-- 2. PROFILES POLICIES
CREATE POLICY "Allow authenticated users to view profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow HR and CEO to manage profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.get_auth_user_role() IN ('CEO', 'HR', 'ADMIN'));

-- 3. TASKS & RELATED POLICIES
CREATE POLICY "Allow management and assignees to view tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (
        public.get_auth_user_role() IN ('CEO', 'COO', 'CTO', 'HR', 'ADMIN')
        OR owner_id = auth.uid()
        OR primary_assignee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.task_assignees
            WHERE task_id = public.tasks.id AND employee_id = auth.uid()
        )
    );

CREATE POLICY "Allow authenticated users to create tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow task owners and assignees to update tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        public.get_auth_user_role() IN ('CEO', 'COO', 'CTO', 'HR', 'ADMIN')
        OR owner_id = auth.uid()
        OR primary_assignee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.task_assignees
            WHERE task_id = public.tasks.id AND employee_id = auth.uid()
        )
    );

-- 4. LEAVE BALANCES & REQUESTS POLICIES
CREATE POLICY "Allow users to view own leave balance or management"
    ON public.leave_balances FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid() OR public.get_auth_user_role() IN ('CEO', 'COO', 'HR', 'ADMIN'));

CREATE POLICY "Allow users to view own leave requests or management"
    ON public.leave_requests FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid() OR public.get_auth_user_role() IN ('CEO', 'COO', 'HR', 'ADMIN'));

CREATE POLICY "Allow employees to submit leave requests"
    ON public.leave_requests FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Allow approvers and employees to update leave requests"
    ON public.leave_requests FOR UPDATE
    TO authenticated
    USING (employee_id = auth.uid() OR public.get_auth_user_role() IN ('CEO', 'COO', 'HR', 'ADMIN'));

-- 5. WORK SESSIONS & WORK SESSION REPORTS POLICIES
CREATE POLICY "Allow employees to view own sessions or management"
    ON public.work_sessions FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid() OR public.get_auth_user_role() IN ('CEO', 'COO', 'HR', 'ADMIN'));

CREATE POLICY "Allow employees to insert and update own sessions"
    ON public.work_sessions FOR ALL
    TO authenticated
    USING (employee_id = auth.uid() OR public.get_auth_user_role() IN ('CEO', 'COO', 'HR', 'ADMIN'));

CREATE POLICY "Allow employees to view own reports or management"
    ON public.work_session_reports FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid() OR public.get_auth_user_role() IN ('CEO', 'COO', 'HR', 'ADMIN'));

CREATE POLICY "Allow employees to submit work session reports"
    ON public.work_session_reports FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = auth.uid());

-- 6. ANNOUNCEMENTS POLICIES
CREATE POLICY "Allow staff to view target announcements"
    ON public.announcements FOR SELECT
    TO authenticated
    USING (
        target_audience IN ('EVERYONE', 'ALL_EMPLOYEES')
        OR (target_audience = 'ALL_DEPARTMENT_HEADS' AND public.get_auth_user_role() IN ('CEO', 'COO', 'CTO', 'HR', 'DEPARTMENT_HEAD'))
        OR target_employee_id = auth.uid()
        OR sender_id = auth.uid()
        OR public.get_auth_user_role() IN ('CEO', 'HR', 'ADMIN')
    );

CREATE POLICY "Allow publishers and management to create announcements"
    ON public.announcements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- 7. NOTIFICATIONS POLICIES
CREATE POLICY "Allow users to view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Allow users to update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Allow system to insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);
