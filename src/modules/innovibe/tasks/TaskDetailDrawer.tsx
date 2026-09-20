import { useState } from 'react';
import {
  Avatar, Badge, Button, ConfirmDialog, Drawer, ErrorState, LiveDot, SkeletonRows,
} from '../ui/ui';
import { useTaskThread } from './hooks';
import { useInnoVibe, useNameOf } from '../provider';
import { formatDay, relativeTime } from '../lib/time';
import { readableError, useToast } from '../lib/toast';
import {
  PRIORITY_LABEL, STATUS_LABEL, TASK_STATUSES,
} from '../types';
import type { TaskActivity, TaskStatus } from '../types';

export function TaskDetailDrawer({
  taskId, onClose, onEdit, onDelete, onStatusChange,
}: {
  taskId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: TaskStatus) => Promise<unknown>;
}) {
  const { userId, isManager } = useInnoVibe();
  const nameOf = useNameOf();
  const toast = useToast();
  const { task, comments, activity, loading, error, realtime, reload, addComment, deleteComment } =
    useTaskThread(taskId);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEdit = !!task && (isManager || task.created_by === userId);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await addComment(draft);
      setDraft('');
    } catch (e) {
      toast.error(readableError(e));
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status: TaskStatus) => {
    if (!task) return;
    try {
      await onStatusChange(task.id, status);
    } catch (e) {
      toast.error(readableError(e));
    }
  };

  return (
    <Drawer open={!!taskId} title="Task" onClose={onClose}>
      {loading && !task ? <SkeletonRows rows={6} /> : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !task ? (
        <ErrorState message="This task is no longer available to you." />
      ) : (
        <>
          <div className="iv-taskdetail__head">
            <div className="iv-taskdetail__badges">
              <Badge tone={`p-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</Badge>
              <Badge tone={`s-${task.status}`} dot>{STATUS_LABEL[task.status]}</Badge>
              <LiveDot status={realtime} />
            </div>
            <h3 className="iv-taskdetail__title">{task.title}</h3>
            {task.description && <p className="iv-taskdetail__desc">{task.description}</p>}
          </div>

          <dl className="iv-taskdetail__meta">
            <div><dt>Assigned to</dt><dd>{nameOf(task.assigned_to)}</dd></div>
            <div><dt>Created by</dt><dd>{nameOf(task.created_by)}</dd></div>
            <div><dt>Due</dt><dd>{task.due_date ? formatDay(task.due_date) : 'No due date'}</dd></div>
            <div><dt>Created</dt><dd>{formatDay(task.created_at)}</dd></div>
            {task.completed_at && (
              <div><dt>Completed</dt><dd>{formatDay(task.completed_at)}</dd></div>
            )}
          </dl>

          <div className="iv-statuspicker" role="group" aria-label="Change status">
            {TASK_STATUSES.map((s) => (
              <button
                key={s}
                className={`iv-statuspicker__btn ${task.status === s ? 'is-active' : ''}`}
                onClick={() => changeStatus(s)}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          {canEdit && (
            <div className="iv-taskdetail__ownerbar">
              <Button size="sm" onClick={() => onEdit(task.id)}>Edit details</Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>Delete task</Button>
            </div>
          )}

          <section className="iv-thread">
            <h4 className="iv-thread__title">Comments</h4>
            {comments.length === 0 ? (
              <p className="iv-thread__empty">No comments yet. Add the first update.</p>
            ) : comments.map((c) => (
              <article key={c.id} className="iv-comment">
                <Avatar name={nameOf(c.user_id)} size={28} />
                <div>
                  <p className="iv-comment__head">
                    <strong>{nameOf(c.user_id)}</strong>
                    <span>{relativeTime(c.created_at)}</span>
                    {c.user_id === userId && (
                      <button className="iv-linkbtn" onClick={() => deleteComment(c.id)}>Delete</button>
                    )}
                  </p>
                  <p className="iv-comment__body">{c.content}</p>
                </div>
              </article>
            ))}

            <div className="iv-composer">
              <textarea
                className="iv-input iv-input--area"
                rows={2}
                value={draft}
                placeholder="Write an update…"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send();
                }}
              />
              <Button variant="primary" loading={sending} onClick={send} disabled={!draft.trim()}>
                Comment
              </Button>
            </div>
          </section>

          <section className="iv-thread">
            <h4 className="iv-thread__title">Activity</h4>
            <ol className="iv-activity">
              {activity.map((a) => (
                <li key={a.id}>
                  <span className="iv-activity__dot" aria-hidden="true" />
                  <p>
                    <strong>{nameOf(a.user_id)}</strong> {describe(a, nameOf)}
                    <span className="iv-activity__time">{relativeTime(a.created_at)}</span>
                  </p>
                </li>
              ))}
              {activity.length === 0 && <li className="iv-thread__empty">Nothing recorded yet.</li>}
            </ol>
          </section>

          <ConfirmDialog
            open={confirmDelete}
            title="Delete this task?"
            message="Comments and activity for this task are removed too. This cannot be undone."
            confirmLabel="Delete task"
            onCancel={() => setConfirmDelete(false)}
            onConfirm={async () => {
              try {
                await onDelete(task.id);
                setConfirmDelete(false);
                onClose();
                toast.success('Task deleted');
              } catch (e) {
                toast.error(readableError(e));
              }
            }}
          />
        </>
      )}
    </Drawer>
  );
}

function describe(a: TaskActivity, nameOf: (id?: string | null) => string): string {
  const m = a.metadata ?? {};
  const label = (v: unknown) => STATUS_LABEL[v as TaskStatus] ?? String(v ?? '');
  switch (a.action) {
    case 'created': return 'created this task';
    case 'completed': return 'marked it completed';
    case 'status_changed': return `moved it from ${label(m.from)} to ${label(m.to)}`;
    case 'priority_changed': return `changed priority from ${m.from} to ${m.to}`;
    case 'reassigned': return `reassigned it to ${nameOf(m.to as string)}`;
    case 'due_date_changed': return `set the due date to ${m.to ? formatDay(String(m.to)) : 'none'}`;
    case 'edited': return 'edited the details';
    case 'commented': return 'added a comment';
    default: return String(a.action).replace(/_/g, ' ');
  }
}
