# Generate Workflow — Test Cases

**Read agent learnings, pull current prompt, generate targeted regression test suite, write Retell-compatible JSON.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Generating test cases"}' \
  > /dev/null 2>&1 &
```

Running **Generate** in the **Test Cases** skill...

---

## Workflow Steps

### Step 1: Identify Target Agent

Parse the user's request to determine which agent to generate tests for. Match against the Agent Registry:

| Name | Skill Path |
|------|-----------|
| Emma | `~/.claude/skills/_EMMA` |
| CNKB | `~/.claude/skills/_CNKB` |
| CNEGGPT | `~/.claude/skills/_CNEGGPT` |

If ambiguous, use `AskUserQuestion` to clarify which agent.

### Step 2: Read Agent Context

Read these files from the target agent's skill directory:

1. **`Learnings.md`** — Extract:
   - Known Patterns table (each becomes a regression test)
   - Verification Queue (each pending fix becomes a verification test)
   - Analysis Log (recent findings for context)

2. **`AgentConfig.md`** — Extract:
   - Agent name, agent ID, LLM model
   - Voice configuration (for test context)

3. **`AgentRegistry.md`** (from this skill) — Extract:
   - Default dynamic variables for this agent
   - Agent context description

### Step 3: Pull Current Prompt

Use the Retell MCP `get_agent_prompt` tool:
- **agent_id:** [from AgentConfig.md]

Extract from the prompt:
- Dynamic variable placeholders (e.g., `{FIRST_NAME}`, `{SLOTS}`)
- Conversation flow stages
- Key phrases the agent should use
- Guardrails and boundaries

### Step 4: Generate Test Cases

Generate test cases in these categories, drawing from the data gathered:

#### 4a: Regression Tests (from Known Patterns)

For **each** Known Pattern in Learnings.md with status other than "Verified fixed":

```
Pattern: "GPT-4.1 generates em dashes despite prompt using hyphens"
→ Test case: Simulated caller triggers the exact scenario where em dashes appeared
→ Metrics: "Agent does NOT use em dashes (—) or en dashes (–) in any response"
→ User prompt: Caller whose conversation naturally leads to the hot-spot phrase
```

#### 4b: Verification Tests (from Verification Queue)

For **each** item in the Verification Queue with status "PENDING":

```
Fix: "Em dash prohibition rule"
→ Test case: Caller triggers the specific interaction the fix targets
→ Metrics: "Agent output contains no em dashes" + "Agent uses period-separated sentences"
→ User prompt: Scenario that directly exercises the fixed behavior
```

#### 4c: Happy Path Tests

Generate 2-3 tests covering the agent's core success scenarios:
- **Successful booking/scheduling** — Caller agrees and books
- **Information request** — Caller asks questions, gets answers, decides
- **Warm reconnection** — Previously interested caller returns

Base these on the conversation flow stages in the agent's prompt.

#### 4d: Edge Case Tests

Generate 2-3 tests for boundary conditions:
- **Caller interrupts mid-sentence** — Tests interruption handling
- **Caller says "not interested"** — Tests graceful objection handling
- **Caller asks off-topic question** — Tests guardrail boundaries
- **Caller goes silent** — Tests silence handling

### Step 5: Assemble JSON

For each test case, create a JSON object following `Schema.md`:

```json
{
  "name": "[Category]: [Descriptive name]",
  "dynamic_variables": { /* from AgentRegistry defaults */ },
  "metrics": ["specific pass/fail criteria"],
  "user_prompt": "## Identity\n\n[who]\n\n## Goal\n\n[what]\n\n## Personality\n\n[how]",
  "creation_timestamp": [Date.now()],
  "user_modified_timestamp": [Date.now()],
  "type": "simulation",
  "tool_mocks": [],
  "llm_model": "gpt-4.1"
}
```

**Timestamp:** Use current Unix time in milliseconds (`Date.now()` equivalent).

### Step 6: Review Gate

Present the generated test suite to the user:

```
TEST SUITE GENERATED: [Agent Name]
  Regression tests: [N] (from [N] known patterns)
  Verification tests: [N] (from [N] pending fixes)
  Happy path tests: [N]
  Edge case tests: [N]
  Total: [N] test cases

[Summary table of each test case name + metrics count]
```

Use `AskUserQuestion`:
- "Write all" — Save all test cases to the agent's TestCases.json
- "Review each" — Walk through each test case for approval/editing
- "Cancel" — Don't write anything

### Step 7: Write JSON File

Write the approved test cases to the agent's TestCases.json:
- Path: `~/.claude/skills/[agent_skill]/TestCases.json`
- If file already exists, ask whether to **replace** or **merge** (append new, keep existing)
- Validate JSON is well-formed after writing

Present confirmation:
```
TEST SUITE WRITTEN: [path]
  Test cases: [N]
  File size: [bytes]
  Ready for Retell simulator upload
```

---

## Merge vs Replace Logic

When TestCases.json already exists:

**Replace:** Overwrites entirely. Use when regenerating from scratch.
**Merge:** Keeps existing test cases, appends new ones. Deduplicates by `name`. If a test with the same name exists, the new version replaces it.

Default: **Merge** (preserves manually added tests).

---

## Output Format

```
═══════════════════════════════════════════
  TEST SUITE GENERATION: [Agent Name]
  Date: [today]
═══════════════════════════════════════════

AGENT CONTEXT:
  Learnings: [N known patterns, N pending verifications]
  Prompt: [model, length, stages]

GENERATED TESTS:
  | # | Name | Category | Metrics |
  |---|------|----------|---------|

[REVIEW GATE — AskUserQuestion]

RESULT: [written/cancelled] — [path, count]
═══════════════════════════════════════════
```

---

## Related

- `Schema.md` — JSON format reference
- `AgentRegistry.md` — Default dynamic variables per agent
- `Manage.md` — Edit individual test cases after generation
