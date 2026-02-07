# AgentAudit

Audit voice AI agents against a 14-point best practices checklist.

## Usage

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/AgentAudit.ts [options]
```

## Options

| Flag | Description |
|------|-------------|
| `-a, --agent-name` | Name of agent to audit |
| `-c, --checklist` | Print full 14-point reference checklist |
| `-i, --interactive` | Interactive mode (answer y/n per point) |
| `-o, --output` | Output format: text (default), json |

## The 14 Points

| # | Category | Point |
|---|----------|-------|
| 1 | PROMPT | Personality defined |
| 2 | PROMPT | Knowledge base scoped |
| 3 | FLOW | Escalation paths defined |
| 4 | PROMPT | Conversation examples included |
| 5 | PROMPT | Custom greeting |
| 6 | FLOW | Silence handling |
| 7 | FLOW | Objection responses |
| 8 | FLOW | Booking confirmation |
| 9 | FLOW | Sentiment awareness |
| 10 | TECH | Tool call efficiency |
| 11 | FLOW | Fallback behavior |
| 12 | SECURITY | Prompt injection resistant |
| 13 | FLOW | End-of-call summary |
| 14 | QA | Edge cases tested |

## Scoring

- **14/14** = PASS
- **11-13/14** = PASS WITH NOTES
- **<11/14** = FAIL

## Used By

- `QaTest` workflow — initial QA at build time
- `AuditAgent` workflow — ongoing optimization audits
- `BuildAgent` workflow — final check before delivery
