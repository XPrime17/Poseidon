---
name: outbound-email-overhaul-2026-08-14
description: "Killed per-attempt \"Outcome unsuccessfull\" email, added centre name to outbound subjects (Shauna's multi-unit ask), and fixed 3 silent-drop email paths (Tentative Tour / No Booking / Manual Booking) that had 0 sends in 90d."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6470eefe-d06d-4d1a-a433-ea81ae78ab9d
---

# Outbound EOC email overhaul (2026-08-14)

Deployed to outbound EOC `4p1V0wESn3kZySt6` via `/root/deploy-outbound-email-subjects-2026-08-14.py`; backup `/root/n8n-backups/outbound-email-subjects-2026-08-14/4p1V0wESn3kZySt6.pre.json`. All 19 post-deploy checks PASS; workflow active.

**1. "Outcome unsuccessfull" email KILLED (Scott chose option a).** Node disabled (not deleted — n8n passes data through disabled nodes, chain intact). It fired per unsuccessful *attempt* (~35 sends/60d to Sharmila/Shauna/EG), redundant with retry system + Lead Exhausted email, blank Name, typo'd subject.

**2. Centre in subjects (Shauna's multi-unit ask).** Inbound emails already had `[<location> Inbound ...]`. Added `location_name` to outbound subjects: No Booking Requested1 (also gained lead name), Tentative Tour Alert, Send Manual Booking Needed, Send Staff Follow-Up Email. Lead Exhausted + Wrong Location Handoff already had centre context. Centre Lookup display-name column = `location_name`.

**3. SILENT-DROP CLUSTER FIXED — 3 outbound emails had never been sending.** Gmail search: 0 sends in 90d for "TENTATIVE TOUR", "No Booking Requested", "MANUAL BOOKING NEEDED". Cause: their `sendTo`/`$json.centre_email` referenced items that never carried centre fields (Leads MasterSheet has NO centre_email column — only `centre_id`; and no centre lookup upstream of `Tentative Tour Check` or `Switch1`). Fix mirrors proven `Lookup Centre SF` pattern: new nodes `Lookup Centre TT/NB/MB` (clones, `alwaysOutputData=true`) inserted TT-check[true]→Alert, TT-check[false]→No Booking, Switch1[2,3,4]→Manual Booking; `sendTo` falls back to Scott; Manual Booking's `$json.body.*` Skyvern refs repointed to `$('Wait on Skyvern Webhook1')` so the lookup doesn't clobber them. **This finally truly resolves [[eoc-centre-email-not-plumbed]]** (my 2026-08-14 morning "RESOLVED" note was premature for Send Manual Booking Needed).

**4. BCC Scott baseline** added to all 6 centre-bound nodes (was missing on every one).

**Gate:** `PipelineRegressionCheck.py` = FAIL, but on a **pre-existing unrelated item**: new centre `barrhaven-on-ca` (Barrhaven, Maurice, agent_78b3b359…, inbound 13432967200, Testing=TRUE, ClickUp lists 901114322298/9) has empty `clickup_user_ids` → inbound ClickUp tasks would be unassigned. Not caused by this deploy (Gmail-node-only change). OPEN: Scott to supply Maurice's ClickUp user ID; also WARN: Retell number 16474963276 has inbound agent bound but no sheet row.

**OPEN:** confirm first real send of each revived email renders correctly (esp. location_name + Skyvern fields in Manual Booking).
