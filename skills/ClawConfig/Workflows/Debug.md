# Debug Workflow

Troubleshoot Moltbot/Telegram bot issues when bot is not responding.

## Diagnostic Steps

### 1. Check Live Logs

```bash
CLOUDFLARE_API_TOKEN=<token> timeout 30 npx wrangler tail --format=pretty
```

Look for:
- `[cron]` messages showing gateway start attempts
- Error messages like "Durable Object reset"
- Rate limit errors (429)
- Gateway startup failures

### 2. Check Gateway Version Status

Try the public debug endpoint:
```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug-public" | jq .
```

Or with auth:
```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug/version-check"
```

**Expected output:**
```json
{
  "gateway_running": true,
  "config_current": true,
  "expected_hash": "abc123",
  "running_hash": "abc123"
}
```

### 3. Check for Cloudflare Access Issues

```bash
curl -sS -I "https://moltbot-sandbox.scott-james1717.workers.dev/sandbox-health" | head -5
```

**If you see:**
- `HTTP 302` with `location: ...cloudflareaccess.com` → CF Access is blocking
- This means Access Application is protecting paths that should be public

**Fix:** Update CF Access Application in Zero Trust Dashboard to only protect `/_admin/*` or add Bypass policies.

### 4. Check Process List

```bash
# Via debug endpoint (if accessible)
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug/processes?logs=true"
```

### 5. Common Issues and Fixes

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| No logs appearing | Gateway not starting | Wait for cron or trigger request |
| "Durable Object reset" | Deploy killed container | Normal - wait for restart |
| Rate limit 429 | Using Opus model | Change to Sonnet in start-moltbot.sh |
| 302 on all paths | CF Access blocking | Update Access Application policy |
| "container exit due to version rollout" | Deploy in progress | Wait 1-2 minutes |
| "No config hash found" | Pre-version gateway | Will auto-restart |

### 6. Force Gateway Restart

If gateway is stuck, trigger a config change to force restart:

1. Make trivial change to environment
2. Deploy
3. Gateway detects hash mismatch and restarts

Or wait for next cron tick (every 5 minutes).

## Escalation

If standard debugging doesn't help:
1. Check Cloudflare Dashboard → Workers → moltbot-sandbox → Logs
2. Check container image was built correctly
3. Verify secrets are set: `wrangler secret list`
