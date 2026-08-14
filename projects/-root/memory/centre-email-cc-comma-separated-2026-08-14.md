---
name: centre-email-cc-comma-separated-2026-08-14
description: "Shauna's extra-CC ask — decision is comma-separated addresses in the existing centre_email cell (no new column, zero workflow changes); verified all 10 Gmail nodes + 3 code nodes pass it through untouched."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6470eefe-d06d-4d1a-a433-ea81ae78ab9d
---

# Centre notification CC = comma-separated centre_email (2026-08-14)

Shauna requested additional CC recipients on centre-bound notification emails. Decision (recommended to Scott 2026-08-14): **put comma-separated addresses in the existing `centre_email` cell** in Centre Lookup — do NOT add a new CC column.

**Why (verified against live workflows 2026-08-14):**
- All 10 Gmail nodes across inbound EOC `3oV7SpPKWmr3xJlQ` (Urgent Call, Message for Staff, Booking Needs Manual) and outbound EOC `4p1V0wESn3kZySt6` (No Booking Requested1, Outcome unsuccessfull, Wrong Location Handoff, Lead Exhausted, Tentative Tour Alert, Send Manual Booking Needed, Send Staff Follow-Up Email) pass `centre_email` straight into Gmail `sendTo`.
- The 3 code nodes touching it (`Detect Test Call`, `Resolve Email`, `Format Email Data`) only `String(...).trim()`/forward it — zero equality checks or single-address assumptions.
- Gmail API To header natively accepts comma-separated lists → multi-address cell delivers to everyone with no deploy.
- A CC column would require editing all 10 nodes AND collide with `Wrong Location Handoff`, whose `ccList` is already used for the originating centre's email.

**Caveats:**
- Extra recipients land in the **To** line, not CC — delivery identical, header cosmetic. If Shauna insists on true CC semantics, that flips the decision to a `ccList` wiring across the 10 nodes.
- Cell format: `a@x.com, b@y.com` — commas only, no semicolons. Scott edits this column (Shauna's self-serve scope is greeting cols S/T only, [[percentre-greeting-spec-2026-08-11]]).
- Unaffected: ClickUp guest identity ([[email-columns-roles]] — `director_personal_email`), booking Confirmed/Failed/Invalid emails (hardcoded to Scott).

**Status: LIVE 2026-08-14.** Scott manually appended `, shauna.chan@codeninjas.com` to `centre_email` for **burlington-on-ca, st-catharines-on-ca, kanata-on-ca** (her 3 centres). Verified in-sheet same day: comma-separated, no semicolons, all other centres single-address. No workflow change was needed (as designed). OPEN: confirm Shauna receives the next real notification from one of those centres (duplicate delivery to centre inbox + her address).

Supersedes the "not plumbed" claim in [[eoc-centre-email-not-plumbed]] (now resolved — see that file's update note).
