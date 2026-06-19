---
name: inbound-slot-source-eg-contamination-2026-06-18
description: "Inbound voice agents were serving East Gwillimbury's tour slots to other centres (StCath offered closed-Friday slots) — calendar_api default + agent tool URLs fixed 2026-06-18"
metadata: 
  node_type: memory
  type: project
  originSessionId: ae697aa6-0f77-4187-ad3e-74e5e086c9e8
---

**Root cause (found via Louis/StCath, Scott flagged 6/26=Friday but StCath closed Fridays):** StCath inbound agent offered EG's availability. The `get_tour_slots` Retell tool on 3 of 5 inbound LLMs pointed at the GENERIC `http://138.197.171.204:5001/retell/get-slots` (no centre in path, empty params), and `calendar_api.py` **defaulted unknown/missing centre_id to `east-gwillimbury`** → every such agent read EG's calendar. Plus the scraper's `CENTRES` cache only held EG + Leaside, and Leaside's URL slug `on-leaside` had 404'd (page moved to `leaside-on-ca`).

**Audit (2026-06-18) — inbound `get_tour_slots` URLs:** EG generic→EG(ok by luck) · **StCath generic→EG ❌** · **Kanata generic→EG ❌** · **Burlington generic→EG ❌** · Leaside `/leaside`(ok but cache 404'd). (Pickering/Riverside have NO inbound agent — outbound only.)

**Proof slots came from EG, not StCath:** StCath has NO Friday slots and runs on :30 times (4:30/5:30/6:30); Louis was offered Fri 6/26 at :00 (5:00/6:00) = EG's grid. StCath real availability: Tue/Wed/Thu evenings + Sat mornings, no Fri.

**Fixes shipped (all verified, /health = healthy, 5 centres cached):**
1. `/root/calendar_api.py` `CENTRES` now has all 5 live inbound centres (east-gwillimbury, st-catharines, kanata, burlington, leaside) with correct `*-on-ca` slugs (fixed Leaside `on-leaside`→`leaside-on-ca`). `calendar-api.service` restarted.
2. Removed the EG default — unknown centre_id now returns "tour times unavailable / callback" (safe), never another centre's slots.
3. Repointed 4 inbound LLM `get_tour_slots` URLs to `/retell/get-slots/<centre>` (EG/StCath/Kanata/Burlington; Leaside already centre-specific). Backup `/root/backup-inbound-slot-tools-20260618.json`. Verified each endpoint serves its OWN slots.

**Caveat:** if any of those LLMs were *published* versions, a republish may be needed for the agent to pick up the new URL (StCath was is_published=false → version 0 live, so fine). Watch the next real inbound call per centre.

**Guard built (2026-06-19):** `~/.claude/skills/_N8N/Tools/SlotRoutingCheck.py` (+`.help.md`) — proves every live inbound agent serves ITS OWN centre's slots. Checks C1 URL is `/retell/get-slots/<centre>` not generic · C2 centre cached >0 · C3 real slots · C4 distinct-from-EG canary · C5 generic endpoint stays 'unavailable'. Modes: fleet (regression gate, run with `PipelineRegressionCheck.py`), `--agent <id>` (onboarding gate, wired into `provision-inbound.ts` Step 6 — throws on fail), `--centre <name>` (debug). Exit 0/1/2. Validated: fleet PASS (5/5), negative test on outbound agent → FAIL exit 1. Catches both this slot bug AND the same EG-template-leak class.

**Louis fallout:** his 6/26 booking was on an invalid (Friday) slot sourced from EG. Needs re-contact to rebook a real StCath time (lead: Thu 6/25 5:30 PM). The earlier Skyvern re-fire to StCath (`wr_541489063291879888`, 6/26) will fail — no such slot exists there. See [[booking-verif-deadbranch-fix-2026-06-18]] for the parallel Skyvern booking/reporting bugs.
