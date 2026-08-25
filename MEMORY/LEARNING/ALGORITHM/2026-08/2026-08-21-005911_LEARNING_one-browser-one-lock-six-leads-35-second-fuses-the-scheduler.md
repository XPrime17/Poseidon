---
capture_type: LEARNING
timestamp: 2026-08-21 00:59:11 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: One browser, one lock, six leads, 35-second fuses — the scheduler starves itself while a fresh cache sits right next to it; say go and I'll switch it over.

**Date:** 2026-08-21
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

**THINK/ANSWER — the scrape-lock bottleneck, from the ground up:**

**The mechanics.** When the retry scheduler wakes up (every 90 minutes) and decides a lead is ready to dial, it first fetches that centre's live tour availability so the agent can offer real slots. That fetch — the `Get Availability` node — calls the calendar API's *live scrape* endpoint, which drives a headless browser through the booking calendar and takes ~33 seconds. Because two simultaneous browser scrapes used to deadlock the droplet (the June 16 incident), the calendar API holds a **global lock: exactly one scrape runs at a time**, and everyone else queues behind it.

**The collision.** The n8n node has a 35-second timeout (added June 29 so a stuck scrape can't kill the whole execution). Now picture one scheduler tick with six eligible leads: lead #1's scrape takes ~33s and just squeaks in; lead #2 spent those 33 seconds waiting for the lock, so its own 35-second window is nearly gone before its scrape even starts — timeout; leads #3–6 same, worse. The graceful-requeue branch catches each timeout and puts the lead back as `retry_pending` with no attempt burned. Net effect: **the scheduler can dial roughly one lead per 90-minute tick, no matter how many are waiting.** Last night was the textbook case: 6:30pm tick — six eligible, zero dialed; 7:06pm tick — one dialed (Jennifer), five requeued.

**Why it's surfacing now.** Two things converged. First, HubSpot went live across the centres, so lead volume is genuinely up. Second — and this is the structural part — the retry cadence *synchronizes* leads: attempts 2/3/4 are all scheduled for 6:30pm ET, so retries pile onto the same tick by design. We've actually met this beast before: the June CORE backfill of 21 leads collapsed for exactly this reason, and the recovery had to be hand-throttled at ~20-minute spacing. What was a backfill edge case then is becoming a Tuesday-evening normal now.

**Why it matters beyond slowness.** Each failed pass increments the lead's `scrape_retries` counter, and at 5 the lead is ejected to `manual_review` with an alert. So under sustained contention, a real customer can fall out of automation entirely — not because we couldn't reach *them*, but because we couldn't reach the *calendar*. That's the cliff I staggered the five stuck leads away from last night (Amanda 9:30, Jaclyn 11:00, Breanne 12:30, Shannon 2:00, aliyah 3:30 today).

**The irony, and the fix.** While those scrapes were timing out, the calendar API's `/health` showed a slots cache for every centre that was *seconds* old — a background refresher keeps it warm (~10-minute cycle, and the Sonamation-migrated centres refresh via a fast JSON API, no browser at all). The inbound agents already serve slots from this cache. The scheduler is the only consumer still insisting on a fresh live scrape per lead:

1. **Recommended: point the scheduler's `Get Availability` at the cache** — instant, lock-free, batch size stops mattering. Trade-off is slots up to ~10 minutes stale, meaning a rare offer of a just-taken slot — but inbound already lives with this, and the Skyvern booking step verifies and falls to manual review if a booking actually fails.
2. **Optional complement: jitter the retry cadence** — have the EOC schedule retries at 6:30pm *plus a random 0–60 minutes*, so batches stop synchronizing even before they hit the calendar.

What I'd avoid: allowing parallel scrapes (that's the deadlock we fixed in June) or wait-node serialization inside the scheduler (keeps the 33s cost and adds complexity).

Nothing changed yet — option 1 (plus 2 if you like) is ready to spec and ship on your word. Meanwhile the stagger covers today's queue, with Amanda's 9:30 dial as the live proof.

🗣️ Poseidon: One browser, one lock, six leads, 35-second fuses — the scheduler starves itself while a fresh cache sits right next to it; say go and I'll switch it over.

</details>
