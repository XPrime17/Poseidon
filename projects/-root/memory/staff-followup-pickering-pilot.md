---
name: Staff Follow-Up notification — rolled out beyond Pickering (2026-05-31)
description: EOC branch fires email + (if configured) ClickUp task when AI promises staff outreach. Schema now on all 6 outbound CNKB agents; ClickUp branch generic and centre-gated.
type: project
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# Staff Follow-Up notification

Originally deployed 2026-05-08 (Pickering only) to address Viji Ruban's silent-drop bug. **Expanded 2026-05-31** to all 6 active outbound CNKB agents, with a generic ClickUp branch gated on Centre Lookup config.

## Current architecture (post 2026-05-31)

**Post-call schema (on all 6 outbound agents — verified 2026-05-31):**
- EG (`agent_0c6c32b6…`), StCath (`agent_c02bfb40…`), Pickering (`agent_9d24e879…`), Riverside (`agent_ee11bcfc…`), Burlington (`agent_075f92a8…`), Leaside (`agent_1f8c2799…`)
- All 14 total fields with `staff_followup_needed` (bool), `staff_followup_reason` (string enum), `staff_followup_summary` (string)

**Reasons enumerated (current):** `junior_program` (ages 5-7), `out_of_age`, `non_create_program`, `kb_gap`, `pricing_question`, `callback_requested`, `no_slot_match`, `ai_rejection`, `bad_connection`, `wrong_location`, **`email_info_request`** (added 2026-05-31 — parent asked to receive info via email), `other`.

**EOC workflow `4p1V0wESn3kZySt6` branch:**
```
Staff Follow-Up Needed? (IF) → Lookup Centre SF (GoogleSheets)
  → Send Staff Follow-Up Email (Gmail to centre_email)
  → Format Staff Follow-Up Task (Code, builds taskName + markdown desc + tags, sets hasClickUpConfig flag from lookup row)
  → Has ClickUp Config? (IF on hasClickUpConfig)
    → Create Staff Follow-Up Task (HTTP POST api.clickup.com/api/v2/list/{listId}/task)
```

**ClickUp gating logic:** The `Format Staff Follow-Up Task` Code node reads `clickup_list_id` + `clickup_user_ids` from the Centre Lookup row and sets `hasClickUpConfig=true` only if BOTH are populated. The `Has ClickUp Config?` IF gates on that flag. So:
- Email always fires (to centre_email)
- ClickUp task only fires for centres with both lookup fields set

## Centre ClickUp readiness (as of 2026-05-31)

| Centre | clickup_list_id | clickup_user_ids | ClickUp fires? |
|---|---|---|---|
| St. Catharines | 901113834370 | 87436757 | YES |
| EG | empty (hardcoded in EG-Inbound only) | empty | NO via this branch |
| Pickering | empty | empty | NO (email only) |
| Leaside | empty | empty | NO (email only) |
| Riverside | empty | empty | NO (email only) |
| Burlington | empty | empty | NO (email only) |

**To enable ClickUp for a centre:** populate `clickup_list_id` + `clickup_user_ids` columns in Centre Lookup sheet `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`. No workflow change needed.

## How to apply
- When auditing dropped follow-ups, check both the Gmail send AND the ClickUp branch — they're separate observables.
- When onboarding a new centre to ClickUp, just populate the two lookup columns. The workflow auto-discovers.
- For new staff_followup reasons, update the field description in ALL 6 agents (use `/tmp/update_pcad.py` pattern from 2026-05-31 — fetches current pcad, replaces staff_followup_* fields, PATCHes).

## Memory now superseded
This memory replaces the original "Pickering-only" framing. Memory `[[staff-followup-promise-dropped]]` documents the original Viji Ruban bug that motivated the pilot. See also [[email-info-request-rev-2026-05-31]].
