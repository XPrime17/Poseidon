---
name: stcath-first-real-booking-2026-06-16
description: "St. Catharines' first real tour booking — inbound, 2026-06-16 — and the test-vs-real distinction for its earlier bookings"
metadata: 
  node_type: memory
  type: project
  originSessionId: f6731dab-ca98-4c2b-b81c-35f02e91227a
---

2026-06-16 5:39pm ET: **first genuine tour booking for St. Catharines** — inbound call `call_03baab9144d416e9e460bab2c34` (StCath-Inbound agent_fa924598caf3662856ac3cea3b), real parent `+12897839013` → Retell DID `+12895140137`, tour booked for 2026-06-26 (~5-min real conversation). First **inbound** booking ever for the centre, and first **real** one.

The 7 earlier StCath "bookings" (May 9–20, all outbound agent_c02bfb40888bba2275ea3a9f3a) were **all tests**: every one went to `9059672357` (universal dummy number) or `9052200332` (StCath's synthetic-lead `test_number` from centre-lookup.csv) — both flagged `testing=TRUE` in the MasterSheet. So don't count launch-window outbound bookings to those two numbers as conversions.

Validates the now-working CFNA forwarding ([[stcath-inbound-call-forwarding]]). When asked "was X the first booking," filter `appointment_booked=true` AND non-voicemail AND `testing!=TRUE` AND exclude the two test numbers. Relates to [[feedback-voicemail-greeting-hallucinated-as-user]].
