# MoltbotAudit Workflow

Run security audit specifically for the Moltbot/Clawdbot Telegram bot.

## What This Checks

### 1. Authentication & Secrets

| Check | Severity | What We Look For |
|-------|----------|------------------|
| Gateway token set | CRITICAL | MOLTBOT_GATEWAY_TOKEN in wrangler secrets |
| API key not exposed | CRITICAL | Keys not in logs, public endpoints, git |
| CF Access configured | HIGH | CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD set |
| Debug routes disabled | HIGH | DEBUG_ROUTES not 'true' in production |

### 2. Network Security

| Check | Severity | What We Look For |
|-------|----------|------------------|
| Admin routes protected | HIGH | /_admin/* requires CF Access |
| Public endpoints limited | MEDIUM | Only intended paths are public |
| HTTPS enforced | MEDIUM | No HTTP access allowed |

### 3. Runtime Security

| Check | Severity | What We Look For |
|-------|----------|------------------|
| Gateway healthy | MEDIUM | Process running, port responding |
| Config hash current | LOW | No stale config |
| Rate limits OK | INFO | No recent 429 errors |

### 4. Operational Security

| Check | Severity | What We Look For |
|-------|----------|------------------|
| Telegram token not leaked | CRITICAL | Token not in public logs/responses |
| Model appropriate | INFO | Not using Opus (rate limit risk) |
| R2 backup working | LOW | Recent sync timestamp |

## Running the Audit

### Manual Run

```bash
bun ~/.claude/skills/SecurityAudit/Tools/MoltbotSecurityCheck.ts
```

### As Part of Hourly Scan

The security-audit-wrapper.sh runs this automatically alongside Lynis.

## Output Format

```
=== MOLTBOT SECURITY AUDIT ===
Date: 2026-02-02T03:00:00Z

[CRITICAL] 0 issues
[HIGH]     1 issue
[MEDIUM]   0 issues
[LOW]      0 issues
[INFO]     2 notes

DETAILS:
--------
[HIGH] Debug routes enabled in production
  → DEBUG_ROUTES=true allows unauthenticated access to /debug/*
  → Fix: wrangler secret delete DEBUG_ROUTES

[INFO] Using Sonnet model (recommended)
[INFO] Last R2 sync: 5 minutes ago
```

## Remediation

For each finding, the tool provides:
1. What was found
2. Why it's a risk
3. How to fix it

## Integration with Email Alerts

When run via hourly timer:
- Findings are appended to the security report email
- CRITICAL/HIGH findings trigger immediate notification
- INFO findings are batched in daily summary
