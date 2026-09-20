import { useMemo, useState } from 'react';
import {
  Avatar, Badge, Button, Card, EmptyState, ErrorState, LiveDot, Meter,
  SectionHead, Search, SkeletonRows, StatTile,
} from '../ui/ui';
import { useTeamAttendance } from './hooks';
import { formatClock, formatDuration, todayISO } from '../lib/time';
import { ATTENDANCE_LABEL } from '../types';
import type { AttendanceStatus } from '../types';

const TONE: Record<string, string> = {
  working: 'working', checked_out: 'out', not_checked_in: 'absent',
  absent: 'absent', on_leave: 'neutral',
};

type StatusFilter = AttendanceStatus | 'all';

export function TeamAttendanceBoard({
  onSelectPerson,
}: { onSelectPerson?: (userId: string, name: string) => void }) {
  const [date, setDate] = useState(todayISO());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { rows, overview, loading, error, realtime, reload } = useTeamAttendance(date);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (q && !r.full_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, statusFilter]);

  const isToday = date === todayISO();

  return (
    <div className="iv-stack">
      <Card>
        <SectionHead
          title="Team attendance"
          subtitle={isToday ? 'Today, updating as people check in' : 'Selected day'}
          actions={(
            <div className="iv-toolbar">
              <LiveDot status={realtime} />
              <input
                className="iv-input iv-input--compact"
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Choose date"
              />
              {!isToday && <Button size="sm" onClick={() => setDate(todayISO())}>Today</Button>}
            </div>
          )}
        />

        {error && <ErrorState message={error} onRetry={reload} />}

        <div className="iv-statrow iv-statrow--5">
          <StatTile label="On the clock" value={overview?.working ?? 0} tone="working" />
          <StatTile label="Checked out" value={overview?.checked_out ?? 0} tone="out" />
          <StatTile label="Not in" value={overview?.absent ?? 0} tone="absent" />
          <StatTile label="Late arrivals" value={overview?.late_arrivals ?? 0} tone="late" />
          <StatTile label="Team size" value={overview?.total_employees ?? 0} />
        </div>

        <div className="iv-attendance-pct">
          <div>
            <span className="iv-attendance-pct__num">{overview?.attendance_percent ?? 0}%</span>
            <span className="iv-attendance-pct__lab">
              attendance · {overview?.present ?? 0} of {overview?.total_employees ?? 0} present
            </span>
          </div>
          <Meter percent={Number(overview?.attendance_percent ?? 0)} />
        </div>
      </Card>

      <Card>
        <div className="iv-filters">
          <Search value={query} onChange={setQuery} placeholder="Search a team member" />
          <div className="iv-segmented" role="group" aria-label="Filter by status">
            {(['all', 'working', 'checked_out', 'not_checked_in'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                className={`iv-segmented__btn ${statusFilter === s ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'Everyone' : ATTENDANCE_LABEL[s as AttendanceStatus]}
              </button>
            ))}
          </div>
        </div>

        {loading ? <SkeletonRows rows={5} /> : visible.length === 0 ? (
          <EmptyState
            title="Nobody matches this view"
            body="Clear the search or pick a different status."
            action={<Button size="sm" onClick={() => { setQuery(''); setStatusFilter('all'); }}>Reset filters</Button>}
          />
        ) : (
          <div className="iv-tablewrap">
            <table className="iv-table iv-table--people">
              <thead>
                <tr>
                  <th>Member</th><th>Status</th><th>Check in</th><th>Check out</th><th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr
                    key={r.user_id}
                    className={`iv-row iv-row--${TONE[r.status]} ${onSelectPerson ? 'is-clickable' : ''}`}
                    onClick={() => onSelectPerson?.(r.user_id, r.full_name)}
                    tabIndex={onSelectPerson ? 0 : -1}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSelectPerson?.(r.user_id, r.full_name); }}
                  >
                    <td data-label="Member">
                      <span className="iv-person">
                        <Avatar name={r.full_name} url={r.avatar_url} />
                        <span>
                          <strong>{r.full_name}</strong>
                          <em>{r.role}</em>
                        </span>
                      </span>
                    </td>
                    <td data-label="Status">
                      <Badge tone={TONE[r.status]} dot>{ATTENDANCE_LABEL[r.status]}</Badge>
                    </td>
                    <td data-label="Check in">
                      {formatClock(r.check_in)}
                      {r.is_late && <span className="iv-flag">late</span>}
                    </td>
                    <td data-label="Check out">{formatClock(r.check_out)}</td>
                    <td data-label="Hours" className="iv-num">{formatDuration(r.total_working_minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
