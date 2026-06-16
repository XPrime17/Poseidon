---
capture_type: LEARNING
timestamp: 2026-05-09 17:15:53 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-05-09
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

## ✅ EXECUTE — per-centre routing infrastructure live

### Centre Lookup sheet — 3 new columns added

| Column | EG row value |
|---|---|
| `director_personal_email` | *(blank — fill with your personal email when convenient)* |
| `clickup_user_ids` | `81534293,87407960` |
| `clickup_list_id` | `901113422190` |

Other centre rows are empty — they'll be populated as each director gets onboarded to ClickUp.

### Workflow — staff-followup branch now fully dynamic

```
Staff Follow-Up Needed? (true)
       ↓
Lookup Centre SF                ← reads Centre Lookup row by centre_id
       ↓
Send Staff Follow-Up Email      ← sendTo = centre_email || scott.james (fallback)
       ↓
Format Staff Follow-Up Task     ← derives listId + assignees from lookup
       ↓
Has ClickUp Config?             ← guard: skip ClickUp creation if list_id blank
       ↓ (true)
Create Staff Follow-Up Task     ← url + assignees pulled from Format output
```

54 nodes total. Workflow active.

### Verification — exec 18461 (replay end-to-end)

| Stage | Result |
|---|---|
| Lookup Centre SF | ✅ resolved EG: centre_email=`scott.james@codeninjas.com`, clickup_user_ids=`81534293,87407960`, clickup_list_id=`901113422190`, Director=`Scott James` |
| Send Staff Follow-Up Email | ✅ Gmail msg `19e0dba5fd973b4a` |
| Format Staff Follow-Up Task | ✅ derived `listId=901113422190`, `assignees=[81534293, 87407960]`, `hasClickUpConfig=true` |
| Has ClickUp Config? | ✅ TRUE branch fired |
| Create Staff Follow-Up Task | ✅ ClickUp task `868jjqyax` with assignees `[81534293, 87407960]` |

🔗 **New ClickUp task: https://app.clickup.com/t/868jjqyax**

### Fallback semantics for un-onboarded centres

- Missing `centre_email` → falls back to `scott.james@codeninjas.com` (you stay catch-all)
- Missing `clickup_list_id` → `Has ClickUp Config?` routes to dead-end output (skip task creation; email still fires)
- Missing `clickup_user_ids` → assignees becomes `[]` → ClickUp creates an unassigned task

So the workflow gracefully degrades for centres that haven't been onboarded yet. You can roll the schema + branch to other 9 outbound CNKB agents anytime; they'll send fallback-routed emails to you until each director is added to Centre Lookup.

### What's needed for cross-centre rollout

For each non-EG centre you want to activate:
1. **Director's personal email** (non-codeninjas) — stored in `director_personal_email`
2. **Add them as ClickUp guest** using that email
3. **Their numeric ClickUp user_id** (visible after they accept invite) — stored in `clickup_user_ids`
4. **A ClickUp list for that centre's tasks** — id stored in `clickup_list_id`

Once those four data points are in the Centre Lookup row, the routing works automatically.

## ✓ VERIFY

- ✅ Centre Lookup has 14 columns now (was 11), EG row populated correctly
- ✅ `clickup_user_ids` stored as text via `valueInputOption=RAW` (avoids comma-as-thousands-separator coercion bug)
- ✅ Lookup Centre SF node reads by `centre_id` matching Fetch Lead Details
- ✅ Fallback expression on email sendTo confirmed working
- ✅ Has ClickUp Config? guard prevents API call with empty list_id
- ✅ Replay produced new ClickUp task `868jjqyax` with correct EG assignees

## 🧠 LEARN

</details>
