import { useNotifications } from './NotificationBell';
import { relativeTime } from '../lib/time';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  SectionHead,
  SkeletonRows,
} from '../ui/ui';

export function NotificationsPage({
  onOpenTask,
}: {
  onOpenTask?: (taskId: string) => void;
}) {
  const {
    items,
    unread,
    loading,
    error,
    reload,
    markAllRead,
    markRead,
    deleteNotification,
    clearAll,
  } = useNotifications(100);

  const handleClearAll = async () => {
    if (items.length === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear all notifications?',
    );

    if (!confirmed) return;

    await clearAll();
  };

  return (
    <div className="iv-page">
      <div className="iv-page__head">
        <div>
          <h1 className="iv-page__title">
            Notifications
          </h1>

          <p className="iv-page__sub">
            {unread > 0
              ? `${unread} unread`
              : 'You are all caught up'}
          </p>
        </div>

        <div className="iv-notification-actions">
          {unread > 0 && (
            <Button
              variant="primary"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}

          {items.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                void handleClearAll();
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      <Card>
        <SectionHead title="All notifications" />

        {error && (
          <ErrorState
            message={error}
            onRetry={reload}
          />
        )}

        {loading ? (
          <SkeletonRows rows={6} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="Task assignments, status changes, and comments meant for you will show up here."
          />
        ) : (
          <ul className="iv-notiflist">
            {items.map((n) => {
              const taskId = (
                n.data as { task_id?: string } | null
              )?.task_id;

              return (
                <li key={n.id}>
                  <div
                    className={`iv-notiflist__item ${
                      n.is_read ? '' : 'is-unread'
                    }`}
                  >
                    <button
                      className={`iv-notiflist__row ${
                        n.is_read ? '' : 'is-unread'
                      }`}
                      onClick={() => {
                        void markRead(n.id);

                        if (taskId && onOpenTask) {
                          onOpenTask(taskId);
                        }
                      }}
                    >
                      <span
                        className="iv-notiflist__dot"
                        aria-hidden="true"
                      />

                      <span className="iv-notiflist__body">
                        <strong>{n.title}</strong>

                        {n.body && (
                          <span>{n.body}</span>
                        )}
                      </span>

                      <span className="iv-notiflist__time">
                        {relativeTime(n.created_at)}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="iv-notiflist__delete"
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
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
