---
name: retell-list-agents-deprecation-2026-07-22
description: Retell deprecated GET /list-agents (removed 2026-07-31) — live stack already migrated Jul 9; repo mirror synced Jul 22
metadata: 
  node_type: memory
  type: project
  originSessionId: 491451ae-177c-4d0c-a7f0-f459b31c4009
---

Retell emailed 2026-07-22 (workspace `org_FI0Hs1y35yMdts2t`): legacy `GET /list-agents` is **removed 2026-07-31**. "Most recent use: Jul 9, 2026 10:41 PM PDT, 1 use."

**No live break — everything that executes was already migrated to `POST /v2/list-agents` on Jul 9/10** (backup `.bak-20260709` proves it): the `retell-voice-ai` MCP server (`_VOICEAIAGENCY/MCP/build/tools/agents.js`), the `e2e-leadflow-check.timer` canary (`.claude/skills/_N8N/Tools/e2e_canary.py`), `SlotRoutingCheck.py`, and `cnkb-list-agents.ts`. Live `POST /v2/list-agents` returns 200. The Jul 9 10:41 PM call was the LAST legacy hit right before that migration; Retell's counter hasn't advanced in 13 days → clean.

**v2 gotchas** (baked into the migrated code): `POST /v2/list-agents` with body `{filter_criteria:{channel:{op:"eq",type:"string",value:"voice"}}, limit:1000}`; response is `{items:[...], has_more, pagination_key}` — must paginate. v2 items are a **slim projection** (no `response_engine`/`llm_id`/`language`), so enrich each kept agent via `/get-agent/<id>` when you need `llm_id_of()`. The retell-sdk `agent.list()` still calls the dead GET internally — bypass it, call `client.post("/v2/list-agents")` directly.

**What I fixed 2026-07-22:** the `poseidon-repo` git mirror (NOT executed, but the redeploy source) still had `E2ELeadFlowCheck.py` + `SlotRoutingCheck.py` on the legacy GET. Synced both to the canonical live versions (incl. the `retell(path, method, body)` helper upgrade + canary poll-window changes). Committed+pushed → `origin/master` `dd92758`. `.claude/skills` and `poseidon-repo/skills` are SEPARATE copies (not symlinks) — mirror drift is a real regression vector; check both when migrating.

Distinct from [[retell-custom-telephony-cidr-2026-07-22]] (that was the telephony CIDR notice, no action).

**2026-08-18 second notice — Aug 12 12:01 PM PDT (19:01 UTC), 1 legacy GET.** Full droplet sweep exonerated us: every executing component re-verified on v2 (MCP build `_VOICEAIAGENCY/MCP/build/tools/agents.js`, greeting scripts `set-greeting.ts`/`greeting-sync.ts` — built Aug 11-12 but v2 from birth, E2E canary, SlotRoutingCheck, cnkb-list-agents.ts, all n8n workflows [0 refs], tourforce-portal + retell-capture/reconcile timers [0 agent-listing at all], all pm2 services, shell history, Aug-12 session transcripts). Live `POST /v2/list-agents` 200 on 8/18. Caller is OFF-droplet — some external holder of a workspace API key. Candidates: **ChatDash** (wired to workspace, dashboards enumerate agents on page load — most likely), Cekura, or a stale `retellai-mcp-server` config on Scott's laptop (pattern preserved in `/root/.claude-backup-20260131/mcp-servers/retellai-mcp-server` — uses retell-sdk `agent.list()` = legacy GET). Nothing to migrate on our side; endpoint still responding despite "removed 2026-07-31" (kill switch not yet flipped). NEVER test-call the legacy GET — it increments Retell's counter and triggers another notice.
