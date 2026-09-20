-- =========================================================================
-- TMS & Employee Portal Backend Architecture - Initial PostgreSQL Schema
-- Migration: 20260816000001_initial_schema.sql
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    head_name TEXT,
    login_email TEXT,
    check_in_cutoff_time TEXT DEFAULT '09:30 AM',
    department_color TEXT DEFAULT '#6D35F5',
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('CEO', 'COO', 'CTO', 'SERVICE_MANAGER', 'HR', 'TECHNICIAN', 'EMPLOYEE')),
    user_type TEXT NOT NULL CHECK (user_type IN ('CEO', 'DEPARTMENT_HEAD', 'EMPLOYEE', 'HR', 'ADMIN', 'INTERN', 'SERVICE')),
    designation TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    avatar TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    account_status TEXT DEFAULT 'ONLINE' CHECK (account_status IN ('ONLINE', 'OFFLINE', 'INACTIVE', 'SUSPENDED', 'PENDING')),
    productivity_score NUMERIC(5, 2) DEFAULT 90.00,
    productivity_status TEXT DEFAULT 'EXCELLENT' CHECK (productivity_status IN ('EXCELLENT', 'VERY_GOOD', 'GOOD', 'AVERAGE', 'POOR')),
    attendance_rate NUMERIC(5, 2) DEFAULT 98.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('STRATEGIC_GOAL', 'OPERATIONS', 'HR_COMPLIANCE', 'TECH_INFRA', 'FLEET_SAFETY', 'FINANCE')),
    priority TEXT NOT NULL CHECK (priority IN ('URGENT', 'HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'OVERDUE')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    deadline TIMESTAMPTZ,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TASK ASSIGNEES (Junction Table for Multi-Employee Assignment)
CREATE TABLE IF NOT EXISTS public.task_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED')),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    hours_spent NUMERIC(6, 2),
    completion_proof_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (task_id, employee_id)
);

-- 5. TASK SUBTASKS
CREATE TABLE IF NOT EXISTS public.task_subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TASK ACTIVITY HISTORY
CREATE TABLE IF NOT EXISTS public.task_activity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TASK DISCUSSIONS (Comments)
CREATE TABLE IF NOT EXISTS public.task_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TASK ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    discussion_id UUID REFERENCES public.task_discussions(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size TEXT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. LEAVE BALANCES TABLE
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    casual_leave_used INTEGER DEFAULT 0,
    casual_leave_total INTEGER DEFAULT 12,
    sick_leave_used INTEGER DEFAULT 0,
    sick_leave_total INTEGER DEFAULT 12,
    pto_used INTEGER DEFAULT 0,
    pto_total INTEGER DEFAULT 15,
    unpaid_leave_used INTEGER DEFAULT 0,
    unpaid_leave_total INTEGER DEFAULT 30,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('CASUAL_LEAVE', 'SICK_LEAVE', 'PAID_TIME_OFF', 'UNPAID_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'COMPENSATORY_OFF', 'EMERGENCY_LEAVE')),
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    applied_date TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. WORK SESSIONS TABLE (Attendance / Shift Tracking)
CREATE TABLE IF NOT EXISTS public.work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    login_time TEXT NOT NULL,
    logout_time TEXT,
    login_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    logout_timestamp TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'LOGGED_OUT', 'INTERRUPTED', 'AUTO_CLOSED')),
    duration TEXT DEFAULT 'Active Session',
    date_str TEXT NOT NULL,
    report_submitted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. WORK SESSION REPORTS TABLE (EOD Checkout Reports)
CREATE TABLE IF NOT EXISTS public.work_session_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    work_summary TEXT NOT NULL,
    tasks_completed JSONB DEFAULT '[]'::jsonb,
    pending_tasks JSONB DEFAULT '[]'::jsonb,
    challenges_blockers TEXT,
    time_notes TEXT,
    additional_notes TEXT,
    logout_method TEXT DEFAULT 'MANUAL_LOGOUT',
    attachments JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 13. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    from_badge TEXT,
    posted_by TEXT,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_audience TEXT NOT NULL CHECK (target_audience IN ('EVERYONE', 'ALL_EMPLOYEES', 'ALL_DEPARTMENT_HEADS', 'SPECIFIC_DEPARTMENT', 'SPECIFIC_EMPLOYEE')),
    target_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    target_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'IMPORTANT', 'CRITICAL')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PINNED', 'EXPIRED', 'DRAFT')),
    is_pinned BOOLEAN DEFAULT false,
    expiry_date TIMESTAMPTZ,
    notify_immediately BOOLEAN DEFAULT true,
    voice_url TEXT,
    voice_duration_seconds INTEGER,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message_preview TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('TASK_ACCEPTED', 'TASK_ASSIGNED', 'LEAVE_APPROVED', 'LEAVE_SUBMITTED', 'COMMENT_ADDED', 'ANNOUNCEMENT')),
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'NORMAL',
    link_tab TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON public.tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_primary_assignee ON public.tasks(primary_assignee_id);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON public.task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_employee_id ON public.task_assignees(employee_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);

CREATE INDEX IF NOT EXISTS idx_work_sessions_employee_id ON public.work_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_status ON public.work_sessions(status);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- AUTO UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_departments BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_leave_requests BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
