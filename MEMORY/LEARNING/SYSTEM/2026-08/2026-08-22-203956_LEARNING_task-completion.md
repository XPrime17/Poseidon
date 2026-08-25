---
capture_type: LEARNING
timestamp: 2026-08-22 20:39:56 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

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

**VERIFY/LEARN — Pickering inbound is provisioned and verified.** ✅

## What shipped

1. **Centre Lookup fixed first:** Pickering's `inbound_number` (F3) was empty — backfilled with the outbound DID `16479516675` per the single-number model.
2. **Agent cloned from the EG golden source:** `CNKB-Pickering-Inbound` (`agent_eac2f0557671b9d15543a02a79`), inheriting the double-greeting fix and begin-message delay. Webhook posts directly to the inbound end-of-call workflow (standard non-EG pattern).
3. **Phone wired:** +1 647-951-6675 now answers inbound with the new agent; PHONE_TO_CENTRE registry updated; KB injection smoke-tested (2,747 chars of Pickering KB returned).
4. **Clone-leak caught and fixed:** exactly as with Barrhaven, the cloned `get_tour_slots` still pointed at EG's endpoint. Repointed to `/retell/get-slots/pickering` — and Pickering's Sonamation slot feed was already wired up (its GUID landed in calendar_api earlier today), so it's now serving 22 real Pickering slots, verified distinct from EG's.
5. **Bonus fix — the gate itself had a hole:** the slot-routing check *passed* the contaminated first run because it only failed on generic URLs, and its distinct-from-EG check skipped when the wrongly-routed centre *was* EG. I patched C1 to derive the expected centre from the agent name and fail on mismatch, then re-ran fleet-wide: **all 7 inbound agents PASS**. This is the third onboard where the clone-leak recurred — worth adding the repoint to `provision-inbound.ts` itself at some point.

## Before Sharmila flips forwarding

1. **You test-dial +1 647-951-6675** — confirm the Pickering greeting and ask for tour times (should offer Wed/Thu evenings + Sat 11 AM).
2. **Chat-Dash:** assign `CNKB-Pickering-Inbound` to Sharmila's client (the visibility gap from earlier — her dashboard should show the service she's paying for).
3. **Sharmila:** gives 30-day notice on the $169 receptionist and sets forwarding on her Pickering landline → the DID.
4. **After forwarding is live:** add `pickering-on-ca` to `LIVE_INBOUND_CENTRE_IDS` in PipelineRegressionCheck — noting that list currently only has EG + St. Catharines, so Leaside/Burlington/Kanata are missing from that regression gate too (separate cleanup).

All of this is recorded in memory (`pickering-inbound-provisioned-2026-08-22.md`).

🗣️ **Poseidon:** Pickering inbound is live-ready, Scott — one number, agent bound, real Sonamation slots verified, and the gate that let the EG leak through last time can't anymore. Give it a test dial, then it's Sharmila's forwarding call.

</details>
