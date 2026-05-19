---
name: Session Tracker
description: Claude Code session tracking system — local JSON + Google Sheet sync via n8n webhook
type: project
---

## Session Tracker (BUILT 2026-03-25)

Tracks every Claude Code session with auto-generated descriptions, synced to Google Sheet on session end.

**Why:** Gives Scott visibility into all sessions (what he's working on, when) and the ability to resume any session from a fresh terminal via `claude -r {session_id}`.

**How to apply:** When Scott asks "what was I working on?" or "resume the X work", use SessionLookup.ts to find the session. When debugging hooks, check `~/.claude/session-tracker.json` for local state.

### Architecture
```
SessionStart hook       → local JSON (new entry, status=active)
UserPromptSubmit hook   → local JSON (Haiku inference → description, first prompt only)
SessionEnd hook         → local JSON (mark completed) → n8n webhook → Google Sheet
SessionLookup.ts        → reads local JSON → formatted table with `claude -r` commands
```

### Files
| Component | Path |
|-----------|------|
| Local tracker | `~/.claude/session-tracker.json` |
| SessionStart hook | `~/.claude/hooks/SessionTracker.hook.ts` |
| UserPromptSubmit hook | `~/.claude/hooks/SessionTrackerDescribe.hook.ts` |
| SessionEnd hook | `~/.claude/hooks/SessionTrackerEnd.hook.ts` |
| Lookup CLI | `~/.claude/skills/PAI/Tools/SessionLookup.ts` |

### Google Sheet
- **Name:** Claude Code Sessions
- **Sheet ID:** `1JbwkccTAQikd366-oNTtljdzXSOH5kZMUeNraOQd6Vk`
- **URL:** https://docs.google.com/spreadsheets/d/1JbwkccTAQikd366-oNTtljdzXSOH5kZMUeNraOQd6Vk/edit
- **Columns:** session_id, description, first_prompt, started_at, ended_at, status, message_count, duration_minutes, resume_command

### n8n Workflow
- **Name:** Session Tracker Sync
- **Workflow ID:** `3CPNKiVRCnRIySjB`
- **Webhook URL:** `https://xprime17.app.n8n.cloud/webhook/session-tracker-sync`
- **Operation:** Google Sheets appendOrUpdate on session_id
- **Credential:** `yjVHcEWrpyDmxkvv` (Google Sheets account 3)

### Usage
```bash
bun SessionLookup.ts                  # Last 10 sessions
bun SessionLookup.ts "retry bug"      # Search by description
bun SessionLookup.ts --active         # Only active sessions
bun SessionLookup.ts --id abc123      # Find by ID prefix
```

### Key Notes
- Description generated via Haiku inference on first prompt (~1-2s, fires once per session)
- Stale active sessions (>24h) auto-marked as completed on next session start
- Subagent sessions are skipped (checked via `CLAUDE_AGENT_TYPE` env var)
- Concurrent session safety via atomic write pattern (temp file → rename)
