import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInnoVibe } from '../provider';
import { useChannelId, useRealtime } from '../lib/realtime';
import { readableError } from '../lib/toast';
import { attendanceApi } from './api';
import { todayISO } from '../lib/time';
import type {
  AttendanceOverview, AttendanceRecord, TeamAttendanceRow, WorkSettings,
} from '../types';

// ---------------------------------------------------------------------------
// useMyAttendance — today's own record, live, plus check in / check out
// ---------------------------------------------------------------------------
export function useMyAttendance() {
  const { supabase, userId } = useInnoVibe();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const date = todayISO();

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setRecord(await attendanceApi.getDay(supabase, userId, date));
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase, userId, date]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-my-attendance');
  const status = useRealtime(
    userId ? channelId : null,
    [{ table: 'attendance', filter: userId ? `user_id=eq.${userId}` : undefined }],
    (payload) => {
      const row = payload.new as AttendanceRecord | null;
      if (payload.eventType === 'DELETE') { setRecord(null); return; }
      if (row && row.work_date === date) setRecord(row);
    },
  );

  const run = async (fn: () => Promise<AttendanceRecord>) => {
    setBusy(true);
    try {
      setRecord(await fn());
      setError(null);
    } catch (e) {
      setError(readableError(e));
      throw e;
    } finally {
      setBusy(false);
    }
  };

  return {
    record,
    loading,
    busy,
    error,
    realtime: status,
    reload: load,
    checkIn: (note?: string) => run(() => attendanceApi.checkIn(supabase, note)),
    checkOut: (note?: string) => run(() => attendanceApi.checkOut(supabase, note)),
  };
}

// ---------------------------------------------------------------------------
// useLiveClock — ticks once a minute so the working timer stays honest
// without any network traffic
// ---------------------------------------------------------------------------
export function useLiveClock(active: boolean, intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

// ---------------------------------------------------------------------------
// useTeamAttendance — manager board for one date, live
// ---------------------------------------------------------------------------
export function useTeamAttendance(date: string) {
  const { supabase, userId } = useInnoVibe();
  const [rows, setRows] = useState<TeamAttendanceRow[]>([]);
  const [overview, setOverview] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [team, ov] = await Promise.all([
        attendanceApi.team(supabase, date),
        attendanceApi.overview(supabase, date),
      ]);
      setRows(team);
      setOverview(ov);
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase, date]);

  useEffect(() => { void load(); }, [load]);

  // A realtime event tells us *that* something changed; the RPC gives us the
  // joined, authorised shape. Refreshes are coalesced so a burst of check-ins
  // costs one request, not one per event.
  const pending = useRef<number | null>(null);
  const scheduleRefresh = useCallback(() => {
    if (pending.current) return;
    pending.current = window.setTimeout(() => {
      pending.current = null;
      void load();
    }, 350);
  }, [load]);

  useEffect(() => () => { if (pending.current) window.clearTimeout(pending.current); }, []);

  const channelId = useChannelId('iv-team-attendance');
  const realtime = useRealtime(
    userId ? channelId : null,
    [{ table: 'attendance' }],
    (payload) => {
      const row = (payload.new ?? payload.old) as { work_date?: string } | null;
      if (!row?.work_date || row.work_date === date) scheduleRefresh();
    },
  );

  return { rows, overview, loading, error, realtime, reload: load };
}

// ---------------------------------------------------------------------------
// useAttendanceHistory — one person, one date range, live
// ---------------------------------------------------------------------------
export function useAttendanceHistory(userId: string | null, from: string, to: string) {
  const { supabase } = useInnoVibe();
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    try {
      setRows(await attendanceApi.history(supabase, userId, from, to));
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase, userId, from, to]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-attendance-history');
  useRealtime(
    userId ? channelId : null,
    [{ table: 'attendance', filter: userId ? `user_id=eq.${userId}` : undefined }],
    (payload) => {
      const row = (payload.new ?? payload.old) as AttendanceRecord | null;
      if (!row?.work_date || row.work_date < from || row.work_date > to) return;
      setRows((cur) => {
        if (payload.eventType === 'DELETE') return cur.filter((r) => r.id !== row.id);
        const exists = cur.some((r) => r.id === row.id);
        const next = exists
          ? cur.map((r) => (r.id === row.id ? { ...r, ...row } : r))
          : [row, ...cur];
        return next.sort((a, b) => (a.work_date < b.work_date ? 1 : -1));
      });
    },
  );

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.status === 'working' || r.status === 'checked_out');
    const minutes = present.reduce((s, r) => s + (r.total_working_minutes || 0), 0);
    return {
      daysPresent: present.length,
      daysLate: rows.filter((r) => r.is_late).length,
      totalMinutes: minutes,
      avgMinutes: present.length ? Math.round(minutes / present.length) : 0,
    };
  }, [rows]);

  return { rows, summary, loading, error, reload: load };
}

// ---------------------------------------------------------------------------
export function useWorkSettings() {
  const { supabase } = useInnoVibe();
  const [settings, setSettings] = useState<WorkSettings | null>(null);
  useEffect(() => {
    let alive = true;
    attendanceApi.settings(supabase)
      .then((s) => { if (alive) setSettings(s); })
      .catch(() => {});
    return () => { alive = false; };
  }, [supabase]);
  return settings;
}
