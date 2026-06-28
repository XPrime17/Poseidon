---
name: audit-tour-info-key-casing-2026-06-28
description: "Daily-audit \"no tour info\" / \"Booking missing fields\" was a false positive from snake_case vs Title Case key mismatch"
metadata: 
  node_type: memory
  type: project
  originSessionId: eac4b168-9bd1-450f-a05d-008a38796696
---

2026-06-28: Scott flagged `call_3f6d8c7d41fb8cd0d110c66e68a` (CNKB-Pickering outbound, agent_9d24e87943bc3b8105261bf308) as "didn't have tour info" per the daily audit. **It was a real, complete booking** (child Chestnut 6&10, tour Thursday July 9 @ 5PM, `appointment_booked=true`, call_successful) — NOT a drop.

Root cause: the audit's "Booking missing fields" check (`/root/daily-call-audit/audit.py:284`) keyed on snake_case `("child_age","tour_date","tour_time")`, but the Retell post-call schema emits those three under **Title Case** names: `Child's Age`, `Tour Date`, `Tour Time`. So `cad.get("tour_date")` was always None → every booked call got a false MEDIUM "Booking missing fields" flag (fleet-wide, not Pickering-specific).

Why Title Case is correct (not the agent's fault): the n8n outbound EOC reads `custom_analysis_data["Tour Date"]` / `["Tour Time"]` / `["Child's Age"]` / `["Child First Name"]` via bracket notation across ALL EOC workflows — so Title Case IS the fleet standard and the Skyvern booking flows fine. Only the audit was out of sync. The other audit checks (`appointment_booked`, `decline_reason`, `staff_followup_needed`) work because those fields genuinely ARE snake_case in the schema.

Fix: changed line 284 to `("Child's Age","Tour Date","Tour Time")`. Verified — flagged call now clean; a genuine empty Tour Date still flags. Relates to [[retell-enum-two-side-gotcha]] (post-call schema field names matter downstream) and [[daily-call-audit-droplet]].

**How to apply:** when an audit field check disagrees with reality, dump the ACTUAL `custom_analysis_data` keys (mixed casing in CN schema: identity/booking fields are Title Case `Child First Name`/`Child's Age`/`Tour Date`/`Tour Time`; everything else snake_case) and confirm against what n8n reads before assuming a pipeline drop.
