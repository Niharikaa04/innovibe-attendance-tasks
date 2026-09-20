import { useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LiveDot,
  Search,
  SkeletonRows,
  StatTile,
} from '../ui/ui';
import { useTasks } from './hooks';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { useInnoVibe, useNameOf } from '../provider';
import { dueLabel, isOverdue } from '../lib/time';
import { readableError, useToast } from '../lib/toast';
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../types';
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from '../types';

export function TasksPage({
  initialAssignee = 'all',
  startWithNewTask = false,
}: {
  initialAssignee?: 'all' | 'me';
  /** Open the "New task" form as soon as the page appears. */
  startWithNewTask?: boolean;
} = {}) {
  const { isManager, people } = useInnoVibe();
  const nameOf = useNameOf();
  const toast = useToast();

  const t = useTasks({
    assignee: isManager ? initialAssignee : 'me',
  });

  const [view, setView] = useState<'board' | 'table'>('board');
  const [formOpen, setFormOpen] = useState(startWithNewTask);
  const [editing, setEditing] = useState<Task | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const counts = isManager ? t.counts : t.myCounts;

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      blocked: [],
      completed: [],
    };

    t.tasks.forEach((task) => {
      map[task.status].push(task);
    });

    return map;
  }, [t.tasks]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (id: string) => {
    setEditing(t.allTasks.find((x) => x.id === id) ?? null);
    setFormOpen(true);
  };

  return (
    <div className="iv-page">
      <div className="iv-page__head">
        <div>
          <h1 className="iv-page__title">Tasks</h1>

          <p className="iv-page__sub">
            {isManager
              ? 'Everything the team is working on.'
              : 'What is on your plate right now.'}
          </p>
        </div>

        <div className="iv-toolbar">
          <LiveDot status={t.realtime} />

          <div className="iv-segmented">
            <button
              className={`iv-segmented__btn ${
                view === 'board' ? 'is-active' : ''
              }`}
              onClick={() => setView('board')}
            >
              Board
            </button>

            <button
              className={`iv-segmented__btn ${
                view === 'table' ? 'is-active' : ''
              }`}
              onClick={() => setView('table')}
            >
              List
            </button>
          </div>

          <Button variant="primary" onClick={openNew}>
            New task
          </Button>
        </div>
      </div>

      <div className="iv-statrow iv-statrow--5">
        <StatTile
          label={isManager ? 'All tasks' : 'My tasks'}
          value={counts.total}
        />

        <StatTile label="To do" value={counts.todo} />

        <StatTile
          label="In progress"
          value={counts.in_progress}
          tone="working"
        />

        <StatTile
          label="Blocked"
          value={counts.blocked}
          tone="late"
        />

        <StatTile
          label="Completed"
          value={counts.completed}
          tone="good"
        />
      </div>

      {counts.overdue > 0 && (
        <div className="iv-alertbar">
          <strong>
            {counts.overdue}{' '}
            {counts.overdue === 1
              ? 'task is'
              : 'tasks are'}{' '}
            past the due date.
          </strong>

          <button
            className="iv-linkbtn"
            onClick={() =>
              t.setFilters({
                ...t.filters,
                due: 'overdue',
                status: 'all',
              })
            }
          >
            Show them
          </button>
        </div>
      )}

      <Card>
        <div className="iv-filters">
          <Search
            value={t.filters.search ?? ''}
            onChange={(v) =>
              t.setFilters({
                ...t.filters,
                search: v,
              })
            }
            placeholder="Search tasks"
          />

          <select
            className="iv-input iv-input--compact"
            value={t.filters.status}
            onChange={(e) =>
              t.setFilters({
                ...t.filters,
                status: e.target.value as TaskStatus | 'all',
              })
            }
          >
            <option value="all">Any status</option>

            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>

          <select
            className="iv-input iv-input--compact"
            value={t.filters.priority}
            onChange={(e) =>
              t.setFilters({
                ...t.filters,
                priority: e.target.value as TaskPriority | 'all',
              })
            }
          >
            <option value="all">Any priority</option>

            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>

          <select
            className="iv-input iv-input--compact"
            value={t.filters.assignee}
            onChange={(e) =>
              t.setFilters({
                ...t.filters,
                assignee: e.target.value,
              })
            }
          >
            <option value="all">Anyone</option>
            <option value="me">Assigned to me</option>

            {isManager &&
              people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? 'Unnamed'}
                </option>
              ))}
          </select>

          <select
            className="iv-input iv-input--compact"
            value={t.filters.due}
            onChange={(e) =>
              t.setFilters({
                ...t.filters,
                due: e.target.value as any,
              })
            }
          >
            <option value="all">Any date</option>
            <option value="today">Due today</option>
            <option value="week">Due this week</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {t.error && (
          <ErrorState
            message={t.error}
            onRetry={t.reload}
          />
        )}

        {t.loading ? (
          <SkeletonRows rows={6} />
        ) : t.tasks.length === 0 ? (
          <EmptyState
            title="No tasks match this view"
            body={
              t.allTasks.length === 0
                ? 'Create the first task and assign it to someone.'
                : 'Adjust the filters to see more.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={openNew}
              >
                New task
              </Button>
            }
          />
        ) : view === 'board' ? (
          <div className="iv-board">
            {TASK_STATUSES.map((status) => (
              <div
                key={status}
                className={`iv-board__col iv-board__col--${status}`}
              >
                <header>
                  <h3>{STATUS_LABEL[status]}</h3>
                  <span>{grouped[status].length}</span>
                </header>

                <div className="iv-board__list">
                  {grouped[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      nameOf={nameOf}
                      onOpen={() => setOpenTaskId(task.id)}
                    />
                  ))}

                  {grouped[status].length === 0 && (
                    <p className="iv-board__empty">
                      Nothing here
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="iv-tablewrap">
            <table className="iv-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned to</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due</th>
                </tr>
              </thead>

              <tbody>
                {t.tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="iv-row is-clickable"
                    onClick={() => setOpenTaskId(task.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setOpenTaskId(task.id);
                      }
                    }}
                  >
                    <td data-label="Task">
                      <strong>{task.title}</strong>
                    </td>

                    <td data-label="Assigned to">
                      <span className="iv-person">
                        <Avatar
                          name={nameOf(task.assigned_to)}
                          size={26}
                        />

                        <span>
                          <strong>
                            {nameOf(task.assigned_to)}
                          </strong>
                        </span>
                      </span>
                    </td>

                    <td data-label="Priority">
                      <Badge tone={`p-${task.priority}`}>
                        {PRIORITY_LABEL[task.priority]}
                      </Badge>
                    </td>

                    <td data-label="Status">
                      <Badge
                        tone={`s-${task.status}`}
                        dot
                      >
                        {STATUS_LABEL[task.status]}
                      </Badge>
                    </td>

                    <td
                      data-label="Due"
                      className={
                        isOverdue(
                          task.due_date,
                          task.status
                        )
                          ? 'iv-overdue'
                          : ''
                      }
                    >
                      {dueLabel(
                        task.due_date,
                        task.status
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <TaskFormModal
        open={formOpen}
        task={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={async (input, assignees) => {
          if (editing) {
            await t.update(editing.id, input);
            return;
          }

          const targets =
            assignees && assignees.length > 0
              ? assignees
              : [input.assigned_to ?? ''];

          // Create one task row for every selected employee.
          // Each employee can track their own task status.
          await Promise.all(
            targets.map((assigneeId) =>
              t.create({
                ...input,
                assigned_to: assigneeId || null,
              })
            )
          );
        }}
      />

      <TaskDetailDrawer
        taskId={openTaskId}
        onClose={() => setOpenTaskId(null)}
        onEdit={(id) => {
          setOpenTaskId(null);
          openEdit(id);
        }}
        onDelete={t.remove}
        onStatusChange={async (id, status) => {
          try {
            await t.setStatus(id, status);
          } catch (e) {
            toast.error(readableError(e));
            throw e;
          }
        }}
      />
    </div>
  );
}

function TaskCard({
  task,
  nameOf,
  onOpen,
}: {
  task: Task;
  nameOf: (id?: string | null) => string;
  onOpen: () => void;
}) {
  const overdue = isOverdue(
    task.due_date,
    task.status
  );

  return (
    <article
      className={`iv-taskcard iv-taskcard--${task.priority} ${
        overdue ? 'is-overdue' : ''
      }`}
      onClick={onOpen}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onOpen();
        }
      }}
    >
      <h4>{task.title}</h4>

      {task.description && (
        <p>{task.description}</p>
      )}

      <footer>
        <span className="iv-person">
          <Avatar
            name={nameOf(task.assigned_to)}
            size={22}
          />

          <span>
            {nameOf(task.assigned_to)}
          </span>
        </span>

        <span
          className={
            overdue ? 'iv-overdue' : 'iv-due'
          }
        >
          {dueLabel(
            task.due_date,
            task.status
          )}
        </span>
      </footer>
    </article>
  );
}