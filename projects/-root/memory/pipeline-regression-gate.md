---
name: pipeline-regression-gate
description: Run PipelineRegressionCheck.py after ANY lead-pipeline change (workflow / Centre Lookup / Retell bindings)
metadata: 
  node_type: memory
  type: project
  originSessionId: b5d4a694-b7e7-4e5e-8c50-67402b3a926a
---

**Change-time gate created 2026-06-07** to prevent silent contract breaks like the EG inbound outage ([[inbound-eoc-eg-orphaned-lookup]]). Run after any change to a lead-pipeline n8n workflow, the Centre Lookup sheet, or a centre's Retell phone bindings — a change isn't shipped until it returns PASS:

```bash
set -a; . /root/.env; . ~/.claude/.env; set +a
python3 ~/.claude/skills/_N8N/Tools/PipelineRegressionCheck.py   # exit 0=PASS 1=FAIL 2=misconfig
```

Cross-validates Centre Lookup ↔ live workflow column refs ↔ Retell inbound bindings ↔ ClickUp. Checks: (A) every workflow-referenced sheet column exists [catches a rename that misses a node]; (B) rows with inbound_number set also have clickup_list_id/user_ids/centre_email; (C) every `LIVE_INBOUND_CENTRE_IDS` centre has inbound_number populated + bound in Retell [stray bindings → WARN]; (D) enabled rows have outbound_number; (E) clickup_list_id resolves.

Reads sheet via **CSV export** (`/export?format=csv&gid=0`) — fresher than gviz (which cached stale for minutes during this work) and returns clean strings (gviz returns floats → `12898038797.0`). Scope is **Layer 1 only** (Scott's call); Layer-2 synthetic E2E (replay CEKURA_TEST call_analyzed per inbound centre, assert task, auto-clean) was deferred. Trigger = change-time gate (NOT scheduled); documented in `_N8N/SKILL.md`. **When a centre's inbound goes live, add its centre_id to `LIVE_INBOUND_CENTRE_IDS`** (top of script). Current PASS state has 1 WARN: Leaside-Inbound (16474963276) provisioned in Retell but not wired in the sheet. Note: Cekura suite tests the agent conversation, daily audit is detective-only — this is the only preventive control. Related: [[inbound-eoc-eg-orphaned-lookup]], [[systemcheck-skill]].
