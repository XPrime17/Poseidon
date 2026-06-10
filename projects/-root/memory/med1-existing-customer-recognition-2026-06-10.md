---
name: med-1-deeper-layer-inbound-existing-customer-recognition-option-b
description: Inbound agents now capture caller name + flag self-identified enrolled families (existing_customer) so paying families stop being treated as cold new_leads. Full phone-lookup deferred to HubSpot.
metadata: 
  node_type: memory
  type: project
  originSessionId: 0dc915b3-0b24-4dc1-97a5-8672dc9c7540
---

Shipped 2026-06-10 — the deeper half of MED-1 (surface precamp-tour fix was [[cnkb-precamp-tour-rev-2026-06-09]]). Evidence call `call_577bee417849614ac2a5e979f7a`: a parent who said "my son is registered for the August camp" was tagged `call_type=new_lead`, `caller_name` empty.

**Scott chose Option B** (name-capture + transcript-driven recognition; NOT a live phone lookup). Rationale: we have **no phone-keyed customer datasource** today — only the public MyStudio camp-catalog API (`kb-crawler/crawl.ts` `fetchCampsFromAPI`). A true silent lookup belongs on the **HubSpot** bridge once the migration lands (see [[hubspot-migration]] — family records + phone numbers + MyStudio POS connection, rollout Jun/Jul 2026). The pre-call webhook ([[inbound-kb-injection]]) already parses `call_inbound`, so the hook point exists for that future add.

**What shipped to all 3 live inbound CNKB clones** (EG `agent_17d623c8a8f95fc674288d0e00`/`llm_6d77f36696f6fbfad97d03fa5ef8`, StCath `agent_fa924598caf3662856ac3cea3b`/`llm_769e0ba68dc37cea573904c474fe`, Leaside `agent_50a754cd5b9ba4ec988c764427`/`llm_cfedf58fd1274e15835042d8b6c8`):
1. **Prompt — name safety-net** (inserted in `## Ending Calls`): before closing any non-spam call, ask the caller's name once if not already captured. Fills `caller_name` on info-only/no-booking paths (the gap that left it empty).
2. **Prompt — Existing-Customer Overlay** (inserted at end of Stage 1, before `## Stage 2`): if the caller signals their child is already registered/enrolled/attending, acknowledge them as an existing family, capture the name, don't treat as a cold lead.
3. **Agent post-call schema** — new boolean `existing_customer` (inserted after `caller_phone`), inferred from the transcript. No `choices` array; `call_type` left unchanged (avoids the [[retell-enum-two-side-gotcha]]).
4. **Inbound EOC** `3oV7SpPKWmr3xJlQ` "Format ClickUp Task" node: when `existing_customer` true → task name prefixed `⭐ EXISTING CUSTOMER -`, a banner + "Existing Customer: Yes" detail line, `existing-customer` tag, priority bumped 3→2. Negative case unchanged (verified via local node sim, both branches).

Backups: `/root/med1-inbound-2026-06-10/backups/` (3 LLM jsons, EG agent, workflow). Patch scripts + sims in `/root/med1-inbound-2026-06-10/`. Pipeline regression gate PASS (only the pre-existing Leaside `16474963276` inbound-not-wired warning).

**Cekura regression scenarios** (created 2026-06-10, agent 16633 "CNKB - EG Inbound", project 3782, `instruction` type, personality 693, criteria in `expected_outcome_prompt`):
- `284772` — Pre-camp visit → camp-registered family books a Create tour (locks [[cnkb-precamp-tour-rev-2026-06-09]]).
- `284773` — Existing-customer recognition + name capture on an info-only/no-booking call, mirrors `call_577bee41` (locks this Option-B fix): expects `existing_customer=true` + `caller_name` populated.
- **Not yet run** — created as locked regression scenarios; a live WebRTC validation pass is the remaining optional step (would also be the first live confirmation of the Option-B prompt changes).

**Also (item #6):** strengthened `_DAILYCALLAUDIT` SKILL.md Step 2 — the agent-driven weekly/ad-hoc audit now excludes Cekura tests by `retell_llm_dynamic_variables.first_name==CEKURA_TEST` + `PHONE==+15555550100` (not just transcript/lead_id), and the 4E Wrong-Location detector now rules out the Bayview test #141951 first. Closes the MED-2 false-alarm class. `audit.py` (daily automated) already had this via the Cekura-runs cross-reference. See [[audit-bayview-wrong-location-is-cekura]].
