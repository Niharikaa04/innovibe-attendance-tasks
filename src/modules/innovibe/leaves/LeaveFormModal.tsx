import { useState } from 'react';
import { Button, Field, Modal } from '../ui/ui';
import { readableError, useToast } from '../lib/toast';
import { todayISO } from '../lib/time';
import { LEAVE_TYPES, LEAVE_TYPE_LABEL } from '../types';
import type { LeaveApplyInput, LeaveType } from '../types';

export function LeaveFormModal({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: LeaveApplyInput) => Promise<unknown>;
}) {
  const toast = useToast();
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = halfDay ? 0.5 : Math.max(
    1,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1,
  );

  const submit = async () => {
    if (halfDay && endDate !== startDate) {
      setError('A half-day leave must be a single date.');
      return;
    }
    if (endDate < startDate) {
      setError('End date cannot be before the start date.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ leave_type: leaveType, start_date: startDate, end_date: endDate, reason: reason.trim() || null, half_day: halfDay });
      toast.success('Leave request submitted');
      setReason('');
      setHalfDay(false);
      onClose();
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Apply for leave"
      onClose={onClose}
      width={520}
      footer={(
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={busy} onClick={submit}>Submit request</Button>
        </>
      )}
    >
      {error && <div className="iv-error"><p>{error}</p></div>}

      <Field label="Leave type">
        <select className="iv-input" value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
          {LEAVE_TYPES.map((t) => <option key={t} value={t}>{LEAVE_TYPE_LABEL[t]}</option>)}
        </select>
      </Field>

      <div className="iv-formgrid">
        <Field label="Start date">
          <input className="iv-input" type="date" value={startDate}
                 onChange={(e) => { setStartDate(e.target.value); if (halfDay) setEndDate(e.target.value); }} />
        </Field>
        <Field label="End date">
          <input className="iv-input" type="date" value={endDate} min={startDate} disabled={halfDay}
                 onChange={(e) => setEndDate(e.target.value)} />
        </Field>
      </div>

      <label className="iv-check" style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0 8px' }}>
        <input
          type="checkbox"
          checked={halfDay}
          onChange={(e) => { setHalfDay(e.target.checked); if (e.target.checked) setEndDate(startDate); }}
        />
        <span>Half day</span>
      </label>

      <p className="iv-field__hint">
        {days} {days === 1 ? 'day' : 'days'} requested. Company holidays in the range are excluded automatically.
      </p>

      <Field label="Reason" hint="Optional, but helps your manager decide quickly.">
        <textarea
          className="iv-input iv-input--area"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Family function on the 14th."
        />
      </Field>
    </Modal>
  );
}