-- ==========================================================
-- 005_departments_hierarchy_extension.sql
-- Migration to make Departments & Hierarchy fully functional in Supabase
-- ==========================================================

-- 1. ADD MISSING COLUMNS TO DEPARTMENTS TABLE
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS department_head_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_departments_status ON public.departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_code ON public.departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_head ON public.departments(department_head_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR DEPARTMENTS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active/inactive departments
CREATE POLICY "Authenticated users can read departments"
ON public.departments FOR SELECT
TO authenticated
USING (true);

-- Allow CEO, HR, and ADMIN users to create departments
CREATE POLICY "Admins can insert departments"
ON public.departments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('CEO', 'COO', 'HR', 'ADMIN')
    )
);

-- Allow CEO, HR, and ADMIN users to update departments
CREATE POLICY "Admins can update departments"
ON public.departments FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('CEO', 'COO', 'HR', 'ADMIN')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('CEO', 'COO', 'HR', 'ADMIN')
    )
);

-- Allow CEO, HR, and ADMIN users to delete departments
CREATE POLICY "Admins can delete departments"
ON public.departments FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('CEO', 'COO', 'HR', 'ADMIN')
    )
);

-- Enable Realtime for departments
ALTER PUBLICATION supabase_realtime ADD TABLE public.departments;
