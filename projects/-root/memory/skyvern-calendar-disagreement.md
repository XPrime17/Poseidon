---
name: Skyvern vs scrape-API calendar disagreement (not a staleness bug)
description: When Skyvern terminates because a slot is "missing", it's a disagreement between two CRM views, not a stale-data problem. Don't ship a fresh-scrape fix.
type: project
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# Skyvern vs scrape-API calendar disagreement

When Skyvern returns `status=terminated` with reason "the only available slot is at X PM, no Y PM slot for this date", the instinct is to ship a "refresh slots before dial" fix. **Don't.** That fix is already in production:

- Retry Scheduler `rt0aEuDnFv3ZCl1y` has `Get KB`, `Get Availability`, `Format Slots`, `Merge KB + Slots` wired between `Update Lead Pre-Call` and `Retell: Retry Call`
- The dial node's body reads `"SLOTS": "{{ $json.slots_text || 'No availability data' }}"` — sourced exclusively from Format Slots, no cache path
- Sandra Truong's call (call_b1eba91080f572eaf991b17be92, retry exec 17816) confirmed: Get Availability scraped at 13:00:42 UTC for 16s, dial fired 18s later — fully fresh

**Why:** The two ChildcareCRM views disagree by minutes. The public scrape endpoint (`https://www.codeninjas.com/{centre_id}/schedule-tour`) and the booking-form view Skyvern automates can show different availability — possibly cache TTL drift, possibly mid-flight reservation holds. Even with a 0-second-old scrape, Skyvern can land in a calendar state where the slot the AI just promised is gone.

**How to apply:**
- If a Skyvern `terminated`/`failed` lands the same minute as a fresh scrape that DID show the slot, don't blame staleness — it's the two-source disagreement.
- The right protective fix is the centre-notification email (shipped 2026-05-08 in `4p1V0wESn3kZySt6` Switch1 outputs 2 + 3 → "Send Manual Booking Needed").
- Future hardening that WOULD help: have Skyvern's first action be re-querying availability and writing it back as the dynamic_variables for the next call. But that's a multi-day rebuild, not a quick fix.
