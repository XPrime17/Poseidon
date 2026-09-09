---
name: retell-legacy-list-migration-2026-08-31
description: "Retell legacy-list deprecation — deployed code all v3; residual v2/list-calls = OUR droplet's ad-hoc triage one-liners (corrected 9/9, NOT external)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8efd58ab-7077-4d76-a6d0-abd66a720a3e
---

Retell deprecation notice 2026-08-31: `POST /v2/list-calls` (16×) + `GET /list-phone-numbers` (2×), last use Aug 30 7:15 PM PDT. Removal already past (2026-06-15 policy) — endpoints die whenever Retell pulls the plug.

**Droplet findings (2026-08-31 sweep):**
- The 2× `GET /list-phone-numbers` were ours: `PipelineRegressionCheck.py` (1 GET per gate run). FIXED → `GET /v2/list-phone-numbers` with `{items, has_more}` unwrap (accepts both shapes). Also fixed dormant `Offboard.ts:341` + 3 _OFFBOARDCENTRE docs. Gate PASS live on v2 (18 numbers). poseidon-repo commit `6977a66`, pushed.
- The 16× `POST /v2/list-calls` — all DEPLOYED/SCHEDULED code is v3 (audit.py `36f6a8c`, MCP build calls.js+analysis.js, tourforce retell-reconcile.ts BOTH timers, E2E, Offboard, ab_readout×2), n8n has ZERO retellai.com refs. **CORRECTION 2026-09-09:** the residual v2/list-calls ARE the droplet, NOT an external caller. New notice (most recent Sep 6 3:32 PM PDT) named API key **"Lead Reactivation"** + source IP **138.197.171.204 = our droplet** (verified `curl ifconfig.me`). Re-swept: `.call.list(` across all /root = ZERO live invocations; every `v2/list-calls` literal lives only in poseidon-repo/MEMORY tool-call logs. So the hits are **ad-hoc interactive one-liners** past sessions ran during triage (copy-pasting the old endpoint into curl/python) — low-volume + sporadic fits. NOT ChatDash/laptop. My 8/31 "external caller" call was wrong.

**Why:** retell-sdk 4.66.0 (installed everywhere) still targets deprecated endpoints for `.list()` calls — that's why our code fetches v3 directly instead of using the SDK. Production is SAFE from the legacy-list removal; only ad-hoc commands would break.
**How to apply:** Never use `client.call.list()` / `client.phoneNumber.list()` from retell-sdk 4.x — fetch `/v3/list-calls` (POST) and `/v2/list-phone-numbers` (GET) directly and read `items`. **In ad-hoc triage one-liners, use `/v3/list-calls` too** — that's the actual source of these notices, not deployed code. Note `v2/get-call/{id}` (audit.py:551) is a *get*, not a *list* — not covered by this deprecation, but watch for a future get-call notice.
