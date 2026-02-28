# Claude Code Remote Features — LEFT OFF (2026-02-27)

## Status
- **Version:** v2.1.62 on droplet (latest)
- **Auth:** claude.ai, Max plan, scott.james@codeninjas.com
- **Task:** Setting up Claude Code headless/API mode for remote/programmatic use

## What Was Decided
- Scott wants **Remote Control** (new Feb 25 feature) as primary
- Use case: all of the above (mobile access, automated tasks, custom agents, exploration)
- SDK language: **NOT YET CHOSEN** — paused before installing

## Three Features Available

### 1. Remote Control (NEW — Feb 25, 2026)
- `claude remote-control` or `/rc` from within session
- Syncs local terminal session to claude.ai/code and Claude mobile app
- **NOT YET AVAILABLE** on Scott's account — returns "not yet available on your plan" despite Max subscription
- Research preview, gradual rollout — will become available automatically
- Always-on mode: `/config` → "Enable Remote Control for all sessions"

### 2. Headless Mode (`claude -p`)
- Already available, just needs testing outside a Claude session
- Key flags: `--output-format json`, `--json-schema`, `--allowedTools`, `--max-budget-usd`
- Can resume sessions: `--resume SESSION_ID`
- Cannot be tested from within a Claude Code session (nested invocation silently suppressed)

### 3. Agent SDK
- **Python:** `pip install claude-agent-sdk`
- **TypeScript:** `npm install @anthropic-ai/claude-agent-sdk` (or bun)
- Full programmatic control: sessions, hooks, custom tools, subagents, MCP
- Auth: `ANTHROPIC_API_KEY` env var or claude.ai login

## Remaining Tasks
1. Install Agent SDK (TypeScript recommended — matches PAI stack)
2. Create test scripts for headless mode (run outside session to verify)
3. Build PAI integration examples (cron automation, n8n triggers)
4. Monitor Remote Control rollout — check periodically with `claude remote-control`
5. Set up always-on Remote Control once available

## Key Learning
- `claude -p` produces 0 bytes output when run from Bash tool inside a Claude Code session
- All Claude env vars (CLAUDECODE, CLAUDE_CODE_ENTRYPOINT, etc.) must be unset — but even then it silently exits
- Test headless mode from a separate terminal session, not from within Claude Code
