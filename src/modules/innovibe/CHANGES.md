# What changed

## Employee Management (new — `employees/`, `supabase/functions/create-employee/`, `supabase/migrations/0016_employee_management.sql`)

Adds a self-service "Employees" section for CEO / Admin / Manager / HR / Lead, so
new hires no longer need to be created by hand in the Supabase dashboard.

**Database (`0016_employee_management.sql`, additive only):**
- Adds two nullable/defaulted columns to the existing `public.profiles` table:
  `email` (unique, case-insensitive) and `status` (`'active' | 'disabled'`, defaults
  to `'active'`). Backfills `email` for existing rows from `auth.users`.
- Everything else the feature needs — `employee_id` uniqueness, the role column,
  `iv_is_manager()` / `iv_is_admin()`, and the "only an admin can change role"
  trigger — already existed (migrations 0001, 0007, 0010, 0015) and is untouched.

**Backend (`supabase/functions/create-employee/index.ts`):**
- A new Supabase Edge Function, the only place that ever touches the
  `service_role` key. Verifies the caller's Supabase Auth token, re-reads
  *their* role from `public.profiles` (never trusts a role sent from the
  browser), validates every field, checks User ID / email uniqueness, creates
  a confirmed `auth.users` account, and upserts the matching `profiles` row.
  If the profile write fails after the Auth account was created, it deletes
  that Auth account so no orphan is left behind. CEO/Admin can never be
  assigned through this endpoint — only Employee / Intern / Lead / HR / Manager.
- Returns a safe, specific JSON error (`"User ID already exists."`, `"Email is
  already registered."`, `"You are not authorized to create employees."`,
  etc.) instead of a generic non-2xx status.

**Frontend:**
- `employees/api.ts`, `employees/hooks.ts` (`useEmployeeDirectory`,
  `useCreateEmployee`), `employees/EmployeeDirectoryPage.tsx` (search + role/status
  filters + table), `employees/AddEmployeeForm.tsx` (full form incl. Generate
  Password) — all follow the same shape as the existing `leaves/` module.
- `types.ts`: `Profile` gains `employee_id` / `email` / `status`; added
  `EMPLOYEE_MANAGEMENT_ROLES` (an alias of the existing `MANAGER_ROLES`, so no
  new role concept was introduced) and `CREATABLE_ROLES`.
- `App.tsx`: new "Employees" sidebar group (Employee Directory, Add Employee),
  gated on the existing `isManager` flag — exactly CEO/Admin/Manager/HR/Lead,
  the same set already used to show Team Attendance/Tasks/Leaves.
- Existing login, forgot-password, dashboard, attendance, tasks, leaves,
  notifications, settings, RLS policies and role logic are all unchanged.

**To deploy:**
1. Run `supabase/migrations/0016_employee_management.sql` in the SQL Editor.
2. `supabase functions deploy create-employee` (no manual env vars needed —
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically).
3. Sign in as an existing CEO/Admin/Manager/HR/Lead account and use
   Employees → Add Employee.


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
