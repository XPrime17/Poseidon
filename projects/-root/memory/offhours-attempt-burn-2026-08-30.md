---
name: offhours-attempt-burn-2026-08-30
description: After-hours gate burned attempt 1 with no call — FIXED fleet-wide 2026-08-31; Smruti row-540 case history + stale-write clobber lesson
metadata: 
  node_type: memory
  type: project
  originSessionId: 00b89bc0-52ac-48bd-8472-6d5b161e679a
---

**Bug:** Outbound pipeline `6sPwo7ngPyTWfmwM` `Append row in sheet` writes `status=calling, attempt_count=1` BEFORE the `After Hours?` gate; the Off Hours branch (`Update Lead - Off Hours`) set `retry_pending` + next-morning `next_call_after` but never reset `attempt_count` → every after-hours lead lost attempt 1 (first real call logged as attempt 2, max 3 real calls instead of 4, `attempt_1_*` slots empty forever).

**FIXED 2026-08-31 (~7:40 PM ET):** added `attempt_count = (parseInt($('Append row in sheet').item.json.attempt_count) || 1) - 1` to `Update Lead - Off Hours` — same un-burn pattern as `Requeue - Scrape Timeout` in the scheduler. PUT + re-fetch verified, workflow active. Backups: `/root/n8n-backups/offhours-attempt-burn-2026-08-30/` (pre + post). NOT live-proven yet — needs the next real after-hours lead to land with attempt_count=0.

**Smruti case (Pickering row 540):** lead 8/30 21:18 ET (exec 31188, after-hours → phantom attempt 1); dupe echo 21:21 correctly dropped (the alert). Real calls 8/31: 10:07 AM ET attempt-2 VM message left (call_577f390d…, 23s) and 2:37 PM ET attempt-3 voicemail_hangup (call_a613b745…, 2s). She gets attempt 4 on **Sept 3 ~6:33 PM ET** then exhausted → staff task; net 3 real dials (one lost to the bug, accepted — no compensation to keep attempt slots truthful).

**⚠️ Lesson (near-miss):** I repaired her counter 1→0 using row state read ~21h earlier; meanwhile the scheduler had dialed her twice and EOC had set attempt_count=3. My write clobbered it to 0 (would have re-opened a fresh 4-call ladder = overcalling a real parent). Caught because the post-write re-read showed next_call_after had changed; restored to 3 within 4 min, no tick in the window. **ALWAYS re-read a row immediately before hand-writing it** — promoted to standing rule [[feedback-reread-before-manual-write]] per Scott 8/31; same family as "ALWAYS re-read after Sheets writes" from [[scheduler-pairing-phantom-attempts-2026-08-22]]. Time can pass between conversation turns; conversation state ≠ sheet state.

**Odd but out of scope:** cadence gave her attempts at 10:07 AM and 2:37 PM the same day (not the 6:30pm day+1 A/B pattern), and `attempt_4_at` is pre-staged with the FUTURE Sept 3 time by EOC's Calculate Next Call. `attempt_2_outcome` blank despite a VM being left.
