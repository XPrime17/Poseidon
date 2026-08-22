---
name: _N8N
description: n8n workflow deployment and testing. USE WHEN deploy n8n, push to n8n, test workflow, n8n changes, update workflow, n8n test, deploy workflow, push workflow changes.
---

# _N8N — n8n Workflow Deployment

Deploy and test n8n workflow changes via the n8n cloud API.

## Infrastructure

| Field | Value |
|-------|-------|
| **Cloud Instance** | `xprime17.app.n8n.cloud` |
| **API Key Env Var** | `N8N_API_KEY` (in `/root/.env`) |
| **API Base** | `https://xprime17.app.n8n.cloud/api/v1` |

## Regression Gate — RUN AFTER EVERY PIPELINE CHANGE

**Mandatory "definition of done"** for any change to a lead-pipeline workflow, the Centre
Lookup sheet, or a centre's Retell phone bindings:

```bash
set -a; . /root/.env; . ~/.claude/.env; set +a
python3 ~/.claude/skills/_N8N/Tools/PipelineRegressionCheck.py   # exit 0 = PASS, 1 = FAIL
```

It cross-validates Centre Lookup ↔ live workflow column refs ↔ Retell inbound bindings ↔
ClickUp, and FAILS on the class of break that took EG inbound offline silently for 10 days
(May-31 2026). A change is **not shipped** until this returns PASS. WARNs flag centres
provisioned-but-not-wired (fix before activating). See `Tools/PipelineRegressionCheck.py`.

## E2E Gate — RUN AFTER BEHAVIOR-CHANGING RELEASES (added 2026-08-22)

The static gate checks wiring, not behavior. For any change that alters **runtime behavior**
of the lead pipeline (dial logic, scheduling/cadence, slot sourcing, calendar_api, EOC
processing), ALSO fire the E2E harness — do not wait for the Thursday 19:00 ET canary:

```bash
set -a; . /root/.env; set +a
python3 ~/.claude/skills/_N8N/Tools/E2ELeadFlowCheck.py   # injects synthetic lead → asserts real dial
```

**Announce first — it rings Scott's cell.** Lesson from 2026-08-22 (lead-reactivation#67):
cache-first shipped hours after the weekly canary passed and a latent scheduler bug burned
real leads' attempts for 2 days before the next check would have run. KNOWN GAP: the harness
only covers ingest→Outbound dial; the Retry Scheduler path is untested (#67 tracks adding it).

## Workflow Registry

| Name | ID | Purpose |
|------|-----|---------|
| **End Of Call - Multicentre** | `pWDLwPlySBQ4WpCn` | Production — Retell post-call processing |
| **[TEST] End Of Call - Wrong Location Handling** | `xYZhARzmBwQYhtRA` | Test clone of production |
| **Centre Feedback → GitHub Issue** | `PZpOxzKcda7Dorq1` | Form → GitHub issue in `XPrime17/lead-reactivation`. Form URL: `https://xprime17.app.n8n.cloud/form/centre-feedback` |

## Credentials Registry

| Name | ID | Type |
|------|-----|------|
| GitHub - XPrime17 | `zmYfj06Xis36lTQ0` | githubApi |
| Gmail account | `x1W7EpNhmEdx8cOR` | gmailOAuth2 |
| Google Sheets account 3 | `yjVHcEWrpyDmxkvv` | googleSheetsOAuth2Api |
| Google Sheets account | `ybuxqM8F2NkyCA7e` | googleSheetsOAuth2Api |
| Skyvern account | `chQjvPAPfW4FFGYW` | skyvernApi |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **DeployTest** | "deploy n8n", "push to n8n", "test workflow", "push workflow changes" | `Workflows/DeployTest.md` |

## Rules

1. **NEVER push directly to production workflows.** Always deploy to a test workflow.
2. **All new nodes MUST be wrapped in a sticky note** with a description of what was added, when, and why.
3. **Test workflows stay inactive** until Scott manually activates them.
4. **After deploying**, provide the n8n cloud URL so Scott can visually review.

## n8n API Gotchas (Learned April 2026)

### PUT Workflow
- `active` is **read-only** on PUT. Use `/activate` and `/deactivate` endpoints instead.
- **Strip these fields before PUT** or you'll get 400: `updatedAt`, `createdAt`, `id`, `description`, `isArchived`, `meta`, `pinData`, `versionId`, `activeVersionId`, `versionCounter`, `triggerCount`, `shared`, `activeVersion`, `active`, `tags`
- Also strip from `settings`: `availableInMCP`, `timeSavedMode`

### Node Rename = Connection Break
- n8n connections map uses **node names as keys**. If you rename a node via API (e.g., "Every 15 Minutes" → "Every 90 Minutes"), you MUST update the connection key too.
- The n8n **UI** does this automatically. The **API** does NOT.
- **Symptom:** Trigger fires but nothing downstream executes (0.0s duration).

### Google Sheets appendOrUpdate
- `matchingColumns` only works with **real sheet column names**. `row_number` is n8n metadata — matching on it silently APPENDS instead of updating.
- If duplicate values exist in the matching column, you get "Multiple matches found" error.
- **Safe approach for targeted updates:** Use HTTP Request node with Google Sheets API `values:batchUpdate` to update specific cells by A1 range (e.g., `'All Centres'!L290`).

### Gmail Trigger
- `after:` date search is **inclusive** (`after:2026/04/03` includes April 3)
- On re-auth, the trigger's internal "last seen" pointer **jumps to current time** — skipping all backlog emails
- After n8n cloud downtime, Gmail triggers get stuck. Fix: deactivate → reactivate.

### Temp Webhook Workflows
- Pattern: POST /workflows (create) → POST /activate → GET webhook URL → DELETE
- `responseMode: "onReceived"` returns HTTP 200 immediately; workflow runs in background
- `responseMode: "lastNode"` waits for workflow to complete (subject to timeout)
- Workflow `executionTimeout` is inherited from cloned workflows — set to `-1` or remove for long-running operations

### Code Node Modes
- Default mode is `runOnceForAllItems` — runs ONCE regardless of input item count
- For batch processing, set `mode: "runOnceForEachItem"` to process each item independently
- **Never clone production workflows for batch processing** without changing Code node modes

## Examples

**Example 1: Deploy new nodes to test**
```
User: "Push the wrong location handling to n8n"
→ Invokes DeployTest workflow
→ Fetches current test workflow from n8n cloud
→ Adds new nodes wrapped in a sticky note
→ PUTs updated workflow back to n8n cloud
→ Returns URL for visual review
```

**Example 2: Create test clone**
```
User: "Create a test copy of the production workflow"
→ Invokes DeployTest workflow
→ GETs production workflow
→ Creates new workflow with [TEST] prefix
→ Returns new workflow ID and URL
```
