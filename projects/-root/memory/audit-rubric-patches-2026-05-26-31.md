---
name: Audit rubric patches shipped (2026-05-26 → 2026-05-31)
description: Three classes of false-positive squashed in daily-call-audit — junk-call filter, Create age-range sync, TOURS-only deflection scope. Audit now in line with canonical rubric memories.
type: project
originSessionId: 2026-05-31-weekly-review
---
# Audit rubric patches (2026-05-26 → 2026-05-31)

Repo: `/root/daily-call-audit/` branch `audit-improvements-2026-05-13`.

## Patch 1 (2026-05-26) — Junk-call filter recognition
**Symptom:** Saturday 5/23 fired HIGH `ClickUp task missing (workflow skipped create)` on EG-Inbound exec 19479. Workflow had correctly terminated at the `Drop Junk?` IF (1-second misdial, empty transcript), but audit didn't know that node existed.

**Fix:** Added `"junk_branch": "Drop Junk?"` to `INBOUND_WORKFLOWS[EG-Inbound]` and a third return value `"dropped_junk"` in `execution_call_status` mirroring the dedup-branch pattern. The existing `if status == "workflow_failed"` guard at the verdict loop naturally skips it.

**Note for future inbound centres (Leaside/StCath/Burlington):** they'll need their own `INBOUND_WORKFLOWS` block + `junk_branch` key when their EOC workflows wire up `Drop Junk?`. Comment at `audit.py:87` already flags this.

## Patch 2 (2026-05-31) — AGE_GATE_ERROR sync with canonical age range
**Symptom:** Friday 5/30 fired HIGH `LLM: AGE_GATE_ERROR` on EG outbound for the agent line "Create, for ages 8 to 14" — which is the CORRECT canonical range per Scott's 2026-05-23 update ([[create-age-range]]).

**Fix:** Updated LLM rubric in `audit.py:615-621`:
- Old: `Junior = 5-7, Create = 7-14, overlap at 7, both placements valid for age 7`
- New: `Junior = 5-7, Create = 8-14, no overlap, all 7-year-olds → Junior`
- Plus example: `Agent saying 'Create is for ages 8 to 14' or 'Junior is for ages 5 to 7' is CORRECT — never flag this.`
- Also updated the "What these Kinds mean" legend at `audit.py:745`.

## Patch 3 (2026-05-31) — TOURS-only deflection scope
**Symptom:** Friday 5/30 fired MEDIUM `Staff-deflection language` on Pickering for "Our team will reach out to" — but the conversation was about CAMP enrollment, which is correctly staff-routed per [[feedback-agents-book-tours-only]]. Booking Autonomy applies to tours only, not all conversations.

**Fix two-part:**
- **LLM rubric** at `audit.py:612-614` — STAFF_DEFLECTION now explicitly says "(OUTBOUND, TOUR-CONTEXT ONLY) ... Do NOT flag this on camp enrolment, party booking, class registration, pricing/discount asks, or any non-tour topic — those are correctly handed off to staff."
- **Keyword check** at `audit.py:502-524` — added `TOUR_INTENT_RE` regex (`tour|visit|come in|walk-through|see the centre|try a class|stop by|...`) and the deflection patterns now only fire if the full transcript contains tour-booking intent. Without that guard, "team will reach out" for camp inquiries was always a MEDIUM false-positive.

**Verified:** Tested patch against 3 actual transcripts from last week — Pickering camp (now CLEAN, was MED), EG end-of-call (still CLEAN, keyword didn't match anyway), positive control "I'd love to tour + team will reach out" (correctly FLAGGED).

## Patch 4 (2026-05-31) — DECLINE_MISSED tolerance for email asks
Added clarifying note to DECLINE_MISSED rubric: `"can you email this to me?" is a CHANNEL preference, not a decline — if the agent acknowledges and promises a staff email follow-up, that is CORRECT behavior (do NOT flag)`. Paired with the [[email-info-request-rev-2026-05-31]] prompt rev that makes agents actually honor these asks.

## Bottom line
After these 4 patches, the audit should be markedly quieter. Last week's 4 HIGH + 8 MED tally would have been ~1 HIGH (the Pickering voicemail-misdetect platform issue) + ~1 MED (Leaside DECLINE_MISSED, which itself becomes obsolete once the prompt rev is in effect).

## Operational pattern
When a prompt rev changes a canonical fact (ages, pricing, program names, booking rules), **also update `daily-call-audit/audit.py` rubric / severity caps in lockstep**. Stale audit rubric → loud false positives that bury real signal. Five-day delay between Scott's 2026-05-23 age-range update and the audit sync was the cause of all 4 HIGHs in the weekly review.
