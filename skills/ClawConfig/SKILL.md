---
name: ClawConfig
description: Moltbot/Clawdbot Telegram bot configuration and maintenance. USE WHEN moltbot, clawdbot, telegram bot, bot config, bot debug, bot deploy, gateway status, bot not responding, bot maintenance, cloudflare sandbox.
---

# ClawConfig

Configuration, deployment, debugging, and maintenance for the Moltbot/Clawdbot Telegram bot running on Cloudflare Sandbox.

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/ClawConfig/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

## 🚨 MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the ClawConfig skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **ClawConfig** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Deploy** | "deploy bot", "push changes", "deploy moltbot" | `Workflows/Deploy.md` |
| **Debug** | "bot not responding", "debug bot", "troubleshoot" | `Workflows/Debug.md` |
| **Status** | "gateway status", "check bot", "is bot running" | `Workflows/Status.md` |
| **Logs** | "view logs", "bot logs", "gateway logs" | `Workflows/Logs.md` |
| **Config** | "change model", "update config", "set policy" | `Workflows/Config.md` |
| **AccessFix** | "cloudflare access", "302 redirect", "auth issue" | `Workflows/AccessFix.md` |

## Critical Paths

| Resource | Path |
|----------|------|
| **Moltworker Source** | `/root/moltworker/` |
| **Gateway Process** | `src/gateway/process.ts` |
| **Environment Vars** | `src/gateway/env.ts` |
| **Version Tracking** | `src/gateway/version.ts` |
| **Startup Script** | `start-moltbot.sh` |
| **Debug Routes** | `src/routes/debug.ts` |
| **Main Worker** | `src/index.ts` |

## Quick Reference

**Architecture:**
- Cloudflare Worker → Cloudflare Sandbox → Moltbot Container → Telegram API
- Config hash in `/tmp/gateway-config-hash` tracks version
- Gateway auto-restarts when config hash changes

**Key Commands:**
```bash
# Build
cd /root/moltworker && npm run build

# Deploy (requires CLOUDFLARE_API_TOKEN)
CLOUDFLARE_API_TOKEN=xxx npx wrangler deploy

# Tail logs
CLOUDFLARE_API_TOKEN=xxx npx wrangler tail --format=pretty
```

**Debug Endpoints (require CF Access or DEBUG_ROUTES=true):**
- `/debug/version-check` - Config hash comparison
- `/debug/processes` - Container process list
- `/debug/logs` - Gateway stdout/stderr
- `/debug/container-config` - Moltbot JSON config
- `/debug-public` - Public debug info (no auth)

## Examples

**Example 1: Deploy after code changes**
```
User: "deploy the bot changes"
→ Invokes Deploy workflow
→ Runs npm build
→ Executes wrangler deploy with API token
→ Reports version ID and confirms deployment
```

**Example 2: Bot not responding to messages**
```
User: "telegram bot isn't responding"
→ Invokes Debug workflow
→ Checks wrangler tail for errors
→ Verifies config hash status
→ Checks for CF Access redirect issues
→ Identifies root cause and fixes
```

**Example 3: Check current gateway status**
```
User: "is the gateway running?"
→ Invokes Status workflow
→ Hits /debug/version-check endpoint
→ Reports gateway status, config hash match, process ID
```

**Example 4: Change the default model**
```
User: "switch to Sonnet instead of Opus"
→ Invokes Config workflow
→ Edits start-moltbot.sh default model
→ Deploys changes
→ Gateway auto-restarts with new model
```

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Bot not responding | Gateway not started | Check logs, trigger request |
| 302 on all requests | CF Access protecting path | Update Access Application policy |
| Rate limit errors | Using Opus (10k tokens/min) | Switch to Sonnet |
| "Durable Object reset" | New deployment killed container | Wait for cron or send request |
| Config changes not applied | Old gateway still running | Version hash triggers restart |
