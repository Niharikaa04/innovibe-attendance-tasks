import { useMemo, useState } from 'react';
import {
  BarChart, Badge, Card, EmptyState, ErrorState, SectionHead, SkeletonRows, StatTile,
} from '../ui/ui';
import { useAttendanceHistory } from './hooks';
import {
  currentMonthISO, formatClock, formatDay, formatDayShort, formatDuration, monthRange,
} from '../lib/time';
import { ATTENDANCE_LABEL } from '../types';

const TONE: Record<string, string> = {
  working: 'working', checked_out: 'out', not_checked_in: 'absent',
  absent: 'absent', on_leave: 'neutral',
};

export function AttendanceHistory({
  userId, personName,
}: { userId: string | null; personName?: string }) {
  const [month, setMonth] = useState(currentMonthISO());
  const { from, to } = useMemo(() => monthRange(month), [month]);
  const { rows, summary, loading, error, reload } = useAttendanceHistory(userId, from, to);

  const chart = useMemo(
    () => [...rows].reverse().slice(-14).map((r) => ({
      label: formatDayShort(r.work_date).split(' ')[0],
      value: Math.round((r.total_working_minutes / 60) * 10) / 10,
      tone: r.is_late ? 'late' : 'working',
    })),
    [rows],
  );

  return (
    <Card>
      <SectionHead
        title={personName ? `${personName}'s attendance` : 'Your attendance history'}
        subtitle={`${formatDay(from)} to ${formatDay(to)}`}
        actions={(
          <input
            className="iv-input iv-input--compact"
            type="month"
            value={month}
            max={currentMonthISO()}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Choose month"
          />
        )}
      />

      {error && <ErrorState message={error} onRetry={reload} />}

      <div className="iv-statrow iv-statrow--4">
        <StatTile label="Days present" value={summary.daysPresent} />
        <StatTile label="Late arrivals" value={summary.daysLate} tone={summary.daysLate ? 'late' : 'neutral'} />
        <StatTile label="Hours logged" value={formatDuration(summary.totalMinutes)} />
        <StatTile label="Daily average" value={formatDuration(summary.avgMinutes)} />
      </div>

      {chart.length > 1 && (
        <div className="iv-chartwrap">
          <p className="iv-chartwrap__cap">Hours per day, most recent {chart.length} records</p>
          <BarChart data={chart} suffix=" h" />
        </div>
      )}

      {loading ? <SkeletonRows rows={5} /> : rows.length === 0 ? (
        <EmptyState
          title="No attendance recorded this month"
          body="Records appear here as soon as someone checks in."
        />
      ) : (
        <div className="iv-tablewrap">
          <table className="iv-table">
            <thead>
              <tr>
                <th>Date</th><th>Check in</th><th>Check out</th><th>Hours</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td data-label="Date">{formatDay(r.work_date)}</td>
                  <td data-label="Check in">
                    {formatClock(r.check_in)}
                    {r.is_late && <span className="iv-flag">late</span>}
                  </td>
                  <td data-label="Check out">{formatClock(r.check_out)}</td>
                  <td data-label="Hours" className="iv-num">{formatDuration(r.total_working_minutes)}</td>
                  <td data-label="Status">
                    <Badge tone={TONE[r.status]} dot>{ATTENDANCE_LABEL[r.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
