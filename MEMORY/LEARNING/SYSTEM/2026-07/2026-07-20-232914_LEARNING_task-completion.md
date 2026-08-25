---
capture_type: LEARNING
timestamp: 2026-07-20 23:29:14 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-07-20
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

🤖 **PAI ALGORITHM** ═════════════

**👁️ OBSERVE** — ClickUp task `868kebbvy` on the CN inbound queue: *"[Billing Question] Unknown Caller — needs a refund."* The thread has the real signal:
- **Jenn Christie:** *"It says handled by agent. Do I still call?"*
- **You:** *"...I'll update it to ensure that it never says handled by agent for a refund request. Can you give them a quick call..."*

**🧠 THINK** — Pulled the source call `call_b50b5228…` (CNKB-EG-Inbound, caller +1 289-500-3998). The agent actually behaved **correctly** — a refund is staff territory, so it took the callback number + a summary to hand off. The bug is downstream: the post-call analysis LLM set `handled_by_agent: true`, which rendered **"Handled by Agent: Yes"** on the task — telling Jenn no callback was needed, when a refund *always* needs a human. The AI can never resolve a refund itself; it only takes a message.

**📋 PLAN** — Fix at the single fleet-wide choke point: inbound EOC `3oV7SpPKWmr3xJlQ` → **Format ClickUp Task** node (same node that already carries the 6/15 new_lead triage gate). Force billing/refund to "needs follow-up" deterministically, ignoring the LLM's guess.

**🔨 BUILD** — Extended the `needsFollowup` gate:
```js
const STAFF_ONLY_TYPES = ['billing_question'];
const needsFollowup = !rawHandled
  || STAFF_ONLY_TYPES.includes(callTypeRaw)
  || (callTypeRaw === 'new_lead' && appointment_booked !== 'true');
```
Deploy script `deploy-refund-nothandled-2026-07-20.py` (exact-string edit, live backup first).

**⚡ EXECUTE** — Dry-run matched, pushed live. `✅ deployed` — patch confirmed present in the running workflow (28 nodes, still active).

**✅ VERIFY** — Replayed this exact call's payload through the patched logic:

| call_type | LLM said | Task now renders |
|---|---|---|
| **billing_question** (this call) | handled=true | **No - needs follow-up** + Action Required block |
| general_question (booked) | handled=true | Yes ✓ (unchanged) |
| new_lead (booked) | handled=true | Yes ✓ (unchanged) |

No regression to genuinely-handled calls. Memory + index updated.

**🧠 LEARN** — The `handled_by_agent` LLM field is unreliable for hand-off call types; deterministic overrides in the format node beat trusting the analyzer. `STAFF_ONLY_TYPES` is now the extension point if complaints/other never-self-serviceable types surface.

---
**Two things for you:**
1. Fix is **live** — any future refund/billing call will read *"No - needs follow-up"* so staff always know to call.
2. The callback on **this** caller (+1 289-500-3998, sounded near-prank) is the one you handed to **Jenn** — that's staff-side, not something I should place. Want me to **drop a one-line comment on the task** telling Jenn/Alex the flag is now fixed?

🗣️ Refund calls will never lie about being handled again — shipped fleet-wide and verified.

</details>
