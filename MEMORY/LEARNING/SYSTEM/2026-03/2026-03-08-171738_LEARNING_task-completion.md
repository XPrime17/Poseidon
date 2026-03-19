---
capture_type: LEARNING
timestamp: 2026-03-08 17:17:38 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-03-08
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

**5/5 ISC criteria passed.**

━━━ 📚 LEARN ━━━ 7/7

- n8n Merge node with `mode: "combine"` defaults to `combineByFields` which requires matching fields config. Always set `combineBy: "combineByPosition"` explicitly.
- n8n webhook with `responseMode: "lastNode"` conflicts with explicit Respond to Webhook nodes — use one or the other, never both.
- When `appendOrUpdate` schema has a field with `removed: true`, it won't be written. Must set `removed: false` for any field you want to update.

🗣️ **Poseidon:** Both fixes done, Scott. The Merge node crash is fixed (`combineByPosition` set), and all 4 stuck leads are unstuck. Gerald just got his retry call placed — `call_f9cc27079a6bb6dc35381a8ae8c` went through at 17:15 UTC. The 3 test leads are cleaned up as `exhausted`. The Retry Scheduler is running clean every 15 minutes with no errors.

</details>
