import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Avatar, Badge, EmptyState, LiveDot, SkeletonRows } from '../ui/ui';
import { useTeamAttendance, useMyAttendance } from '../attendance/hooks';
import { useTasks } from '../tasks/hooks';
import { useTeamLeaves } from '../leaves/hooks';
import { useInnoVibe, useNameOf } from '../provider';
import { useChannelId, useRealtime } from '../lib/realtime';
import { tasksApi } from '../tasks/api';
import { dueLabel, formatClock, isOverdue, relativeTime, todayISO } from '../lib/time';
import {
  ATTENDANCE_LABEL, PRIORITY_LABEL, STATUS_LABEL,
} from '../types';
import type { TaskActivity, TaskStatus } from '../types';
import './dashboard.css';

// ---------------------------------------------------------------------------
// These are intentionally small and self-contained. The Office Dashboard can
// place any of them anywhere without importing a page.
//
// Markup here uses the iv-d* classes from dashboard.css (spacious cards,
// dedicated tile/list/feed layouts) rather than the compact iv-kpi / iv-card
// / iv-statrow classes the rest of the app uses for the Attendance and Tasks
// pages, so this file is the only thing that needs dashboard.css.
// ---------------------------------------------------------------------------

const TONE: Record<string, string> = {
  working: 'working', checked_out: 'out', not_checked_in: 'absent',
  absent: 'absent', on_leave: 'neutral',
};

// ---------------------------------------------------------------------------
// KpiCard / DashboardKpiRow — the colored icon-badge stat cards from the
// reference dashboard (blue/green/cyan/orange rounded icon + big number).
// ---------------------------------------------------------------------------
export function KpiCard({
  icon, tone, value, label, trend, onClick,
}: {
  icon: string;
  tone: 'blue' | 'green' | 'cyan' | 'orange' | 'purple';
  value: ReactNode;
  label: string;
  trend?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className={`iv-dkpi__icon iv-dkpi__icon--${tone}`} aria-hidden="true">{icon}</span>
      <div className="iv-dkpi__body">
        <div className="iv-dkpi__value">{value}</div>
        <div className="iv-dkpi__label">{label}</div>
        {trend && <span className="iv-dkpi__trend">{trend}</span>}
      </div>
    </>
  );
  if (!onClick) return <div className="iv-dkpi">{body}</div>;
  return (
    <button type="button" className="iv-dkpi-btn" onClick={onClick} title={`Open ${label.toLowerCase()}`}>
      <div className="iv-dkpi">{body}</div>
    </button>
  );
}

/** The KPI row for the top of the dashboard — different cards for employees vs managers. */
export function DashboardKpiRow({
  onOpenAttendance, onOpenTasks,
}: {
  /** filter hint passed straight through to the target page's own filter, when the caller supports it */
  onOpenAttendance?: (filter?: 'all' | 'present' | 'absent') => void;
  onOpenTasks?: (filter?: 'pending' | 'completed' | 'all') => void;
} = {}) {
  const { isManager } = useInnoVibe();
  const { overview, loading: attLoading } = useTeamAttendance(todayISO());
  const { record: myRecord, loading: myAttLoading } = useMyAttendance();
  const { counts, myCounts, loading: taskLoading } = useTasks();

  const loading = isManager
    ? (attLoading || taskLoading)
    : (myAttLoading || taskLoading);

  if (loading) {
    return (
      <div className="iv-dkpirow">
        {[0, 1, 2, 3].map((i) => <div key={i} className="iv-dkpi"><SkeletonRows rows={2} /></div>)}
      </div>
    );
  }

  if (isManager) {
    return (
      <div className="iv-dkpirow iv-dkpirow--5">
        <KpiCard icon="👥" tone="blue" value={overview?.total_employees ?? 0} label="Total employees"
          onClick={onOpenAttendance ? () => onOpenAttendance('all') : undefined} />
        <KpiCard icon="🟢" tone="green" value={overview?.present ?? 0} label="Present today"
          onClick={onOpenAttendance ? () => onOpenAttendance('present') : undefined} />
        <KpiCard icon="🔴" tone="orange" value={overview?.absent ?? 0} label="Absent today"
          onClick={onOpenAttendance ? () => onOpenAttendance('absent') : undefined} />
        <KpiCard icon="⏳" tone="cyan" value={counts.todo + counts.in_progress + counts.blocked} label="Pending tasks"
          onClick={onOpenTasks ? () => onOpenTasks('pending') : undefined} />
        <KpiCard icon="✅" tone="purple" value={counts.completed} label="Completed tasks"
          onClick={onOpenTasks ? () => onOpenTasks('completed') : undefined} />
      </div>
    );
  }

  const myStatus = myRecord?.status ?? 'not_checked_in';
  const pending = myCounts.todo + myCounts.in_progress + myCounts.blocked;

  return (
    <div className="iv-dkpirow">
      <KpiCard
        icon={myStatus === 'working' ? '🟢' : myStatus === 'checked_out' ? '🟡' : '🔴'}
        tone="green"
        value={ATTENDANCE_LABEL[myStatus]}
        label="Today's attendance"
        onClick={onOpenAttendance ? () => onOpenAttendance() : undefined}
      />
      <KpiCard icon="🕘" tone="blue" value={formatClock(myRecord?.check_in)} label="Check-in time"
        onClick={onOpenAttendance ? () => onOpenAttendance() : undefined} />
      <KpiCard icon="🕕" tone="cyan" value={formatClock(myRecord?.check_out)} label="Check-out time"
        onClick={onOpenAttendance ? () => onOpenAttendance() : undefined} />
      <KpiCard icon="📋" tone="orange" value={pending} label="My pending tasks"
        onClick={onOpenTasks ? () => onOpenTasks('pending') : undefined} />
    </div>
  );
}


export function AttendanceSummaryWidget({
  onOpen,
}: { onOpen?: (filter?: 'working' | 'checked_out' | 'absent') => void }) {
  const { overview, loading, realtime } = useTeamAttendance(todayISO());
  return (
    <div className="iv-dcard">
      <div className="iv-dhead">
        <h3 className="iv-dhead__title">Attendance today</h3>
        <LiveDot status={realtime} />
      </div>
      {loading ? <SkeletonRows rows={2} /> : (
        <div className="iv-dtiles iv-dtiles--3">
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to working" onClick={() => onOpen?.('working')}>
            <div className="iv-dtile iv-dtile--green">
              <span className="iv-dtile__value">{overview?.working ?? 0}</span>
              <span className="iv-dtile__label">Working</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to checked out" onClick={() => onOpen?.('checked_out')}>
            <div className="iv-dtile iv-dtile--amber">
              <span className="iv-dtile__value">{overview?.checked_out ?? 0}</span>
              <span className="iv-dtile__label">Checked out</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to not in" onClick={() => onOpen?.('absent')}>
            <div className="iv-dtile iv-dtile--grey">
              <span className="iv-dtile__value">{overview?.absent ?? 0}</span>
              <span className="iv-dtile__label">Not in</span>
            </div>
          </button>
        </div>
      )}
      {onOpen && (
        <button className="iv-btn iv-dbtn" onClick={() => onOpen()}>Open attendance</button>
      )}
    </div>
  );
}

export function EmployeeStatusWidget({
  max = 6, onSelectPerson,
}: { max?: number; onSelectPerson?: (userId: string, name: string) => void }) {
  const { rows, loading, realtime } = useTeamAttendance(todayISO());
  return (
    <div className="iv-dcard">
      <div className="iv-dhead">
        <h3 className="iv-dhead__title">Who is in</h3>
        <LiveDot status={realtime} />
      </div>
      {loading ? <SkeletonRows rows={4} /> : (
        <ul className="iv-dpeople">
          {rows.slice(0, max).map((r) => (
            <li
              key={r.user_id}
              className={onSelectPerson ? 'is-clickable' : ''}
              onClick={() => onSelectPerson?.(r.user_id, r.full_name)}
              tabIndex={onSelectPerson ? 0 : -1}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelectPerson?.(r.user_id, r.full_name); }}
            >
              <span className="iv-dpeople__name">
                <Avatar name={r.full_name} url={r.avatar_url} size={28} />
                <strong>{r.full_name}</strong>
              </span>
              <span className="iv-dpeople__right">
                <Badge tone={TONE[r.status]} dot>{ATTENDANCE_LABEL[r.status]}</Badge>
                <em className="iv-dpeople__time">{formatClock(r.check_in)}</em>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TaskSummaryWidget({
  onOpen,
  onNewTask,
}: {
  onOpen?: (filter?: TaskStatus | 'all') => void;
  onNewTask?: () => void;
}) {
  const { counts, myCounts, loading, realtime } = useTasks();
  const { isManager } = useInnoVibe();
  const c = isManager ? counts : myCounts;
  return (
    <div className="iv-dcard">
      <div className="iv-dhead">
        <h3 className="iv-dhead__title">{isManager ? 'Tasks across the team' : 'My tasks'}</h3>
        <LiveDot status={realtime} />
      </div>
      {loading ? <SkeletonRows rows={2} /> : (
        <div className="iv-dtiles iv-dtiles--auto">
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Show all tasks" onClick={() => onOpen?.('all')}>
            <div className="iv-dtile iv-dtile--blue">
              <span className="iv-dtile__value">{c.total}</span>
              <span className="iv-dtile__label">Total</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to To do" onClick={() => onOpen?.('todo')}>
            <div className="iv-dtile iv-dtile--grey">
              <span className="iv-dtile__value">{c.todo}</span>
              <span className="iv-dtile__label">To do</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to In progress" onClick={() => onOpen?.('in_progress')}>
            <div className="iv-dtile iv-dtile--cyan">
              <span className="iv-dtile__value">{c.in_progress}</span>
              <span className="iv-dtile__label">In progress</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to Blocked" onClick={() => onOpen?.('blocked')}>
            <div className="iv-dtile iv-dtile--red">
              <span className="iv-dtile__value">{c.blocked}</span>
              <span className="iv-dtile__label">Blocked</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to Completed" onClick={() => onOpen?.('completed')}>
            <div className="iv-dtile iv-dtile--green">
              <span className="iv-dtile__value">{c.completed}</span>
              <span className="iv-dtile__label">Completed</span>
            </div>
          </button>
        </div>
      )}
      {/* Two distinct buttons with real spacing — this is the fix for the
          "Open tasksNew task" run-together bug (iv-widget-actions was never
          defined in CSS, so the buttons had no gap at all). */}
      {(onOpen || onNewTask) && (
        <div className="iv-dactions">
          {onOpen && (
            <button className="iv-btn iv-btn--sm" onClick={() => onOpen()}>
              Open tasks
            </button>
          )}
          {onNewTask && (
            <button className="iv-btn iv-btn--sm iv-btn--primary" onClick={onNewTask}>
              New task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PendingTasksWidget({
  max = 5, onOpenTask,
}: { max?: number; onOpenTask?: (id: string) => void }) {
  const { tasks, loading } = useTasks({ status: 'all' });
  const pending = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => (a.due_date ?? '9999') < (b.due_date ?? '9999') ? -1 : 1)
    .slice(0, max);

  return (
    <div className="iv-dcard">
      <div className="iv-dhead">
        <div>
          <h3 className="iv-dhead__title">Next up</h3>
          <p className="iv-dhead__sub">Soonest due dates first</p>
        </div>
      </div>
      {loading ? <SkeletonRows rows={3} /> : pending.length === 0 ? (
        <EmptyState title="Nothing pending" body="Every open task is done." />
      ) : (
        <ul className="iv-dlist">
          {pending.map((t) => (
            <li key={t.id}>
              <button className="iv-dlist__row" onClick={() => onOpenTask?.(t.id)}>
                <span className="iv-dlist__main">
                  <strong>{t.title}</strong>
                  <em>{STATUS_LABEL[t.status as TaskStatus]} · {PRIORITY_LABEL[t.priority]}</em>
                </span>
                <span className={`iv-dlist__date ${isOverdue(t.due_date, t.status) ? 'is-overdue' : ''}`}>
                  {dueLabel(t.due_date, t.status)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OverdueTasksWidget({ onOpenTask }: { onOpenTask?: (id: string) => void }) {
  const { allTasks, loading } = useTasks();
  const overdue = allTasks.filter((t) => isOverdue(t.due_date, t.status));
  if (!loading && overdue.length === 0) return null;
  return (
    <div className="iv-dcard iv-dcard--warn">
      <div className="iv-dhead">
        <div>
          <h3 className="iv-dhead__title">Overdue</h3>
          <p className="iv-dhead__sub">{overdue.length} past the due date</p>
        </div>
      </div>
      <ul className="iv-dlist">
        {overdue.slice(0, 5).map((t) => (
          <li key={t.id}>
            <button className="iv-dlist__row" onClick={() => onOpenTask?.(t.id)}>
              <span className="iv-dlist__main"><strong>{t.title}</strong></span>
              <span className="iv-dlist__date is-overdue">{dueLabel(t.due_date, t.status)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecentActivityWidget({ limit = 8 }: { limit?: number }) {
  const { supabase, userId } = useInnoVibe();
  const nameOf = useNameOf();
  const [rows, setRows] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setRows(await tasksApi.recentActivity(supabase, limit));
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

  return (
    <div className="iv-dcard">
      <div className="iv-dhead">
        <h3 className="iv-dhead__title">Recent activity</h3>
      </div>
      {loading ? <SkeletonRows rows={3} /> : rows.length === 0 ? (
        <EmptyState title="Quiet so far" body="Task updates show up here as they happen." />
      ) : (
        <ul className="iv-dfeed">
          {rows.map((a) => (
            <li key={a.id}>
              <span className="iv-dfeed__icon iv-dfeed__icon--blue" aria-hidden="true" />
              <span className="iv-dfeed__text">
                <strong>{nameOf(a.user_id)}</strong> {a.action.replace(/_/g, ' ')}
              </span>
              <span className="iv-dfeed__time">{relativeTime(a.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PendingLeavesWidget({
  onOpen,
}: { onOpen?: (filter?: 'pending' | 'cancellations' | 'on_leave') => void }) {
  const { isManager } = useInnoVibe();
  const { overview, loading } = useTeamLeaves();
  if (!isManager) return null;
  return (
    <div className="iv-dcard">
      <div className="iv-dhead">
        <h3 className="iv-dhead__title">Leave requests</h3>
      </div>
      {loading ? <SkeletonRows rows={2} /> : (
        <div className="iv-dtiles iv-dtiles--auto">
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to pending" onClick={() => onOpen?.('pending')}>
            <div className={`iv-dtile ${overview && overview.pending_count > 0 ? 'iv-dtile--amber' : 'iv-dtile--grey'}`}>
              <span className="iv-dtile__value">{overview?.pending_count ?? 0}</span>
              <span className="iv-dtile__label">Pending</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Filter to cancellation requests" onClick={() => onOpen?.('cancellations')}>
            <div className={`iv-dtile ${overview && overview.cancellation_requested_count > 0 ? 'iv-dtile--amber' : 'iv-dtile--grey'}`}>
              <span className="iv-dtile__value">{overview?.cancellation_requested_count ?? 0}</span>
              <span className="iv-dtile__label">Cancellations</span>
            </div>
          </button>
          <button type="button" className="iv-dtile-btn" disabled={!onOpen}
            title="Show who's on leave today" onClick={() => onOpen?.('on_leave')}>
            <div className="iv-dtile iv-dtile--green">
              <span className="iv-dtile__value">{overview?.on_leave_today ?? 0}</span>
              <span className="iv-dtile__label">On leave today</span>
            </div>
          </button>
        </div>
      )}
      {onOpen && <button className="iv-btn iv-dbtn" onClick={() => onOpen()}>Open leaves</button>}
    </div>
  );
}

/** Everything at once, for a quick dashboard section. */
export function OfficeDashboardSection({
  onOpenAttendance,
  onOpenTasks,
  onNewTask,
  onReviewLeaves,
  onOpenTask,
  onOpenLeaves,
  onSelectPerson,
}: {
  onOpenAttendance?: (filter?: 'all' | 'working' | 'checked_out' | 'absent') => void;
  onOpenTasks?: (filter?: TaskStatus | 'all') => void;
  onNewTask?: () => void;
  onReviewLeaves?: (filter?: 'pending' | 'cancellations' | 'on_leave') => void;
  onOpenTask?: (id: string) => void;
  onOpenLeaves?: (filter?: 'pending' | 'cancellations' | 'on_leave') => void;
  onSelectPerson?: (userId: string, name: string) => void;
}) {
  const { isManager } = useInnoVibe();
  return (
    <div className="iv-dash">
      <AttendanceSummaryWidget onOpen={onOpenAttendance} />
      <TaskSummaryWidget onOpen={onOpenTasks} onNewTask={onNewTask} />
      <EmployeeStatusWidget onSelectPerson={onSelectPerson} />
      <PendingTasksWidget onOpenTask={onOpenTask} />
      <OverdueTasksWidget onOpenTask={onOpenTask} />
      {isManager && (
        <PendingLeavesWidget onOpen={onReviewLeaves ?? onOpenLeaves} />
      )}
      <RecentActivityWidget />
    </div>
  );
}