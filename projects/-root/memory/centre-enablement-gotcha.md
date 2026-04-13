---
name: Lookup Centre Transient Error Bug (FIXED 2026-04-13)
description: Transient Google Sheets errors on Lookup Centre used to send BOTH "Centre not found" AND "Not Enabled" emails and silently drop the lead. Fixed with Centre Found? guard IF node + retry bump (5 tries × 5s). Historical reference.
type: project
originSessionId: 9c353dfb-ec8d-4776-bb48-f722080f769c
---
**Status: FIXED 2026-04-13.** Keep as reference for incident archaeology and for the "temp-workflow replay" pattern lessons.

**Historical bug:**
On 2026-04-13 1:17 PM EDT, Cindy Correia's Canton CORE lead hit a Google Sheets transient error on Lookup Centre. Despite retryOnFail=3 × 1s, all retries failed. Node `onError: continueErrorOutput` sent error to output 1 (→ "Centre not found" email) AND passed an empty `{}` on output 0 (→ Enabled? saw undefined → "Not Enabled" email). Lead was dropped silently (not appended to Leads MasterSheet, no Retell call).

**Fix applied 2026-04-13 22:34 UTC:**
1. Lookup Centre `maxTries` 3 → 5, `waitBetweenTries` 1000 → 5000ms (total ~25s vs 4s).
2. New IF node `Centre Found?` between Lookup Centre main[0] and Enabled? — checks `{{ $json.centre_id }}` is not empty. True → Enabled? path. False → silent drop (prevents empty-object fan-out when onError fires).

**Recovery pattern for future drops:**
- n8n's `/executions/{id}/retry` returns 400 "execution succeeded" when `onError: continueErrorOutput` was set, because the node "continued" instead of erroring out. Can't use standard retry.
- Re-injecting via temp email has a gotcha: **Gmail does not set `delivered-to` header on same-account sends**. Extract Centre parses only `delivered-to`, so a temp workflow sending from scott.james1717@gmail.com TO scott.james1717+ma-canton@gmail.com fails at Lookup Centre with "Cannot read properties of null". For real CORE emails (external sender) this isn't an issue.
- Cleanest recovery: fire Retell API directly with the agent's dynamic variables. Fetch SLOTS from calendar-api (`POST http://138.197.171.204:5001/extract-calendar`) with `calendar_url` and `location_id`. Apply Format Slots logic client-side.
- Don't forget to also manually append the lead to Leads MasterSheet if you want the Retry Scheduler to pick up subsequent attempts — otherwise End Of Call will emit "Semaphore Not Found" on appendOrUpdate and no retry will fire.

**Lead recovered but user_declined:**
Cindy's replay (call_9a035483b0e91937b5c96562c40) got `user_declined` at 0ms on attempt 1 — phone spam-filtered or rejected. No transcript. Cindy was then appended to Leads MasterSheet with `status=retry_pending`, `next_call_after=2026-04-14T09:00:00-04:00`, `attempt_count=1` so Retry Scheduler handles attempt 2.

**Temp schedule-trigger double-fire is safe for `appendOrUpdate`:**
When using the temp-workflow pattern (Schedule Trigger every minute → Google Sheets appendOrUpdate), deactivation always races the next fire. In Cindy's append, the workflow fired twice (executions 16429, 16430) before I could deactivate. Because `matchingColumns: ["lead_id"]` keyed on a unique lead_id, the second fire *updated* the already-created row instead of appending a duplicate. No-op result. Lesson: unique-key appendOrUpdate is idempotent under double-fire; you can activate, wait ~75s, deactivate, without worrying about row duplication. Only risky case: writes without a matching-columns key (pure append), which WILL duplicate on double-fire.
