---
capture_type: LEARNING
timestamp: 2026-06-24 23:59:29 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Heads-up, Scott — the burst tripped the batch bug I warned about. Nadine got her call, but the other 20 collapsed at Classify Lead and didn't dial. I've deactivated the one-shot so nothing double-fires. Want me to re-inject those 20 throttled right now so they go out tonight, or fix #61 first?

**Date:** 2026-06-24
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

🤖 PAI ALGORITHM (v0.2.23) ═════
   Task: Backfill fired — 1 of 21 dialed

📋 **SUMMARY:**

The backfill ran (exec `22020`, 19:29 ET) and **all 21 leads injected** — but only **1 actually got dialed**: **Nadine Gageiro** (East Gwillimbury, +1 289-687-6082), the lead that kicked this whole thing off.

The other **20 were dropped.** The 21-in-one-burst hit exactly the batch-collapse bug I flagged before firing (#61): the `Classify Lead` node only processes the *first* lead when a Gmail poll delivers several at once. So `Gmail Trigger=21 → Classify Lead=1 → 1 dial`. Those 20 are now read in the inbox and won't auto-retry.

What I locked down:
- ✅ Backfill **deactivated** — tomorrow's 6 PM cron can't double-fire
- ✅ Backup saved: `/root/n8n-backups/backfill-QdsKZXl5clf26jsd-20260624-232741.json`
- ✅ Recorded the realized #61 bug to memory

**Dropped 20** (need re-dialing): Pickering ×11, St. Catharines ×5, Leaside ×3, EG ×1 (Jasmine Punni).

**Your call — how do you want the 20 recovered?**
1. **Re-inject the 20 throttled now** (one every ~70s so each gets its own pipeline run; ~24 min, finishes ~8 PM ET — still in-window). Fastest path, gets them dialed tonight.
2. **Fix #61 first** (make Classify Lead + downstream run per-item via SplitInBatches), then re-inject as a burst safely. Cleaner, but it's real pipeline surgery + a regression-gate run before any sends.
3. **Hold** until tomorrow and I'll do (1) or (2) then.

🗣️ Poseidon: Heads-up, Scott — the burst tripped the batch bug I warned about. Nadine got her call, but the other 20 collapsed at Classify Lead and didn't dial. I've deactivated the one-shot so nothing double-fires. Want me to re-inject those 20 throttled right now so they go out tonight, or fix #61 first?

</details>
