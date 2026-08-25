---
name: single-number-model-fleetwide
description: "Single AI number = both inbound + outbound per centre (StCath model); EG consolidated,"
metadata: 
  node_type: memory
  type: project
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

Every live-inbound centre uses **ONE Retell number for both inbound and outbound** (the St. Catharines model). In Centre Lookup that shows as `inbound_number == outbound_number`.

Confirmed live 2026-07-10: EG `12898038797`, StCath `12895140137`, Burlington `12899071911`, Kanata `16137028134` — all four SAME both directions. Outbound-only centres (Pickering, Canton, San Antonio, Round Rock, Spring-Rayford, Leaside, Riverside, Sudbury) have `inbound_number` blank (no inbound agent yet).

**Why:** EG used to be the lone two-number outlier — inbound `289-803-8797` vs a stray outbound caller-ID `249-449-2726` (nicknamed `bob-test`, cross-wired to the Emma agent). The May-31 refactor keyed inbound lookup on the outbound-caller-ID column and orphaned EG for ~10 days (dropped a real $281 callback); StCath survived only because it was already single-number. Scott then asked to converge EG (session `b5d4a694-b7e7-4e5e-8c50-67402b3a926a`, ~2026-06-07, handoff `/root/handoff-2026-06-07-eg-inbound.md`, open item "#13 one-number EG"). #13 is now DONE — EG is consolidated on `12898038797`.

**How to apply:**
- New centres: provision ONE number bound both directions; set `inbound_number == outbound_number`. Don't reintroduce a second DID.
- The centre's physical **landline forwards INTO** that Retell number — track it in `centre_landline` (col R, added 2026-07-10). See [[feedback-did-from-centre-lookup]].
- Returned missed-calls to the AI number bypass forwarding and are NOT a valid inbound test — call the landline. See [[stcath-inbound-call-forwarding]] and [[feedback-no-answer-forwarding-always]].
