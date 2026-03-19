---
capture_type: LEARNING
timestamp: 2026-03-19 01:30:08 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-03-19
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

**Root cause:** The Outbound Call Flow writes the lead to the sheet (`status=calling`, `last_call_at=now`) **before** the `After Hours?` check. When the check blocks the call, the lead is orphaned at `calling` forever.

**Fix applied:** Added `Update Lead - Off Hours` node after the off-hours email. It sets:
- `status` → `retry_pending`
- `next_call_after` → 9 AM next day in centre timezone

The Retry Scheduler picks it up during the next business hours window.

**Retry Scheduler is fine** — its `Within Calling Hours?` check runs before the Pre-Call write, so no orphan risk on that path.

**Dummy101** fixed: set to `retry_pending` with `next_call_after = 2026-03-19T09:00 EDT`. It'll get called tomorrow morning.

**Schema update rule now covers 9 write nodes** (added Update Lead - Off Hours to the Outbound workflow).

Let me save this to memory.

</details>
