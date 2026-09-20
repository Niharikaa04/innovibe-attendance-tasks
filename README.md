# InnoVibe Office — Attendance & Task Management

Two production modules for the existing InnoVibe Office & Chat platform: employee
attendance and team task management, both realtime, both enforced in the database.

This is **not** a standalone app. There is no login screen, no seed data, no fake
employees. It plugs into the Supabase project, the auth session and the `profiles`
table you already have, and it leaves chat, channels, DMs, Jitsi, recording,
transcription and the AI features completely untouched.

---

## What it does

**Attendance**
- Check in / check out through server-side RPCs (the database clock decides the time, not the browser)
- Live working timer, today's status, late-arrival detection
- Personal history by month with hours chart and summary
- Manager board: who is working, who checked out, who is not in, late arrivals, attendance percentage
- Date picker, employee search, status filter

**Tasks**
- Title, description, assignee, creator, priority, status, due date, completion date
- Board view and list view, filter by status / priority / person / due window, full-text search
- Comments and an automatic activity log
- Notifications for assignment, reassignment, status change, priority change, due-date change, comments, due-soon and overdue

**Everything above is realtime.** Supabase Realtime subscriptions on five tables,
one channel per mounted component, cleaned up on unmount. No polling anywhere.

---

## Files

```
supabase/
  migrations/
    0001_innovibe_core.sql      roles, SECURITY DEFINER helpers, work settings
    0002_attendance.sql         attendance table, RLS, check-in/out RPCs, dashboard RPCs
    0003_tasks.sql              tasks table, RLS, column-level guard trigger
    0004_notifications.sql      notifications (reuses yours if it exists), iv_notify
    0005_task_activity.sql      comments, activity log, event triggers, due sweep
    0006_realtime.sql           publication + replica identity
    0007_assign_roles.sql       give Sri Hari CEO access, the interns employee access
  rollback.sql                  removes this module only

src/modules/innovibe/
  index.ts                      the only import path you need
  provider.tsx                  injects your Supabase client + signed-in user
  types.ts                      all shared TypeScript types
  lib/realtime.ts               subscription hook + list reducers
  lib/time.ts                   formatting
  lib/toast.tsx                 toasts + human-readable Postgres errors
  ui/ui.tsx                     cards, badges, modal, drawer, chart, states
  styles/innovibe.css           complete stylesheet, token-driven
  attendance/                   api, hooks, panel, history, team board, page
  tasks/                        api, hooks, form modal, detail drawer, page
  notifications/                hook + bell
  dashboard/                    six widgets for the Office Dashboard

examples/IntegrationExample.tsx how to wire it into your app
docs/SETUP_GUIDE.md             step-by-step build order, phase by phase
docs/TESTING.md                 the two-user test script
docs/SECURITY.md                what RLS enforces and how to prove it
```

---

## Quick start

This is a complete, installable Vite + React + TypeScript project.

1. Run the eight SQL files in order in the Supabase SQL editor (`supabase/migrations/`), starting with `0000_bootstrap_profiles.sql` — it's safe to run even if `profiles` already exists (e.g. from InnoVibe Chat), since every statement is guarded with `if not exists` / `drop if exists`.
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.
4. `npm run dev`
5. Sign in with one of the accounts created via `0007_assign_roles.sql`.

The app ships with a light sidebar layout (Dashboard / Attendance / Tasks) and its own sign-in screen. If you're integrating into an existing InnoVibe Chat codebase instead of running this standalone, see the note at the top of `src/App.tsx` — swap the sign-in screen for your existing auth and drop `src/modules/innovibe/` into your project's `src/modules/`.

Full detail, including what to verify after each step, is in
[`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md).

---

## Requirements

- React 18+ and TypeScript (the module is `.tsx`, no framework beyond React)
- `@supabase/supabase-js` v2 — already in your project
- No other dependencies. The chart, modal, drawer, toasts and spinner are all
  hand-written so nothing new enters your bundle.

---

## Design notes

The stylesheet is one file of CSS custom properties. Every colour, radius and
font in the module comes from the token block at the top of
`styles/innovibe.css`, so matching InnoVibe Chat is a matter of editing that
block rather than hunting through components. Dark mode follows the system
setting and can be forced with `data-iv-theme="dark"` on a wrapper.

Every class is prefixed `iv-`, so nothing here can collide with your existing
chat styles.

---

## The people in this workspace

Migration `0007` maps your real accounts to roles:

| Person | Role | Access |
| --- | --- | --- |
| Sri Hari | `ceo` | Manager level: team attendance, all tasks, create and assign |
| Niharika | `intern` | Own attendance, own tasks, comment where permitted |
| Greeshma | `intern` | Same |
| Yamini | `intern` | Same |
| Laasya Sri | `intern` | Same |

Edit the emails in that file before running it. No users are created — these
profiles must already exist from the chat platform's signup.
