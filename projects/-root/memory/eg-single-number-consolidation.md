---
name: eg-single-number-consolidation
description: "EG consolidated to one number (12898038797) for both inbound + outbound, matching the StCath model"
metadata: 
  node_type: memory
  type: project
  originSessionId: ba97f964-0f34-464f-a756-fd75eff2dca5
---

**Shipped 2026-06-08.** EG (`east-gwillimbury-on-ca`) now uses a SINGLE number `+12898038797` for both directions, mirroring the StCath one-number model. Previously EG ran two numbers: inbound `12898038797` and outbound caller-ID `12494492726` (nicknamed **bob-test**, whose own bound outbound agent was `agent_552e57364711f0eec51afa512a` — irrelevant, since the outbound workflow overrides the agent per-call from the Centre Lookup `agent_id` column).

What changed:
- **Retell** `+12898038797`: added `outbound_agents=[agent_0c6c32b61cb506fefb6ac247f4]` (= EG Centre Lookup `agent_id`) alongside existing `inbound_agents=[agent_17d623c8a8f95fc674288d0e00]`. Nickname updated `CNKB-EG-Inbound-905` → `CNKB-EG-905 (inbound+outbound)`. Used the `*_agents` array form ([[retell-phone-weighted-agents-api]]).
- **Centre Lookup** EG row: `outbound_number` `12494492726` → `12898038797` (= `inbound_number`). bob-test no longer used as caller-ID; the number was NOT released.

Verified live: outbound test `call_a60bf02286b23b5d98affb9ded1` showed caller-ID `289-803-8797` (Scott's missed call + `from_number=+12898038797` server-side); return call `call_c39c9a762ecd75d335806a818ae` (`+19059672357 → +12898038797`) landed on inbound agent `agent_17d6…`. Regression gate PASS.

**Implication (intended):** EG leads returning a missed outbound call now reach the inbound AI directly, bypassing call-forwarding — same as StCath ([[returned-outbound-calls-hit-inbound-agent]]). New centres onboarded via `onboard-centre.ts` default to this one-number model (inbound_number = outbound_number = provisioned number). Resolves the root cause class behind [[inbound-eoc-eg-orphaned-lookup]].

**HIYA GAP (caught 2026-06-08, OPEN).** Hiya branded caller-ID ("Code Ninjas East Gwillimbury" display) is registered **per-number** and was on the OLD outbound number `12494492726` (249/bob-test) only. Consolidating outbound to `12898038797` (289) dropped branding — the verified test call rang unbranded. **Decision (Scott): register 289 with Hiya, keep the one-number model** (289 is also the *local* 905-overlay number; 249 is out-of-region 705/Barrie, and 289 is already the inbound anchor). SUBMITTED 2026-06-08 (Scott) at hiya.com/branded-caller-id under the Code Ninjas EG brand profile; Hiya vetting typically 1–2 days → expected branded ~2026-06-09/10. Verify via a branded test call to a real handset (display should read "Code Ninjas East Gwillimbury"). No n8n/Retell/sheet flip needed afterward — 289 is already the outbound caller-ID; only branding is pending vetting. General rule: **changing/consolidating an outbound caller-ID drops Hiya branding until the new number is re-registered** — check Hiya before any caller-ID change. See [[lead-reactivation]] (onboard step 11 Hiya).
