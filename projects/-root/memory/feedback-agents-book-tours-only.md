---
name: feedback-agents-book-tours-only
description: "Voice AI agents ONLY book TOURS (initial walk-through / try-a-class visits). They do NOT book camp enrolments, class enrolments, parties, or subscription changes — those are staff handoff territory and the handoff is correct."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4bb62092-eb24-47e7-8dc5-e4936c81436f
---

Voice agents (inbound AND outbound) have ONE booking authority: **tours**.

**A "tour" =** initial walk-through or try-a-class visit at the centre. The thing CNKB outbound agents are trying to close, and what inbound agents schedule when callers want to come see the place.

**NOT bookable by the agent — staff handoff is correct:**
- Camp enrolment (summer camp, day camp, PA-day camp)
- Class / membership enrolment
- Birthday parties
- Subscription pause / cancel / edits
- Pricing or discount approvals
- Sibling-discount math

**Why:** these all touch staff-only systems (CRM mutations, payment processing, calendar conflicts) and require human judgement on edge cases (promo eligibility, age exceptions, multi-child pricing). The voice agent's job stops at "tour booked" — everything else is the centre director's call.

**How to apply when reviewing audits / call quality:**
- A caller saying "sign up", "enroll my kid", "secure my camp spot", "register", "book a party" = NON-tour intent. Don't flag the agent's handoff as a BOOKING_FUMBLE.
- A caller saying "come visit", "see the centre", "try a class", "schedule a tour" = TOUR intent. Now BOOKING_FUMBLE is fair game if the agent had child age + parent identity and still deflected.
- Outbound Booking Autonomy rev applies to TOUR booking specifically — it doesn't (and can't) make the agent book non-tour items.

Confirmed 2026-05-13 after I wrongly flagged Kevin/Harper's camp-enrolment handoff as a real bug (it wasn't — Kevin wanted to enrol in CAMP, which agent can't do).

Related: [[feedback-staff-deflection-outbound-only]] (companion rule: inbound handoffs aren't banned), [[prompt-v2026-04-21]] (Booking Autonomy = TOUR autonomy).
