---
name: BCC Scott on all centre-bound emails
description: Every Gmail/Resend node whose To/CC routes to a centre director must add bccAddresses=scott.james@codeninjas.com so Scott has visibility without owning the recipient. Skip Scott-only nodes (would dupe).
type: feedback
originSessionId: 9bbce18a-4923-46d2-9b2b-08b9388b4399
---
# BCC Scott on every centre-bound email

When any n8n email node — Gmail (`bccAddresses` field) or Resend HTTP (`bcc` in JSON body) — routes to a centre director (`centre_email`, `director_personal_email`, or any expression resolving to a non-Scott address), it MUST include Scott as BCC.

**Why:** Scott needs visibility into every operational email the voice AI pipeline sends to centres — booking confirmations, tentative-tour alerts, manual-booking-needed, staff follow-up, sanitization failures, off-hours notices, etc. Without BCC he loses the audit trail when sendTo migrates from Scott→centre.

**How to apply:**
- Audit baseline (2026-05-10): 9 nodes BCC'd across 2 cloud workflows.
  - `4p1V0wESn3kZySt6` (EOC): No Booking Requested1, Outcome unsuccessfull, Email: Wrong Location Handoff, Email: Lead Exhausted, Tentative Tour Alert, Send Manual Booking Needed, Send Staff Follow-Up Email
  - `6sPwo7ngPyTWfmwM` (Outbound): Sanitization Failed, Off Hours1
- **Skip Scott-only nodes** (BCC=Scott on a To=Scott message creates duplicates).
- **Skip hybrid To=Scott+centre nodes** like Outbound "Call Failed" — Scott is already in `to`.
- **Customer-bound emails** (Listen360 "Send Thank You Email" → parent) are NOT centre emails. No BCC.
- **Drive share notifications** (Drive - Share File workflow) use Google's native API — `bcc` isn't supported on `sendNotificationEmail`. Skip.
- **Inbound EOC EG** currently sends all 5 Resend emails to Scott only. When `centre_email` is plumbed (per `eoc-centre-email-not-plumbed.md`), add `"bcc": "scott.james@codeninjas.com"` to each JSON body at the same time.
- **Onboarding script** (`onboard-centre.ts`) sends both Resend emails to Scott only; no BCC needed.

**Future onboard-centre.ts emails:** if you add any direct-to-centre Resend call, include `"bcc": "scott.james@codeninjas.com"` in the JSON body.

**PUT gotcha encountered 2026-05-10:** Outbound Call Flow workflow had `description: null`; n8n API rejected PUT with `request/body/description must be string`. STRIP `description` from PUT body (already in n8n-api-gotchas memory — re-confirmed).
