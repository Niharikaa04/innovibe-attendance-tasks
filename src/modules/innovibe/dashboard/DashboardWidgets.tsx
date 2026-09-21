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
  icon, tone, value, label, trend,
}: {
  icon: string;
  tone: 'blue' | 'green' | 'cyan' | 'orange' | 'purple';
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
        <KpiCard icon="👥" tone="blue" value={overview?.total_employees ?? 0} label="Total employees" />
        <KpiCard icon="🟢" tone="green" value={overview?.present ?? 0} label="Present today" />
        <KpiCard icon="🔴" tone="orange" value={overview?.absent ?? 0} label="Absent today" />
        <KpiCard icon="⏳" tone="cyan" value={counts.todo + counts.in_progress + counts.blocked} label="Pending tasks" />
        <KpiCard icon="✅" tone="purple" value={counts.completed} label="Completed tasks" />
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
      />
      <KpiCard icon="🕘" tone="blue" value={formatClock(myRecord?.check_in)} label="Check-in time" />
      <KpiCard icon="🕕" tone="cyan" value={formatClock(myRecord?.check_out)} label="Check-out time" />
      <KpiCard icon="📋" tone="orange" value={pending} label="My pending tasks" />
    </div>
  );
}


export function AttendanceSummaryWidget({ onOpen }: { onOpen?: () => void }) {
  const { overview, loading, realtime } = useTeamAttendance(todayISO());
  return (
    <div className="iv-dcard">
      <div className="iv-dhead">
        <h3 className="iv-dhead__title">Attendance today</h3>
        <LiveDot status={realtime} />
      </div>
      {loading ? <SkeletonRows rows={2} /> : (
        <div className="iv-dtiles iv-dtiles--3">
          <div className="iv-dtile iv-dtile--green">
            <span className="iv-dtile__value">{overview?.working ?? 0}</span>
            <span className="iv-dtile__label">Working</span>
          </div>
          <div className="iv-dtile iv-dtile--amber">
            <span className="iv-dtile__value">{overview?.checked_out ?? 0}</span>
            <span className="iv-dtile__label">Checked out</span>
          </div>
          <div className="iv-dtile iv-dtile--grey">
            <span className="iv-dtile__value">{overview?.absent ?? 0}</span>
            <span className="iv-dtile__label">Not in</span>
          </div>
        </div>
      )}
      {onOpen && (
        <button className="iv-btn iv-dbtn" onClick={onOpen}>Open attendance</button>
      )}
    </div>
  );
}

export function EmployeeStatusWidget({ max = 6 }: { max?: number }) {
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
            <li key={r.user_id}>
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
  onOpen?: () => void;
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
          <div className="iv-dtile iv-dtile--blue">
            <span className="iv-dtile__value">{c.total}</span>
            <span className="iv-dtile__label">Total</span>
          </div>
          <div className="iv-dtile iv-dtile--grey">
            <span className="iv-dtile__value">{c.todo}</span>
            <span className="iv-dtile__label">To do</span>
          </div>
          <div className="iv-dtile iv-dtile--cyan">
            <span className="iv-dtile__value">{c.in_progress}</span>
            <span className="iv-dtile__label">In progress</span>
          </div>
          <div className="iv-dtile iv-dtile--red">
            <span className="iv-dtile__value">{c.blocked}</span>
            <span className="iv-dtile__label">Blocked</span>
          </div>
          <div className="iv-dtile iv-dtile--green">
            <span className="iv-dtile__value">{c.completed}</span>
            <span className="iv-dtile__label">Completed</span>
          </div>
        </div>
      )}
      {/* Two distinct buttons with real spacing — this is the fix for the
          "Open tasksNew task" run-together bug (iv-widget-actions was never
          defined in CSS, so the buttons had no gap at all). */}
      {(onOpen || onNewTask) && (
        <div className="iv-dactions">
          {onOpen && (
            <button className="iv-btn iv-btn--sm" onClick={onOpen}>
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

export function PendingLeavesWidget({ onOpen }: { onOpen?: () => void }) {
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
          <div className={`iv-dtile ${overview && overview.pending_count > 0 ? 'iv-dtile--amber' : 'iv-dtile--grey'}`}>
            <span className="iv-dtile__value">{overview?.pending_count ?? 0}</span>
            <span className="iv-dtile__label">Pending</span>
          </div>
          <div className={`iv-dtile ${overview && overview.cancellation_requested_count > 0 ? 'iv-dtile--amber' : 'iv-dtile--grey'}`}>
            <span className="iv-dtile__value">{overview?.cancellation_requested_count ?? 0}</span>
            <span className="iv-dtile__label">Cancellations</span>
          </div>
          <div className="iv-dtile iv-dtile--green">
            <span className="iv-dtile__value">{overview?.on_leave_today ?? 0}</span>
            <span className="iv-dtile__label">On leave today</span>
          </div>
        </div>
      )}
      {onOpen && <button className="iv-btn iv-dbtn" onClick={onOpen}>Open leaves</button>}
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
}: {
  onOpenAttendance?: () => void;
  onOpenTasks?: () => void;
  onNewTask?: () => void;
  onReviewLeaves?: () => void;
  onOpenTask?: (id: string) => void;
  onOpenLeaves?: () => void;
}) {
  const { isManager } = useInnoVibe();
  return (
    <div className="iv-dash">
      <AttendanceSummaryWidget onOpen={onOpenAttendance} />
      <TaskSummaryWidget onOpen={onOpenTasks} onNewTask={onNewTask} />
      <EmployeeStatusWidget />
      <PendingTasksWidget onOpenTask={onOpenTask} />
      <OverdueTasksWidget onOpenTask={onOpenTask} />
      {isManager && (
        <PendingLeavesWidget onOpen={onReviewLeaves ?? onOpenLeaves} />
      )}
      <RecentActivityWidget />
    </div>
  );
}