# TestCaseManager

CLI tool for validating, listing, and summarizing Retell simulator test case suites.

## Usage

```bash
bun run ~/.claude/skills/_TESTCASES/Tools/TestCaseManager.ts --agent <name> [options]
```

## Agents

| Name | Agent |
|------|-------|
| `emma` | Code Ninjas Lead Reactivation - Emma |
| `cnkb` | Code Ninjas with Knowledge Base |
| `cneggpt` | Code Ninjas EG GPT |

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--agent <name>` | `-a` | Target agent (required) |
| `--list` | `-l` | List all test cases with details |
| `--validate` | `-v` | Validate against Retell simulator schema |
| `--output <fmt>` | `-o` | Output format: `text` (default) or `json` |
| `--help` | `-h` | Show help |

## Examples

```bash
# Summary of Emma's test suite
bun run TestCaseManager.ts --agent emma

# List all test cases
bun run TestCaseManager.ts --agent emma --list

# Validate schema compliance
bun run TestCaseManager.ts --agent cnkb --validate

# JSON output for programmatic use
bun run TestCaseManager.ts --agent emma --validate --output json
```

## Validation Checks

- Required fields present (name, dynamic_variables, metrics, user_prompt, type, tool_mocks, llm_model)
- `type` is exactly `"simulation"`
- `metrics` has at least 1 entry
- `user_prompt` contains `## Identity`, `## Goal`, `## Personality` sections
- `dynamic_variables` has FIRST_NAME and LAST_NAME
- Timestamps are valid numbers
