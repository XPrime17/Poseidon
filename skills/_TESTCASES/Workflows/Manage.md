# Manage Workflow — Test Cases

**List, add, edit, and remove individual test cases from an agent's test suite.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Managing test cases"}' \
  > /dev/null 2>&1 &
```

Running **Manage** in the **Test Cases** skill...

---

## Workflow Steps

### Step 1: Identify Target Agent

Parse the user's request for agent name. Match against registry:

| Name | TestCases Path |
|------|---------------|
| Emma | `~/.claude/skills/_EMMA/TestCases.json` |
| CNKB | `~/.claude/skills/_CNKB/TestCases.json` |
| CNEGGPT | `~/.claude/skills/_CNEGGPT/TestCases.json` |

If ambiguous, use `AskUserQuestion` to clarify.

### Step 2: Determine Operation

If the user's intent is clear (e.g., "add a test case for Emma"), skip to that operation. Otherwise, use `AskUserQuestion`:

- **List** — Show all test cases with summary
- **Add** — Create a new test case
- **Edit** — Modify an existing test case
- **Remove** — Delete a test case
- **Validate** — Check JSON schema compliance

---

## Operations

### List

Read the agent's TestCases.json and present:

```
TEST CASES: [Agent Name] ([N] total)

| # | Name | Category | Metrics | Created |
|---|------|----------|---------|---------|
| 1 | Regression: Em dash in check-in | Regression | 2 | 2026-02-08 |
| 2 | Happy path: Successful booking | Happy path | 3 | 2026-02-08 |
```

If file doesn't exist or is empty, report that and suggest running Generate workflow.

### Add

Gather information for the new test case:

1. **Name** — Ask the user or infer from their description
2. **Category** — Regression, Verification, Happy path, Edge case, or Stress
3. **Scenario** — What the simulated caller is doing
4. **Metrics** — What pass/fail criteria to check
5. **Personality** — How the simulated caller behaves

Construct the test case object using:
- Dynamic variables from `AgentRegistry.md` defaults
- Current timestamp for creation/modification
- `type: "simulation"`, `tool_mocks: []`, `llm_model: "gpt-4.1"`

Build the `user_prompt` with proper `## Identity`, `## Goal`, `## Personality` sections.

**Review before writing:**
Show the complete test case JSON to the user. Use `AskUserQuestion`:
- "Save" — Append to TestCases.json
- "Edit" — Make changes first
- "Cancel" — Discard

### Edit

1. List all test cases (numbered)
2. User selects which to edit (by number or name)
3. Show current test case
4. User describes changes
5. Apply changes, update `user_modified_timestamp`
6. Show diff and confirm before writing

### Remove

1. List all test cases (numbered)
2. User selects which to remove (by number or name)
3. Show the test case being removed
4. Use `AskUserQuestion` to confirm:
   - "Remove" — Delete from TestCases.json
   - "Cancel" — Keep it

### Validate

Read TestCases.json and check each test case against Schema.md:

```
VALIDATION: [Agent Name]

| # | Name | Status | Issues |
|---|------|--------|--------|
| 1 | Regression: Em dash... | PASS | — |
| 2 | Happy path: Booking | FAIL | Missing ## Personality in user_prompt |

Result: [N/N passed]
```

Check:
- Required fields present
- `type` is `"simulation"`
- `metrics` has at least 1 entry
- `user_prompt` contains all 3 sections (## Identity, ## Goal, ## Personality)
- `dynamic_variables` has at minimum FIRST_NAME and LAST_NAME
- Timestamps are valid numbers
- JSON is well-formed

---

## Output Format

```
═══════════════════════════════════════════
  TEST CASE MANAGEMENT: [Agent Name]
  Operation: [List/Add/Edit/Remove/Validate]
═══════════════════════════════════════════

[Operation-specific output]

═══════════════════════════════════════════
```

---

## Related

- `Schema.md` — JSON format reference
- `Generate.md` — Bulk generate test suite from learnings
- `AgentRegistry.md` — Default dynamic variables per agent
