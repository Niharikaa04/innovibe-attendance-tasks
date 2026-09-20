# Security model

Nothing here relies on the frontend hiding a button. Every rule below is
enforced in Postgres and can be verified with SQL.

---

## Roles

`profiles.role` drives everything. Manager-level roles are `ceo`, `admin`,
`manager`, `hr`, `lead`. Everything else (`employee`, `intern`) is standard.

Policies never read `profiles` directly. They call `iv_is_manager()`, a
`SECURITY DEFINER` function, which reads `profiles` with the function owner's
rights. This is what prevents the classic recursive-RLS deadlock where a policy
on `profiles` triggers a query on `profiles`.

---

## What each table allows

### attendance

| Action | Standard employee | Manager | Admin / CEO |
| --- | --- | --- | --- |
| Read own | yes | yes | yes |
| Read others | no | yes | yes |
| Insert | no — only via `iv_check_in()` | no | yes (corrections) |
| Update | no — only via `iv_check_out()` | no | yes (corrections) |
| Delete | no | no | yes |

Employees have **no direct write access at all**. Check-in and check-out go
through `SECURITY DEFINER` RPCs that take the timestamp from `now()` on the
database server. A user cannot change their system clock to fake an early
arrival, and cannot POST an arbitrary `check_in` value.

### tasks

| Action | Standard employee | Manager |
| --- | --- | --- |
| Read | assigned to them, or created by them | all |
| Create | only assigned to themselves | anyone |
| Update | status only, on their own tasks | any field |
| Delete | only tasks they created | any |

The "status only" rule is a `BEFORE UPDATE` trigger, `iv_tasks_guard_update`,
not a UI restriction. If an assignee sends a crafted request changing `priority`
or `assigned_to`, the transaction aborts with SQLSTATE 42501.

### task_comments and task_activity

Readable only if `iv_can_view_task()` says you can see the parent task.
Comments are insertable as yourself; editable and deletable only by their
author (admins may also delete). `task_activity` has **no insert policy at
all** — it is written exclusively by triggers, so the audit trail cannot be
forged from the client.

### notifications

Read, update and delete your own rows only. No insert policy — only the
`iv_notify()` definer function writes them.

---

## Proving it

Run these from the app (so the JWT is a real user's), or in the SQL editor with
an impersonated role.

```sql
-- as an intern: should return only their own attendance rows
select user_id, work_date from public.attendance;

-- as an intern: should return 0 rows, not an error
select * from public.tasks where assigned_to <> auth.uid() and created_by <> auth.uid();

-- as an intern who is only the assignee: must raise 42501
update public.tasks set priority = 'urgent' where id = '<task id>';

-- as an intern: must raise, activity has no insert policy
insert into public.task_activity (task_id, user_id, action)
values ('<task id>', auth.uid(), 'completed');

-- as anyone: must raise, notifications has no insert policy
insert into public.notifications (user_id, title) values (auth.uid(), 'fake');
```

To check a policy set has not drifted:

```sql
select tablename, policyname, cmd, qual, with_check
  from pg_policies
 where schemaname = 'public'
   and tablename in ('attendance','tasks','task_comments','task_activity','notifications')
 order by tablename, policyname;
```

---

## Realtime and RLS

Supabase Realtime applies RLS to the change stream, so a row a user cannot
`select` never reaches their socket. Two consequences worth knowing:

- An intern subscribed to `tasks` receives events only for their own tasks. This
  is why the task list can subscribe to the whole table without leaking.
- `replica identity full` is required for this filtering to work on UPDATE and
  for DELETE payloads to contain the old row. Migration `0006` sets it.

---

## Known limits

- **Attendance corrections** are admin-only and have no UI. Do them in SQL, or
  build a small admin form on top of `attendanceApi`.
- **Mentions in comments** are notified to the assignee and creator, not to an
  arbitrary `@name` parsed from the text. Add that by extending
  `iv_comments_after_insert` once you settle on a mention format that matches
  chat's.
- **`iv_notify` fails quietly.** If your pre-existing `notifications` table has
  a required column this module does not fill, the notification is skipped and
  a warning is written to the Postgres log rather than failing the task update.
  Check Logs → Postgres after the first assignment to confirm it is not
  silently skipping everything.
