---
name: Email Info Request rev shipped to 6 outbound CNKB clones (2026-05-31)
description: Parents asking "can you email me this?" now route to centre via Staff Follow-Up branch with reason=email_info_request, instead of being deflected to booking.
type: project
originSessionId: 2026-05-31-weekly-review
---
# Email Info Request rev (2026-05-31)

## Why
Weekly call audit (May 24-30) surfaced a single but recurring prompt gap: when parents asked for info via email on the call (Leaside Thu 5/29 — *"Is it possible to get this in an email?"*), the agent pivoted to *"You'll get details in your confirmation email once we book a tour"* instead of honoring the request. This made the agent feel evasive and used email-info as a booking carrot.

## What shipped
Three-layer change across all 6 active outbound CNKB clones (EG, StCath, Pickering, Riverside, Burlington, Leaside):

**1. Prompt insert (+941 chars per LLM)** — new section `## Handling Email Info Requests` placed between Handling Callback Requests and Non-Create Program Interest Q&A mode. Key rules:
- Honor the email request — never deflect to booking
- Trust the lead form email — don't ask on the call
- Acknowledge with "I'll have someone from our team email you the details about [topic]"
- Set `staff_followup_needed=true`, `reason='email_info_request'`, summary captures topic
- If parent ALSO wants Create, continue to tour offer afterward (email handoff doesn't replace tour)

**2. Post-call schema baseline** — backfilled the 3 `staff_followup_*` fields to 4 agents that didn't have them (StCath, Riverside, Burlington, Leaside — were stuck at the original 11-field schema; pilot had only baselined EG + Pickering). All 6 now at 14 fields. Reason enum extended to include `email_info_request`. Junior age range corrected from 5-6 → 5-7 in the reason description as a sweep-in fix.

**3. Audit rubric guard** — `daily-call-audit/audit.py` DECLINE_MISSED rule now explicitly says: "email me this" is a CHANNEL preference, not a decline. If agent acknowledges and promises staff email follow-up, that is CORRECT (do NOT flag).

## How it fires
1. Parent: "Can you email me the camp info?"
2. Agent (new): "Absolutely! I'll have someone from our team email you the details about summer camps. Anything else I can help with?"
3. Post-call extractor sets `staff_followup_needed=true`, `reason='email_info_request'`, `summary='Parent asked to receive summer camp info via email.'`
4. EOC workflow `4p1V0wESn3kZySt6` `Staff Follow-Up Needed?` IF takes true branch
5. `Send Staff Follow-Up Email` fires to `centre_email` from Centre Lookup (always)
6. If centre has `clickup_list_id` + `clickup_user_ids` populated → `Create Staff Follow-Up Task` fires to ClickUp (today: StCath only)

## No workflow changes were needed
The EOC ClickUp infrastructure (`Format Staff Follow-Up Task` → `Has ClickUp Config?` → `Create Staff Follow-Up Task`) was already wired and centre-gated by an earlier session — memory `[[staff-followup-pickering-pilot]]` was stale on this. Confirmed by reading live n8n nodes.

## Migration scripts (one-shot, kept as reference)
- `/tmp/update_pcad.py` — backfills/refreshes staff_followup_* fields across all 6 agents, idempotent
- `/tmp/update_llms.py` — inserts the new prompt section, anchored on `## Non-Create Program Interest (Q&A MODE)`, idempotent (skips if section already present)

## How to apply
- When auditing calls for the next week, watch for the new behavior on Leaside-style "email me" asks.
- If new outbound CNKB clones spin up, both the schema fields AND the prompt section must be propagated — use the scripts above as templates.
- For a centre to get ClickUp tasks (not just Gmail), populate `clickup_list_id` + `clickup_user_ids` in Centre Lookup. See [[staff-followup-pickering-pilot]] for the readiness table.
- Memory [[create-age-range]] also fixed the Junior age range in this sweep (5-6 → 5-7 in the reason description).
