---
capture_type: LEARNING
timestamp: 2026-05-09 22:25:39 UTC
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

## 🧠 LEARN
**Same "buried instruction" pattern as the outbound bugs we fixed today** — three different prompts, three different surfaces, same failure mode: a sub-step says "skip" or "wait" but a higher-level instruction (here: `BEFORE SPEAKING, call the function`) overrides it. Pattern: when adding a function-call step to a numbered procedure, put the explicit WAIT *between* the question step and the function-call step, and remove any "BEFORE SPEAKING" override that contradicts the question step.

Worth saving as part of the existing `feedback-prompt-buried-instructions-fail.md` memory — I'll append a third example (function-call timing) to that file next iteration.

🗣️ **Poseidon**: *Three wins this turn: transcript pulled, no-pause bug rooted out and patched on EG-Inbound, and the ChatDash chain proven live end-to-end (your call hit Retell, fanned through ChatDash, reached n8n, executed both call_started and call_analyzed runs successfully). Inbound proxy chain is operational.*

</details>
