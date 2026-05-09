---
name: ClickUp task assignees must be the centre director, not Scott
description: For non-EG centres, staff-followup ClickUp tasks must assign to the centre director's ClickUp guest user_id (keyed off their personal non-codeninjas.com email), not to Scott's account.
type: feedback
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# ClickUp assignee = centre director, not Scott

For any voice-AI workflow that creates ClickUp tasks scoped to a specific centre (staff-followup, manual booking needed, no booking requested, etc.), the task `assignees` array must point at **the centre's director**, not Scott's account.

**Why:** Scott's centre is EG; tasks for EG correctly assign to him (user_ids `[81534293, 87407960]`). For Pickering, Leaside, Burlington, etc., the responsible human is the centre director (Sharmila, Shauna, etc.), and Scott shouldn't be in the loop on every centre's operational tasks.

**How to apply:**
- The director joins ClickUp as a guest using their **personal (non-codeninjas.com) email** — this is the existing ClickUp guest pattern (per `clickup-multicentre.md` memo, "guest email MUST be non-codeninjas.com").
- Once they accept the guest invite, capture their numeric ClickUp `user_id`.
- Store the user_id (and their personal email) in the Centre Lookup sheet — propose new columns: `director_personal_email`, `clickup_user_id`, `clickup_list_id`.
- In any task-creation node, look up the centre's row by `centre_id` and use `clickup_user_id` as the assignee.
- For EG specifically, current assignees `[81534293, 87407960]` stay (Scott + admin).
- Fallback if `clickup_user_id` is missing: create the task unassigned (still better than misassigning to Scott).

**Surfaced 2026-05-09** when shipping the EG staff-followup ClickUp task pilot. Currently the Create Staff Follow-Up Task node hardcodes Scott's assignees, which only works for EG. Cross-centre rollout requires this fix first.

**SHIPPED 2026-05-09**: Centre Lookup sheet now has 3 new columns — `director_personal_email`, `clickup_user_ids` (comma-separated), `clickup_list_id`. EG row populated. Staff-followup branch in EOC workflow `4p1V0wESn3kZySt6` now reads them via new `Lookup Centre SF` node + a `Has ClickUp Config?` guard IF that skips task creation when `clickup_list_id` is blank. Email still fires regardless (fallback to scott.james when centre_email blank). Verified end-to-end via exec 18461 → ClickUp task `868jjqyax`. Ready for cross-centre rollout once director emails / user_ids / list_ids are collected.

**Sheets API gotcha**: writing comma-separated user_ids via `valueInputOption=USER_ENTERED` coerces to a single number (e.g. `81534293,87407960` → `8,153,429,387,407,960`). Always use `valueInputOption=RAW` for comma-separated string values.
