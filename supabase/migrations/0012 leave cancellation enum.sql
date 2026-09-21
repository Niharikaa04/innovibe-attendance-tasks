-- ============================================================================
-- Migration 0012 — add 'cancellation_requested' to iv_leave_status
-- ============================================================================
-- Run this file ON ITS OWN, and let it finish, BEFORE running 0013.
-- Postgres does not let a newly added enum value be used in the same
-- transaction that added it, and 0013 uses it.
-- Safe to run again.
-- ============================================================================
alter type public.iv_leave_status add value if not exists 'cancellation_requested';