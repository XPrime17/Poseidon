---
name: _TESTCASES
description: Create, maintain, and update Retell simulator test case suites for voice AI agents. USE WHEN test cases, regression tests, generate tests, test suite, simulator tests, retell tests, manage tests, add test case, remove test case, export tests.
---

# Test Cases — Retell Simulator Regression Suites

Create, maintain, and update per-agent test case suites that export as Retell simulator-compatible JSON.

Test cases are **driven by learnings** — every known failure pattern from transcript analysis becomes a regression test.

## Agent Registry

| Agent | Skill Path | Agent ID | TestCases File |
|-------|-----------|----------|----------------|
| **Emma** | `~/.claude/skills/_EMMA` | `agent_552e57364711f0eec51afa512a` | `_EMMA/TestCases.json` |
| **CNKB** | `~/.claude/skills/_CNKB` | `agent_0c6c32b61cb506fefb6ac247f4` | `_CNKB/TestCases.json` |
| **CNEGGPT** | `~/.claude/skills/_CNEGGPT` | `agent_5938532f78787d831efea1a598` | `_CNEGGPT/TestCases.json` |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Generate** | "generate tests for [agent]", "create test suite for [agent]", "build regression tests" | `Workflows/Generate.md` |
| **Manage** | "manage test cases", "add test case", "edit test case", "remove test case", "list tests" | `Workflows/Manage.md` |

## Examples

**Example 1: Generate test suite from learnings**
```
User: "Generate tests for Emma"
-> Reads _EMMA/Learnings.md for known patterns
-> Reads _EMMA/AgentConfig.md for agent context
-> Pulls current prompt via MCP for dynamic variables
-> Generates test cases targeting each known failure pattern
-> Adds happy path and edge case tests
-> Writes to _EMMA/TestCases.json
-> Shows summary and offers export
```

**Example 2: Add a specific test case**
```
User: "Add a test case for Emma where the caller hangs up mid-sentence"
-> Opens Manage workflow
-> Creates test case with proper schema
-> Appends to _EMMA/TestCases.json
```

**Example 3: List and validate**
```
User: "Show me CNKB's test cases"
-> Reads _CNKB/TestCases.json
-> Validates against schema
-> Presents summary table
```

## Related

- `Schema.md` — Retell simulator JSON format reference
- `AgentRegistry.md` — Full agent mapping with dynamic variables
- `~/.claude/skills/_VOICEAIAGENCY/MCP/` — Retell MCP server for pulling prompts
