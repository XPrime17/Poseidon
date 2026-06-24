---
name: e2e-leadflow-regression-harness-2026-06-24
description: Live end-to-end deploy gate that drives a synthetic lead through the whole pipeline to a real call
metadata: 
  node_type: memory
  type: reference
  originSessionId: f505e22f-7522-4661-a481-d18444c78266
---

## E2E Lead-Flow Regression Harness (built 2026-06-24)

Layer-2 runtime gate complementing the static [[pipeline-regression-gate]] (`PipelineRegressionCheck.py`). Built after the CORE classifier silently dropped every CORE lead for 11 days ([[core-classifier-drop-2026-06-24]]) — a semantic break a contract check can't catch. Drives ONE synthetic `New CORE Program Inquiry` email through the real pipeline and asserts it reaches the dial instead of a drop node.

**Run (deploy gate, after the static check):**
`set -a; . /root/.env; . ~/.claude/.env; set +a; python3 ~/.claude/skills/_N8N/Tools/E2ELeadFlowCheck.py`
- `--selfcheck` = structural validation, NO inject, NO call (safe anytime).
- Live run **rings Scott's cell +19059672357** only when run **in-hours (9–20 ET)**. Hour-aware: in-hours requires a real Retell call; after-hours asserts the classify→lookup→append path and treats the withheld dial as healthy (so after-hours deploy runs still catch the classifier-class bug; call-leg covered weekly by the canary). Exit 0=PASS,1=FAIL,2=misconfig.

**Pieces:**
- Harness: `~/.claude/skills/_N8N/Tools/E2ELeadFlowCheck.py` (+ `.help.md`).
- Helper n8n workflow **`joLG6ji6JEMW6aaW`** "E2E Harness Ops", webhook `https://xprime17.app.n8n.cloud/webhook/e2e-harness-ops`, ops: `inject` (Gmail send via cred `x1W7EpNhmEdx8cOR`), `addcentre` (Sheets append Centre Lookup), `cleanup` (Sheets appendOrUpdate MasterSheet `lead_id`→`status=done`).
- Dedicated fixture: Centre Lookup row **`centre_id=regression-test`** (enabled+Testing=TRUE, `test_number=9059672357`, reuses Burlington call assets `agent_id=agent_075f92a824314e958918af3d9c`/`outbound_number=12899071911`/KB doc; inbound blank). DO NOT DISABLE. Synthetic-only (no organic lead is plus-addressed to `+regression-test`).
- Weekly canary: systemd `e2e-leadflow-check.timer` (+`.service`, `e2e_canary.py`) **Thu 19:00 America/Toronto** — in-hours, so it PLACES a real call to Scott's cell every Thursday 7pm ET and emails scott.james@codeninjas.com (Resend/Mozilla-UA) on FAIL. enabled+armed.

**Backups:** `/root/lead-reactivation/backups/e2e-harness-ops-2026-06-24.json`, `…/systemd/e2e-leadflow-check.{service,timer}`.

**Validated 2026-06-24 ~21:35 ET:** live run PASS via after-hours path (lead reached Append, no drop). Call-leg's first true in-hours validation = the Thursday 6/25 19:00 canary (expect the phone to ring). Cosmetic: live banner always says "WILL ring" even after-hours; the `[6]` line states the truth.
