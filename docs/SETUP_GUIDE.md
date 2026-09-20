# Step-by-step guide

Follow this in order. After every phase there is a short "prove it works" check.
Do not move to the next phase until that check passes — that is the whole point
of building this incrementally.

Budget roughly: phases 1–4 in one sitting, 5–9 in a second, 10–11 in a third.

---

## Before you start

1. **Back up.** Supabase dashboard → Database → Backups → take a manual backup.
   Nothing in these migrations drops or renames anything, but take one anyway.

2. **Confirm what already exists.** Run this in the SQL editor:

   ```sql
   select table_name
     from information_schema.tables
    where table_schema = 'public'
    order by table_name;
   ```

   Look for: `profiles`, and whether you already have `notifications`,
   `attendance` or `tasks`. If you already have a table called `attendance` or
   `tasks` from something else, rename the new ones in the migrations before
   running them.

3. **Check the profiles shape.**

   ```sql
   select column_name, data_type
     from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles';
   ```

   The module expects `id`, `full_name`, and optionally `avatar_url`. If your
   column is called something else (`name`, `display_name`), adjust the select
   in `provider.tsx` and in `iv_team_attendance` / `iv_display_name`.

---

## Phase 1 — Database and security

Open the Supabase SQL editor and run these one at a time, reading the output:

1. `supabase/migrations/0000_bootstrap_profiles.sql` — creates `profiles` if this is a brand-new Supabase project with no InnoVibe Chat deployed yet. Safe to run even if `profiles` already exists.
2. `supabase/migrations/0001_innovibe_core.sql`
3. `supabase/migrations/0002_attendance.sql`
4. `supabase/migrations/0003_tasks.sql`
5. `supabase/migrations/0004_notifications.sql`
6. `supabase/migrations/0005_task_activity.sql`
7. `supabase/migrations/0006_realtime.sql`
8. Edit the emails in `0007_assign_roles.sql`, then run it.

Set your office hours while you are here:

```sql
update public.iv_work_settings
   set timezone = 'Asia/Kolkata',
       work_start = '09:30',
       work_end   = '18:30',
       late_grace_minutes = 15
 where id = 1;
```

**Prove it works.**

```sql
-- roles landed
select full_name, role from public.profiles order by role;

-- helpers respond
select public.iv_today(), public.iv_is_manager();

-- realtime is on for all five tables
select tablename from pg_publication_tables
 where pubname = 'supabase_realtime' and schemaname = 'public';

-- RLS is on
select tablename, rowsecurity from pg_tables
 where schemaname = 'public'
   and tablename in ('attendance','tasks','task_comments','task_activity','notifications');
```

All five tables must show in the publication and `rowsecurity = true`.

**Then open the chat app and send a message.** Chat must still work. If it does
not, stop and tell me what broke — nothing in phase 1 should be able to affect it.

---

## Phase 2 — Attendance UI for employees

1. Copy the folder `src/modules/innovibe/` into your project at the same path.
2. Wrap your authenticated tree (see `examples/IntegrationExample.tsx`):

   ```tsx
   <InnoVibeProvider supabase={supabase} userId={user?.id ?? null}>
     <ToastHost>{children}</ToastHost>
   </InnoVibeProvider>
   ```

   `supabase` must be **your existing client instance**. Importing a second
   client would create a second realtime socket and a second auth session.

3. Add a route: `/attendance` → `<AttendancePage />`.

If your bundler complains about the CSS import in `index.ts`, either add
`declare module '*.css';` to a `.d.ts` file, or remove that import line and
import `modules/innovibe/styles/innovibe.css` from your global stylesheet
instead.

**Prove it works.** Sign in as Niharika. Check in. The status badge turns green,
the timer starts, and the check-in time appears. Then:

```sql
select * from public.attendance where work_date = current_date;
```

One row, with a real `check_in`. Check out and confirm `total_working_minutes`
is populated.

---

## Phase 3 — Attendance realtime

Nothing to build; it is already wired. This phase is the test.

**Prove it works.** Two browsers, two different accounts — say Niharika in
Chrome and Greeshma in a private window. Both on `/attendance`.

- Greeshma checks in.
- Niharika's page must not change (she only subscribes to her own row — this is
  correct, not a bug).
- Now sign in as Sri Hari on the Team tab and repeat: his board updates within a
  second, with no refresh.

If nothing arrives: open the browser console. A `CHANNEL_ERROR` usually means
the table is missing from the publication (re-run `0006`), and silence usually
means RLS is blocking the row for that viewer.

---

## Phase 4 — Manager attendance dashboard

Already built as the Team tab of `<AttendancePage />`, plus
`<TeamAttendanceBoard />` if you want it standalone.

**Prove it works.** Sign in as Sri Hari. The Team tab shows every profile,
including people who have not checked in (`iv_team_attendance` left-joins, so
absent people still appear). Click a row — their monthly history opens in a
drawer. Sign in as an intern and confirm the Team tab is not even rendered, then
confirm the database agrees:

```sql
-- as the intern's JWT, via the app, this returns only their own row
select * from public.iv_team_attendance(null);
```

---

## Phase 5 — Task database

Already applied in phase 1 (`0003` and `0005`). Sanity check the guard:

```sql
-- as an intern who is only the assignee, this must fail with 42501
update public.tasks set priority = 'urgent' where id = '<some task id>';
```

---

## Phase 6 — Task UI

Add a route: `/tasks` → `<TasksPage />`.

**Prove it works.** As Sri Hari, create a task: "Prepare monthly vehicle report",
assigned to Niharika, priority High, due in three days. It appears on the board
under To do.

---

## Phase 7 — Task realtime

Again, already wired; this is the test. Two windows, Sri Hari and Niharika, both
on `/tasks`.

- Sri Hari creates a task for Niharika → it appears on her board immediately.
- Niharika drags it… actually, she opens it and presses **In progress** → Sri
  Hari's board moves the card across immediately.
- Sri Hari changes the priority → she sees the new badge.
- Either deletes → the card disappears for both.

---

## Phase 8 — Comments and activity

Open any task's drawer. The Activity list is written by database triggers, so it
is correct even if someone changes a row in the SQL editor.

**Prove it works.** Niharika comments "Battery report is ready." With the drawer
open on Sri Hari's screen, the comment appears without a refresh, and an
`added a comment` entry joins the activity list on both screens.

---

## Phase 9 — Notifications

Put `<NotificationBell />` in your top bar.

**Prove it works.** Sri Hari assigns a task to Greeshma. Greeshma's bell gains a
red count within a second. Yamini's bell does not move — `iv_notify` only writes
to the assignee and the creator, and never to the person who caused the event.

For due-soon and overdue notices, schedule the sweep. In the Supabase dashboard,
Database → Extensions, enable `pg_cron`, then:

```sql
select cron.schedule(
  'iv-due-task-sweep', '0 3 * * *',           -- 03:00 UTC = 08:30 IST
  $$ select public.iv_sweep_due_tasks(); $$
);
```

If you prefer not to use pg_cron, call `iv_sweep_due_tasks()` from an Edge
Function on a schedule. The function is idempotent per day, so running it twice
does not double-notify.

---

## Phase 10 — Office Dashboard integration

In your existing dashboard page:

```tsx
<OfficeDashboardSection
  onOpenAttendance={() => navigate('/attendance')}
  onOpenTasks={() => navigate('/tasks')}
  onOpenTask={(id) => navigate(`/tasks?open=${id}`)}
/>
```

Or place the six widgets individually: `AttendanceSummaryWidget`,
`EmployeeStatusWidget`, `TaskSummaryWidget`, `PendingTasksWidget`,
`OverdueTasksWidget`, `RecentActivityWidget`.

**Prove it works.** Leave the dashboard open on one screen. Check in from
another device. The counts move on their own.

---

## Phase 11 — Final review

Work through [`docs/TESTING.md`](TESTING.md) end to end with two accounts, then
the security checks in [`docs/SECURITY.md`](SECURITY.md).

Last pass:

- `npx tsc --noEmit` — no errors.
- Browser console — no red, and no warnings about duplicate channel
  subscriptions.
- Supabase dashboard → Logs → Postgres — no repeating warnings from `iv_notify`.
- Open chat, send a message, start a Jitsi call, check DMs and reactions. All
  still fine.

---

## Troubleshooting

**"new row violates row-level security policy" when creating a task.**
You are signed in as a non-manager and tried to assign to someone else. Either
that is correct behaviour, or that person's `profiles.role` needs to be a
manager role.

**Realtime works for inserts but not deletes.**
`replica identity full` did not apply. Re-run `0006_realtime.sql`.

**Times are off by 5h30m.**
`iv_work_settings.timezone` is not `Asia/Kolkata`. All timestamps are stored as
`timestamptz` and only the *date bucketing* uses that setting, so fixing it does
not corrupt existing rows.

**Two check-ins on one day.**
Not possible — `attendance_one_row_per_day` is a unique constraint, and
`iv_check_in` raises if `check_in` is already set.

**Duplicate rows flash in the list.**
The optimistic update and the realtime event arrived together. `applyChange`
de-duplicates by `id`; if you see this, something is calling `setTasks` outside
those helpers.
