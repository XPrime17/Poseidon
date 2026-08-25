---
capture_type: LEARNING
timestamp: 2026-08-22 19:45:47 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Green across the board now — but the check caught the scheduler quietly burning real leads' attempts on calls it never made; seven leads restored and dialing momentarily.

**Date:** 2026-08-22
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

🤖 PAI ALGORITHM ═════════════

**SYSTEM CHECK — last 2 days: infrastructure healthy, but the check uncovered and repaired an outage-class bug that had silently exhausted real leads.**

```
SYSTEM HEALTH CHECK — 2026-08-22 16:00 ET
============================================
n8n WORKFLOWS
[PASS] Outbound Call Flow   — 1.4h ago, success (1 error in 48h = the already-fixed exec 28370)
[PASS] Retry Scheduler      — 1.0h ago, 54.7s duration
[PASS] End Of Call          — active, 0 errors
[PASS] Orphan Sweep         — 1.6h ago, success
[PASS] Heartbeat Monitor    — active
[PASS] Connection integrity — no broken keys in any workflow

GOOGLE SHEETS (510 leads)
[PASS] No stuck calling >2h · no stale retries >7d · no empty statuses · no active duplicate lead_ids
       (after repairs below)

RETELL / SCRAPER
[PASS] API accessible; calendar-api active, 61 tasks, 338MB
[PASS] Cache-first working — 16 hits, 0 stale fallthroughs, EG test 0.5s from cache

FOUND & FIXED THIS CHECK: phantom-attempt incident (details below)
```

**The incident:** Amanda and Jaclyn showed `exhausted` (4 attempts) — but Retell shows **Amanda was never called, ever**, and Jaclyn only once. Three bugs compounded:

1. **Pickering was Sonamation-migrated but never added to the calendar config** — its scrape failed on every tick, so its three leads requeued forever, making every batch a partial failure. *(Fixed: Pickering added with its facility GUID; its cache now serves 22 slots.)*
2. **Partial failures break the scheduler's positional merge** — KB and slots streams misalign, the dial node errors with "Multiple matches found" onto a disconnected output, and the lead's attempt is already burned. My cache-first change exposed this latent bug (before it, successes were always a batch prefix, so positions aligned by accident). Filed as **lead-reactivation#67** with fix options — this needs a proper design pass.
3. **The 8/21 stagger never actually landed** — my temp sheet-proxy script had an empty-body bug, and Google returns success (`updatedRange`) even when writing nothing. Lesson burned into memory: *always re-read after a Sheets write.*

**Repairs (all read-back verified):** seven rows reset to Retell ground truth — Amanda→0 attempts, Jaclyn→1, Brianna→1 (was stuck `calling` at 4), Jennifer→2, Shannon/aliyah/Ashley→0 — all `retry_pending` and eligible at the **16:06 ET tick**, which should now dial the whole batch cleanly since every outbound centre is cached. A monitor is watching that tick and will report the calls. Also confirmed **no bogus "exhausted" emails** went to you or Shauna — the sweep exhausts silently.

Memory is written; I'll commit and push everything together with the tick outcome when the monitor reports in a few minutes.

🗣️ Poseidon: Green across the board now — but the check caught the scheduler quietly burning real leads' attempts on calls it never made; seven leads restored and dialing momentarily.

</details>
