---
name: cekura-tier2-percentre-crons
description: "Tier-2 smoke = one Cekura cron PER CENTRE staggered 5 min (bi-weekly Wed 6am ET); cron 429 is Canton's; cron_jobs API is MCP-only"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0102d5a3-1122-4106-8599-442881c95519
---

Tier-2 smoke tests run as **one cron per centre**, crontab `<min> 6 1-7,15-21 * 3` US/Eastern, minutes staggered 0,5,10,… (429=Canton, 436=StoneOak … 442=Riverside, **511=Kanata @ :40**). onboard-centre.ts used to say "append scenarios to cron 429" — wrong; 429 is agent-scoped to Canton (fixed in commit `9b9e332`).

**Gotcha:** `cron_jobs` is NOT reachable on `api.cekura.ai` REST — `/test_framework/v1/cron_jobs/...` and all variants 404 (probed 2026-06-12) even though `/test_framework/v1/aiagents/` works. Use the Cekura MCP tools (`cron_jobs_list`/`cron_jobs_create`/`cron_jobs_partial_update`).

**How to apply:** new centre → `cron_jobs_list({project_id:"3782"})`, take next free minute among "Tier 2 - *" names, `cron_jobs_create` with the centre's Cekura agent + 2 smoke scenarios.
