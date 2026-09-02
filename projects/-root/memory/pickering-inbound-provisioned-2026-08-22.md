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
1. ~~Scott test-dials~~ DONE 8/22 (3 calls from 905-967-2357, 16:48)
2. ~~ChatDash assign~~ DONE — agent webhook now → ChatDash `6a8a10cfd7c9552b9203824e` (import rewired it from direct-EOC; StCath pattern)
3. ~~Sharmila forwarding~~ **LIVE Mon 2026-08-31** — 9 real inbound calls (Madhu 151s, Tahira 60s, Ahmed 79s + quick hangups), 0 booked; inbound EOC processed all (ChatDash→n8n verified, execs 31504–31569 success)
4. STILL OPEN: add `pickering-on-ca` to `LIVE_INBOUND_CENTRE_IDS` in `PipelineRegressionCheck.py` (Leaside/Burlington/Kanata missing too)
5. STILL OPEN: provision-inbound.ts doesn't repoint the slot URL itself (third occurrence)

## Update 2026-09-01 — surfaced as "unknown agent", audit-registered
Nobody recognized `agent_eac2f0557671` when the fail-visible audit tripwire ([[audit-fleet-roster-gap-2026-08-30]]) flagged it nightly from 8/31 — this memory existed but sat at the tail of the over-length MEMORY.md index, and investigation greps `head`-truncated past it. Registered in audit roster 9/1 (`c9f3689`: AGENTS + INBOUND_CENTRES + SKILL.md table; no Cekura agent, no INBOUND_WORKFLOWS entry). **Real HIGH found on first live day:** `call_576891277ca03b4df3aa0d47dc8` (Madhu, 8/31 10:47) — agent FABRICATED camp dates ("last week of summer camp runs August 31–September 4"); injected KB (2,207 chars) has no camp content, prompt requires deflect-to-team for camps not in KB. Prompt-side FIXED 2026-09-02 fleet-wide → [[date-fabrication-guard-2026-09-02]]. OPEN: staff correct camp info with Madhu; consider camp section in Pickering KB doc.

Related: [[customer-leaside-pickering-first-paying]], [[barrhaven-onboarding-2026-08-14]], [[inbound-slot-source-eg-contamination-2026-06-18]]
