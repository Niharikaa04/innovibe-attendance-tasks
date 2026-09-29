import { useCallback, useEffect, useRef, useState } from 'react';
import { useInnoVibe } from '../provider';
import { applyChange, useChannelId, useRealtime } from '../lib/realtime';
import { readableError } from '../lib/toast';
import { relativeTime } from '../lib/time';
import { Button, EmptyState, SkeletonRows } from '../ui/ui';
import type { AppNotification } from '../types';

// ---------------------------------------------------------------------------
// useNotifications
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

    if (err) {
      setError(readableError(err));
    } else {
      setItems((data ?? []) as AppNotification[]);
      setError(null);
    }

    setLoading(false);
  }, [supabase, userId, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const channelId = useChannelId('iv-notifications');

  useRealtime(
    userId ? channelId : null,
    [
      {
        table: 'notifications',
        filter: userId ? `user_id=eq.${userId}` : undefined,
      },
    ],
    (payload) => {
      setItems((cur) =>
        applyChange<AppNotification>(cur, payload, {
          sort: (a, b) =>
            a.created_at < b.created_at ? 1 : -1,
        }).slice(0, limit),
      );
    },
  );

  const unread = items.filter((n) => !n.is_read).length;

  // -------------------------------------------------------------------------
  // Mark all as read
  // -------------------------------------------------------------------------
  const markAllRead = async () => {
    setItems((cur) =>
      cur.map((n) => ({
        ...n,
        is_read: true,
      })),
    );

    const { error: err } = await supabase.rpc(
      'iv_mark_notifications_read',
      {
        p_ids: null,
      },
    );

    if (err) {
      setError(readableError(err));
      void load();
    }
  };

  // -------------------------------------------------------------------------
  // Mark one as read
  // -------------------------------------------------------------------------
  const markRead = async (id: string) => {
    setItems((cur) =>
      cur.map((n) =>
        n.id === id
          ? { ...n, is_read: true }
          : n,
      ),
    );

    const { error: err } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (err) {
      setError(readableError(err));
      void load();
    }
  };

  // -------------------------------------------------------------------------
  // Delete one notification
  // -------------------------------------------------------------------------
  const deleteNotification = async (id: string) => {
    const previous = items;

    setItems((cur) =>
      cur.filter((n) => n.id !== id),
    );

    const { error: err } = await supabase.rpc(
      'iv_delete_notification',
      {
        p_notification_id: id,
      },
    );

    if (err) {
      setItems(previous);
      setError(readableError(err));
    }
  };

  // -------------------------------------------------------------------------
  // Clear all notifications
  // -------------------------------------------------------------------------
  const clearAll = async () => {
    const previous = items;

    setItems([]);

    const { error: err } = await supabase.rpc(
      'iv_clear_notifications',
    );

    if (err) {
      setItems(previous);
      setError(readableError(err));
    }
  };

  return {
    items,
    unread,
    loading,
    error,
    reload: load,
    markAllRead,
    markRead,
    deleteNotification,
    clearAll,
  };
}

// ---------------------------------------------------------------------------
// Notification Bell
// ---------------------------------------------------------------------------
export function NotificationBell({
  onOpenTask,
}: {
  onOpenTask?: (taskId: string) => void;
}) {
  const {
    items,
    unread,
    loading,
    markAllRead,
    markRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const onDoc = (e: MouseEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDoc);

    return () =>
      document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleClearAll = async () => {
    if (items.length === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear all notifications?',
    );

    if (!confirmed) return;

    await clearAll();
  };

  return (
    <div className="iv-bell" ref={wrapRef}>
      <button
        className="iv-bell__btn"
        aria-label={
          unread
            ? `Notifications, ${unread} unread`
            : 'Notifications'
        }
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🔔</span>

        {unread > 0 && (
          <span className="iv-bell__count">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="iv-bell__panel"
          role="dialog"
          aria-label="Notifications"
        >
          <header>
            <h3>Notifications</h3>

            <div className="iv-notification-actions">
              {unread > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              )}

              {items.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void handleClearAll();
                  }}
                >
                  Clear all
                </Button>
              )}
            </div>
          </header>

          <div className="iv-bell__list">
            {loading ? (
              <SkeletonRows rows={3} />
            ) : items.length === 0 ? (
              <EmptyState
                title="Nothing new"
                body="Task updates meant for you will land here."
              />
            ) : (
              items.map((n) => {
                const taskId = (
                  n.data as { task_id?: string } | null
                )?.task_id;

                return (
                  <div
                    key={n.id}
                    className={`iv-notice-wrap ${
                      n.is_read ? '' : 'is-unread'
                    }`}
                  >
                    <button
                      className={`iv-notice ${
                        n.is_read ? '' : 'is-unread'
                      }`}
                      onClick={() => {
                        void markRead(n.id);

                        if (taskId && onOpenTask) {
                          onOpenTask(taskId);
                          setOpen(false);
                        }
                      }}
                    >
                      <span className="iv-notice__title">
                        {n.title}
                      </span>

                      {n.body && (
                        <span className="iv-notice__body">
                          {n.body}
                        </span>
                      )}

                      <span className="iv-notice__time">
                        {relativeTime(n.created_at)}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="iv-notice__delete"
                      aria-label={`Delete ${n.title}`}
                      title="Delete notification"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteNotification(n.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}