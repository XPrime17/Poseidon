---
name: feedback-reread-before-manual-write
description: "MANDATORY check — re-read live state immediately before any hand-write repair (sheet row, n8n node, Retell config); never write from state read earlier in the conversation"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 00b89bc0-52ac-48bd-8472-6d5b161e679a
---

Before ANY manual state repair — a MasterSheet cell, an n8n node, a Retell agent/LLM config — re-fetch the target's CURRENT state in the same breath as the write, and re-verify the premise of the fix still holds. Never write a value computed from state read earlier in the conversation, even minutes earlier.

**Why:** 2026-08-31 near-miss (Scott: "let's definitely save that check"). I repaired Smruti's `attempt_count` 1→0 from a row read ~21 hours earlier; between turns the scheduler had dialed her twice and EOC had set the counter to 3. My write clobbered it to 0, which would have re-opened a fresh 4-call ladder on a real parent. Caught in 4 minutes only because the post-write re-read showed an unrelated field (`next_call_after`) had shifted. Live pipelines mutate state continuously; wall-clock time can jump between conversation turns without any visible signal. Conversation state ≠ live state. See [[offhours-attempt-burn-2026-08-30]].

**How to apply:**
1. **Pre-write:** re-read the exact target (row, node, config) immediately before composing the write. If any field differs from what the plan assumed — especially timestamps or status — STOP and re-derive the correct value from ground truth (Retell call log, n8n executions) before writing.
2. **Post-write:** re-read again and verify BOTH the field you changed AND that neighbouring fields still match the pre-write read (a neighbour that moved = concurrent writer → investigate).
3. Applies doubly when resuming after any idle gap, `/clear`, or session recall — treat all previously-read state as expired.

Related lessons, same family: [[scheduler-pairing-phantom-attempts-2026-08-22]] ("ALWAYS re-read after Sheets writes" — broken proxy no-oped writes silently) and [[feedback-clickup-backfill-not-junk]] (read a task body before deleting). Together: read before write, read after write, read before delete.
