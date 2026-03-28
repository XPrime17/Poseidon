---
name: Retry over completed for unknown disconnections
description: When a call ends for unclear reasons, default to retry_pending not completed — many fallback scenarios deserve another attempt
type: feedback
---

For voice AI call outcomes with ambiguous or fallback disconnect reasons (`user_hangup`, `error_*`, `machine_detected`, etc.), always default to `retry_pending` rather than `completed`.

**Why:** `completed` permanently abandons the lead. Many fallback scenarios — accidental hangups, bad connections, system errors — mean the person was never properly reached or was cut off mid-conversation. The retry pipeline's attempt cap (>=4 → exhausted) naturally handles leads that truly can't be reached.

**How to apply:** When adding new call outcome routing or modifying disconnect reason handling, ask: "did a real conversation happen where the person expressed clear intent?" If no → retry. If yes but unclear → retry. Only mark `completed` when there's positive evidence of resolution (tour booked, explicit "not interested" via decline_reason).
