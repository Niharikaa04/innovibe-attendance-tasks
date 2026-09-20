import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AttendanceOverview, AttendanceRecord, TeamAttendanceRow, WorkSettings,
} from '../types';

// ---------------------------------------------------------------------------
// Every write goes through a SECURITY DEFINER RPC so the timestamp comes from
// the database clock, not from the browser. There is no client-side INSERT on
// public.attendance at all.
// ---------------------------------------------------------------------------

export const attendanceApi = {
  async checkIn(sb: SupabaseClient, note?: string): Promise<AttendanceRecord> {
    const { data, error } = await sb.rpc('iv_check_in', { p_note: note ?? null });
    if (error) throw error;
    return data as AttendanceRecord;
  },

  async checkOut(sb: SupabaseClient, note?: string): Promise<AttendanceRecord> {
    const { data, error } = await sb.rpc('iv_check_out', { p_note: note ?? null });
    if (error) throw error;
    return data as AttendanceRecord;
  },

  async getDay(sb: SupabaseClient, userId: string, date: string): Promise<AttendanceRecord | null> {
    const { data, error } = await sb
      .from('attendance').select('*')
      .eq('user_id', userId).eq('work_date', date)
      .maybeSingle();
    if (error) throw error;
    return (data as AttendanceRecord) ?? null;
  },

  async history(
    sb: SupabaseClient, userId: string, from: string, to: string,
  ): Promise<AttendanceRecord[]> {
    const { data, error } = await sb
      .from('attendance').select('*')
      .eq('user_id', userId)
      .gte('work_date', from).lte('work_date', to)
      .order('work_date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AttendanceRecord[];
  },

  async range(sb: SupabaseClient, from: string, to: string): Promise<AttendanceRecord[]> {
    const { data, error } = await sb
      .from('attendance').select('*')
      .gte('work_date', from).lte('work_date', to)
      .order('work_date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AttendanceRecord[];
  },

  async team(sb: SupabaseClient, date: string | null): Promise<TeamAttendanceRow[]> {
    const { data, error } = await sb.rpc('iv_team_attendance', { p_date: date });
    if (error) throw error;
    return (data ?? []) as TeamAttendanceRow[];
  },

  async overview(sb: SupabaseClient, date: string | null): Promise<AttendanceOverview> {
    const { data, error } = await sb.rpc('iv_attendance_overview', { p_date: date });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return (row ?? {
      total_employees: 0, present: 0, working: 0, checked_out: 0,
      absent: 0, late_arrivals: 0, attendance_percent: 0,
    }) as AttendanceOverview;
  },

  async settings(sb: SupabaseClient): Promise<WorkSettings | null> {
    const { data, error } = await sb.from('iv_work_settings').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;
    return (data as WorkSettings) ?? null;
  },
};