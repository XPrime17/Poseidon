---
name: feedback-staff-deflection-outbound-only
description: "Staff-deflection language ('team will reach out', 'someone will contact you') is banned for OUTBOUND agents only. INBOUND agents are expected to hand off to staff when appropriate."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4bb62092-eb24-47e7-8dc5-e4936c81436f
---

The 2026-04-21 Booking Autonomy rev — including its banned phrases ("team member will reach out", "someone will reach out") — applies to **outbound agents only**. For inbound agents, staff handoff IS the correct behaviour in many cases.

**Why:** Inbound agents are receptionists, not closers. Calls about subscription pauses, billing, sibling discounts, pricing edge cases, complaints, etc. legitimately require a human follow-up. Forcing the inbound agent to "book autonomously" on those would be wrong (the agent has no authority over billing/pricing and no KB coverage for unusual asks).

**How to apply:**
- When reviewing audit output for inbound agents (e.g., CNKB-EG-Inbound), do NOT count `STAFF_DEFLECTION` or banned-phrase findings as bugs by default.
- Treat them as bugs ONLY when the caller's intent was a clear tour booking AND the agent had everything needed to book but deflected anyway (e.g., Kevin's "ready to sign Harper up" on 2026-05-11).
- The audit's `STAFF_DEFLECTION` LLM check + banned-phrase regex should be gated to outbound centres in [[daily-call-audit-droplet]] — currently fires on all and inflates HIGH counts.
- The CNKB outbound clones [[prompt-v2026-04-21]] remain bound by Booking Autonomy — don't relax there.

Related: [[staff-followup-promise-dropped]] (parallel concern: when inbound DOES promise staff outreach, the post-call workflow must honour it; Pickering pilot [[staff-followup-pickering-pilot]] addresses that side).

Surfaced 2026-05-13 when I incorrectly flagged 6 EG-Inbound deflections as Booking-Autonomy regressions.
