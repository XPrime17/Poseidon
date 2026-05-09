---
name: Skyvern dead-branch fix (EOC Switch1)
description: End Of Call workflow Switch1 had unwired terminated/timed_out outputs, silently losing AI-confirmed bookings; fixed 2026-05-08
type: project
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# Skyvern Switch1 dead-branch — fixed 2026-05-08

End Of Call workflow `4p1V0wESn3kZySt6` `Switch1` (after Wait on Skyvern Webhook1) had four rules — `completed`, `failed`, `timed_out`, `terminated` — but only `completed` and `failed` outputs were wired in `connections.Switch1.main`. Skyvern's `terminated` and `timed_out` statuses fell into the void, dropping bookings silently with no centre notification.

**Why:** Sharmila reported a real Sandra Truong booking at Pickering on Wed May 6 6 PM that never landed on her calendar. Trace: AI booked, Skyvern terminated because 6 PM slot was taken between scrape (1:40 AM) and Skyvern attempt (9:06 AM same day) — only 5 PM was free at book-attempt time. Switch1 correctly routed to output 3, but output 3 was unwired → silent drop, no email, no calendar entry.

**How to apply:** if you ever modify Switch1 rules in EOC, ALWAYS update `connections.Switch1.main` to have the same length as the rules array. Add a "Send Manual Booking Needed" Gmail node downstream of any unhandled non-completed Skyvern status — sends to `={{ $('Fetch Lead Details').item.json.centre_email }}`, includes lead First/Last/Phone/Email and Set Tour True's Date/Time + Skyvern failure_reason. Recovery template:
```
Switch1 outputs:
  out0=completed -> Send Completed Email1
  out1=failed -> Failed1   (currently sends to Scott — could redirect to centre_email later)
  out2=timed_out -> Send Manual Booking Needed   (NEW 2026-05-08)
  out3=terminated -> Send Manual Booking Needed   (NEW 2026-05-08)
```

Backup of pre-fix workflow: `/root/n8n-fixes-2026-05-08/eoc.before.json`. Race-condition root cause (scrape API vs Skyvern live calendar disagreement) NOT fixed — only the silent-drop notification gap.

**Bug scope is centre-agnostic / call-direction-agnostic / attempt-agnostic.** Lives downstream of Skyvern in shared EOC workflow; fires for first-attempt outbound, retry outbound, and any inbound that uses this workflow. Sandra's case being a retry was incidental.

**Same bug class also lives in EG-Inbound EOC workflow `3oV7SpPKWmr3xJlQ`** — Switch node `Booking Result` only has rules for `completed`/`failed`, no `terminated`/`timed_out` rules and no `fallbackOutput`. NOT YET FIXED as of 2026-05-08. Audit of past 250 execs surfaced 3 lost bookings: Sandra Truong (Pickering, May 6 6 PM), Viji Ruban (Pickering, May 7 6 PM), and one EG-Inbound case (May 18 11 AM). When fixing the EG-Inbound workflow, add `terminated` and `timed_out` rules to `Booking Result` Switch + wire to a "Send Manual Booking Needed" Gmail node sending to centre_email with full lead details.
