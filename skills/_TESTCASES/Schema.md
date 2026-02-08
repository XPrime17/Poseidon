# Retell Simulator Test Case Schema

Authoritative reference for the JSON format accepted by the Retell simulator.

---

## JSON Structure

The test case file is a **JSON array** of test case objects:

```json
[
  {
    "name": "Test case name - descriptive of what's being tested",
    "dynamic_variables": {
      "SLOTS": "2026-01-15: 5:00 PM, 6:00 PM | 2026-01-16: 10:00 AM",
      "PHONE": "555-123-4567",
      "knowledge_base": "<doc id=1 title=\"CREATE Program\" category=\"Programs\">CREATE is for ages 9-14.</doc>",
      "PROGRAM_INTEREST": "CREATE",
      "PREVIOUS_NOTES": "Inquired about CREATE program for 10-year-old son.",
      "LAST_NAME": "Johnson",
      "first_name": "Sarah",
      "LOCATION_NAME": "Pickering",
      "FIRST_NAME": "Sarah"
    },
    "metrics": [
      "Specific pass/fail criteria 1",
      "Specific pass/fail criteria 2"
    ],
    "user_prompt": "## Identity\n\nDescribe who the simulated user is.\n\n## Goal\n\nWhat the simulated user is trying to accomplish.\n\n## Personality\n\nHow the simulated user behaves.",
    "creation_timestamp": 1736697600000,
    "user_modified_timestamp": 1736697600000,
    "type": "simulation",
    "tool_mocks": [],
    "llm_model": "gpt-4.1"
  }
]
```

---

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Descriptive test name — what scenario is being tested |
| `dynamic_variables` | object | All agent variables injected into the prompt at call time |
| `metrics` | string[] | Specific, measurable pass/fail criteria |
| `user_prompt` | string | Markdown with `## Identity`, `## Goal`, `## Personality` sections |
| `type` | string | Always `"simulation"` |
| `tool_mocks` | array | Empty array `[]` unless testing function/tool behavior |
| `llm_model` | string | Use `"gpt-4.1"` for accuracy |
| `creation_timestamp` | number | Unix timestamp in milliseconds |
| `user_modified_timestamp` | number | Unix timestamp in milliseconds (same as creation for new tests) |

---

## Field Details

### `name`

Should clearly describe the scenario: `"Regression: Em dash in check-in transition"`, `"Happy path: Successful booking"`, `"Edge: Caller hangs up during scheduling"`.

Convention:
- `Regression: [pattern name]` — tests for known failure patterns
- `Verify: [fix name]` — confirms a specific fix is working
- `Happy path: [scenario]` — successful interaction flows
- `Edge: [scenario]` — boundary conditions and unusual caller behavior

### `dynamic_variables`

Agent-specific variables. Common Code Ninjas variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FIRST_NAME` | Lead's first name (uppercase key) | `"Sarah"` |
| `first_name` | Lowercase variant (some prompts use both) | `"Sarah"` |
| `LAST_NAME` | Last name | `"Johnson"` |
| `LOCATION_NAME` | Code Ninjas location | `"Pickering"` |
| `PHONE` | Callback phone number | `"555-123-4567"` |
| `SLOTS` | Available time slots (pipe-separated days) | `"2026-01-15: 5:00 PM, 6:00 PM \| 2026-01-16: 10:00 AM"` |
| `knowledge_base` | KB content as XML docs (empty string if none) | `"<doc id=1 title=\"CREATE\" category=\"Programs\">...</doc>"` |
| `PROGRAM_INTEREST` | Program the lead inquired about | `"CREATE"`, `"JR"`, `"CLUBS"`, `"ACADEMIES"` |
| `PREVIOUS_NOTES` | CRM notes from previous interaction | `"Inquired about CREATE for 10-year-old."` |

**Legacy variables** (older tests may use these instead):

| Variable | Description |
|----------|-------------|
| `last_name` | Lowercase variant of LAST_NAME |
| `slots` | ISO datetime format `"2025-11-06T18:00,..."` |
| `customer_info` | Combined `"first, last, email, phone"` |
| `email` | Lead's email address |

### `metrics`

Each metric is a single pass/fail statement. Be specific:
- "Agent does NOT use em dashes (—) or en dashes (–) in any response"
- "Agent mentions the child's name within the first 2 turns"
- "Agent offers exactly 2-3 time slot options, not all of them"
- "Agent uses the phrase 'Is finding a coding program for your child still on your radar?'"

### `user_prompt`

Three required sections in markdown:

```markdown
## Identity

Sarah Johnson is the parent of a 10-year-old who previously showed interest in Code Ninjas Pickering. She filled out a form 3 weeks ago but never scheduled a visit.

## Goal

Sarah is curious but noncommittal. She wants to know what Code Ninjas offers but will need gentle persuasion to book a time.

## Personality

- Friendly but busy
- Asks 1-2 questions before deciding
- Responds with short sentences
- Will book if given a convenient time
```

### `tool_mocks`

Empty array for standard tests. Use when testing function calls:

```json
"tool_mocks": [
  {
    "tool_name": "check_availability",
    "mock_response": {"available": true, "next_slot": "2026-01-15 5:00 PM"}
  }
]
```

---

## Test Case Categories

| Category | Purpose | Source |
|----------|---------|--------|
| **Regression** | Prevent known issues from recurring | Learnings.md → Known Patterns |
| **Verification** | Confirm recent fixes are working | Learnings.md → Verification Queue |
| **Happy Path** | Validate core success scenarios | Agent prompt → Conversation Flow |
| **Edge Case** | Test boundary conditions | Common voice AI edge cases |
| **Stress** | Test handling of difficult callers | Interruptions, objections, off-topic |

---

## Validation Rules

A valid test case file must:
1. Be a JSON array (even if single test case)
2. Each object has all required fields
3. `type` is exactly `"simulation"`
4. `metrics` has at least 1 entry
5. `user_prompt` contains `## Identity`, `## Goal`, `## Personality`
6. `dynamic_variables` contains at minimum `FIRST_NAME` and `LAST_NAME`
7. Timestamps are valid Unix milliseconds
