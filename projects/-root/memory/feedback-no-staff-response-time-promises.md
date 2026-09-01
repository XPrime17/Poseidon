---
name: feedback-no-staff-response-time-promises
description: "Never let agents/emails promise a specific centre-staff response time (e.g. 'within one business day') — we don't control local staff; promise the action, not the clock"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 635b9053-51af-4458-be62-3c9280a7e1ed
---

# No staff response-time promises

**What happened:** The Base-tier tour-request-capture flow I wrote 2026-08-31 had the agent promise a staff callback "within one business day" ([[shauna-base-tier-cutover]]). Scott's correction 2026-09-01: we have no control over local centre staff response time — if staff take longer, the AI made the centre break a promise to a customer.

**Why:** Voice agents and automated emails speak FOR the centre. Any time-bound commitment ("within X hours/days", "right away", "by tomorrow") becomes the centre's commitment, and only centre staff can honour it. TourForce controls the AI's actions, never the staff's.

**How to apply:** In any agent prompt, email template, or notification that references human follow-up: promise the ACTION ("our team will give you a call to set a time"), never the DEADLINE. Applies to tour-request capture, message-taking, staff-follow-up flows, callback requests, and future centre onboarding copy. When a customer explicitly asks "when will they call?", the agent should say it can't give an exact time but the request has been sent to the team.

Fixed 2026-09-01 on all 3 Base-tier inbound LLMs (StCath/Burlington/Kanata) — zero "business day" residue verified.
