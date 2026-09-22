import { Badge, Modal } from '../ui/ui';
import { LEAVE_STATUS_LABEL, LEAVE_TYPE_LABEL } from '../types';
import type { LeaveRequest } from '../types';
import { formatDay } from '../lib/time';

const STATUS_TONE: Record<string, string> = {
  pending: 'late', approved: 'working', rejected: 'absent',
  cancellation_requested: 'out', cancelled: 'neutral',
};

// Whole numbers stay whole ("7"), half-days show one decimal ("6.5").
const fmt = (n: number | null | undefined) => {
  const v = Number(n ?? 0);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

/**
 * Read-only "View details" dialog for one leave request — the full record,
 * including who reviewed it and when, and the cancellation trail if there is
 * one. Reused by the employee's own table and every manager table so the
 * same information is always presented the same way.
 */
export function LeaveDetailsModal({
  leave, onClose, nameOf, employeeName,
}: {
  leave: LeaveRequest | null;
  onClose: () => void;
  nameOf: (id?: string | null) => string;
  /** Shown in the team view, where the viewer is not the employee. Omit on My Leaves. */
  employeeName?: string;
}) {
  return (
    <Modal open={!!leave} title="Leave request details" onClose={onClose} width={520}>
      {leave && (
        <>
          <div className="iv-taskdetail__badges">
            <Badge tone={STATUS_TONE[leave.status]} dot>{LEAVE_STATUS_LABEL[leave.status]}</Badge>
            {leave.is_half_day && <Badge>Half day</Badge>}
          </div>
          <h3 className="iv-taskdetail__title">{LEAVE_TYPE_LABEL[leave.leave_type]}</h3>
          {leave.reason && <p className="iv-taskdetail__desc">{leave.reason}</p>}

          <dl className="iv-taskdetail__meta">
            {employeeName && (<><dt>Employee</dt><dd>{employeeName}</dd></>)}
            <dt>Start date</dt><dd>{formatDay(leave.start_date)}</dd>
            <dt>End date</dt><dd>{formatDay(leave.end_date)}</dd>
            <dt>Days</dt><dd>{fmt(leave.days)}</dd>
            <dt>Submitted</dt><dd>{formatDay(leave.created_at)}</dd>

            {leave.reviewed_by && (
              <>
                <dt>{leave.status === 'rejected' ? 'Rejected by' : 'Reviewed by'}</dt>
                <dd>{nameOf(leave.reviewed_by)}{leave.reviewed_at ? `, ${formatDay(leave.reviewed_at)}` : ''}</dd>
              </>
            )}
            {leave.review_note && (<><dt>Reviewer note</dt><dd>{leave.review_note}</dd></>)}

            {leave.cancel_requested_by && (
              <>
                <dt>Cancellation requested</dt>
                <dd>By {nameOf(leave.cancel_requested_by)}{leave.cancel_requested_at ? `, ${formatDay(leave.cancel_requested_at)}` : ''}</dd>
              </>
            )}
            {leave.cancel_reviewed_by && (
              <>
                <dt>Cancellation reviewed</dt>
                <dd>By {nameOf(leave.cancel_reviewed_by)}{leave.cancel_reviewed_at ? `, ${formatDay(leave.cancel_reviewed_at)}` : ''}</dd>
              </>
            )}
            {leave.cancel_review_note && (<><dt>Cancellation note</dt><dd>{leave.cancel_review_note}</dd></>)}
          </dl>
        </>
      )}
    </Modal>
  );
}
