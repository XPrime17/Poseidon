---
name: EOC workflow doesn't plumb centre_email; emails hardcode Scott
description: All 4 EOC notification nodes either hardcode scott.james@codeninjas.com or reference an undefined centre_email. Cross-centre rollout needs a Lookup Centre wiring fix.
type: project
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# EOC notification emails don't route to centres — RESOLVED (verified 2026-08-14)

> **UPDATE 2026-08-14:** This is fixed in the live workflow. All outbound EOC `4p1V0wESn3kZySt6` email nodes now reference `centre_email` (via `Resolve Email` / `Lookup Centre SF` / `Fetch Lead Details` / `Format Email Data`) with Scott fallbacks where applicable; only booking Confirmed/Failed/Invalid remain intentionally Scott-only. Verified by pulling both EOC workflows live. Historical detail below kept for context. See [[centre-email-cc-comma-separated-2026-08-14]].

The End Of Call workflow `4p1V0wESn3kZySt6` has 4 notification email nodes:
- `Send Completed Email1` — hardcoded `scott.james@codeninjas.com`
- `Failed1` — hardcoded `scott.james@codeninjas.com`
- `Send Manual Booking Needed` (added 2026-05-08 Fix 1) — references `$('Fetch Lead Details').item.json.centre_email` (undefined; would error on first real fire)
- `Send Staff Follow-Up Email` (added 2026-05-08 pilot) — hardcoded `scott.james@codeninjas.com` (matches existing pattern)

`Fetch Lead Details` reads from the Leads MasterSheet, which has columns through `last_call_at` but **NOT centre_email**. Centre_email lives in the separate Centre Lookup sheet keyed by `centre_id`.

**Why noticed:** Pickering staff-followup pilot test 2026-05-08. The IF branch fired correctly, but `Send Staff Follow-Up Email` errored because `$('Fetch Lead Details').item.json.centre_email` was undefined. Same bug pattern in `Send Manual Booking Needed` — it would have errored when first fired in production.

**How to fix properly:** Add a `Lookup Centre` Google Sheets node (reading Centre Lookup `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`, sheet `All Centres`, lookup column `centre_id` matching `Fetch Lead Details.centre_id`) BEFORE the email branch. Then change all 4 emails' sendTo to `={{ $('Lookup Centre').item.json.centre_email }}`. Also pre-requisite for rolling staff-followup pilot to other centres.

**Why this matters:** today every notification email lands in Scott's inbox regardless of which centre's call generated it. Sandra's "Manual Booking Needed" email would have hit Scott, not Sharmila. Cross-centre rollout (Leaside, Burlington, etc.) must fix this first or operators won't get their alerts.
