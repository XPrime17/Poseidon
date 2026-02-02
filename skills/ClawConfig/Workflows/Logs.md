# Logs Workflow

View gateway and worker logs for debugging.

## Live Logs (Streaming)

```bash
CLOUDFLARE_API_TOKEN=<token> npx wrangler tail --format=pretty
```

**Options:**
- `--format=pretty` - Human-readable output
- `--format=json` - Machine-parseable JSON

**Tip:** Use `timeout 60` to auto-stop after 60 seconds:
```bash
CLOUDFLARE_API_TOKEN=<token> timeout 60 npx wrangler tail --format=pretty
```

## Gateway Process Logs

### Via Debug Endpoint

```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug/logs" | jq .
```

Returns stdout/stderr from the gateway process.

### Via Process List

```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug/processes?logs=true" | jq '.processes[] | select(.command | contains("gateway") or contains("moltbot"))'
```

## Container Config

View the generated moltbot config inside the container:

```bash
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/debug/container-config" | jq .
```

## Key Log Patterns

| Pattern | Meaning |
|---------|---------|
| `[cron] Ensuring gateway...` | Cron checking gateway status |
| `[version] Gateway config mismatch` | Config changed, restarting |
| `[Gateway] Moltbot gateway is ready!` | Successful startup |
| `Telegram channel connected` | Telegram polling active |
| `rate_limit_error` | Hit API rate limits |
| `Durable Object reset` | Container killed by deploy |

## Filtering Logs

When tailing, look for specific patterns:

```bash
# Filter for errors only
CLOUDFLARE_API_TOKEN=<token> npx wrangler tail --format=json 2>&1 | jq 'select(.logs[].level == "error")'

# Filter for cron events
CLOUDFLARE_API_TOKEN=<token> npx wrangler tail --format=json 2>&1 | jq 'select(.event.cron)'
```
