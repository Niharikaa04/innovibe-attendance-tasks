import { useNotifications } from './NotificationBell';
import { relativeTime } from '../lib/time';
import {
  Button, Card, EmptyState, ErrorState, SectionHead, SkeletonRows,
} from '../ui/ui';

export function NotificationsPage({
  onOpenTask,
}: { onOpenTask?: (taskId: string) => void }) {
  const { items, unread, loading, error, reload, markAllRead, markRead } = useNotifications(100);

  return (
    <div className="iv-page">
      <div className="iv-page__head">
        <div>
          <h1 className="iv-page__title">Notifications</h1>
          <p className="iv-page__sub">
            {unread > 0 ? `${unread} unread` : 'You are all caught up'}
          </p>
        </div>
        {unread > 0 && <Button variant="primary" onClick={markAllRead}>Mark all read</Button>}
      </div>

      <Card>
        <SectionHead title="All notifications" />
        {error && <ErrorState message={error} onRetry={reload} />}
        {loading ? <SkeletonRows rows={6} /> : items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="Task assignments, status changes, and comments meant for you will show up here."
          />
        ) : (
          <ul className="iv-notiflist">
            {items.map((n) => {
              const taskId = (n.data as { task_id?: string } | null)?.task_id;
              return (
                <li key={n.id}>
                  <button
                    className={`iv-notiflist__row ${n.is_read ? '' : 'is-unread'}`}
                    onClick={() => {
                      void markRead(n.id);
                      if (taskId && onOpenTask) onOpenTask(taskId);
                    }}
                  >
                    <span className="iv-notiflist__dot" aria-hidden="true" />
                    <span className="iv-notiflist__body">
                      <strong>{n.title}</strong>
                      {n.body && <span>{n.body}</span>}
                    </span>
                    <span className="iv-notiflist__time">{relativeTime(n.created_at)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
