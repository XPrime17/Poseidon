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

**EG phone-number determination (2026-07-26, from SonaMation module video):**
- HubSpot hostable/non-hostable applies to the centre's LOCAL number only. EG local = landline 905-478-1664 (Centre Lookup col centre_landline) — traditional business landline → treat as HOSTABLE; course action = submit the phone bill for 905-478-1664.
- GUARD: the Retell/Twilio DID 289-803-8797 must NEVER appear in HubSpot/SonaMation migration paperwork as EG's number — a hosted-SMS LOA or port request against it could disrupt the AI trunk. Only 905-478-1664 goes on forms.
- Hosted SMS is SMS-path only; the landline→Twilio→Retell voice forward is untouched (video confirms zero calling-side changes). Our stack sends no SMS from the landline → no conflict.
- The retiring LineLeader CRM texting number has zero references in our stack (not in Centre Lookup, prompts, or n8n).
- Real migration risk for EG remains lead ingestion: at EG cutover, LineLeader "New CORE Program Inquiry" emails stop → EG outbound starves until the HubSpot webhook→n8n bridge (or a format-compatible HubSpot email notification) is live. Get the EG cutover date from SonaMation.
- Terminology (SonaMation course): "hostable" = HubSpot's SMS provider takes over texting on the existing number, voice stays with carrier, zero downtime; "TBD" = unclassified until the phone bill upload identifies the provider. Action matrix: hostable → submit bill, TBD → submit bill, non-hostable → no upload but ~2 days texting downtime at cutover.

**EG migration status (as of 2026-07-26):**
- Staff explainer email DRAFTED+SENT to Scott's inbox for forwarding (Resend `d4521701-6398-4a1a-bf95-15efd0862c43`) — covers texting consolidation onto 905-478-1664, calling/AI unaffected, Twilio-number caution. Scott to fill cutover date before forwarding.
- OPEN: (1) Scott submits phone bill for 905-478-1664 in the SonaMation course module; (2) get EG cutover date → deadline for HubSpot→n8n lead bridge; (3) final LineLeader SMS blast to families before cutover ("text us at 905-478-1664").
