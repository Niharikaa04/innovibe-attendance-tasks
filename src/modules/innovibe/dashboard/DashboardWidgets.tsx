import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Avatar, Badge, Card, EmptyState, ErrorState, LiveDot, SectionHead, SkeletonRows,
} from '../ui/ui';
import { IvIcon } from '../ui/icons';
import type { IvIconName } from '../ui/icons';
import { useTeamAttendance, useMyAttendance } from '../attendance/hooks';
import { useTasks } from '../tasks/hooks';
import { useInnoVibe, useNameOf } from '../provider';
import { useChannelId, useRealtime } from '../lib/realtime';
import { tasksApi } from '../tasks/api';
import { readableError } from '../lib/toast';
import { dueLabel, formatClock, isOverdue, relativeTime, todayISO } from '../lib/time';
import {
  ATTENDANCE_LABEL, PRIORITY_LABEL, STATUS_LABEL,
} from '../types';
import type { ActivityAction, Task, TaskActivity, TaskStatus } from '../types';
import './dashboard.css';

// ---------------------------------------------------------------------------
// Small, self-contained widgets. OfficeDashboardSection places them in the
// 3-column dashboard grid; each one can also be used on its own.
// ---------------------------------------------------------------------------

const TONE: Record<string, string> = {
  working: 'working', checked_out: 'out', not_checked_in: 'absent',
  absent: 'absent', on_leave: 'neutral',
};

/**
 * Statuses that still need work. This is the same set the "Pending tasks"
 * KPI adds up (todo + in_progress + blocked), taken from TaskStatus in
 * types.ts. 'completed' is deliberately not in this list.
 */
const PENDING_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked'];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Reads "YYYY-MM-DD" (or an ISO timestamp) as a local calendar day. */
function parseDay(value?: string | null): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

const ACTIVITY_TEXT: Record<ActivityAction, string> = {
  created: 'created a task',
  status_changed: "changed a task's status",
  priority_changed: "changed a task's priority",
  reassigned: 'reassigned a task',
  due_date_changed: "changed a task's due date",
  edited: 'edited a task',
  commented: 'commented on a task',
  completed: 'completed a task',
};

/**
 * True once the first load has finished. The live hooks set `loading` again on
 * every refresh; without this, every check-in would flash the cards back to
 * grey placeholders.
 */
function useSettled(loading: boolean): boolean {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!loading) setSettled(true);
  }, [loading]);
  return settled || !loading;
}

function toTimestamp(value: string): number {
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function CardHead({
  icon, title, right,
}: { icon: IvIconName; title: string; right?: ReactNode }) {
  return (
    <div className="iv-dhead">
      <h3 className="iv-dhead__title">
        <IvIcon name={icon} size={18} />
        <span>{title}</span>
      </h3>
      {right}
    </div>
  );
}

type TileTone = 'green' | 'amber' | 'red' | 'blue' | 'cyan' | 'grey';

function Tile({
  icon, tone, value, label,
}: { icon: IvIconName; tone: TileTone; value: number; label: string }) {
  return (
    <div className={`iv-dtile iv-dtile--${tone}`}>
      <IvIcon name={icon} size={20} className="iv-dtile__icon" />
      <span className="iv-dtile__value">{value}</span>
      <span className="iv-dtile__label">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KpiCard / KpiRow — icon on the left, number + label on the right.
// ---------------------------------------------------------------------------
export function KpiCard({
  icon, tone, value, label, trend,
}: {
  icon: ReactNode;
  tone: 'blue' | 'green' | 'cyan' | 'orange' | 'purple' | 'red';
  value: ReactNode;
  label: string;
  trend?: string;
}) {
  return (
    <div className="iv-dkpi">
      <span className={`iv-dkpi__icon iv-dkpi__icon--${tone}`} aria-hidden="true">{icon}</span>
      <div className="iv-dkpi__body">
        <div className="iv-dkpi__value">{value}</div>
        <div className="iv-dkpi__label">{label}</div>
        {trend && <span className="iv-dkpi__trend">{trend}</span>}
      </div>
    </div>
  );
}

/** The KPI row for the top of the dashboard — different cards for employees vs managers. */
export function DashboardKpiRow() {
  const { isManager } = useInnoVibe();
  const team = useTeamAttendance(todayISO());
  const mine = useMyAttendance();
  const taskData = useTasks();
  const { overview } = team;
  const { record: myRecord } = mine;
  const { counts, myCounts } = taskData;

  const loading = isManager
    ? (team.loading || taskData.loading)
    : (mine.loading || taskData.loading);
  const error = isManager
    ? (team.error ?? taskData.error)
    : (mine.error ?? taskData.error);
  const ready = useSettled(loading);

  if (!ready) {
    return (
      <div className="iv-dkpirow">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="iv-dkpi"><SkeletonRows rows={2} /></div>
        ))}
      </div>
    );
  }

  // A failed request must not look like "0 employees, 0 tasks".
  if (error) {
    return (
      <div className="iv-dkpirow">
        <div className="iv-dkpi" style={{ gridColumn: '1 / -1' }}>
          <ErrorState
            message={error}
            onRetry={() => {
              void team.reload();
              void mine.reload();
              void taskData.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (isManager) {
    return (
      <div className="iv-dkpirow iv-dkpirow--5">
        <KpiCard icon={<IvIcon name="users" size={24} />} tone="blue"
          value={overview?.total_employees ?? 0} label="Total employees" />
        <KpiCard icon={<IvIcon name="user-check" size={24} />} tone="green"
          value={overview?.present ?? 0} label="Present today" />
        <KpiCard icon={<IvIcon name="user-x" size={24} />} tone="red"
          value={overview?.absent ?? 0} label="Absent today" />
        <KpiCard icon={<IvIcon name="hourglass" size={24} />} tone="cyan"
          value={counts.todo + counts.in_progress + counts.blocked} label="Pending tasks" />
        <KpiCard icon={<IvIcon name="check-circle" size={24} />} tone="green"
          value={counts.completed} label="Completed tasks" />
      </div>
    );
  }

  const myStatus = myRecord?.status ?? 'not_checked_in';
  const pending = myCounts.todo + myCounts.in_progress + myCounts.blocked;
  const statusTone = myStatus === 'working' ? 'green' : myStatus === 'checked_out' ? 'orange' : 'purple';

  return (
    <div className="iv-dkpirow">
      <KpiCard icon={<IvIcon name="user-check" size={24} />} tone={statusTone}
        value={ATTENDANCE_LABEL[myStatus]} label="Today's attendance" />
      <KpiCard icon={<IvIcon name="log-in" size={24} />} tone="blue"
        value={formatClock(myRecord?.check_in)} label="Check-in time" />
      <KpiCard icon={<IvIcon name="log-out" size={24} />} tone="cyan"
        value={formatClock(myRecord?.check_out)} label="Check-out time" />
      <KpiCard icon={<IvIcon name="clipboard" size={24} />} tone="orange"
        value={pending} label="My pending tasks" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attendance today
// ---------------------------------------------------------------------------
export function AttendanceSummaryWidget({ onOpen }: { onOpen?: () => void }) {
  const { overview, loading, error, reload, realtime } = useTeamAttendance(todayISO());
  const ready = useSettled(loading);
  return (
    <Card className="iv-dcard">
      <CardHead icon="users" title="Attendance today" right={<LiveDot status={realtime} />} />
      {!ready ? <SkeletonRows rows={2} /> : error ? (
        <ErrorState message={error} onRetry={() => { void reload(); }} />
      ) : (
        <div className="iv-dtiles iv-dtiles--3">
          <Tile icon="users" tone="green" value={overview?.working ?? 0} label="Working" />
          <Tile icon="log-out" tone="amber" value={overview?.checked_out ?? 0} label="Checked out" />
          <Tile icon="user-x" tone="red" value={overview?.absent ?? 0} label="Not in" />
        </div>
      )}
      {onOpen && (
        <button type="button" className="iv-btn iv-btn--primary iv-dbtn" onClick={onOpen}>
          View Attendance <IvIcon name="arrow-right" size={16} />
        </button>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Who is in
// ---------------------------------------------------------------------------
export function EmployeeStatusWidget({ max = 6 }: { max?: number }) {
  const { rows, loading, error, reload, realtime } = useTeamAttendance(todayISO());
  const ready = useSettled(loading);
  const nameOf = useNameOf();
  return (
    <Card className="iv-dcard">
      <CardHead icon="activity" title="Who is in" right={<LiveDot status={realtime} />} />
      {!ready ? <SkeletonRows rows={4} /> : error ? (
        <ErrorState message={error} onRetry={() => { void reload(); }} />
      ) : rows.length === 0 ? (
        <EmptyState title="No employees yet" body="People appear here once they are added." />
      ) : (
        <ul className="iv-dpeople">
          {rows.slice(0, max).map((r) => {
            const name = r.full_name || nameOf(r.user_id);
            return (
              <li key={r.user_id}>
                <span className="iv-dpeople__name">
                  <Avatar name={name} url={r.avatar_url} size={30} />
                  <strong>{name}</strong>
                </span>
                <span className="iv-dpeople__right">
                  <Badge tone={TONE[r.status]} dot>{ATTENDANCE_LABEL[r.status]}</Badge>
                  <em className="iv-dpeople__time">{formatClock(r.check_in)}</em>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tasks across the team
// ---------------------------------------------------------------------------
export function TaskSummaryWidget({ onOpen }: { onOpen?: () => void }) {
  const { counts, myCounts, loading, error, reload, realtime } = useTasks();
  const ready = useSettled(loading);
  const { isManager } = useInnoVibe();
  const c = isManager ? counts : myCounts;
  return (
    <Card className="iv-dcard">
      <CardHead
        icon="list"
        title={isManager ? 'Tasks across the team' : 'My tasks'}
        right={<LiveDot status={realtime} />}
      />
      {!ready ? <SkeletonRows rows={2} /> : error ? (
        <ErrorState message={error} onRetry={() => { void reload(); }} />
      ) : (
        <div className="iv-dtiles iv-dtiles--auto">
          <Tile icon="list" tone="blue" value={c.total} label="Total" />
          <Tile icon="circle" tone="grey" value={c.todo} label="To do" />
          <Tile icon="play" tone="cyan" value={c.in_progress} label="In progress" />
          <Tile icon="alert-circle" tone="red" value={c.blocked} label="Blocked" />
          <Tile icon="check-circle" tone="green" value={c.completed} label="Completed" />
        </div>
      )}
      {onOpen && (
        <button type="button" className="iv-btn iv-btn--primary iv-dbtn" onClick={onOpen}>
          Open Tasks <IvIcon name="arrow-right" size={16} />
        </button>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Upcoming deadlines — open tasks that have a due date, nearest date first.
//
// This widget asks Supabase directly for exactly those tasks (status is
// todo / in_progress / blocked, due_date is set) instead of filtering a list
// held in memory. So a task that is marked Completed can never be returned,
// and the list reloads on every task change, when the dashboard is opened,
// and when you switch back to this browser tab.
// ---------------------------------------------------------------------------
type DeadlineRow = Pick<Task, 'id' | 'title' | 'status' | 'priority' | 'due_date'>;

export function UpcomingDeadlinesWidget({
  max = 4, onOpen, onOpenTask,
}: {
  max?: number;
  onOpen?: () => void;
  onOpenTask?: (id: string) => void;
}) {
  const { supabase, userId, isManager } = useInnoVibe();
  const [upcoming, setUpcoming] = useState<DeadlineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let query = supabase
      .from('tasks')
      .select('id, title, status, priority, due_date')
      .in('status', PENDING_STATUSES)
      .not('due_date', 'is', null);

    // Employees see the deadlines of their own tasks; managers see the team's.
    if (!isManager && userId) query = query.eq('assigned_to', userId);

    const { data, error: err } = await query
      .order('due_date', { ascending: true })
      .limit(max);

    if (err) {
      setError(err.message);
    } else {
      setError(null);
      const rows = (data ?? []) as DeadlineRow[];
      setUpcoming(rows.filter((t) => PENDING_STATUSES.includes(t.status)));
    }
    setLoading(false);
  }, [supabase, userId, isManager, max]);

  useEffect(() => { void load(); }, [load]);

  // Reload whenever any task is created, edited (e.g. completed) or deleted.
  const channelId = useChannelId('iv-upcoming-deadlines');
  useRealtime(
    userId ? channelId : null,
    [
      { table: 'tasks', event: 'INSERT' },
      { table: 'tasks', event: 'UPDATE' },
      { table: 'tasks', event: 'DELETE' },
    ],
    () => { void load(); },
  );

  // Reload when the person comes back to this tab.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return (
    <Card className="iv-dcard">
      <CardHead
        icon="calendar"
        title="Upcoming deadlines"
        right={onOpen ? (
          <button type="button" className="iv-dhead__link" onClick={onOpen}>View all</button>
        ) : undefined}
      />
      {loading ? <SkeletonRows rows={3} /> : error ? (
        <ErrorState message={error} onRetry={() => { void load(); }} />
      ) : upcoming.length === 0 ? (
        <EmptyState title="No upcoming deadlines" body="Open tasks with a due date will show up here." />
      ) : (
        <ul className="iv-dlist">
          {upcoming.map((t) => {
            const due = parseDay(t.due_date);
            const overdue = isOverdue(t.due_date, t.status);
            const soon = !overdue && due !== null && (due.getTime() - today0) / 86400000 <= 2;
            const pillClass = overdue ? 'is-overdue' : soon ? 'is-soon' : '';
            return (
              <li key={t.id}>
                <button type="button" className="iv-dlist__row" onClick={() => onOpenTask?.(t.id)}>
                  <span className={`iv-dlist__icon iv-dlist__icon--p-${t.priority}`}>
                    <IvIcon name="file-text" size={18} />
                  </span>
                  <span className="iv-dlist__main">
                    <strong>{t.title}</strong>
                    <em>{STATUS_LABEL[t.status]} • {PRIORITY_LABEL[t.priority]} priority</em>
                  </span>
                  <span className={`iv-dlist__date ${pillClass}`}>
                    {due ? `${due.getDate()} ${MONTHS[due.getMonth()]}` : dueLabel(t.due_date, t.status)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Next up (previous widget, kept so nothing that imports it breaks)
// ---------------------------------------------------------------------------
export function PendingTasksWidget({
  max = 5, onOpenTask,
}: { max?: number; onOpenTask?: (id: string) => void }) {
  const { tasks, loading } = useTasks({ status: 'all' });
  const pending = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => (a.due_date ?? '9999') < (b.due_date ?? '9999') ? -1 : 1)
    .slice(0, max);

  return (
    <Card>
      <SectionHead title="Next up" subtitle="Soonest due dates first" />
      {loading ? <SkeletonRows rows={3} /> : pending.length === 0 ? (
        <EmptyState title="Nothing pending" body="Every open task is done." />
      ) : (
        <ul className="iv-minilist">
          {pending.map((t) => (
            <li key={t.id}>
              <button className="iv-minilist__row" onClick={() => onOpenTask?.(t.id)}>
                <span>
                  <strong>{t.title}</strong>
                  <em>{STATUS_LABEL[t.status as TaskStatus]} · {PRIORITY_LABEL[t.priority]}</em>
                </span>
                <span className={isOverdue(t.due_date, t.status) ? 'iv-overdue' : 'iv-due'}>
                  {dueLabel(t.due_date, t.status)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Overdue (only renders when something is overdue; spans the full grid width)
// ---------------------------------------------------------------------------
export function OverdueTasksWidget({ onOpenTask }: { onOpenTask?: (id: string) => void }) {
  const { allTasks, loading } = useTasks();
  const overdue = allTasks.filter((t) => isOverdue(t.due_date, t.status));
  if (!loading && overdue.length === 0) return null;
  return (
    <Card className="iv-card--warn iv-dash__wide">
      <SectionHead title="Overdue" subtitle={`${overdue.length} past the due date`} />
      <ul className="iv-minilist">
        {overdue.slice(0, 5).map((t) => (
          <li key={t.id}>
            <button className="iv-minilist__row" onClick={() => onOpenTask?.(t.id)}>
              <span><strong>{t.title}</strong></span>
              <span className="iv-overdue">{dueLabel(t.due_date, t.status)}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Recent activity — today's check-ins / check-outs merged with task activity.
// Only real database rows are shown; nothing is invented.
// ---------------------------------------------------------------------------
interface FeedItem {
  id: string;
  icon: IvIconName;
  tone: 'green' | 'amber' | 'blue';
  who: string;
  text: string;
  when: string;
  ts: number;
}

export function RecentActivityWidget({ limit = 6 }: { limit?: number }) {
  const { supabase, userId } = useInnoVibe();
  const nameOf = useNameOf();
  const { rows: attendanceRows, loading: attLoading } = useTeamAttendance(todayISO());
  const [rows, setRows] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await tasksApi.recentActivity(supabase, limit));
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase, limit]);

  useEffect(() => { void load(); }, [load]);

  const channelId = useChannelId('iv-recent-activity');
  useRealtime(
    userId ? channelId : null,
    [{ table: 'task_activity', event: 'INSERT' }],
    (payload) => {
      const row = payload.new as TaskActivity;
      setRows((cur) => [row, ...cur.filter((r) => r.id !== row.id)].slice(0, limit));
    },
  );

  const items: FeedItem[] = [];

  for (const r of attendanceRows) {
    const who = r.full_name || nameOf(r.user_id);
    if (r.check_in) {
      items.push({
        id: `in-${r.user_id}`, icon: 'log-in', tone: 'green', who,
        text: 'checked in', when: formatClock(r.check_in), ts: toTimestamp(r.check_in),
      });
    }
    if (r.check_out) {
      items.push({
        id: `out-${r.user_id}`, icon: 'log-out', tone: 'amber', who,
        text: 'checked out', when: formatClock(r.check_out), ts: toTimestamp(r.check_out),
      });
    }
  }

  for (const a of rows) {
    items.push({
      id: `task-${a.id}`, icon: 'check-square', tone: 'blue',
      who: a.user_id ? nameOf(a.user_id) : 'Someone',
      text: ACTIVITY_TEXT[a.action] ?? a.action.replace(/_/g, ' '),
      when: relativeTime(a.created_at),
      ts: toTimestamp(a.created_at),
    });
  }

  const feed = items.sort((a, b) => b.ts - a.ts).slice(0, limit);

  return (
    <Card className="iv-dcard">
      <CardHead icon="activity" title="Recent activity" />
      {loading || attLoading ? <SkeletonRows rows={3} /> : error && feed.length === 0 ? (
        <ErrorState message={error} onRetry={() => { void load(); }} />
      ) : feed.length === 0 ? (
        <EmptyState title="Quiet so far" body="Check-ins and task updates show up here as they happen." />
      ) : (
        <ul className="iv-dfeed">
          {feed.map((f) => (
            <li key={f.id}>
              <span className={`iv-dfeed__icon iv-dfeed__icon--${f.tone}`}>
                <IvIcon name={f.icon} size={16} />
              </span>
              <span className="iv-dfeed__text"><strong>{f.who}</strong> {f.text}</span>
              <span className="iv-dfeed__time">{f.when}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quick actions — a button only renders when its handler is provided, so
// nothing on this card can point at a page that does not exist.
// ---------------------------------------------------------------------------
export function QuickActionsWidget({
  onNewTask, onOpenTasks, onOpenAttendance, onOpenNotifications, onOpenSettings,
}: {
  /** Opens the "New task" form. When given, it replaces the plain Tasks button. */
  onNewTask?: () => void;
  onOpenTasks?: () => void;
  onOpenAttendance?: () => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}) {
  return (
    <Card className="iv-dcard">
      <CardHead icon="zap" title="Quick actions" />
      <div className="iv-qagrid">
        {onNewTask ? (
          <button type="button" className="iv-qa iv-qa--green" onClick={onNewTask}>
            <IvIcon name="plus-circle" size={20} /><span>New Task</span>
          </button>
        ) : onOpenTasks && (
          <button type="button" className="iv-qa iv-qa--green" onClick={onOpenTasks}>
            <IvIcon name="check-square" size={20} /><span>Tasks</span>
          </button>
        )}
        {onOpenAttendance && (
          <button type="button" className="iv-qa iv-qa--blue" onClick={onOpenAttendance}>
            <IvIcon name="clock" size={20} /><span>Attendance</span>
          </button>
        )}
        {onOpenNotifications && (
          <button type="button" className="iv-qa iv-qa--purple" onClick={onOpenNotifications}>
            <IvIcon name="bell" size={20} /><span>Notifications</span>
          </button>
        )}
        {onOpenSettings && (
          <button type="button" className="iv-qa iv-qa--grey" onClick={onOpenSettings}>
            <IvIcon name="settings" size={20} /><span>Settings</span>
          </button>
        )}
      </div>
    </Card>
  );
}

/** Everything at once, laid out like the reference dashboard. */
export function OfficeDashboardSection({
  onOpenAttendance, onOpenTasks, onNewTask, onOpenTask, onOpenNotifications, onOpenSettings,
}: {
  onOpenAttendance?: () => void;
  onOpenTasks?: () => void;
  onNewTask?: () => void;
  onOpenTask?: (id: string) => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}) {
  return (
    <div className="iv-dash">
      <AttendanceSummaryWidget onOpen={onOpenAttendance} />
      <TaskSummaryWidget onOpen={onOpenTasks} />
      <EmployeeStatusWidget />
      <UpcomingDeadlinesWidget onOpen={onOpenTasks} onOpenTask={onOpenTask} />
      <RecentActivityWidget />
      <QuickActionsWidget
        onNewTask={onNewTask}
        onOpenTasks={onOpenTasks}
        onOpenAttendance={onOpenAttendance}
        onOpenNotifications={onOpenNotifications}
        onOpenSettings={onOpenSettings}
      />
      <OverdueTasksWidget onOpenTask={onOpenTask} />
    </div>
  );
}