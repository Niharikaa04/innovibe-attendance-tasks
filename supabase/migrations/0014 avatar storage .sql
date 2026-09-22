-- ============================================================================
-- Migration 0012 — Profile photo storage
-- ============================================================================
-- Run the WHOLE file once in Supabase -> SQL Editor. Safe to run again.
--
-- BEFORE RUNNING: open Supabase -> Storage and check whether a bucket for
-- profile photos already exists (from InnoVibe Chat). If one does, tell me
-- its name instead of running this file — reusing it is better than having
-- two separate photo buckets for the same people. If none exists, running
-- this file creates one called "avatars".
--
-- What this does
--   * Creates a public "avatars" storage bucket (skipped if it already
--     exists), 2 MB per file, JPEG/PNG/WebP only.
--   * A signed-in person may only upload, replace or delete files inside
--     their OWN folder, named after their user id — e.g. an id starting
--     "1a2b3c…" can write to "1a2b3c.../photo.jpg" but not to any other
--     folder. This mirrors how iv_check_in already restricts each person to
--     their own row.
--   * Anyone (including a logged-out visitor) can VIEW a photo, the same way
--     an avatar is public today.
--
-- This does not touch the profiles table: updating your own full_name or
-- avatar_url there already works under the existing "profiles_update_own"
-- rule from migration 0000, confirmed by testing — no change needed there.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 2 * 1024 * 1024,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_own_folder_insert on storage.objects;
create policy avatars_own_folder_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_own_folder_update on storage.objects;
create policy avatars_own_folder_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_own_folder_delete on storage.objects;
create policy avatars_own_folder_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ---------------------------------------------------------------------------
-- CHECK — run after this migration
-- ---------------------------------------------------------------------------
select 'avatars bucket public: ' || public::text
  from storage.buckets where id = 'avatars';

select policyname, cmd
  from pg_policies
 where schemaname = 'storage' and tablename = 'objects' and policyname like 'avatars_%'
 order by policyname;


-- ============================================================================
-- OPTIONAL — let a manager fix another person's name or photo
-- ============================================================================
-- Today, only you can edit your own profile (tested: even the CEO's account
-- gets "0 rows updated" trying to rename someone else). If your team wants a
-- manager to be able to correct a colleague's name or remove an
-- inappropriate photo, run this separately. It only adds a second way in —
-- it does not remove the rule above that everyone can edit their own row.
--
-- create policy profiles_update_manager on public.profiles
--   for update to authenticated
--   using (public.iv_is_manager()) with check (public.iv_is_manager());