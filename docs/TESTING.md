# Testing script

Every realtime feature is tested with two signed-in accounts in two windows.
Use a normal window and a private window so the sessions do not share storage.

Suggested pairing:
- **Window A** — Sri Hari (`ceo`)
- **Window B** — Niharika (`intern`)

Tick each line only when the change appears **without pressing refresh**.

---

## Attendance

| # | Do this | Expect |
| --- | --- | --- |
| A1 | B checks in | B's badge turns green, timer starts from 00h 00m |
| A2 | — | A's Team tab shows Niharika as Working with her check-in time |
| A3 | Wait one minute | B's timer reads 00h 01m (local tick, no network call) |
| A4 | B checks out | Confirmation dialog first, then status Checked out with total hours |
| A5 | — | A's board moves her to Checked out and shows the hours |
| A6 | A picks yesterday's date | Board shows that day; B's screen is unaffected |
| A7 | B tries to check in twice | Second attempt is refused with a clear message |
| A8 | Check in after the grace window | Row is flagged `late` on both screens |

## Tasks

| # | Do this | Expect |
| --- | --- | --- |
| T1 | A creates "Prepare monthly vehicle report", assigned to Niharika, High | Card appears on B's board under To do |
| T2 | B opens it and presses In progress | A's card moves to the In progress column |
| T3 | A changes priority to Urgent | B's badge turns red |
| T4 | A changes the due date | B sees the new date |
| T5 | B presses Completed | A's card moves to Completed, `completed_at` is set |
| T6 | A deletes the task | Card disappears on both screens |
| T7 | B tries to edit the title | Edit controls are not offered; the database also refuses (see SECURITY.md) |
| T8 | A filters to Overdue | Only past-due, unfinished tasks remain |

## Comments and activity

| # | Do this | Expect |
| --- | --- | --- |
| C1 | Both open the same task drawer | Both see the same comments and activity |
| C2 | B comments "Battery report is ready." | A sees the comment appear |
| C3 | — | Both activity lists gain "added a comment" |
| C4 | B changes status while both drawers are open | Both see "moved it from … to …" |
| C5 | B deletes her own comment | It disappears for both |

## Notifications

| # | Do this | Expect |
| --- | --- | --- |
| N1 | A assigns a task to B | B's bell count increases |
| N2 | — | A's own bell does not move (never notify the actor) |
| N3 | Sign in as Yamini in a third window | Her bell does not move — she is unrelated to that task |
| N4 | B opens the notification | It opens the task and the unread highlight clears |
| N5 | B presses Mark all read | Count goes to zero and stays zero after refresh |

## Office Dashboard

| # | Do this | Expect |
| --- | --- | --- |
| D1 | A stays on the dashboard, B checks in | Working count increases on its own |
| D2 | A creates a task | Task totals move on both dashboards |
| D3 | B completes a task | Completed count moves, Recent activity gains a line |

## Existing chat — regression check

Run this after every phase, not just at the end.

- Send a message in a channel
- Send a 1-to-1 DM and a group DM
- React to a message and reply to one
- Share a file
- Search messages
- Start a Jitsi call, record, and confirm transcription and AI summary still run
- Use the AI Assistant

None of these should change in any way.

## Cleanup and resilience

| # | Do this | Expect |
| --- | --- | --- |
| R1 | Navigate between /tasks and /attendance ten times | Console shows no growing list of channels; memory stays flat |
| R2 | Open the network tab and idle for two minutes | No repeating requests — realtime is event-driven, nothing polls |
| R3 | Turn wifi off | "Reconnecting" indicator appears |
| R4 | Turn wifi back on | Indicator returns to Live; hit refresh once to resync any events missed while offline |

Note on R4: Supabase Realtime does not replay events from a disconnected
period. The reconnect indicator is there so the person knows to refresh if they
were away. Every hook also exposes `reload()` if you want to call it on
reconnect yourself.
