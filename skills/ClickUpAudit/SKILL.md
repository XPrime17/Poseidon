---
name: ClickUpAudit
description: Audit the Codeninjas ClickUp workspace for overdue tasks and improper closures. USE WHEN user asks for a ClickUp audit, overdue report, overdue analysis, task accountability, who has overdue tasks, stale tasks, were tasks closed properly, closure compliance, or a ClickUp task health summary.
---

# ClickUpAudit

Read-only accountability auditing for the Codeninjas ClickUp workspace. Answers
two questions Scott cares about:

1. **Overdue analysis** — what's past due, how stale, who owns it. (No policy needed.)
2. **Closure compliance** — are tasks being *finished* before they're marked done,
   or is someone just flipping the status? Defined **per-list** (see Config).

Distinct from the `_CLICKUP` skill (which creates/manages tasks). This skill only
reads and reports — it never writes to ClickUp.

## Auth

Uses `CLICKUP_PERSONAL_TOKEN` from `~/.claude/.env` + direct v2 REST API.
The `mcp__clickup__*` MCP server uses OAuth that expires — do **not** rely on it.

## Tools

| Tool | Purpose | Writes? |
|------|---------|---------|
| `Tools/Recon.ts` | Map the space/folder/list tree + sample closure signals per list. Use when designing/tuning closure policy. | No |
| `Tools/Overdue.ts` | Overdue-task report: by age bucket, by list, by assignee, worst offenders. | No |
| `Tools/Closure.ts` | Closure-compliance: flags tasks closed without the evidence a list requires (note/checklist/subtasks/field). Driven by `Config/audit-config.json`. | No |

```bash
cd ~/.claude/skills/ClickUpAudit
bun Tools/Recon.ts   [--days 45] [--json --out recon.json]
bun Tools/Overdue.ts [--top 15]  [--json --out overdue.json]
bun Tools/Closure.ts [--days 30] [--json --out closure.json]
```

## Configuration — `Config/audit-config.json`

- `ignoreSpaceIds` / `ignoreSpaceNames` / `ignoreListNamePatterns` — remove
  records-not-work (CRM rows, import lists, reference databases, checklist
  templates) so they don't pollute accountability numbers.
- `overdue.staleDays`, `overdue.buckets` — overdue aging.
- `closurePolicy` — **per-list** rules. Each entry:
  `{ label, requireNote, requireChecklistComplete, requireNoOpenSubtasks, requireAssignee, requiredCustomFields[] }`.
  A list with no entry is reported for overdue only, not closure compliance.

## Key facts about this workspace (from recon, 2026-06-06)

- Team does **not** use ClickUp time tracking (0%) → never use "no time logged" as a signal.
- Custom fields barely used → "required field" rules apply to almost nothing today.
  Hold/cancellation reasons live in a separate XLS (candidate to migrate in).
- "Properly closed" in practice = **a comment/note exists** describing what was done.
- Biggest real signal: Ops › New Student On-Ramp › "Students" (`901113048282`) —
  chronic past-due (81% of closures late).

## Output requirements

- Lead with the headline number (e.g. "65 overdue, 60 of them 30d+").
- Always break down by **assignee** (accountability) and by **list**.
- Link tasks via `https://app.clickup.com/t/<id>`.
- Flag false-positive-prone lists (event "due dates", checklist templates).
- Never dump raw JSON to Scott — format it.

## Roadmap

- [x] Phase 1 — Recon (tree + closure-signal sampling)
- [x] Phase 2 — Overdue report
- [ ] Phase 3 — Closure-compliance engine (`Tools/Closure.ts`, per-list policy)
- [ ] Phase 4 — Schedule weekly on Poseidon, deliver via email/voice
