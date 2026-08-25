---
name: inbound-eoc-notification-gaps-2026-07-24
description: Inbound EOC (3oV7SpPKWmr3xJlQ) notification architecture + 2 gaps (Cancel Task hardcoded to EG list; no BCC Scott)
metadata: 
  node_type: memory
  type: project
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

Inbound End-of-Call workflow **`3oV7SpPKWmr3xJlQ`** ("Inbound End Of Call - Multicentre", active). Routing: `Lookup Centre (Inbound)` matches the call's `to_number` against Centre Lookup `inbound_number`; `Detect Test Call` maps `_clickup_list_id = clickup_inbound_list_id`, `_clickup_user_ids = clickup_user_ids`, `_centre_email = centre_email`. `isTest = isNonCanadian || Cekura-persona-name` (NOT the sheet `Testing` column — that flag does not affect inbound routing).

**Per real inbound call:** `Create ClickUp Task` → `clickup_inbound_list_id`, assignees `clickup_user_ids`, due +2d, deduped via `Search Existing Task`.

**Emails to centre_email (Gmail):** `Email: Urgent Call` (urgent), `Email: Message for Staff` (message left), `Email: Booking Needs Manual` (ambiguous Skyvern status).
**Emails hardcoded to scott.james only (Resend):** Booking Confirmed / Booking Failed / Invalid Date — centre director does NOT receive these.

**GAP 1 — Cancel Task cross-centre bug:** `Create Cancel Task` URL was hardcoded to list **901113422190 (EG's inbound list)**, so a tour-cancellation call at ANY non-EG centre filed the cancel task on EG's board. ✅ FIXED 2026-07-24 → now `=…/list/{{ $('Detect Test Call').first().json._clickup_list_id }}/task` (EG unchanged since EG's `_clickup_list_id` IS 901113422190; fixes all other centres).
**GAP 2 — BCC Scott:** the correct Gmail field is top-level **`bccAddresses`** (typeVersion 2.1), NOT additionalFields.bccList — my first scan checked the wrong field. Reality: `Email: Urgent Call` and `Email: Message for Staff` ALREADY had `bccAddresses=scott.james@codeninjas.com`; only **`Email: Booking Needs Manual`** was blank. ✅ FIXED 2026-07-24 → all three now BCC Scott.

Deploy 2026-07-24: backup `/root/n8n-backups/inbound-eoc-notif-fix-2026-07-24/3oV7SpPKWmr3xJlQ.before.json`; PUT + re-activate; readback verified; **gate PASS**.
Also fixed a FALSE-FAIL in `PipelineRegressionCheck.py` (line 120): it filtered Retell numbers by deprecated singular `inbound_agent_id` (now null) → EG/StCath showed "not bound"; now accepts `inbound_agent_id OR inbound_agents[]` (both .claude + poseidon-repo copies). See [[retell-phone-weighted-agents-api]], [[inbound-agents-unpublished-normal]].

Surfaced 2026-07-24 answering "what notifications does Burlington have?" (Burlington row: centre_email shauna.chan@codeninjas.com, inbound list 901113931620, user 87436757). Related: [[single-number-model-fleetwide]], [[staff-followup-pickering-pilot]], [[feedback-bcc-scott-on-centre-emails]].
