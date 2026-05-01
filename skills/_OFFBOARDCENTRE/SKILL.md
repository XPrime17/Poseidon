---
name: _OFFBOARDCENTRE
description: Offboard a Code Ninjas centre from the voice AI pipeline. Halts leads, disables routing, optionally releases phone numbers and archives KBs. USE WHEN offboard centre, deactivate centre, remove centre, exit centre, end pilot, terminate centre, decommission centre, archive centre, reactivate centre, undo offboard.
---

# _OFFBOARDCENTRE — Centre Offboarding

Two-tier offboarding for centres exiting the voice AI pipeline, plus a reactivate path for soft offboards.

## 🚨 MANDATORY: Voice Notification

Before executing any workflow, fire:

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Offboarding centre <NAME> in <MODE> mode"}' \
  > /dev/null 2>&1 &
```

## Workflow Routing

| Trigger | Mode | File |
|---------|------|------|
| "soft offboard \<centre\>", "halt centre \<centre\>", "disable centre \<centre\>" | Soft (reversible) | `Workflows/SoftOffboard.md` |
| "hard offboard \<centre\>", "fully decommission \<centre\>", "release \<centre\>" | Hard (terminal) | `Workflows/HardOffboard.md` |
| "reactivate centre \<centre\>", "undo offboard \<centre\>" | Reactivate | `Workflows/Reactivate.md` |

**Default when ambiguous:** soft. Hard is opt-in only — it is irreversible (Twilio number released, Cekura scenarios archived, KB doc archived).

## Quick Reference

**Centre identifier** = `centre_id` from Centre Lookup Sheet (e.g. `ma-canton`, `tx-spring-rayford`). NEVER use display name.

**Tool**: `bun ~/.claude/skills/_OFFBOARDCENTRE/Tools/Offboard.ts --centre <centre_id> --mode <soft|hard|reactivate> [--dry-run] [--yes]`

## Environment

The tool reads secrets from environment variables (never committed). Set these before running:

```bash
export RETELL_API_KEY=...           # 1Password: Retell AI API
export N8N_CLOUD_API_KEY=...        # 1Password: n8n Cloud API
export RESEND_API_KEY=...           # 1Password: Resend
export CLICKUP_API_TOKEN=...        # 1Password: ClickUp
export N8N_SHEETS_WRITE_CRED_ID=... # n8n credential ID for Google Sheets write
export N8N_SHEETS_READ_CRED_ID=...  # n8n credential ID for Google Sheets read
```

Tool fails fast on startup if any are missing.

**Always start with `--dry-run`.** Print the inventory and proposed mutations. Confirm with Scott. Then re-run without `--dry-run`.

## What Each Mode Does

| Action | Soft | Hard | Reactivate |
|--------|:----:|:----:|:----:|
| Drain open leads (`retry_pending`/`calling` → `cancelled_offboard`) | ✅ | ✅ | — |
| Centre Lookup Sheet `enabled=FALSE` | ✅ | ✅ | flips to TRUE |
| Rename Retell agent `[OFFBOARDED-YYYY-MM-DD]` | ✅ | ✅ | strip prefix |
| Unbind Retell phone agent | ✅ | ✅ | re-bind |
| Delete Retell phone (releases Twilio number) | — | ✅ | — |
| Archive KB Google Doc (rename `[ARCHIVED]`) | — | ✅ | — |
| Archive ClickUp folder | — | ✅ | — |
| Archive Cekura scenarios | — | ✅ | — |
| Generate exit report + draft director email | ✅ | ✅ | — |
| Audit log entry to `/root/offboard-archives/log.jsonl` | ✅ | ✅ | ✅ |

## Resource Inventory

When in doubt about what touchpoints exist for a centre, load `Inventory.md`:
`SkillSearch('offboardcentre inventory')`

## Examples

```
User: "Offboard Canton — soft"
→ Tool: --centre ma-canton --mode soft --dry-run
→ Show: 1 active lead, agent_f10e..., phone +17744062037, KB doc, 0 ClickUp lists
→ Scott confirms → re-run without --dry-run
→ Result: lead drained, sheet flag flipped, agent renamed, phone unbound, exit report at /root/offboard-archives/ma-canton-2026-05-01/

User: "Hard offboard all four NV centres"
→ Confirm twice (hard mode requires double-confirm)
→ Tool runs once per centre with --mode hard
→ Twilio numbers released, KB docs archived, Cekura cleaned up

User: "Reactivate Round Rock"
→ Tool: --centre tx-round-rock-ryans-crossing --mode reactivate
→ enabled=TRUE, agent name un-prefixed, phone re-bound
```

## Files

- `SKILL.md` — this file (routing)
- `Inventory.md` — per-resource SOP (what each touchpoint is, where it lives, how to mutate)
- `Workflows/SoftOffboard.md` — soft mode SOP
- `Workflows/HardOffboard.md` — hard mode SOP
- `Workflows/Reactivate.md` — reactivate SOP
- `Tools/Offboard.ts` — Bun CLI that orchestrates everything
