---
name: _EMMA
description: Manage the Emma voice AI agent (Code Ninjas Lead Reactivation). USE WHEN analyze emma, emma agent, emma prompt, emma calls, emma transcripts, check emma, audit emma, update emma.
---

# Emma — Code Ninjas Lead Reactivation

Voice AI agent skill for **Emma** (Code Ninjas Lead Reactivation).

Analyze transcripts, audit prompt quality, and push approved updates — all wired to the live Retell agent.

## Agent Quick Reference

| Field | Value |
|-------|-------|
| **Agent** | Code Ninjas Lead Reactivation - Emma |
| **Agent ID** | `agent_552e57364711f0eec51afa512a` |
| **LLM ID** | `llm_77cfa44e3394885ff3e25d95c4f2` |
| **Voice** | 11labs-Hailey |
| **Language** | en-US |

**Full config:** `AgentConfig.md`

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Analyze** | "analyze emma", "check emma", "emma transcripts", "audit emma" | `Workflows/Analyze.md` |

## Examples

**Example 1: Full analysis**
```
User: "Analyze Emma"
→ Invokes Analyze workflow
→ Pulls latest transcripts via MCP list_calls + get_transcript
→ Runs 14-rule analysis via MCP analyze_transcripts
→ Pulls current prompt via MCP get_agent_prompt
→ Presents findings + prompt recommendations
→ Waits for approval before pushing any changes
```

**Example 2: Quick check**
```
User: "How's Emma doing?"
→ Invokes Analyze workflow
→ Shows recent call stats + any critical issues
→ Recommendations only if issues found
```
