# Status Workflow

Check the current status of the Moltbot gateway.

## Quick Status Check

### 1. Check Version/Config Status

```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug-public" | jq .
```

**Healthy output shows:**
- Processes array with gateway running
- Gateway logs showing Telegram channel connected
- Config with correct settings

### 2. Check API Status

```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/api/status"
```

**Expected:**
```json
{"ok": true, "status": "running", "processId": "proc_xxx"}
```

**If 302 redirect:** Cloudflare Access is blocking - see AccessFix workflow.

### 3. Full Process List

```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug/processes?logs=true" | jq .
```

Look for:
- `start-moltbot.sh` or `clawdbot gateway` process
- Status: `running`
- Logs showing successful startup

## Status Indicators

| Status | Meaning |
|--------|---------|
| `running` | Gateway is active and healthy |
| `starting` | Gateway is initializing |
| `not_running` | No gateway process found |
| `not_responding` | Process exists but port not open |

## Report Format

Summarize status for user:

```
Gateway Status: [RUNNING/STOPPED/STARTING]
Process ID: proc_xxx
Config Hash: abc123 (current/outdated)
Telegram: [connected/disconnected]
Last Cron: [timestamp]
```
