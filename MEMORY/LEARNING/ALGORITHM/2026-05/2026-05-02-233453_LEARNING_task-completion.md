---
capture_type: LEARNING
timestamp: 2026-05-02 23:34:53 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-05-02
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

## 🧠 LEARN

The bug wasn't the UI or the limit — it was a **type mismatch hiding in plain sight**: `extractOutcome` checked for the string `'true'` while Retell sent boolean `true`. Every booking was silently mis-bucketed as `completed` since 2026-04-29 (when extractOutcome was first written). Analytics summary was reporting 2 because it pulled the DB historical `call_analytics` table — not Retell — and that table had stale aggregates.

**Pattern to watch:** when external API responses include booleans or numbers, NEVER do bare `=== 'true'` string comparisons. Always normalize the truthy check (`=== true || === 'true' || === 'yes' || === 1`).

🗣️ **Poseidon:** Tours Booked went from empty to **110 rows**, Scott. Root cause was `appointment_booked` boolean vs string mismatch — every booking the agent ever closed was mislabeled as "completed". Commit `0de8c62`. The structured Contact/Tour Date columns are sparse for some agents because field names vary across centres — want me to add fallbacks (`First Name`, `first_name`, `firstName`) so those columns populate cleanly next?

</details>
