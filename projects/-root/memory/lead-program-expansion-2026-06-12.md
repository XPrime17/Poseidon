---
name: lead-program-expansion-2026-06-12
description: "Outbound pipeline expanded from Create-only to Create+Junior+Camp — subject classifier, lead_program dynamic var, program-aware Stage 1 on all 7 outbound LLMs"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0102d5a3-1122-4106-8599-442881c95519
---

Scott 2026-06-12: centres now forward **ALL LineLeader traffic** (no subject filter); pipeline has the smarts.

## Subject → lead_program mapping (LineLeader, until HubSpot)
- `New CORE Inquiry` → **create** (the Create-form subject is CORE!)
- `New JUNIOR Program Inquiry` → **junior** (matcher also accepts JR)
- `New Inquiry for <centre>` → **camp**
- anything else → `is_lead=false` → "Non-Lead Dropped" NoOp (visible in execution log, no email)
- All three contain "Inquiry" → Gmail trigger q widened `subject:New CORE Inquiry` → `subject:Inquiry`

## Plumbing
- Intake `6sPwo7ngPyTWfmwM`: Extract Centre → **Classify Lead** (code) → **Legit Lead?** (IF) → Lookup Centre. lead_program flows to "Append row in sheet" (Leads MasterSheet col **Z** `lead_program` — added to header AND node schema) and to `Retell: Call Prospect` dynamic vars.
- Retry `rt0aEuDnFv3ZCl1y`: `Retell: Retry Call` sends `lead_program` from the sheet row (`Filter Eligible`), `|| 'unknown'` for pre-expansion rows.
- Workflow backups: `/root/wf-backups-2026-06-12-leadprogram-{intake,retry}.json`

## Prompt rev (all 7 outbound LLMs: source-EG + 5 SyncPrompt clones + StCath in-place)
- `# Context` gains: `Inquiry form: {{lead_program}}` — explicitly "a HINT, not truth; parents often fill the wrong form"
- Stage 1 opens with the variant matching lead_program (junior/camp confirm THAT program; create/unknown/**unsubstituted-literal** falls through to the old generic question — safe for Cekura/manual calls with no dynamic var)
- Routing unchanged: answer decides — Create → Stage 2; junior/camp/other → Non-Create Q&A mode (KB loop → staff follow-up → ClickUp); Booking gate Create-only + pre-camp visit exception preserved
- Backups: `/root/kb-crawler/llm-prompt-backups/2026-06-12-lead-program/` (StCath LLM is `llm_5b4dbab1bf6dcc5007c61c2726ff`)

## Centre-side rollout (OPEN)
- onboarding email template updated (commit `1b063ba`) for new centres
- **EXISTING centres still filter on "New CORE Program Inquiry"** — each centre's Outlook rule / Power Automate flow needs the subject condition removed before junior/camp leads flow. Until then they only send Create leads (which still work).

## Verification (synthetic JUNIOR leads, Burlington testing mode)
- ✅ subject→classifier→sheet col Z→call dynamic var: `lead_program=junior` on all 3 test calls
- ✅ routing-on-answer: Scott said "Create" → full Create flow + booking (call_e002d07854df)
- ✅ anti-hallucination guard added to Sanitize & Validate (`not_in_source`): triggered by accidental garbage-body test where the AI extractor echoed its own prompt-example phone (832-434-3862) — without the guard that would dial a stranger on a real junk email
- ⚠️ Junior Stage-1 opener used the GENERIC variant on first live test → fixed by inlining `{{lead_program}}` at the Stage-1 decision point (all 7 LLMs); NOT yet re-verified live (retest call hit "I'm busy" → callback flow). First real junior lead / next test call will confirm.
- 🔴 **Burlington outbound EOC chain is DEAD** — both test calls produced NO EOC execution. Burlington + Kanata ChatDash agents exist (webhooks appeared 2026-06-12) but the ChatDash forwarding URL (step 5) isn't set → events die in ChatDash. Scott to set forwarding URL to the n8n EOC webhook in ChatDash UI for both. GO-LIVE BLOCKER.

## Watch items
- Junior/camp email **body** layouts may differ from CORE — Regex Extract is generic (email+phone+name-line) with AI fallback + Sanitization Failed email as backstop; check first real junior/camp leads.
- Same parent filling two forms = two lead rows (lead_id = First-phone collides — appends twice). Pre-existing dedup gap, now likelier. 
- HubSpot migration will replace the Gmail trigger entirely ([[hubspot-migration]]).

Related: [[kanata-burlington-onboarding-2026-06-12]], [[cnkb-qaloop-rev-2026-05-23]], [[cnkb-precamp-tour-rev-2026-06-09]]
