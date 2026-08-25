---
name: pickering-inbound-provisioned
description: "Pickering inbound agent provisioned 2026-08-22 via provision-inbound.ts (EG clone) — agent_eac2f0557671b9d15543a02a79, slot gate PASS after clone-leak fix; SlotRoutingCheck C1 hole patched; awaiting Scott test call + Sharmila forwarding"
metadata: 
  node_type: memory
  type: project
  originSessionId: 635b9053-51af-4458-be62-3c9280a7e1ed
---

# Pickering inbound provisioned (2026-08-22)

Context: Sharmila replacing her $169/mo third-party receptionist (30-day cancel notice) as part of paid transition. Closes the "Pickering = outbound-only by design" state.

## Shipped
- Centre Lookup **F3** (`inbound_number`) backfilled `16479516675` (= outbound DID, single-number model; was empty and 404'd provision-inbound)
- LLM `llm_744a8d1c9c052e9a7b09abf08f6b` + agent `agent_eac2f0557671b9d15543a02a79` (CNKB-Pickering-Inbound), cloned from EG golden source (inherits double-greeting fix + delay); webhook → inbound-end-of-call direct (non-EG pattern, no ChatDash routing)
- Phone +16479516675 wired (weighted `inbound_agents`), PHONE_TO_CENTRE += entry (wf `QFxDu1MBooL332PN`), KB smoke 2747 chars ✓
- **Clone-leak caught AGAIN** (Barrhaven gotcha #2): get_tour_slots URL cloned EG's → repointed to `/retell/get-slots/pickering`. Pickering already in calendar_api CENTRES + SONAMATION_GUIDS (GUID found earlier 2026-08-22)
- **SlotRoutingCheck C1 hole FIXED**: gate previously PASSed a specific-but-wrong URL (routed to /east-gwillimbury; C4 skipped because routed centre WAS EG). C1 now derives expected centre from agent name (CNKB-<X>-Inbound) and fails on mismatch. Fleet-wide re-run: all 7 inbound agents PASS (Pickering 22 slots, distinct from EG)

## Remaining before Sharmila forwards
1. Scott test-dials +1 647-951-6675 (live inbound answer, Pickering greeting/slots)
2. ChatDash: assign CNKB-Pickering-Inbound to Sharmila's client (visibility; see [[chatdash-agent-assignment-gaps]])
3. Sharmila: cancel other receptionist (30d notice) + set forwarding on Pickering landline → +16479516675
4. After forwarding live: add `pickering-on-ca` to `LIVE_INBOUND_CENTRE_IDS` in `PipelineRegressionCheck.py` (currently only EG + StCath — Leaside/Burlington/Kanata missing too, separate gap)
5. provision-inbound.ts still doesn't repoint the slot URL itself — third occurrence; consider adding the repoint to the script

Related: [[customer-leaside-pickering-first-paying]], [[barrhaven-onboarding-2026-08-14]], [[inbound-slot-source-eg-contamination-2026-06-18]]
