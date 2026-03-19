---
capture_type: LEARNING
timestamp: 2026-03-12 21:06:31 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-03-12
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

━━━ 📚 LEARN ━━━ 7/7

- n8n `appendOrUpdate` with `defineBelow` mode: columns in schema with `removed: false` but no `value` entry may write empty strings, **blanking existing data**. Always ensure every `removed: false` schema entry has a corresponding value.
- The `Set Tour True/False` nodes had `CRM Confirm` exposed with no value — potential silent data loss vector.

---

🗣️ Scott, here's what I found and fixed across all 3 workflows:

**Root cause:** The Outbound "Append row" node was only writing 7 of the 16 columns — `testing`, `status`, `attempt_count`, and `last_call_at` were all marked `removed: true` in the schema. Plus the End Of Call retry/completed nodes had `attempt_count` in the schema but no value expression, which could blank it out.

**6 patches applied (all live):**

| Workflow | Node | Fix |
|----------|------|-----|
| Outbound | Append row | Now writes `testing`, `status=calling`, `attempt_count=1`, `last_call_at` |
| End Of Call | Update Lead - Retry | Now writes `attempt_count` from Calculate Next Call |
| End Of Call | Update Lead - Completed | Now preserves `attempt_count` from existing row |
| End Of Call | Set Tour True | Marked `CRM Confirm` as removed (was silently at risk of blanking) |
| End Of Call | Set Tour False | Same CRM Confirm fix |

All 3 workflows confirmed still active. Next lead that comes in will have all columns populated from the start.

</details>
