import { useRef, useState } from 'react';
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, LiveDot,
  Modal, SectionHead, SkeletonRows, StatTile,
} from '../ui/ui';
import { useInnoVibe, useNameOf } from '../provider';
import { useMyLeaves, useTeamLeaves, useLeaveBalance } from './hooks';
import { LeaveFormModal } from './LeaveFormModal';
import { LeaveDetailsModal } from './LeaveDetailsModal';
import { readableError, useToast } from '../lib/toast';
import { formatDay, todayISO } from '../lib/time';
import { LEAVE_STATUS_LABEL, LEAVE_TYPE_LABEL } from '../types';
import type { LeaveBalanceRow, LeaveRequest } from '../types';

const STATUS_TONE: Record<string, string> = {
  pending: 'late', approved: 'working', rejected: 'absent',
  cancellation_requested: 'out', cancelled: 'neutral',
};

// Whole numbers stay whole ("7"), half-days show one decimal ("6.5").
const fmt = (n: number | null | undefined) => {
  const v = Number(n ?? 0);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

// Low-balance warning: 20% of what the person can use this year, minimum 1 day.
const isLow = (b: LeaveBalanceRow) => {
  const total = Number(b.accrued_days) + Number(b.carried_forward);
  return total > 0 && b.remaining > 0 && b.remaining <= Math.max(1, total * 0.2);
};

// Mirrors iv_cancel_leave on the server (which is the real gate):
//   pending                                -> withdrawn straight away
//   approved, end date not yet passed      -> cancellation is *requested*; a
//                                             manager approves or rejects it
//   approved and already finished, or any
//   other status                           -> no action
function cancellability(l: LeaveRequest): 'withdraw' | 'request-cancellation' | null {
  if (l.status === 'pending') return 'withdraw';
  if (l.status === 'approved' && l.end_date >= todayISO()) return 'request-cancellation';
  return null;
}

// What to show in the Note column for the employee.
function noteFor(l: LeaveRequest): string {
  if (l.status === 'approved' && l.cancel_review_note) return `Cancellation declined: ${l.cancel_review_note}`;
  if (l.status === 'cancellation_requested') return 'Waiting for a manager to review your cancellation request.';
  return l.review_note ?? l.cancel_review_note ?? '—';
}

export function LeavesPage({
  initialTab = 'me',
}: { initialTab?: 'me' | 'team' } = {}) {
  const { isManager } = useInnoVibe();
  const [tab, setTab] = useState<'me' | 'team'>(initialTab);

  return (
    <div className="iv-page">
      <div className="iv-page__head">
        <div>
          <h1 className="iv-page__title">Leaves</h1>
          <p className="iv-page__sub">Apply for leave and keep track of the balance.</p>
        </div>
        {isManager && (
          <div className="iv-tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'me'}
              className={`iv-tabs__btn ${tab === 'me' ? 'is-active' : ''}`}
              onClick={() => setTab('me')}>My Leaves</button>
            <button role="tab" aria-selected={tab === 'team'}
              className={`iv-tabs__btn ${tab === 'team' ? 'is-active' : ''}`}
              onClick={() => setTab('team')}>Team Leaves</button>
          </div>
        )}
      </div>

      {tab === 'me' ? <MyLeavesPanel /> : <TeamLeavesPanel />}
    </div>
  );
}

// ---------------------------------------------------------------------------
function MyLeavesPanel() {
  const { userId } = useInnoVibe();
  const nameOf = useNameOf();
  const { leaves, counts, loading, busy, error, realtime, reload, apply, cancel } = useMyLeaves();
  const { rows: balance, loading: balanceLoading } = useLeaveBalance(userId);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<LeaveRequest | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<LeaveRequest | null>(null);
  const [typeFilter, setTypeFilter] = useState<LeaveRequest['leave_type'] | null>(null);
  const toast = useToast();

  const confirmMode = confirmTarget ? cancellability(confirmTarget) : null;
  const visibleLeaves = typeFilter ? leaves.filter((l) => l.leave_type === typeFilter) : leaves;

  return (
    <div className="iv-stack">
      <Card>
        <SectionHead
          title="Leave balance"
          subtitle="This calendar year"
          actions={(
            <>
              <LiveDot status={realtime} />
              <Button variant="primary" onClick={() => setFormOpen(true)}>Apply for leave</Button>
            </>
          )}
        />
        {balanceLoading ? <SkeletonRows rows={2} /> : (
          <div className="iv-statrow iv-statrow--4">
            {balance.map((b) => (
              <button
                key={b.leave_type}
                type="button"
                className="iv-stattile-btn"
                aria-pressed={typeFilter === b.leave_type}
                title={`Filter your requests to ${LEAVE_TYPE_LABEL[b.leave_type]}`}
                onClick={() => setTypeFilter((prev) => (prev === b.leave_type ? null : b.leave_type))}
              >
                <StatTile
                  label={LEAVE_TYPE_LABEL[b.leave_type]}
                  value={`${fmt(b.remaining)} available`}
                  hint={[
                    `Allocated ${fmt(b.accrued_days)}`,
                    `Used ${fmt(b.used_days)}`,
                    `Pending ${fmt(b.pending_days)}`,
                    `Carried forward ${fmt(b.carried_forward)}`,
                    isLow(b) ? 'Low balance' : null,
                  ].filter(Boolean).join(' · ')}
                  tone={b.remaining <= 0 ? 'late' : isLow(b) ? 'late' : 'neutral'}
                />
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionHead
          title="Your requests"
          subtitle={
            typeFilter
              ? `Showing ${LEAVE_TYPE_LABEL[typeFilter].toLowerCase()} only · ${visibleLeaves.length} request(s)`
              : `${counts.pending} awaiting a decision · ${counts.approved} approved · ${counts.rejected} rejected`
          }
          actions={typeFilter && (
            <Button size="sm" onClick={() => setTypeFilter(null)}>Clear filter</Button>
          )}
        />
        {error && <ErrorState message={error} onRetry={reload} />}
        {loading ? <SkeletonRows rows={4} /> : visibleLeaves.length === 0 ? (
          <EmptyState
            title={typeFilter ? `No ${LEAVE_TYPE_LABEL[typeFilter].toLowerCase()} requests` : 'No leave requests yet'}
            body={
              typeFilter
                ? 'Nothing of this type yet. Clear the filter to see all your requests.'
                : 'Apply for leave and it will show up here, with live status updates.'
            }
            action={
              typeFilter
                ? <Button size="sm" onClick={() => setTypeFilter(null)}>Clear filter</Button>
                : <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>Apply for leave</Button>
            }
          />
        ) : (
          <div className="iv-tablewrap">
            <table className="iv-table">
              <thead>
                <tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Submitted</th><th>Note</th><th /></tr>
              </thead>
              <tbody>
                {visibleLeaves.map((l) => {
                  const mode = cancellability(l);
                  return (
                    <tr key={l.id}>
                      <td data-label="Type">{LEAVE_TYPE_LABEL[l.leave_type]}</td>
                      <td data-label="Dates">{formatDay(l.start_date)} – {formatDay(l.end_date)}</td>
                      <td data-label="Days" className="iv-num">{fmt(l.days)}{l.is_half_day ? ' (half day)' : ''}</td>
                      <td data-label="Status"><Badge tone={STATUS_TONE[l.status]} dot>{LEAVE_STATUS_LABEL[l.status]}</Badge></td>
                      <td data-label="Submitted">{formatDay(l.created_at)}</td>
                      <td data-label="Note">{noteFor(l)}</td>
                      <td data-label="">
                        <div className="iv-toolbar">
                          <Button size="sm" onClick={() => setDetailsTarget(l)}>Details</Button>
                          {mode === 'withdraw' && (
                            <Button size="sm" variant="danger" onClick={() => setConfirmTarget(l)}>Withdraw</Button>
                          )}
                          {mode === 'request-cancellation' && (
                            <Button size="sm" variant="danger" onClick={() => setConfirmTarget(l)}>Request cancellation</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <LeaveFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={apply} />

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmMode === 'request-cancellation' ? 'Request cancellation?' : 'Withdraw this request?'}
        message={confirmTarget ? (
          confirmMode === 'request-cancellation'
            ? `Your approved ${LEAVE_TYPE_LABEL[confirmTarget.leave_type].toLowerCase()} for ${fmt(confirmTarget.days)} day(s) will be sent to a manager for approval. The leave stays booked, and the days stay deducted, until they approve.`
            : `Your ${LEAVE_TYPE_LABEL[confirmTarget.leave_type].toLowerCase()} request for ${fmt(confirmTarget.days)} day(s) will be withdrawn.`
        ) : ''}
        confirmLabel={confirmMode === 'request-cancellation' ? 'Request cancellation' : 'Withdraw request'}
        busy={busy}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={async () => {
          if (!confirmTarget) return;
          try {
            await cancel(confirmTarget.id);
            setConfirmTarget(null);
            toast.success(confirmMode === 'request-cancellation' ? 'Cancellation requested. A manager will review it.' : 'Request withdrawn');
          } catch (e) {
            toast.error(readableError(e));
          }
        }}
      />

      <LeaveDetailsModal leave={detailsTarget} onClose={() => setDetailsTarget(null)} nameOf={nameOf} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Briefly flashes a highlight ring on a section after it's scrolled to, so
// clicking an overview tile has a visible landing effect, not just a jump.
function scrollAndFlash(el: HTMLElement | null) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.remove('iv-flash');
  // Force reflow so the animation restarts if the same tile is clicked twice.
  void el.offsetWidth;
  el.classList.add('iv-flash');
  window.setTimeout(() => el.classList.remove('iv-flash'), 1200);
}

function TeamLeavesPanel() {
  const nameOf = useNameOf();
  const { leaves, overview, loading, busy, error, realtime, reload, review, reviewCancellation } = useTeamLeaves();
  const [reviewing, setReviewing] = useState<{
    leave: LeaveRequest; decision: 'approved' | 'rejected'; kind: 'leave' | 'cancellation';
  } | null>(null);
  const [note, setNote] = useState('');
  const [detailsTarget, setDetailsTarget] = useState<LeaveRequest | null>(null);
  const toast = useToast();

  const pendingCardRef = useRef<HTMLDivElement | null>(null);
  const cancelCardRef = useRef<HTMLDivElement | null>(null);
  const reviewedCardRef = useRef<HTMLDivElement | null>(null);

  const pending = leaves.filter((l) => l.status === 'pending');
  const cancelReqs = leaves.filter((l) => l.status === 'cancellation_requested');
  const others = leaves.filter((l) => l.status !== 'pending' && l.status !== 'cancellation_requested');
  const isCancel = reviewing?.kind === 'cancellation';

  // A rejection must carry a reason so the employee knows why; approving
  // stays optional ("Enjoy your time off." is a nice-to-have, not required).
  const noteRequired = reviewing?.decision === 'rejected';
  const noteMissing = noteRequired && note.trim().length === 0;

  return (
    <div className="iv-stack">
      <Card>
        <SectionHead title="Team leave overview" actions={<LiveDot status={realtime} />} />
        {error && <ErrorState message={error} onRetry={reload} />}
        <div className="iv-statrow iv-statrow--4">
          <button type="button" className="iv-stattile-btn" onClick={() => scrollAndFlash(pendingCardRef.current)}>
            <StatTile label="Pending requests" value={overview?.pending_count ?? 0} tone={overview && overview.pending_count > 0 ? 'late' : 'neutral'} />
          </button>
          <button type="button" className="iv-stattile-btn" onClick={() => scrollAndFlash(cancelCardRef.current)}>
            <StatTile label="Cancellation requests" value={overview?.cancellation_requested_count ?? 0} tone={overview && overview.cancellation_requested_count > 0 ? 'late' : 'neutral'} />
          </button>
          <StatTile label="On leave today" value={overview?.on_leave_today ?? 0} tone="working" />
          <button type="button" className="iv-stattile-btn" onClick={() => scrollAndFlash(reviewedCardRef.current)}>
            <StatTile label="Total requests" value={leaves.length} />
          </button>
        </div>
      </Card>

      <div ref={pendingCardRef}><Card>
        <SectionHead title="Awaiting your review" subtitle={`${pending.length} pending`} />
        {loading ? <SkeletonRows rows={3} /> : pending.length === 0 ? (
          <EmptyState title="Nothing to review" body="New leave requests will appear here." />
        ) : (
          <div className="iv-tablewrap">
            <table className="iv-table">
              <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Applied</th><th /></tr></thead>
              <tbody>
                {pending.map((l) => (
                  <tr key={l.id}>
                    <td data-label="Employee"><strong>{nameOf(l.user_id)}</strong></td>
                    <td data-label="Type">{LEAVE_TYPE_LABEL[l.leave_type]}</td>
                    <td data-label="Dates">{formatDay(l.start_date)} – {formatDay(l.end_date)}</td>
                    <td data-label="Days" className="iv-num">{fmt(l.days)}{l.is_half_day ? ' (half day)' : ''}</td>
                    <td data-label="Reason">{l.reason ?? '—'}</td>
                    <td data-label="Applied">{formatDay(l.created_at)}</td>
                    <td data-label="">
                      <div className="iv-toolbar">
                        <Button size="sm" variant="primary" onClick={() => { setReviewing({ leave: l, decision: 'approved', kind: 'leave' }); setNote(''); }}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => { setReviewing({ leave: l, decision: 'rejected', kind: 'leave' }); setNote(''); }}>Reject</Button>
                        <Button size="sm" onClick={() => setDetailsTarget(l)}>View details</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card></div>

      <div ref={cancelCardRef}><Card>
        <SectionHead title="Cancellation requests" subtitle={`${cancelReqs.length} awaiting your review`} />
        {loading ? <SkeletonRows rows={2} /> : cancelReqs.length === 0 ? (
          <EmptyState title="No cancellation requests" body="Employees asking to cancel approved leave will appear here." />
        ) : (
          <div className="iv-tablewrap">
            <table className="iv-table">
              <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Requested</th><th /></tr></thead>
              <tbody>
                {cancelReqs.map((l) => (
                  <tr key={l.id}>
                    <td data-label="Employee"><strong>{nameOf(l.user_id)}</strong></td>
                    <td data-label="Type">{LEAVE_TYPE_LABEL[l.leave_type]}</td>
                    <td data-label="Dates">{formatDay(l.start_date)} – {formatDay(l.end_date)}</td>
                    <td data-label="Days" className="iv-num">{fmt(l.days)}{l.is_half_day ? ' (half day)' : ''}</td>
                    <td data-label="Requested">{l.cancel_requested_at ? formatDay(l.cancel_requested_at) : '—'}</td>
                    <td data-label="">
                      <div className="iv-toolbar">
                        <Button size="sm" variant="primary" onClick={() => { setReviewing({ leave: l, decision: 'approved', kind: 'cancellation' }); setNote(''); }}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => { setReviewing({ leave: l, decision: 'rejected', kind: 'cancellation' }); setNote(''); }}>Reject</Button>
                        <Button size="sm" onClick={() => setDetailsTarget(l)}>View details</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card></div>

      <div ref={reviewedCardRef}><Card>
        <SectionHead title="Reviewed requests" />
        {others.length === 0 ? (
          <EmptyState title="Nothing reviewed yet" />
        ) : (
          <div className="iv-tablewrap">
            <table className="iv-table">
              <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th><th>Note</th><th /></tr></thead>
              <tbody>
                {others.map((l) => (
                  <tr key={l.id}>
                    <td data-label="Employee">{nameOf(l.user_id)}</td>
                    <td data-label="Type">{LEAVE_TYPE_LABEL[l.leave_type]}</td>
                    <td data-label="Dates">{formatDay(l.start_date)} – {formatDay(l.end_date)}</td>
                    <td data-label="Status"><Badge tone={STATUS_TONE[l.status]} dot>{LEAVE_STATUS_LABEL[l.status]}</Badge></td>
                    <td data-label="Note">{noteFor(l)}</td>
                    <td data-label="">
                      <Button size="sm" onClick={() => setDetailsTarget(l)}>View details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card></div>

      <Modal
        open={!!reviewing}
        title={
          isCancel
            ? (reviewing?.decision === 'approved' ? 'Approve this cancellation?' : 'Reject this cancellation?')
            : (reviewing?.decision === 'approved' ? 'Approve this leave?' : 'Reject this leave?')
        }
        onClose={() => setReviewing(null)}
        width={460}
        footer={(
          <>
            <Button onClick={() => setReviewing(null)}>Cancel</Button>
            <Button
              variant={reviewing?.decision === 'approved' ? 'primary' : 'danger'}
              loading={busy}
              disabled={noteMissing}
              onClick={async () => {
                if (!reviewing || noteMissing) return;
                try {
                  const fn = isCancel ? reviewCancellation : review;
                  await fn(reviewing.leave.id, reviewing.decision, note.trim() || undefined);
                  toast.success(
                    isCancel
                      ? (reviewing.decision === 'approved' ? 'Cancellation approved. Days restored.' : 'Cancellation rejected. Leave stays approved.')
                      : (reviewing.decision === 'approved' ? 'Leave approved' : 'Leave rejected'),
                  );
                  setReviewing(null);
                } catch (e) {
                  toast.error(readableError(e));
                }
              }}
            >
              {reviewing?.decision === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </>
        )}
      >
        {reviewing && (
          <>
            <p className="iv-confirm__msg">
              {nameOf(reviewing.leave.user_id)} · {LEAVE_TYPE_LABEL[reviewing.leave.leave_type]} · {fmt(reviewing.leave.days)} day(s)
            </p>
            <Field
              label={noteRequired ? (isCancel ? 'Reason for rejecting the cancellation' : 'Reason for rejection') : 'Note (optional)'}
              hint="Visible to the employee."
            >
              <textarea
                className="iv-input iv-input--area"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={reviewing.decision === 'approved' ? 'Enjoy your time off.' : 'Let them know why.'}
              />
            </Field>
            {noteMissing && <p className="iv-field__error">A reason is required to reject.</p>}
          </>
        )}
      </Modal>

      <LeaveDetailsModal
        leave={detailsTarget}
        onClose={() => setDetailsTarget(null)}
        nameOf={nameOf}
        employeeName={detailsTarget ? nameOf(detailsTarget.user_id) : undefined}
      />
    </div>
  );
}