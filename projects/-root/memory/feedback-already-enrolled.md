---
name: Already-enrolled calls are not bugs
description: Do not flag outbound calls where customer says "already signed up / already enrolled" as daily audit issues
type: feedback
originSessionId: e7b0ead3-1878-4cf3-aca1-c91a26cb0061
---
When an outbound CNKB agent calls a lead who says they've already signed up / already enrolled, do NOT flag this as a HIGH or MEDIUM issue in the daily call audit — even if the post-call analysis sets `appointment_booked: true` with empty Tour Date/Time fields.

**Why:** The business outcome is correct. The lead is enrolled, no retry is needed, and the End Of Call workflow correctly routes to completed via the `appointment_booked=true` → Set Tour True → completed path. Whether the `appointment_booked` flag is semantically "technically accurate" for a pre-existing enrollment is cosmetic. Scott corrected me on 2026-04-19 when I flagged a Pickering/Peter call (call_04675014591c2e6bd75224186da) as HIGH — his exact words: "I don't see a problem. Pickering Peter was called but he already signed up."

**How to apply:**
- In `_DAILYCALLAUDIT`, treat "already signed up / already enrolled / we just signed up" transcripts as successful terminations, not issues.
- If anything, note them under "Notable Calls" (Gmail trigger still picked up their inquiry even though they later enrolled) — not under Issues.
- Only flag something as an issue if it affects a retry loop, pipeline corruption, or a real missed booking. Business outcome first, field semantics second.
- The same principle applies to Rayford/Bruce-style "already signed up" responses.
