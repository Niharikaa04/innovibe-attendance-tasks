-- =========================================================================
-- TMS & Employee Portal Backend Architecture - Initial Seed Data
-- Migration: 20260816000004_seed_data.sql
-- =========================================================================

-- 1. SEED DEPARTMENTS
INSERT INTO public.departments (id, code, name, head_name, login_email, check_in_cutoff_time, department_color, status)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'DEP-1', 'Technology', 'Srinivas Thalada', 'tech@innovibe.ai', '09:30 AM', '#2563EB', 'ACTIVE'),
  ('a2222222-2222-2222-2222-222222222222', 'DEP-2', 'Operations', 'Rajesh Varma', 'ops@innovibe.ai', '09:15 AM', '#059669', 'ACTIVE'),
  ('a3333333-3333-3333-3333-333333333333', 'DEP-3', 'Human Resources', 'Priya Sharma', 'hr@innovibe.ai', '09:30 AM', '#D97706', 'ACTIVE'),
  ('a4444444-4444-4444-4444-444444444444', 'DEP-4', 'Fleet Management', 'Vikram Singh', 'fleet@innovibe.ai', '09:00 AM', '#DC2626', 'ACTIVE'),
  ('a5555555-5555-5555-5555-555555555555', 'DEP-5', 'Finance', 'Ananya Roy', 'finance@innovibe.ai', '09:30 AM', '#7C3AED', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;
