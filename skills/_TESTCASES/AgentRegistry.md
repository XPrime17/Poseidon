# Agent Registry

Maps agent names to their skill paths, IDs, and default dynamic variables for test case generation.

---

## Emma — Code Ninjas Lead Reactivation

| Field | Value |
|-------|-------|
| **Skill Path** | `~/.claude/skills/_EMMA` |
| **Agent ID** | `agent_552e57364711f0eec51afa512a` |
| **LLM ID** | `llm_77cfa44e3394885ff3e25d95c4f2` |
| **LLM Model** | `gpt-4.1` |
| **TestCases File** | `~/.claude/skills/_EMMA/TestCases.json` |
| **Learnings File** | `~/.claude/skills/_EMMA/Learnings.md` |

**Default Dynamic Variables:**
```json
{
  "FIRST_NAME": "Sarah",
  "first_name": "Sarah",
  "LAST_NAME": "Johnson",
  "LOCATION_NAME": "East Gwillimbury",
  "PHONE": "555-123-4567",
  "SLOTS": "2026-02-10: 4:00 PM, 5:00 PM | 2026-02-11: 10:00 AM, 3:00 PM",
  "knowledge_base": "<doc id=1 title=\"CREATE Program\" category=\"Programs\">CREATE is for ages 9-14.</doc>",
  "PROGRAM_INTEREST": "CREATE",
  "PREVIOUS_NOTES": "Inquired about CREATE program for 10-year-old son."
}
```

**Test Suite:** 8 test cases (imported from `/EMMA_tests.json`)
**Agent Context:** Lead reactivation — calling back parents who filled out interest forms but didn't book. Warm outreach, not cold calling. Locations: Pickering, East Gwillimbury, Winnipeg.

---

## CNKB — Code Ninjas with Knowledge Base

| Field | Value |
|-------|-------|
| **Skill Path** | `~/.claude/skills/_CNKB` |
| **Agent ID** | `agent_0c6c32b61cb506fefb6ac247f4` |
| **LLM ID** | `llm_44111168b1a2a469f50891b26e34` |
| **TestCases File** | `~/.claude/skills/_CNKB/TestCases.json` |
| **Learnings File** | `~/.claude/skills/_CNKB/Learnings.md` |

**Default Dynamic Variables:**
```json
{
  "FIRST_NAME": "Sarah",
  "first_name": "Sarah",
  "LAST_NAME": "Johnson",
  "LOCATION_NAME": "Pickering",
  "PHONE": "555-123-4567",
  "SLOTS": "2026-01-20: 4:00 PM, 5:00 PM | 2026-01-21: 10:00 AM",
  "knowledge_base": "<doc id=1 title=\"CREATE Program\" category=\"Programs\">CREATE is for ages 9-14.</doc>",
  "PROGRAM_INTEREST": "CREATE",
  "PREVIOUS_NOTES": "General inquiry about coding programs."
}
```

**Test Suite:** 69 test cases (imported from `/CNKB_tests`) — comprehensive suite covering happy paths, edge cases, compliance, pricing, callbacks, AI disclosure, SLOTS validation, natural transitions, and more.
**Validation:** 20/69 pass current schema. 49 legacy tests (gpt-4o/gpt-4o-mini) use older format — missing `## Identity`/`## Goal`/`## Personality` sections and `FIRST_NAME`/`LAST_NAME` dynamic variables.
**Note:** Older tests (pre-2026) use `gpt-4o`/`gpt-4o-mini` models and may have empty `dynamic_variables`. Newer tests use `gpt-4.1` with full variables.
**Agent Context:** Code Ninjas agent with knowledge base integration. Handles lead reactivation with KB-backed answers. Locations: Pickering, East Gwillimbury, Winnipeg.

---

## CNEGGPT — Code Ninjas EG GPT

| Field | Value |
|-------|-------|
| **Skill Path** | `~/.claude/skills/_CNEGGPT` |
| **Agent ID** | `agent_5938532f78787d831efea1a598` |
| **LLM ID** | `llm_1eea31d892857532c447fc95066e` |
| **TestCases File** | `~/.claude/skills/_CNEGGPT/TestCases.json` |
| **Learnings File** | `~/.claude/skills/_CNEGGPT/Learnings.md` |

**Default Dynamic Variables:**
```json
{
  "FIRST_NAME": "Alex",
  "first_name": "Alex",
  "LAST_NAME": "Rivera",
  "LOCATION_NAME": "East Gwillimbury",
  "PHONE": "555-345-6789",
  "SLOTS": "2026-02-10: 4:00 PM, 5:00 PM | 2026-02-11: 10:00 AM, 3:00 PM",
  "knowledge_base": "",
  "PROGRAM_INTEREST": "CREATE",
  "PREVIOUS_NOTES": "General inquiry about coding programs."
}
```

**Test Suite:** 0 test cases (awaiting first analysis or manual creation)
**Agent Context:** Code Ninjas East Gwillimbury GPT agent. Handles scheduling and inquiries for the EG location.

---

## CNKB-EG-Inbound — Code Ninjas East Gwillimbury Inbound

| Field | Value |
|-------|-------|
| **Skill Path** | `~/.claude/skills/_EGINBOUND` |
| **Agent ID** | `agent_17d623c8a8f95fc674288d0e00` |
| **LLM ID** | `llm_6d77f36696f6fbfad97d03fa5ef8` |
| **LLM Model** | `gpt-4.1` |
| **KB ID** | `knowledge_base_5144c616b2046679` (12 EG website pages) |
| **Phone** | `+12899030611` (direct) / `+12898038797` (Bell forward target) |
| **TestCases File** | `~/.claude/skills/_EGINBOUND/TestCases.json` |

**Default Dynamic Variables:**
```json
{
  "FIRST_NAME": "Caller",
  "first_name": "Caller",
  "LAST_NAME": "Unknown",
  "LOCATION_NAME": "East Gwillimbury",
  "PHONE": "905-555-0100"
}
```

**Test Suite:** 10 test cases — 5 call-type coverage (new_lead, schedule_change, billing, general, complaint) + fast-track gate + multi-child + 2 edge cases + **KB-BOUNDARY (CRITICAL)** anti-hallucination test.
**Agent Context:** Inbound voice AI — answers calls forwarded from EG centre landline. Uses `get_tour_slots` custom function for availability. Post-call analysis routes to ClickUp list `901113422190` + urgent emails for complaints.

---

## Adding New Agents

When a new Retell agent gets a PAI skill, add it here with:
1. Skill path, agent ID, LLM ID
2. TestCases and Learnings file paths
3. Default dynamic variables (pull from prompt or Retell dashboard)
4. Agent context (1 sentence describing what this agent does)
