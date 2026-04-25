---
name: Re-deliver deliverables when re-asked, don't make user scroll
description: When Scott re-asks "did you send X?" or "where is X?" and I already produced X earlier in conversation, paste a clean copy again rather than pointing back to a prior message
type: feedback
originSessionId: 3e3105b9-2896-43a9-8f0e-8c6fd1bb8315
---
When Scott asks twice whether a deliverable was sent (email draft, code snippet, summary, etc.), re-deliver it cleanly in the next response — do not say "see my earlier message" or "scroll up". Even if the original is intact, the act of re-asking signals it's hard to find.

**Why:** Scott uses Poseidon at high task velocity and scrolls a lot. A re-ask is a UX signal, not a literal question. Pointing back upstream forces extra friction; re-delivering takes 5 seconds and removes it. Confirmed twice on 2026-04-25 (staff-email re-delivery in the EG inbound bug-fix session).

**How to apply:** If user asks "did you send X?" / "where is X?" / "do I have X?" and X exists earlier in this conversation, output the deliverable again, refreshed if facts have changed since I first wrote it (e.g., past tense if work has now landed). Don't waste time apologizing for the redundancy — just produce.
