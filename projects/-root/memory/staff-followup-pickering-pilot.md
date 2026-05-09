---
name: Staff Follow-Up notification — Pickering pilot deployed 2026-05-08
description: New EOC branch fires email to centre when AI promises staff outreach. Pickering only for now; mirror to other 9 agents once validated.
type: project
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# Staff Follow-Up notification — Pickering pilot

Deployed 2026-05-08 to address the silent-drop bug surfaced by Viji Ruban's case (mom with 6yo Junior + 9yo Create — AI promised staff would reach out about the 6yo, no workflow node honored it).

**What shipped:**
- Pickering agent `agent_9d24e87943bc3b8105261bf308` — added 3 fields to `post_call_analysis_data`: `staff_followup_needed` (bool), `staff_followup_reason` (string enum), `staff_followup_summary` (string). Total 14 fields.
- EOC workflow `4p1V0wESn3kZySt6` — added IF node "Staff Follow-Up Needed?" + Gmail node "Send Staff Follow-Up Email" branched off `Fetch Lead Details main[0]` parallel to `Call Sucessful?`. Total 50 nodes.

**Why this design:**
- No prompt edit needed — Retell post-call analysis classifies from transcript using the field descriptions. No customer-facing language change, no Cekura regression risk.
- Branch runs in parallel to booking branch so cases like Viji's (booked tour + secondary handoff) get both notifications.
- IF defaults false on missing field, so pre-deploy call payloads don't trigger spurious emails.

**Reasons enumerated:** `junior_program`, `out_of_age`, `non_create_program`, `kb_gap`, `pricing_question`, `callback_requested`, `no_slot_match`, `ai_rejection`, `bad_connection`, `wrong_location`, `other`. Same set covers all 11 deflection paths in the current CNKB outbound prompt.

**How to apply:**
- Watch for the first real Pickering "STAFF FOLLOW-UP NEEDED" emails to validate classification accuracy and Sharmila signals the email is useful.
- If validated, roll the same schema + workflow pattern to the other 9 outbound CNKB agents (Leaside, Burlington, St. Catharines, Sudbury, EG outbound, Riverside, Sandtoft? — confirm full list).
- ClickUp creation IS now wired (added 2026-05-09 after Scott flagged the gap). Two new nodes downstream of Send Staff Follow-Up Email: `Format Staff Follow-Up Task` (Code, builds taskName + markdown desc + tags) → `Create Staff Follow-Up Task` (HTTP POST to ClickUp API). Hardcoded to EG Inbound list `901113422190` for pilot; per-centre routing needed before cross-centre rollout. Tags: `staff_followup` + reason classifier (e.g., `junior_program`). Mirrors inbound EOC ClickUp pattern.
- Backup files: `/root/n8n-fixes-2026-05-08/pickering_agent.before.json`, `eoc.fix1deployed.json`.
