import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useInnoVibe } from '../provider';

// ---------------------------------------------------------------------------
// One channel per hook call. Event driven — there is no polling anywhere in
// this module. Channels are removed on unmount, and the effect is keyed on a
// serialised description of the subscriptions so React StrictMode's double
// mount cannot leave a duplicate channel behind.
// ---------------------------------------------------------------------------

export type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeSub {
  table: string;
  schema?: string;
  event?: ChangeEvent;
  /** Postgres filter, e.g. `user_id=eq.<uuid>` */
  filter?: string;
}

export type RealtimeStatus = 'connecting' | 'live' | 'error';

export function useRealtime(
  /** Unique per mounted component instance. Pass null to disable. */
  channelKey: string | null,
  subs: RealtimeSub[],
  onEvent: (payload: RealtimePostgresChangesPayload<Record<string, any>>, sub: RealtimeSub) => void,
): RealtimeStatus {
  const { supabase } = useInnoVibe();
  const [status, setStatus] = useState<RealtimeStatus>('connecting');

  // Keep the latest callback without re-subscribing on every render.
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  const subsKey = JSON.stringify(subs);

  useEffect(() => {
    if (!channelKey) return undefined;

    const parsed: RealtimeSub[] = JSON.parse(subsKey);
    let channel: RealtimeChannel | null = supabase.channel(channelKey);
    let cancelled = false;

    parsed.forEach((sub) => {
      channel = channel!.on(
        'postgres_changes' as any,
        {
          event: sub.event ?? '*',
          schema: sub.schema ?? 'public',
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
          if (!cancelled) handlerRef.current(payload, sub);
        },
      );
    });

    channel!.subscribe((s) => {
      if (cancelled) return;
      if (s === 'SUBSCRIBED') setStatus('live');
      else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('error');
    });

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [supabase, channelKey, subsKey]);

  return status;
}

/** Stable per-instance channel name, so two open tabs never collide. */
export function useChannelId(prefix: string): string {
  const ref = useRef<string | undefined>(undefined);
  if (!ref.current) {
    ref.current = `${prefix}:${Math.random().toString(36).slice(2, 10)}`;
  }
  return ref.current;
}

// ---------------------------------------------------------------------------
// List reducers — apply a realtime payload to an array without duplicates.
// ---------------------------------------------------------------------------

export function applyChange<T extends { id: string }>(
  list: T[],
  payload: RealtimePostgresChangesPayload<Record<string, any>>,
  opts: { sort?: (a: T, b: T) => number; keep?: (row: T) => boolean } = {},
): T[] {
  const { sort, keep } = opts;
  const next = (payload.new ?? null) as T | null;
  const old = (payload.old ?? null) as T | null;
  let out = list;

  if (payload.eventType === 'INSERT' && next) {
    if (keep && !keep(next)) return list;
    if (list.some((r) => r.id === next.id)) {
      out = list.map((r) => (r.id === next.id ? { ...r, ...next } : r));
    } else {
      out = [next, ...list];
    }
  } else if (payload.eventType === 'UPDATE' && next) {
    const exists = list.some((r) => r.id === next.id);
    if (keep && !keep(next)) {
      out = list.filter((r) => r.id !== next.id);           // moved out of view
    } else if (exists) {
      out = list.map((r) => (r.id === next.id ? { ...r, ...next } : r));
    } else {
      out = [next, ...list];                                 // moved into view
    }
  } else if (payload.eventType === 'DELETE' && old?.id) {
    out = list.filter((r) => r.id !== old.id);
  }

  return sort ? [...out].sort(sort) : out;
}
