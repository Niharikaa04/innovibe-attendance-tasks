import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  LeaveApplyInput, LeaveBalanceRow, LeaveOverview, LeaveRequest, LeaveStatus,
} from '../types';

export const leavesApi = {
  async mine(sb: SupabaseClient, userId: string): Promise<LeaveRequest[]> {
    const { data, error } = await sb
      .from('leaves').select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as LeaveRequest[];
  },

  async team(sb: SupabaseClient): Promise<LeaveRequest[]> {
    // RLS already limits this to managers; employees calling it just get
    // their own rows back via the same select policy.
    const { data, error } = await sb
      .from('leaves').select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as LeaveRequest[];
  },

  async apply(sb: SupabaseClient, input: LeaveApplyInput): Promise<LeaveRequest> {
    const { data, error } = await sb.rpc('iv_apply_leave', {
      p_leave_type: input.leave_type,
      p_start_date: input.start_date,
      p_end_date: input.end_date,
      p_reason: input.reason ?? null,
      p_half_day: input.half_day ?? false,
    });
    if (error) throw error;
    return data as LeaveRequest;
  },

  async review(
    sb: SupabaseClient, leaveId: string, decision: Extract<LeaveStatus, 'approved' | 'rejected'>, note?: string,
  ): Promise<LeaveRequest> {
    const { data, error } = await sb.rpc('iv_review_leave', {
      p_leave_id: leaveId, p_decision: decision, p_note: note ?? null,
    });
    if (error) throw error;
    return data as LeaveRequest;
  },

  /** Manager decision on a cancellation request: approved = leave cancelled, rejected = stays approved. */
  async reviewCancellation(
    sb: SupabaseClient, leaveId: string, decision: Extract<LeaveStatus, 'approved' | 'rejected'>, note?: string,
  ): Promise<LeaveRequest> {
    const { data, error } = await sb.rpc('iv_review_cancellation', {
      p_leave_id: leaveId, p_decision: decision, p_note: note ?? null,
    });
    if (error) throw error;
    return data as LeaveRequest;
  },

  async cancel(sb: SupabaseClient, leaveId: string): Promise<LeaveRequest> {
    const { data, error } = await sb.rpc('iv_cancel_leave', { p_leave_id: leaveId });
    if (error) throw error;
    return data as LeaveRequest;
  },

  async balance(sb: SupabaseClient, userId?: string | null): Promise<LeaveBalanceRow[]> {
    const { data, error } = await sb.rpc('iv_leave_balance', { p_user: userId ?? null });
    if (error) throw error;
    return (data ?? []) as LeaveBalanceRow[];
  },

  async overview(sb: SupabaseClient): Promise<LeaveOverview> {
    const { data, error } = await sb.rpc('iv_leave_overview');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return (row ?? { pending_count: 0, cancellation_requested_count: 0, on_leave_today: 0 }) as LeaveOverview;
  },
};