---
capture_type: LEARNING
timestamp: 2026-03-09 02:34:25 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-03-09
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

The filter is intentionally permissive with past-due dates — which is actually the right default behavior. A past-due lead *should* be called at the next available calling window. The risk is more about accumulation: if the system was broken for days, a burst of past-due leads could all fire at once.

---

🗣️ **Poseidon:** Scott, the answer is: **past-due leads get called — that's by design, and it works fine.**

Here's the trace:

```
Filter Eligible:  nextCallTime > now → FAILS (past is NOT > now)
                  → lead PASSES the filter ✅ (it's eligible)
                  
Calling Hours:    hour >= 9 AND hour < 20 in centre timezone
                  → If YES: call is placed
                  → If NO:  dead end, lead stays retry_pending, 
                            picked up again next tick
```

**The good news:** A lead due yesterday simply gets called at the next available calling window. No special handling needed — the `>` comparison naturally treats all past dates as eligible.

**The risk to be aware of:** There's no rate limiting or staleness cutoff. If the schema bug had persisted for days and multiple leads accumulated past-due `next_call_after` timestamps, they'd **all fire simultaneously** the moment the system was fixed and hit a calling window. That burst just happened to not occur because the fix went in overnight (outside calling hours).

</details>
