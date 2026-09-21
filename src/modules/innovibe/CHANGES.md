# What changed

## Dashboard (`dashboard/DashboardWidgets.tsx`, `dashboard/dashboard.css`)

**Root cause found:** `dashboard.css` already contained a full, spacious "professional
dashboard" design system (`.iv-dkpi`, `.iv-dcard`, `.iv-dtiles`, `.iv-dpeople`,
`.iv-dlist`, `.iv-dfeed`, `.iv-dbtn`, …) but `DashboardWidgets.tsx` never imported the
stylesheet and never used any of those class names — it was still rendering with the
older, tighter `.iv-kpi` / `.iv-card` / `.iv-statrow` classes from `innovibe.css`. That
mismatch is why the dashboard looked compressed even though a better stylesheet already
existed in the repo.

The "Open tasks" / "New task" buttons running together was a second, separate bug:
the JSX referenced a class `iv-widget-actions` that was never defined anywhere in CSS,
so the two `<button className="iv-linkbtn">` elements had zero gap/flex styling.

Fixes:
- `DashboardWidgets.tsx` now imports `./dashboard.css` and every widget renders with
  the `iv-d*` classes (spacious cards, real padding, proper stat tiles, list rows).
- "Open tasks" and "New task" are now two real buttons (`.iv-btn` / `.iv-btn--primary`)
  in a `.iv-dactions` row with a 10px gap — no more running together, and they wrap
  cleanly on narrow screens instead of overlapping.
- Added `.iv-dactions`, `.iv-dhead__sub`, and `.iv-dcard--warn` to `dashboard.css`
  (small additions the existing design system was missing to support the above).
- All hooks, data fetching, realtime subscriptions and prop signatures are untouched —
  only markup/class names changed, so attendance/tasks/leaves logic isn't affected.
- Left the emoji KPI icons as-is (not "new" emojis, and no icon library/SVG set was
  included in the files you sent, so swapping to SVG icons risks an import that
  doesn't exist in your project — happy to do that pass if you send `ui/ui.tsx` and
  tell me which icon set you use).

## Leaves (`leaves/LeavesPage.tsx`)

- Added a **Submitted** column (employee view) and **Applied** column (manager view)
  using `l.created_at`.
- Cancellation now follows the rule you asked for:
  - **Pending** → "Withdraw" button (unchanged behavior, just relabeled/confirmed
    clearly as a withdrawal).
  - **Approved, not yet started** → "Request cancellation" button, with its own
    confirmation wording.
  - **Rejected / already cancelled / in-progress-or-past approved leave** → no action
    shown at all, matching "past approved leaves must not be deletable by employees."
- Rejecting a request now **requires** a reason — the Approve/Reject modal disables
  the Reject button and shows an inline error until a note is entered. Approving still
  keeps the note optional.
- Balance tiles now also show a computed "used" figure alongside "pending", not just
  the plain `remaining / annual_days` number.
- Confirmation modals and toasts were already in place (no `alert()`/`confirm()` was
  ever used) — I kept that pattern.

### Backend items I could not verify or change

I only received 6 frontend files — no `types.ts`, `ui/ui.tsx`, `provider.tsx`, SQL
migrations, or RPC definitions (`iv_apply_leave`, `iv_review_leave`, `iv_cancel_leave`,
etc.), so I could not run `npm run build` or confirm these against your real schema:

1. **"Request cancellation" on an approved leave** currently calls the same
   `iv_cancel_leave` RPC as withdrawing a pending one, so it resolves immediately
   rather than going back through manager approval. A true two-step flow (employee
   requests → manager confirms the cancellation) needs a DB-side change — e.g. a new
   status or a flag the manager clears — that isn't in the files provided.
2. There's no separate **"Withdrawn"** status in the `STATUS_TONE`/label maps you sent
   (only `pending/approved/rejected/cancelled`), so I used "Withdraw" purely as the UI
   verb for a pending-request cancellation rather than inventing a new status value
   that might not exist in your `LeaveStatus` enum/DB check constraint. If you do want
   a distinct `withdrawn` status, that also needs a `types.ts` + DB enum change.
3. Approver ID + timestamp recording, and audit history, are presumably already
   handled inside `iv_review_leave` / `iv_cancel_leave` server-side — I didn't see
   those functions, so I can't confirm.
4. "Department or role" column for the manager table wasn't added — I didn't see a
   data source for it (no `roleOf`/department field) in the files provided.

If you can send `types.ts`, `ui/ui.tsx`, and the SQL for the three RPC functions, I can
close out items 1–3 properly and actually verify a `tsc`/`next build` pass.
