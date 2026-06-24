# E2ELeadFlowCheck — live end-to-end lead-pipeline gate

**Layer 2** of the pipeline regression suite. Run it AFTER
`PipelineRegressionCheck.py` (Layer 1, static) passes on any deploy.

| Layer | Script | What it proves | Side effects |
|-------|--------|----------------|--------------|
| 1 static | `PipelineRegressionCheck.py` | sheet ↔ workflow ↔ Retell ↔ ClickUp wiring is internally consistent | none (read-only) |
| 2 live | `E2ELeadFlowCheck.py` | a real synthetic lead flows intake → classify → enable → append → **Retell dial** | injects 1 email, rings the **test** phone |

## Why it exists
`PipelineRegressionCheck` can't see a broken *classifier regex*. The live break it
catches: `Classify Lead` matches `/New\s+CORE\s+Inquiry/i`, which does **not** match the
real LineLeader subject **`New CORE Program Inquiry`** — so those leads silently die at
`Non-Lead Dropped`. This harness sends that exact subject and FAILS if the execution
hits any drop node instead of reaching the dial.

## How it works
Everything routes through a dedicated `regression-test` Centre Lookup row
(`Testing=TRUE`, `test_number=9059672357`), so the dial always targets the owner's own
phone (`+19059672357`) and never a real lead or centre line.

It drives the **E2E Harness Ops** helper workflow
(`joLG6ji6JEMW6aaW`, webhook `https://xprime17.app.n8n.cloud/webhook/e2e-harness-ops`):
- `op=inject`  → Gmail-send the synthetic LineLeader email to `scott.james1717+regression-test@gmail.com`
- `op=addcentre` → append a Centre Lookup row (used once to create the test row)
- `op=cleanup` → MasterSheet appendOrUpdate, set `status=done` for the test `lead_id`

## Usage
```bash
# Structural validation — NO email, NO call. Always safe.
python3 E2ELeadFlowCheck.py --selfcheck

# LIVE run — injects ONE email and WILL ring +19059672357. Only when intended.
python3 E2ELeadFlowCheck.py
```
Exit codes: **0 = PASS**, **1 = FAIL**, **2 = misconfig / missing keys**.

## What the live run asserts
1. An intake-workflow execution matching the unique `E2E <ts>` marker appears (≤120 s).
2. It did **not** terminate at `Non-Lead Dropped` / `Sanitization Failed` / `Not Enabled` / `Centre not found`.
3. It reached `Append row in sheet` (and `Retell: Call Prospect` when in-hours 09–20 ET).
4. A Retell call to `+19059672357` was created after inject (v3 `list-calls`).
5. Cleanup: the appended MasterSheet row is marked `status=done` so the Retry Scheduler never re-dials.

## Env
`N8N_API_KEY` (required), `RETELL_API_KEY` (required for the call assertion / selfcheck).
Both are sourced automatically from `/root/.env` and `~/.claude/.env`.

## Weekly canary
`e2e-leadflow-check.timer` runs the harness every **Thursday 19:00 America/Toronto**.
On FAIL the service emails `scott.james@codeninjas.com` (Resend, Mozilla UA).
The timer is enabled but the first live run is triggered manually by the owner.
