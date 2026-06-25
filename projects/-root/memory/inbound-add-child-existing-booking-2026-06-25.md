---
name: inbound-add-child-existing-booking-2026-06-25
description: "appointment_booked=false on inbound isn't always a miss — adding a child to a full/existing session is correct staff deflection"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e0a2d807-8a9a-40f7-b458-afe81ee530dd
---

StCath inbound call `call_dec5bf53f02b758fb9d438dd353` (Cimo, agent `agent_fa924598caf3662856ac3cea3b`, caller Amanda +12893037608, 2026-06-23) ended `appointment_booked=false` — and that was **correct**, not a fumble. Confirmed by Scott 2026-06-25.

Amanda didn't want a new tour; she wanted to add Penelope (age 7) to a **family member's existing July 2 @ 6:30 PM session**. A single `get_tour_slots` returned the right StCath calendar (`2026-07-02: 4:30 PM, 5:30 PM` — 6:30 full, appears 7/8/9 instead), so the slot was genuinely unavailable. Agent offered every legit alternative, caller declined, agent routed to staff follow-up with name/phone/child — textbook.

**Why:** "Add a kid to someone else's booking" is staff territory, not a slot the AI can grab. See [[feedback-agents-book-tours-only]] and [[feedback-staff-deflection-outbound-only]] (deflection EXPECTED on inbound).

**How to apply:** When triaging an inbound `appointment_booked=false`, first read intent. If the caller wants a slot the tool shows as unavailable/full, and `get_tour_slots` returned the *correct centre's* calendar (rules out [[inbound-slot-source-eg-contamination-2026-06-18]]), it's a correct deflection — don't flag it. Only open loop is whether the centre's staff actually followed up.
