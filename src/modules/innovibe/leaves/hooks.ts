import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInnoVibe } from '../provider';
import { applyChange, useChannelId, useRealtime } from '../lib/realtime';
import { readableError } from '../lib/toast';
import { leavesApi } from './api';
import type {
  LeaveApplyInput, LeaveBalanceRow, LeaveOverview, LeaveRequest, LeaveStatus,
} from '../types';

const byNewest = (a: { created_at: string }, b: { created_at: string }) =>
  (a.created_at < b.created_at ? 1 : -1);

// ---------------------------------------------------------------------------
// useMyLeaves — the signed-in person's own leave history, live
// ---------------------------------------------------------------------------
export function useMyLeaves() {
  const { supabase, userId } = useInnoVibe();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setLeaves(await leavesApi.mine(supabase, userId));
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-my-leaves');
  const realtime = useRealtime(
    userId ? channelId : null,
    [{ table: 'leaves', filter: userId ? `user_id=eq.${userId}` : undefined }],
    (payload) => setLeaves((cur) => applyChange<LeaveRequest>(cur, payload, {
      sort: (a, b) => (a.start_date < b.start_date ? 1 : -1),
    })),
  );

  const apply = async (input: LeaveApplyInput) => {
    setBusy(true);
    try {
      const created = await leavesApi.apply(supabase, input);
      setLeaves((cur) => (cur.some((l) => l.id === created.id) ? cur : [created, ...cur]));
      setError(null);
      return created;
    } catch (e) {
      setError(readableError(e));
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    setBusy(true);
    try {
      const updated = await leavesApi.cancel(supabase, id);
      setLeaves((cur) => cur.map((l) => (l.id === id ? updated : l)));
    } catch (e) {
      setError(readableError(e));
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(() => ({
    pending: leaves.filter((l) => l.status === 'pending' || l.status === 'cancellation_requested').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  }), [leaves]);

  return { leaves, counts, loading, busy, error, realtime, reload: load, apply, cancel };
}

// ---------------------------------------------------------------------------
// useTeamLeaves — manager view: every request, live, plus review actions
// ---------------------------------------------------------------------------
export function useTeamLeaves() {
  const { supabase, userId } = useInnoVibe();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [overview, setOverview] = useState<LeaveOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rows, ov] = await Promise.all([
        leavesApi.team(supabase),
        leavesApi.overview(supabase),
      ]);
      setLeaves(rows);
      setOverview(ov);
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-team-leaves');
  const realtime = useRealtime(
    userId ? channelId : null,
    [{ table: 'leaves' }],
    (payload) => {
      setLeaves((cur) => applyChange<LeaveRequest>(cur, payload, { sort: byNewest }));
      // Overview counts (pending/on-leave-today) need a fresh aggregate;
      // a lightweight follow-up call keeps this correct without polling.
      void leavesApi.overview(supabase).then(setOverview).catch(() => {});
    },
  );

  const review = async (id: string, decision: Extract<LeaveStatus, 'approved' | 'rejected'>, note?: string) => {
    setBusy(true);
    try {
      const updated = await leavesApi.review(supabase, id, decision, note);
      setLeaves((cur) => cur.map((l) => (l.id === id ? updated : l)));
    } catch (e) {
      setError(readableError(e));
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const reviewCancellation = async (
    id: string, decision: Extract<LeaveStatus, 'approved' | 'rejected'>, note?: string,
  ) => {
    setBusy(true);
    try {
      const updated = await leavesApi.reviewCancellation(supabase, id, decision, note);
      setLeaves((cur) => cur.map((l) => (l.id === id ? updated : l)));
      void leavesApi.overview(supabase).then(setOverview).catch(() => {});
    } catch (e) {
      setError(readableError(e));
      throw e;
    } finally {
      setBusy(false);
    }
  };

  return { leaves, overview, loading, busy, error, realtime, reload: load, review, reviewCancellation };
}

// ---------------------------------------------------------------------------
export function useLeaveBalance(userId?: string | null) {
  const { supabase } = useInnoVibe();
  const [rows, setRows] = useState<LeaveBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await leavesApi.balance(supabase, userId));
    } catch {
      /* balance is supplementary; a failed fetch just shows nothing */
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => { void load(); }, [load]);

  return { rows, loading, reload: load };
}