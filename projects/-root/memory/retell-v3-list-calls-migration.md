---
name: retell-v3-list-calls-migration
description: Retell legacy list-endpoints deprecation (v2→v3 list-calls) — the 5 call sites and the v3 response-shape gotcha
metadata: 
  node_type: memory
  type: project
  originSessionId: e3bc8c92-db49-4584-8142-a116e0dd12ea
---

Retell deprecated the **legacy list endpoints** effective 2026-06-15 (separate from the [[retell-phone-weighted-agents-api]] phone-fields deprecation — don't conflate them). `POST /v2/list-calls` → `POST /v3/list-calls`; `GET /list-chat` → `POST /v3/list-chats`.

**Gotcha:** legacy v2 returned a top-level **array**; v3 returns unified pagination `{ items, pagination_key, has_more }`. Every caller must read `.items`. `get-call/{id}` is NOT deprecated and stays on `/v2`.

Migrated all 5 live `list-calls` sites to v3 on 2026-06-01 (parsing kept array-or-items resilient):
1. `daily-call-audit/audit.py` (raw POST) — droplet systemd timer; **needs redeploy to n8n-production droplet**.
2. `tourforce-portal/lib/retell.ts` (raw fetch) — split shared base: list-calls→v3, get-call→v2; **needs portal redeploy**.
3. `.claude/skills/_OFFBOARDCENTRE/Tools/Offboard.ts` (raw fetch) — exit-report call dump.
4. `.claude/skills/_VOICEAIAGENCY/MCP/src/tools/calls.ts` (was SDK `client.call.list`) — replaced with direct v3 fetch.
5. `.claude/skills/_VOICEAIAGENCY/MCP/src/tools/analysis.ts` (was SDK `client.call.list`) — same; **MCP rebuilt (`npm run build` OK), restart MCP/session to load build/**.

**Why direct fetch over SDK bump:** installed `retell-sdk` 4.66 still targets v2; latest is 5.x — a 4→5 major bump risks the whole MCP server for only ~6 SDK uses. Surgical v3 fetch eliminated the SDK list-calls calls with zero major-version risk.

Mirror copies in `poseidon-repo/skills/_VOICEAIAGENCY/MCP/` (public XPrime17/Poseidon) patched identically to prevent drift on sync. Live v3 smoke test 2026-06-01: HTTP 200, returned `{has_more, items, pagination_key}`.
