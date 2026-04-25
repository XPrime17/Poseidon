---
name: Leaside Inbound Setup
description: Leaside inbound voice AI agent — provisioned 2026-04-23, pending Sharmilla activation
type: project
originSessionId: 242ca7bf-6798-48ba-9c6d-f6afcc42ba90
---
## Leaside Inbound — PROVISIONED 2026-04-23, pending activation

### Key Numbers
- **Rogers landline:** (416) 546-3114 (Sharmilla's centre phone)
- **Forwarding destination:** `+1 (647) 496-3276` (Twilio, Toronto)
  - Twilio subaccount: [REDACTED — see 1Password "Twilio Leaside subaccount SID"]
  - Phone SID: [REDACTED — see 1Password "Twilio Leaside Phone SID"]
  - SIP trunk: `leaside-cnkb.pstn.twilio.com` (existing, shared with outbound)
  - SIP auth: `leaside` / [REDACTED — see 1Password "Twilio Leaside SIP password"]
- **Retell agent:** `agent_50a754cd5b9ba4ec988c764427` (CNKB-Leaside-Inbound)
- **Retell LLM:** `llm_cfedf58fd1274e15835042d8b6c8`
- **Slots endpoint:** `POST /retell/get-slots/leaside`

### Architecture
- Cloned from EG Inbound pattern
- Prompt: EG Inbound prompt with s/East Gwillimbury/Leaside/
- get_tour_slots function → `/retell/get-slots/leaside` (cached)
- No pre-call webhook (instant answer)
- KB: currently using EG's KB (knowledge_base_5144c616b2046679) — needs Leaside-specific KB

### Pending Items
- **Sharmilla blocked on activation 2026-04-25:** Reported busy signal on multiple star codes. Diagnosis: Call Forwarding feature not provisioned on her Rogers Home Phone plan. **Action:** she must call Rogers Business 1-888-764-3771 to enable "Call Forwarding (Variable)" on (416) 546-3114. After provisioning: `*72` + `6474963276` (no leading `1`), hold ≥5 sec, listen for 2 beeps. Deactivate: `*73`. Source: https://www.rogers.com/support/home-phone/call-forwarding. Alternative path: MyRogers online portal (rogers.com sign-in) on plans that support web-based forwarding setup. (Earlier note said `*92` — that's a Bell code, doesn't exist on Rogers; corrected.)
- **Leaside KB:** needs Leaside-specific content (PA days, birthdays Sat 3-5, camps, events page)
- **Calendar scraper:** Leaside schedule-tour page uses different widget than EG (`.fc-view-container` not found). Scraper needs adaptation. Agent falls back to callback flow until fixed.
- **ClickUp folder:** Leaside Inbound folder/list not yet created. Need to set up per clickup-multicentre.md pattern.
- **Post-call workflow:** Currently no End Of Call workflow wired for Leaside inbound. Needs n8n webhook + ClickUp + email routing.
- **Pickering clarification:** Sharmilla says she "already has one running" at Pickering. Need to understand what it is.
