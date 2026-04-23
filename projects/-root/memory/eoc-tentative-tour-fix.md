---
name: End-Of-Call — Tentative Tour branch (2026-04-22)
description: Workflow-level safety net added to End-Of-Call (4p1V0wESn3kZySt6). When the voice agent flags appointment_booked=false but the post-call analysis captured a tour_date and tour_time, the workflow now emails the centre director with an actionable subject instead of silently routing to the "No Booking Requested" path.
type: project
originSessionId: fb1283ef-1d84-48b4-865b-263821fdbd91
---
# End-Of-Call — Tentative Tour branch (2026-04-22)

**Workflow:** `4p1V0wESn3kZySt6` (`[TEST] End Of Call - Retry System`)

## Why this exists
`Appointment Requested1` IF node routes based solely on `appointment_booked`. When the voice agent deferred booking (e.g., parent withheld child name — Sean Walker call_57d1efa072574b9bd6e70152847 on 2026-04-20), Retell's post-call judge returned `appointment_booked:false` even though `Tour Date` ("April 30, 2026") and `Tour Time` ("6 PM") were captured in the analysis. The workflow's false-branch routed to the `No Booking Requested1` Gmail node — subject line "No Booking Requested" — so Sharmila (Pickering director) reasonably ignored it, leaving Sean in limbo.

**Why:** subject-line semantics matter — the original email asserted "no booking" even though there WAS a tentative one, so directors missed the ask. The tonight's Booking Autonomy prompt rev reduces how often this fires, but as a defense-in-depth measure the workflow should also emit an actionable subject when the data is there.

**How to apply:** When debugging "director didn't act on a known tour request," first check whether `appointment_booked=false` but tour_date+tour_time populated — this branch now handles that case, but older workflows in the fleet might not.

## What changed
Added two new nodes to the workflow:
- `Tentative Tour Check` (IF) — checks if `custom_analysis_data['Tour Date']` AND `['Tour Time']` are both populated (same conditions as existing `Tour Date & Time Exist` node, cloned)
- `Tentative Tour Alert` (Gmail) — sends to `centre_email` with **subject `TENTATIVE TOUR — needs booking confirmation — [First] [Last]`**. Body includes tentative date/time, parent contact, age, call summary, and full transcript.

Connection rewire:
```
Appointment Requested1 false branch
  → Tentative Tour Check
    ├── true  → Tentative Tour Alert  (NEW)
    └── false → No Booking Requested1 (unchanged)
```

Happy path (`appointment_booked=true` → Skyvern) is untouched.

## Node-count and audit keys
Workflow grew 45 → 47 nodes. To audit whether Tentative Tour Alert fired on a given execution:
```
GET /executions/:id?includeData=true
→ .data.resultData.runData | has("Tentative Tour Alert")
```
Returns true only if the tentative-tour branch fired (use the same pattern as `Sanitization Failed` from the Outbound Call Flow).

## Related
- [Sanitization fix 2026-04-21](sanitization-fix-2026-04-21.md) — different workflow (Outbound Call Flow), different root cause (Simple Memory poisoning)
- [CNKB Prompt Rev 2026-04-21](prompt-v2026-04-21.md) — prompt-side fixes that reduce how often tentative bookings occur
- [n8n API gotchas](n8n-api-gotchas.md) — PUT whitelist, credential-cloning pattern used here
