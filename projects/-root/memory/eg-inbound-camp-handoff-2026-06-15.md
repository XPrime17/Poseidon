---
name: eg-inbound-camp-handoff-2026-06-15
description: EG-Inbound camp-lead quality fixes — prompt patch + EOC triage fix shipped 2026-06-15
metadata: 
  node_type: memory
  type: project
  originSessionId: 1a67023f-0c20-4946-b9ff-54ae4799cbad
---

A 3-day call audit (2026-06-09→12) surfaced one real lead on EG-Inbound: a 344s summer-camp registration call (`call_302fa8…`, caller +19059558240) that ended on inactivity, captured as **"Unknown Caller"**.

**Key correction (don't repeat the wrong framing):** the lead was **NOT dropped**. The inbound EOC workflow `3oV7SpPKWmr3xJlQ` ("Inbound End Of Call - Multicentre") routes on **`appointment_booked`**, NOT `staff_followup_needed` — that field isn't even in the inbound post-call schema. Any non-booked real call (not junk/spam/test) hits `Create ClickUp Task` + `Email: Message for Staff`. So the centre got a task with the phone number; the defect was lead *quality* (no name) + a voice info-dump.

**Why:** the agent recited all 10 camp weeks aloud, then the caller went silent before the name was collected; and `handled_by_agent=true` made the ClickUp card read "handled" so a director would skip an unconverted camp lead that still needs an enrollment call.

**Shipped 2026-06-15:**
1. **Prompt patch** to EG-Inbound LLM `llm_6d77f36696f6fbfad97d03fa5ef8` (Non-Create Q&A): grab caller name up front on camp/enrollment intent; **cap spoken lists at 3**; for "full list" requests give a one-line highlight then **offer to email** the schedule. Script `/root/eg-inbound-camp-handoff-patch.ts` (idempotent, sentinel "Long-list rule (CRITICAL)"). Backup: `kb-crawler/llm-prompt-backups/2026-06-15-eg-inbound-camp-handoff/`.
2. **Option A EOC triage fix** (one-node edit, `Format ClickUp Task`): `needsFollowup = !rawHandled || (call_type==='new_lead' && appointment_booked!=='true')`; `handledByAgent = !needsFollowup`. Unbooked new_lead now reads **"No – needs follow-up"** + populates the Action Required block, all centres. Script `/root/deploy-triage-fix.py` (sentinel "Option A triage fix (2026-06-15)"). Live backup: `/root/wf-backups-2026-06-15/3oV7SpPKWmr3xJlQ.json`. Regression gate PASS.

**How to apply:** source [[deploy-env-sourcing]] before running the n8n script. Deferred (Scott's call): editing the `handled_by_agent` analysis-schema description (Option B) was rejected in favor of the deterministic workflow fix. Related: [[staff-followup-promise-dropped]], [[inbound-eoc-percentre-routing-fix]], [[feedback-agents-book-tours-only]].
