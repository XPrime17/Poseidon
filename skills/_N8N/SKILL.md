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

## Workflow Registry

| Name | ID | Purpose |
|------|-----|---------|
| **End Of Call - Multicentre** | `pWDLwPlySBQ4WpCn` | Production — Retell post-call processing |
| **[TEST] End Of Call - Wrong Location Handling** | `xYZhARzmBwQYhtRA` | Test clone of production |

## Credentials Registry

| Name | ID | Type |
|------|-----|------|
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
