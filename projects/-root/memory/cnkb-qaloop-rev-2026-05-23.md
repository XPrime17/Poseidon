---
name: CNKB Q&A Loop Rev 2026-05-23 (#2)
description: Replaced share-once-then-deflect pattern with multi-turn Q&A loop for non-Create programs. Agent now answers questions until parent is done, then routes to staff. Hallucination-guarded with KB-gap rule.
type: project
originSessionId: dfcce36f-cdf2-4142-82a5-a8d73d8d6185
---
Shipped 2026-05-23 (second prompt rev of the day).

**The change:** Non-Create programs (Junior, Camps, Create Prep, PNO, etc.) previously got *one* KB-sourced answer then immediate staff deflection. Now the agent loops: answer → "any other questions about [program]?" → loop until parent says they're done → THEN route to staff for enrollment.

**Edits applied:**

*Outbound (7 agents, 4 edits, 23898 → 25415 chars):*
- Stage 1 "If other program" → enters Non-Create Q&A mode (was: share-once-then-deflect)
- Non-Create Program Interest section → fully replaced with 10-step Q&A loop spec
- Stage 3 Junior branch → "Want me to tell you a bit about Junior?" → enter Q&A (was: immediate handoff)
- Stage 3 intermediate-program branch → same Q&A entry pattern for Create Prep

*Inbound (2 agents, 2 edits, +1420 chars each):*
- Stage 2A "If other program" → enters Q&A mode
- Non-Create Program Interest section → same Q&A loop spec (uses "caller" not "parent")

**KB-gap rule (CRITICAL, in both):** If parent asks about something NOT in {{knowledge_base}}, agent must say "I don't have that specific detail in my notes — for that one, our team would be the best to walk you through it." NEVER invent prices, dates, ages, schedules, or program names. This is the guardrail that makes the loop safe.

**Booking gate (unchanged):** Tour booking via Stages 4-6 is Create-only. Q&A loop never offers a tour for Junior/Camps/Create Prep/Academies/Birthday Parties/PNO.

**Why:** Scope reframe originally parked, then unparked once base rev was verified stable. ClickUp wiring already in place for staff_followup_needed=true (description is forward-compatible: "any kind of staff or team outreach"). St. Cath ready to be the first centre to see this in production once Shauna's ClickUp user_id is populated.

**Effect:** Parents asking about camps/Junior/Create Prep now get a real conversation, not a one-line brush-off. Hallucination risk capped by explicit KB-gap rule. staff_followup_needed still fires at end of conversation → email + (when configured) ClickUp task.

**Cekura impact:** The 7 existing regression scenarios on agent 13260 mostly tested Create flow + age-gate. Q&A loop behavior is new — needs at least 4 fresh scenarios:
1. Multi-turn camps Q&A → final deflection (verify loop terminates)
2. Junior inquiry with deep KB → multi-turn answers (verify substance)
3. Out-of-KB question (e.g., "what time does Tuesday camp start?") → KB-gap fallback fires (verify no hallucination)
4. Mixed inquiry (Junior + Create) → Q&A first, then Create tour offered (verify flow doesn't drop Create)

**Scripts:** `/root/cnkb-outbound-prompt-rev-qaloop-2026-05-23.ts`, `/root/cnkb-inbound-prompt-rev-qaloop-2026-05-23.ts`. Run with `--dry-run` first.
