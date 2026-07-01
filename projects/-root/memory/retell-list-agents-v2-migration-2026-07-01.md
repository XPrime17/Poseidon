---
name: retell-list-agents-v2-migration-2026-07-01
description: Third Retell deprecation — GET /list-agents → POST /v2/list-agents; migrated all 4 live callers 2026-07-01
metadata: 
  node_type: memory
  type: project
  originSessionId: 5b9e246c-1b7e-4c8e-9ffb-72caa7260be8
---

Retell's **3rd** deprecation email (distinct from [[retell-phone-weighted-agents-api]] and [[retell-v3-list-calls-migration]]): legacy agent-list endpoints `GET /list-agents` + `GET /list-chat-agents` **removed 2026-07-31** → `POST /v2/list-agents`. Scott forwarded it 2026-07-01 (last use Jun 25, 1 call). Migrated **all 4 live callers**; final sweep clean, all verified live.

**Real request contract (the migration doc is WRONG):** doc shows `channel:{op:"eq",value:"voice"}` — the API rejects that (400). Correct shape:
```json
{"filter_criteria":{"channel":{"op":"eq","type":"string","value":"voice"}},"limit":1000}
```
Both `op` AND `type:"string"` are required. Empty body `{}` also works and returns all agents (workspace is voice-only, 18 agents, has_more:false). Response = `{items:[...], has_more, pagination_key}` (paginate on has_more).

**GOTCHA — v2 items are a slim projection.** Fields: agent_id, agent_name, channel, is_multi_prompt, phone_numbers, response_engine_type, tags, user_modified_timestamp, voice_avatar_url, voice_id, voice_name. **No `response_engine`/`llm_id`/`language`/`last_modification_timestamp`.** Anything needing llm_id must enrich per-agent via `GET /get-agent/{id}` (returns `response_engine.llm_id`). This was the real trap — a naive shape-only swap silently breaks llm_id consumers (cf. the class of bug [[audit-tour-info-key-casing-2026-06-28]]).

**4 callers migrated (2026-07-01):**
1. `/root/.claude/skills/_N8N/Tools/E2ELeadFlowCheck.py` ~L171 — validity probe; `retell()` already supported method/body. → `v2/list-agents 200`. Selfcheck PASS.
2. `/root/.claude/skills/_N8N/Tools/SlotRoutingCheck.py` `discover_inbound_agents()` — extended `retell()` helper for POST body; POST v2 + paginate + **enrich each kept -Inbound via /get-agent** so `llm_id_of()` still resolves. Live `RESULT: PASS` (5 inbound, all routing checks green).
3. `/root/cnkb-list-agents.ts` — POST v2 + paginate; dedup field `last_modified`→`user_modified_timestamp`; **enrich picked agents via /get-agent** for the `(llm ...)` column. Ran clean, 12 agents.
4. MCP `list_agents` tool — retell-sdk v4.66 `client.agent.list()` STILL calls deprecated GET (resources/agent.js:50). Bypassed via `(client as any).post("/v2/list-agents",{body})`, enumerate ids, then `client.agent.retrieve(id)` each to restore llm_id/language. Edited BOTH copies: live `/root/.claude/skills/_VOICEAIAGENCY/MCP/src/tools/agents.ts` (tsc build exit 0, `build/tools/agents.js` has v2, no deprecated) + git source `/root/poseidon-repo/skills/_VOICEAIAGENCY/MCP/src/tools/agents.ts`. MCP package name = `retell-voice-ai-mcp` → it backs the `mcp__retell-voice-ai__*` tools; new build takes effect on next MCP reload/session.

**Not committed:** `poseidon-repo` shows `M skills/_VOICEAIAGENCY/MCP/src/tools/agents.ts` uncommitted (per rule: commit only when Scott asks). The 3 droplet-only files (_N8N tools, cnkb-list-agents.ts) aren't in any repo — edited in place.

Env note: RETELL_API_KEY is in `/root/.claude/.env` (NOT `/root/.env`, which has ELEVENLABS/SKYVERN). See [[deploy-env-sourcing]].
