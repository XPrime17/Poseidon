---
name: Onboarding Gap Fix — Inbound Provisioning + Fan-Out Discovery
description: New scripts close the gap where onboard-centre.ts only provisioned outbound. Inbound agents had been manually set up (drift risk). Fan-out helper prevents future rev scripts from missing agents.
type: project
originSessionId: dfcce36f-cdf2-4142-82a5-a8d73d8d6185
---
Shipped 2026-05-23 in response to "find out why these gaps existed in onboarding."

**Root cause discovered:** `/root/lead-reactivation/scripts/onboard-centre.ts` has zero inbound provisioning. The whole 1500+ line script only does outbound: SOURCE_AGENT_ID and SOURCE_LLM_ID both point at the CN /w KB **outbound** canonical. Inbound was provisioned manually each time (EG, Leaside, StCath), which is why my 2026-05-23 rev scripts had hardcoded target lists that missed CNKB-StCatharines-Inbound.

**Two new tools:**

### `/root/lead-reactivation/scripts/provision-inbound.ts`
Idempotent inbound provisioning. Closes the gap. Five steps:
1. Clone EG-Inbound LLM (`llm_6d77f36696f6fbfad97d03fa5ef8`), swap "East Gwillimbury" → centre name
2. Clone EG-Inbound agent (`agent_17d623c8a8f95fc674288d0e00`), name `CNKB-{Centre}-Inbound`
3. PATCH phone number → `inbound_agent_id` + `inbound_webhook_url=https://xprime17.app.n8n.cloud/webhook/inbound-kb-injection-eg`
4. Insert phone → centre mapping into PHONE_TO_CENTRE in n8n workflow `QFxDu1MBooL332PN` (the "Inbound Pre-Call KB Injection - Multicentre" workflow — actual name is misleading, despite its `inbound-kb-injection-eg` webhook path it routes for ALL centres)
5. Smoke-test the webhook returns ≥100 chars of KB for the new number

Usage: `RETELL_API_KEY=... N8N_API_KEY=... bun run provision-inbound.ts --centre <slug> [--dry-run]`

Idempotency: re-runs are safe. Skips agent creation if phone already has inbound_agent_id; skips registry insert if number already in PHONE_TO_CENTRE.

### `/root/cnkb-list-agents.ts`
Fan-out discovery helper. Lists all live CNKB agents (filters `[OFFBOARDED-`). Outputs TS array literal for paste into rev scripts.

Usage: `RETELL_API_KEY=... bun run cnkb-list-agents.ts --filter=inbound --format=ts`

**Status as of 2026-05-23:** 9 active CNKB agents (6 outbound + 1 canonical + 3 inbound):
- CN /w KB (EG outbound), CNKB-Burlington, CNKB-Pickering, CNKB-Leaside, CNKB-Riverside, CNKB-St. Catharines
- CNKB-EG-Inbound, CNKB-Leaside-Inbound, CNKB-StCatharines-Inbound
- SUDBURY OFFBOARDED 2026-05-22 (rev pushed before realizing — harmless since agent exists but not called)

**Followup:** Integrate `provision-inbound.ts` into `onboard-centre.ts` as a step (or call it from there) so the next new centre gets inbound automatically. Today it's a separate script — works fine but requires the operator to remember to run it.
