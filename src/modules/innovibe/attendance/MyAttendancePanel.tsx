import { useState } from 'react';
import { Badge, Button, Card, ConfirmDialog, ErrorState, LiveDot, SkeletonRows } from '../ui/ui';
import { useLiveClock, useMyAttendance, useWorkSettings } from './hooks';
import { formatClock, formatDuration, minutesSince } from '../lib/time';
import { useToast } from '../lib/toast';
import { useInnoVibe } from '../provider';
import { ATTENDANCE_LABEL } from '../types';

const TONE: Record<string, string> = {
  working: 'working', checked_out: 'out', not_checked_in: 'absent',
  absent: 'absent', on_leave: 'neutral',
};

export function MyAttendancePanel() {
  const { profile } = useInnoVibe();
  const { record, loading, busy, error, realtime, reload, checkIn, checkOut } = useMyAttendance();
  const settings = useWorkSettings();
  const toast = useToast();
  const [confirmOut, setConfirmOut] = useState(false);

  const isWorking = record?.status === 'working';
  const now = useLiveClock(isWorking);

  const liveMinutes = isWorking
    ? minutesSince(record?.check_in, now)
    : record?.total_working_minutes ?? 0;

  const status = record?.status ?? 'not_checked_in';

  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success('Checked in. Have a good day.');
    } catch { /* surfaced in `error` */ }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      setConfirmOut(false);
      toast.success('Checked out. Hours recorded.');
    } catch { setConfirmOut(false); }
  };

  if (loading) return <Card><SkeletonRows rows={3} /></Card>;

  return (
    <Card className="iv-today">
      <div className="iv-today__top">
        <div>
          <p className="iv-today__greeting">
            {greeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </p>
          <Badge tone={TONE[status]} dot>{ATTENDANCE_LABEL[status]}</Badge>
          {record?.is_late && <Badge tone="late">Late arrival</Badge>}
        </div>
        <LiveDot status={realtime} />
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}

      <div className="iv-today__timer">
        <span className="iv-today__figure">{formatDuration(liveMinutes)}</span>
        <span className="iv-today__figurelabel">
          {isWorking ? 'worked so far today' : status === 'checked_out' ? 'total hours today' : 'no hours yet today'}
        </span>
      </div>

      <dl className="iv-today__facts">
        <div>
          <dt>Check in</dt>
          <dd>{formatClock(record?.check_in)}</dd>
        </div>
        <div>
          <dt>Check out</dt>
          <dd>{formatClock(record?.check_out)}</dd>
        </div>
        <div>
          <dt>Office hours</dt>
          <dd>{settings ? `${settings.work_start.slice(0, 5)} – ${settings.work_end.slice(0, 5)}` : '—'}</dd>
        </div>
      </dl>

      <div className="iv-today__actions">
        {status === 'not_checked_in' && (
          <Button variant="primary" size="lg" loading={busy} onClick={handleCheckIn}>
            Check in
          </Button>
        )}
        {status === 'working' && (
          <Button variant="primary" size="lg" onClick={() => setConfirmOut(true)}>
            Check out
          </Button>
        )}
        {status === 'checked_out' && (
          <p className="iv-today__done">
            Day closed at {formatClock(record?.check_out)}. Tomorrow starts fresh.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmOut}
        title="Check out for the day?"
        message={`Your working time of ${formatDuration(liveMinutes)} will be recorded. You cannot check in again today.`}
        confirmLabel="Check out"
        tone="primary"
        busy={busy}
        onConfirm={handleCheckOut}
        onCancel={() => setConfirmOut(false)}
      />
    </Card>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
