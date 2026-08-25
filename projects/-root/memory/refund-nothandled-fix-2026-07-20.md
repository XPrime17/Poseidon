---
name: refund-nothandled-fix-2026-07-20
description: "Refund/billing inbound calls forced to \"needs follow-up\" so staff never skip the callback"
metadata: 
  node_type: memory
  type: project
  originSessionId: d5c67067-03ae-4624-ad18-71262d68f1d2
---

ClickUp 868kebbvy (call_b50b5228dbd7a26f32ac6356b53, CNKB-EG-Inbound, caller +12895003998): a refund/billing caller was correctly deflected (agent took number + summary for the refund team) but the analysis LLM set `handled_by_agent=true` → task rendered "Handled by Agent: Yes" → staff (Jenn Christie) asked "It says handled by agent. Do I still call?". Scott: "ensure it never says handled by agent for a refund request."

**Fix (deployed 2026-07-20, fleet-wide):** inbound EOC `3oV7SpPKWmr3xJlQ` node **Format ClickUp Task**. Added `STAFF_ONLY_TYPES = ['billing_question']` into the existing `needsFollowup` gate — a billing_question can never be actioned by the AI (message-only), so it ALWAYS reads "No - needs follow-up" + Action Required block regardless of the LLM's `handled_by_agent`. Extends the [[open-followups-2026-06-10]]-era Option A new_lead triage gate.

- Deploy script: `/root/deploy-refund-nothandled-2026-07-20.py` (exact-string edit, sentinel "Refund/billing fix (2026-07-20"). Backup: `/root/n8n-backups/refund-nothandled-2026-07-20/3oV7SpPKWmr3xJlQ.json`.
- Verified: this call flips to "No - needs follow-up"; booked/handled general_question & new_lead stay "Yes".
- Extend the list if other never-self-serviceable types appear (complaint, etc.).
- Scott asked Jenn to give the caller a quick call (sounded near-prank) — that callback is staff-side, not mine.
