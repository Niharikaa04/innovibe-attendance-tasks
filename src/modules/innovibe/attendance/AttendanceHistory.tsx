import { useMemo, useState } from 'react';
import {
  BarChart,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  SectionHead,
  SkeletonRows,
  StatTile,
} from '../ui/ui';
import { useAttendanceHistory } from './hooks';
import {
  currentMonthISO,
  formatClock,
  formatDay,
  formatDayShort,
  formatDuration,
  monthRange,
  todayISO,
} from '../lib/time';
import { ATTENDANCE_LABEL } from '../types';
import type { AttendanceStatus } from '../types';

const TONE: Record<string, string> = {
  working: 'working',
  checked_out: 'out',
  missing_checkout: 'late',
  not_checked_in: 'absent',
  absent: 'absent',
  on_leave: 'neutral',
};

type HistoryFilter = 'all' | 'present' | 'late';

export function AttendanceHistory({
  userId,
  personName,
}: {
  userId: string | null;
  personName?: string;
}) {
  const [month, setMonth] = useState(currentMonthISO());
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const { from, to } = useMemo(() => monthRange(month), [month]);

  const { rows, summary, loading, error, reload } =
    useAttendanceHistory(userId, from, to);

  /*
   * The database keeps an unfinished attendance row as "working".
   * For display purposes:
   * - today + no checkout = Working
   * - past date + no checkout = Missing checkout
   * - checkout exists = Checked out
   */
  const getDisplayStatus = (
    row: (typeof rows)[number],
  ): AttendanceStatus => {
    if (row.check_out) {
      return 'checked_out';
    }

    if (row.check_in && row.work_date < todayISO()) {
      return 'missing_checkout';
    }

    if (row.check_in) {
      return 'working';
    }

    return row.status;
  };

  const visibleRows = useMemo(() => {
    if (filter === 'present') {
      return rows.filter((r) => {
        const status = getDisplayStatus(r);
        return status === 'working' || status === 'checked_out';
      });
    }

    if (filter === 'late') {
      return rows.filter((r) => r.is_late);
    }

    return rows;
  }, [rows, filter]);

  const chart = useMemo(
    () =>
      [...rows]
        .reverse()
        .slice(-14)
        .map((r) => ({
          label: formatDayShort(r.work_date).split(' ')[0],
          value:
            Math.round((r.total_working_minutes / 60) * 10) / 10,
          tone: r.is_late ? 'late' : 'working',
        })),
    [rows],
  );

  return (
    <Card>
      <SectionHead
        title={
          personName
            ? `${personName}'s attendance`
            : 'Your attendance history'
        }
        subtitle={`${formatDay(from)} to ${formatDay(to)}`}
        actions={(
          <input
            className="iv-input iv-input--compact"
            type="month"
            value={month}
            max={currentMonthISO()}
            onChange={(e) => {
              setMonth(e.target.value);
              setFilter('all');
            }}
            aria-label="Choose month"
          />
        )}
      />

      {error && <ErrorState message={error} onRetry={reload} />}

      <div className="iv-statrow iv-statrow--4">
        <button
          type="button"
          className="iv-stattile-btn"
          aria-pressed={filter === 'present'}
          title="Show only days present"
          onClick={() =>
            setFilter((f) =>
              f === 'present' ? 'all' : 'present',
            )
          }
        >
          <StatTile
            label="Days present"
            value={summary.daysPresent}
          />
        </button>

        <button
          type="button"
          className="iv-stattile-btn"
          aria-pressed={filter === 'late'}
          title="Show only late arrivals"
          onClick={() =>
            setFilter((f) => (f === 'late' ? 'all' : 'late'))
          }
        >
          <StatTile
            label="Late arrivals"
            value={summary.daysLate}
            tone={summary.daysLate ? 'late' : 'neutral'}
          />
        </button>

        <StatTile
          label="Hours logged"
          value={formatDuration(summary.totalMinutes)}
        />

        <StatTile
          label="Daily average"
          value={formatDuration(summary.avgMinutes)}
        />
      </div>

      {chart.length > 1 && (
        <div className="iv-chartwrap">
          <p className="iv-chartwrap__cap">
            Hours per day, most recent {chart.length} records
          </p>
          <BarChart data={chart} suffix=" h" />
        </div>
      )}

      {loading ? (
        <SkeletonRows rows={5} />
      ) : visibleRows.length === 0 ? (
        <EmptyState
          title={
            rows.length === 0
              ? 'No attendance recorded this month'
              : filter === 'late'
                ? 'No late arrivals this month'
                : 'No matching records'
          }
          body={
            rows.length === 0
              ? 'Records appear here as soon as someone checks in.'
              : 'Clear the filter to see every record this month.'
          }
          action={
            filter !== 'all' ? (
              <Button
                size="sm"
                onClick={() => setFilter('all')}
              >
                Clear filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="iv-tablewrap">
          {filter !== 'all' && (
            <div className="iv-filters">
              <span className="iv-chartwrap__cap">
                Showing{' '}
                {filter === 'present'
                  ? 'days present'
                  : 'late arrivals'}{' '}
                only · {visibleRows.length} record(s)
              </span>

              <Button
                size="sm"
                onClick={() => setFilter('all')}
              >
                Clear filter
              </Button>
            </div>
          )}

          <table className="iv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((r) => {
                const displayStatus = getDisplayStatus(r);

                return (
                  <tr key={r.id}>
                    <td data-label="Date">
                      {formatDay(r.work_date)}
                    </td>

                    <td data-label="Check in">
                      {formatClock(r.check_in)}

                      {r.is_late && (
                        <span className="iv-flag">late</span>
                      )}
                    </td>

                    <td data-label="Check out">
                      {formatClock(r.check_out)}
                    </td>

                    <td
                      data-label="Hours"
                      className="iv-num"
                    >
                      {formatDuration(
                        r.total_working_minutes,
                      )}
                    </td>

                    <td data-label="Status">
                      <Badge
                        tone={TONE[displayStatus]}
                        dot
                      >
                        {ATTENDANCE_LABEL[displayStatus]}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}