---
capture_type: LEARNING
timestamp: 2026-08-31 02:17:39 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-08-31
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

**✅ VERIFY / 📊 LEARN**

Scott — the alert itself is benign, but chasing it surfaced a real fleet-wide bug. TLDR:

## The alert: no action needed

- **Same person, same centre.** There's exactly one row for her — Pickering row 540 (`Smruti-6475174593`, smruti28@gmail.com). The "duplicate" was the HubSpot/LineLeader dual-write echo arriving 3 minutes later (exec 31191), and the Dedupe Judge correctly dropped it. No centre mismatch — both copies ingested as `pickering-on-ca`, so the Zap's To: address is fine.
- **`retry_pending` = after-hours gate, not a stuck lead.** Her lead arrived at 9:18 PM ET Saturday (exec 31188), past calling hours, so the pipeline routed her through `After Hours? → Update Lead - Off Hours` with `next_call_after = 9:00 AM Monday`. The retry scheduler's eligibility filter matches her on every check, and its ticks run on a fixed 90-minute grid — **she'll be dialed at ~10:06 AM ET tomorrow (Mon 8/31)**, inside calling hours. Nothing to do.

## The bug I found while verifying: after-hours leads silently lose an attempt

Her row reads `attempt_count=1`, but Retell shows **zero calls ever placed to her number**. The pipeline writes `status=calling, attempt_count=1` at dial-prep, *before* the after-hours check — and the Off Hours branch flips her to `retry_pending` without resetting the counter. The scrape-timeout requeue path in the same scheduler explicitly decrements the counter to un-burn the attempt; the Off Hours path never got that treatment.

Consequences for **every lead that arrives after hours, fleet-wide**:
- Their first real call is logged as attempt 2 (`attempt_1_at`/`attempt_1_outcome` stay empty forever), so Smruti's first-ever call tomorrow will leave the attempt-2 "following up" voicemail if she doesn't answer.
- They get a maximum of **3 real calls instead of 4** before the scheduler's `attempts >= 4` cap treats them as done.

This is the same symptom class as the 8/22 Pickering phantom-attempts incident (attempts recorded without calls), via a different mechanism. The fix is one expression on `Update Lead - Off Hours` in `6sPwo7ngPyTWfmwM`: decrement `attempt_count` exactly like the `Requeue - Scrape Timeout` node does. I have **not** shipped it — it's a fleet-wide prod edit you didn't ask for, so I'm flagging it for your call. If you want it before Smruti's 10 AM dial (so her calls number correctly from attempt 1), say the word and I'll deploy with the usual backup + gate. Everything above is saved to memory (`offhours-attempt-burn-2026-08-30`).

🗣️ **Poseidon:** The alert was a benign echo — but Smruti's "attempt 1" never rang a phone, and that's a one-line fix away from costing after-hours leads a real call.

</details>
