import { useCallback, useEffect, useRef, useState } from 'react';
import { useInnoVibe } from '../provider';
import { applyChange, useChannelId, useRealtime } from '../lib/realtime';
import { readableError } from '../lib/toast';
import { relativeTime } from '../lib/time';
import { Button, EmptyState, SkeletonRows } from '../ui/ui';
import type { AppNotification } from '../types';

// ---------------------------------------------------------------------------
// useNotifications — only ever reads the signed-in user's own rows (RLS
// enforces this as well) and subscribes with a user_id filter so the socket
// does not carry other people's notices.
// ---------------------------------------------------------------------------
export function useNotifications(limit = 30) {
  const { supabase, userId } = useInnoVibe();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (err) setError(readableError(err));
    else { setItems((data ?? []) as AppNotification[]); setError(null); }
    setLoading(false);
  }, [supabase, userId, limit]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-notifications');
  useRealtime(
    userId ? channelId : null,
    [{ table: 'notifications', filter: userId ? `user_id=eq.${userId}` : undefined }],
    (payload) => {
      setItems((cur) => applyChange<AppNotification>(cur, payload, {
        sort: (a, b) => (a.created_at < b.created_at ? 1 : -1),
      }).slice(0, limit));
    },
  );

  const unread = items.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    setItems((cur) => cur.map((n) => ({ ...n, is_read: true })));
    const { error: err } = await supabase.rpc('iv_mark_notifications_read', { p_ids: null });
    if (err) { setError(readableError(err)); void load(); }
  };

  const markRead = async (id: string) => {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  return { items, unread, loading, error, reload: load, markAllRead, markRead };
}

// ---------------------------------------------------------------------------
export function NotificationBell({
  onOpenTask,
}: { onOpenTask?: (taskId: string) => void }) {
  const { items, unread, loading, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="iv-bell" ref={wrapRef}>
      <button
        className="iv-bell__btn"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && <span className="iv-bell__count">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="iv-bell__panel" role="dialog" aria-label="Notifications">
          <header>
            <h3>Notifications</h3>
            {unread > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>
            )}
          </header>

          <div className="iv-bell__list">
            {loading ? <SkeletonRows rows={3} /> : items.length === 0 ? (
              <EmptyState title="Nothing new" body="Task updates meant for you will land here." />
            ) : items.map((n) => {
              const taskId = (n.data as { task_id?: string } | null)?.task_id;
              return (
                <button
                  key={n.id}
                  className={`iv-notice ${n.is_read ? '' : 'is-unread'}`}
                  onClick={() => {
                    void markRead(n.id);
                    if (taskId && onOpenTask) { onOpenTask(taskId); setOpen(false); }
                  }}
                >
                  <span className="iv-notice__title">{n.title}</span>
                  {n.body && <span className="iv-notice__body">{n.body}</span>}
                  <span className="iv-notice__time">{relativeTime(n.created_at)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
