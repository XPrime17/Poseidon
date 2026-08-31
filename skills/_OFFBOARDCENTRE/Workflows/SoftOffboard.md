---
name: SoftOffboard
description: Reversible offboarding. Halts new leads, disables routing, renames agent, unbinds phone. Keeps Twilio number, KB doc, ClickUp, Cekura intact. Run via Tools/Offboard.ts --mode soft.
---

# Soft Offboard — Reversible

**When to use**: Centre is pausing or you're 90% sure they're done but want a fast un-do path.

## Pre-flight

1. Confirm centre is real: lookup `centre_id` in Centre Lookup Sheet
2. Print full inventory (load `Inventory.md`):
   - Active lead count (rows where `centre_id=X` AND `status IN ('retry_pending','calling')`)
   - Retell agent_id + agent_name + last call date
   - Retell phone number + binding state
   - KB doc URL (will not be touched)
   - ClickUp folder (will not be touched)
   - Cekura scenario count (informational)
3. Show the user the inventory and the planned mutations
4. Get explicit confirmation (skip if `--yes`)

## Execution Order

Order matters — drain leads BEFORE flipping the lookup flag, so in-flight retries that read the sheet don't half-process.

1. **Drain leads** — Leads MasterSheet:
   - Find rows: `centre_id=X` AND `status IN ('retry_pending','calling')`
   - For each: set `status='cancelled_offboard'`, `last_outcome='offboarded_YYYY-MM-DD'`
   - Method: temp n8n webhook with `appendOrUpdate`. Schema must include all columns (set unused as `removed:true`).
2. **Disable in routing** — Centre Lookup Sheet:
   - Set `enabled=FALSE` for the centre row
3. **Rename Retell agent**:
   - GET `/get-agent/{agent_id}` to capture original name → save to inventory.json
   - PATCH `/update-agent/{agent_id}` with `agent_name = "[OFFBOARDED-YYYY-MM-DD] " + original_name`
4. **Unbind Retell phone**:
   - GET `/v2/list-phone-numbers` (rows under `items`), find row by `outbound_agent_id` OR `nickname`
   - Save original `outbound_agent_id` and `inbound_agent_id` to inventory.json
   - PATCH `/update-phone-number/{phone_number}` body `{"outbound_agent_id": null, "inbound_agent_id": null}`
5. **Generate exit report** at `/root/offboard-archives/<centre_id>-YYYY-MM-DD/`:
   - Pull last 100 calls from Retell for that agent → `calls-<centre>.json`
   - Compute stats (calls placed, real-lead conversion, last call date) → `stats.json`
   - Save full pre-state → `inventory.json`
   - Draft director email → `director-email.md` (NOT sent)
   - Write `README.md` with reactivate instructions
6. **Audit log** — append JSONL line to `/root/offboard-archives/log.jsonl`

## Verification

After execution, run:
- `curl -s "https://docs.google.com/spreadsheets/d/1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0/gviz/tq?tqx=out:csv" | grep <centre_id>` — confirm `enabled=FALSE`
- `curl -s "https://api.retellai.com/get-agent/<agent_id>" -H "Authorization: Bearer $RETELL_API_KEY" | jq .agent_name` — confirm `[OFFBOARDED-…]` prefix
- Confirm exit report directory exists with all expected files

## Rollback

If something fails mid-execution:
- The skill writes audit log entries AFTER each successful step
- Reactivate workflow uses inventory.json to restore exact pre-state
- For partial state: run reactivate with `--centre X --mode reactivate`
