---
name: retell-legacy-list-migration-2026-08-31
description: "Retell legacy-list deprecation notice (8/31) — droplet migrated (list-phone-numbers → v2), residual v2/list-calls caller is external (ChatDash/laptop MCP)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8efd58ab-7077-4d76-a6d0-abd66a720a3e
---

Retell deprecation notice 2026-08-31: `POST /v2/list-calls` (16×) + `GET /list-phone-numbers` (2×), last use Aug 30 7:15 PM PDT. Removal already past (2026-06-15 policy) — endpoints die whenever Retell pulls the plug.

**Droplet findings (2026-08-31 sweep):**
- The 2× `GET /list-phone-numbers` were ours: `PipelineRegressionCheck.py` (1 GET per gate run). FIXED → `GET /v2/list-phone-numbers` with `{items, has_more}` unwrap (accepts both shapes). Also fixed dormant `Offboard.ts:341` + 3 _OFFBOARDCENTRE docs. Gate PASS live on v2 (18 numbers). poseidon-repo commit `6977a66`, pushed.
- The 16× `POST /v2/list-calls` are NOT the droplet: audit.py migrated to v3 in `36f6a8c`, MCP build/tourforce/E2E/Offboard/ab_readout all v3, n8n has ZERO retellai.com refs (verified across all workflows). Same external-key-holder profile as [[retell-list-agents-deprecation-2026-07-22]] — ChatDash most likely, or Scott's stale laptop MCP (old `retellai-mcp-server` uses retell-sdk 4.x whose `call.list()` = v2; `phoneNumber.list()` = legacy GET).

**Why:** retell-sdk 4.66.0 (installed everywhere) still targets deprecated endpoints for `.list()` calls — that's why our code fetches v3 directly instead of using the SDK.
**How to apply:** Never use `client.call.list()` / `client.phoneNumber.list()` from retell-sdk 4.x; fetch `/v3/list-calls` (POST) and `/v2/list-phone-numbers` (GET) directly and read `items`. If another notice arrives for v2/list-calls, it's the external caller — audit Retell API keys / ChatDash, not the droplet.
