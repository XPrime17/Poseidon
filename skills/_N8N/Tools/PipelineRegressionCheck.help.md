# PipelineRegressionCheck

Layer-1 contract/integrity check for the voice-AI lead pipeline. **Run after any change** to a
lead-pipeline n8n workflow, the Centre Lookup sheet, or a centre's Retell phone bindings.

## Run
```bash
set -a; . /root/.env; . ~/.claude/.env; set +a
python3 ~/.claude/skills/_N8N/Tools/PipelineRegressionCheck.py
```
Exit `0` = PASS, `1` = FAIL (use as a gate), `2` = misconfig (no N8N_API_KEY).

## What it checks
- **A. Column existence** — every Centre Lookup column referenced by a live workflow
  (`lookupColumn` of nodes reading the sheet + `$('Lookup Centre…').item.json.<col>` expressions)
  must exist in the sheet. Catches a column rename that misses a node.
- **B. Inbound consistency** — every row with `inbound_number` set must also have
  `clickup_list_id`, `clickup_user_ids`, `centre_email`.
- **C. Inbound coverage** — every centre in `LIVE_INBOUND_CENTRE_IDS` must have `inbound_number`
  populated AND bound to an inbound agent in Retell. Stray Retell inbound bindings with no row → WARN.
- **D. Outbound** — every `enabled` row must have `outbound_number`.
- **E. ClickUp** — each live inbound centre's `clickup_list_id` must resolve via the ClickUp API.

## Maintenance
- Reads the sheet via the **CSV export** endpoint (fresher than gviz, no float artifacts).
- When a centre's inbound forwarding goes live, add its `centre_id` to `LIVE_INBOUND_CENTRE_IDS`
  (top of the script) so coverage is enforced (FAIL) rather than warned.
- Add new test/dev inbound numbers to `EXCLUDE_INBOUND_NUMBERS`.

## Why it exists
The May-31 2026 inbound refactor keyed the Centre lookup on a column whose value EG didn't have,
silently orphaning EG inbound for 10 days (no ClickUp tasks). Cekura tests the agent conversation,
the daily audit is detective-only — neither caught a contract break at change time. This does.
