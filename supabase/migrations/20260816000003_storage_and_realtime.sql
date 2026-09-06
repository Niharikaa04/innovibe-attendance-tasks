-- =========================================================================
-- TMS & Employee Portal Backend Architecture - Storage & Realtime Setup
-- Migration: 20260816000003_storage_and_realtime.sql
-- =========================================================================

-- 1. CREATE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('tms-attachments', 'tms-attachments', true),
  ('tms-voice-notes', 'tms-voice-notes', true),
  ('tms-avatars', 'tms-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
CREATE POLICY "Allow authenticated upload to tms-attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tms-attachments');

CREATE POLICY "Allow public read from tms-attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tms-attachments');

CREATE POLICY "Allow authenticated upload to tms-voice-notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tms-voice-notes');

CREATE POLICY "Allow public read from tms-voice-notes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tms-voice-notes');

CREATE POLICY "Allow authenticated upload to tms-avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tms-avatars');

CREATE POLICY "Allow public read from tms-avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tms-avatars');

-- 2. ENABLE REALTIME ON CORE TMS TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
