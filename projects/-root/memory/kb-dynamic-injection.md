---
name: KB Dynamic Injection (Outbound Agents)
description: How per-centre KB content gets injected into CNKB outbound agent prompts at call time via n8n + Google Docs. Critical for understanding pricing/policy sourcing in outbound calls.
type: project
originSessionId: f6e70775-c6c4-4dd9-b988-f6e377f4f0b5
---
# KB Dynamic Injection for CNKB Outbound Agents

## The Fact
CNKB outbound agents (Leaside, Canton, Pickering, Rayford, Round Rock, Stone Oak, Burlington, Riverside, Sudbury, St. Catharines, East Gwillimbury) have `knowledge_base_ids: []` in their Retell LLM config — **NO KB is attached statically**. The `{{knowledge_base}}` template variable is populated at call-initiation time via `retell_llm_dynamic_variables` in the Retell API payload.

## Why
Each centre has its own pricing, hours, and policies. Rather than maintain 10 separate Retell KBs, the content lives in per-centre Google Docs, referenced from the Centre Lookup Sheet.

## How to apply
- When auditing CNKB outbound call content (pricing, hours, staff, policies), DO NOT conclude the agent is hallucinating just because Retell shows `knowledge_base_ids: []`. Check the n8n flow first.
- When Scott reports a suspected hallucination, the source of truth is the Google Doc KB for that centre — pulled via the `knowledge_base` column in Centre Lookup Sheet `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`.

## Flow (Outbound Call Flow - Multicentre, `6sPwo7ngPyTWfmwM`)
1. **Gmail Trigger** catches CORE Inquiry email with plus-addressing (e.g., `+ma-canton@`)
2. **Extract Centre** parses centre_id from the `to` header
3. **Lookup Centre** (Google Sheets node) → reads row from Centre Lookup Sheet. Row has: centre_id, agent_id, from_number, location_name, **knowledge_base** (Google Docs URL), enabled flag, etc.
4. **Get KB** (Google Docs node) → `operation: get`, `documentURL: {{ $json.knowledge_base }}`. Pulls full doc content.
5. **Retell: Call Prospect** (HTTP node) → POSTs to `https://api.retellai.com/v2/create-phone-call` with:
   ```json
   "retell_llm_dynamic_variables": {
     "knowledge_base": "<full text of the centre's Google Doc>",
     "first_name": "...",
     "LOCATION_NAME": "...",
     "PHONE": "...",
     "SLOTS": "..."
   }
   ```
6. Retell substitutes `{{knowledge_base}}`, `{{SLOTS}}`, etc. into the LLM prompt at call time.

## Also used by
- Retry Scheduler (`rt0aEuDnFv3ZCl1y`) — same injection for retry calls (attempts 2-4)
- Inbound Pre-Call - EG webhook — serves `{{SLOTS}}` live for inbound EG agent (EG inbound uses the statically-attached `knowledge_base_5144c616b2046679` "Website" KB, not the dynamic doc pattern — different architecture for inbound)

## Implication for Troubleshooting
- **Wrong pricing in a call?** → Edit the centre's Google Doc (linked in Centre Lookup Sheet's `knowledge_base` column), NOT the Retell LLM prompt.
- **Pricing CRITICAL FAILURE guard in prompt** (`ONLY quote prices found VERBATIM in {{knowledge_base}}`) works correctly — the variable is populated with the full doc at runtime.
- **EG Inbound agent** is different — it uses the statically-attached Retell KB (`knowledge_base_5144c616b2046679`), not dynamic doc injection. Inbound can't pre-resolve the centre the way outbound does.
