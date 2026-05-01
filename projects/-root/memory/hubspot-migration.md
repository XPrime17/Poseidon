---
name: CN HubSpot Migration (replaces LineLeader)
description: Code Ninjas HQ is migrating system-wide from LineLeader to HubSpot. Pilot end of May 2026, full rollout June/July 2026. Invalidates the CORE Gmail-trigger pattern.
type: project
originSessionId: 98503b1c-3232-43c6-8835-5536553e83e7
---
Code Ninjas HQ contracted SonaMation (HubSpot Elite implementation partner) to migrate every centre from LineLeader to HubSpot. Announced 2026-04-23 Townhall.

**Timeline:**
- End of May 2026: pilot cohort live, 10 corporate-owned centres first
- June / July 2026: system-wide rollout, sequenced to avoid summer-camp disruption
- Owners pay $0 — HQ absorbs implementation + partner cost
- MyStudio direct POS connection included
- Lead history, family records, phone numbers all migrate

**Why:** This invalidates the LineLeader/CORE Gmail-trigger pipeline TourForce uses today. Outbound Call Flow's Gmail trigger watching `scott.james1717@gmail.com` for "New CORE Inquiry" subjects breaks per-centre at HubSpot cutover. Vinsi's claimed HubSpot integration is also now materially relevant — they can pitch "we plug into your new CRM" during the migration window when owners are most receptive to new tooling.

**How to apply:**
- Treat any Gmail-trigger / CORE-inbox proposal as deprecated. New lead-source path is HubSpot webhook → n8n → existing Outbound Call Flow.
- Build/spike the HubSpot↔n8n bridge BEFORE end-of-May pilot. Demo artifact = HubSpot contact.creation event triggering a Retell call end-to-end.
- Reach out to SonaMation to land on franchise-approved-integrations list.
- Surfaces unaffected: Retell webhooks, retry pipeline, KB injection, KB crawler, Skyvern booking, ClickUp tasks, EG inbound. Only the lead-ingestion edge changes.
- When centres start switching, flip their lead source from Gmail-watch to HubSpot-webhook one-by-one (gradual cutover possible).
- Pricing/positioning: emphasize "TourForce keeps working through the HubSpot swap" — owners overloaded by migration won't want a second new vendor.
