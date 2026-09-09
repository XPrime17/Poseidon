---
name: eoc-email-consolidation-2026-09-09
description: Outbound EOC email consolidation — NB email gated off when Staff FU fires; ClickUp task now created BEFORE staff email so link lands in body
metadata: 
  node_type: memory
  type: project
  originSessionId: cfc31496-3c8e-463a-bc29-745acd1d89c9
---

Scott reported (2026-09-09) both "No Booking Requested" and "STAFF FOLLOW-UP NEEDED" emails arriving for the same call, and no ClickUp task links in them.

**Root causes** (outbound EOC `4p1V0wESn3kZySt6`):
1. `Fetch Lead Details` fans out to TWO parallel branches — outcome branch (→ NB email) and staff-FU branch. A no-booking call with `staff_followup_needed=true` sent both (proven: exec 34382, 9/7 23:10).
2. Staff-FU branch order was Email → Format Task → Create Task, and the email body NEVER had a task link (checked backups to June — it's not a regression from the [[eoc-rownumber-refactor]] session). The links Scott remembered are from the INBOUND EOC `3oV7SpPKWmr3xJlQ`, which creates the task first and embeds `$('Create ClickUp Task').json.url`.

**Shipped 2026-09-09** (backup `/root/n8n-backups/eoc-email-consolidation-2026-09-09/`):
- Staff branch reordered to Lookup Centre SF → Format → Has ClickUp Config? → Create Task → Email; email now embeds `$json.url` (ClickUp link) with fallback text, `onError: continueRegularOutput` on Create Task so ClickUp outage can't kill the email. Refs switched `.item` → `.first()` (email now runs after code nodes).
- Staff email is now a strict superset of NB: transcript appended.
- New IF `Staff FU Covers This?` (sticky-wrapped) in front of `No Booking Requested1`, fed by BOTH feeders (`Lookup Centre` from Set Tour False path + `Lookup Centre NB`); suppresses NB email when `staff_followup_needed=true`, fail-open (absent/false → NB sends as before).
- Wiring post-verified live, PipelineRegressionCheck PASS 0 warnings.

**OPEN:** confirm next real staff-followup call renders the ClickUp link + single email. NB-only calls create no ClickUp task by design (only inbound + staff-FU paths create tasks) — so NB emails legitimately have no link.

**Gotcha:** _N8N skill registry stale — lists `pWDLwPlySBQ4WpCn` as prod EOC; the ACTIVE outbound EOC is `4p1V0wESn3kZySt6` (name still "[TEST] End Of Call - Retry System").
