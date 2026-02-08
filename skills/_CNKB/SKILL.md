---
name: _CNKB
description: Manage the CN KB voice AI agent (Code Ninjas with Knowledge Base). USE WHEN analyze cnkb, cnkb agent, cnkb prompt, cnkb calls, cnkb transcripts, check cnkb, audit cnkb, update cnkb, cn kb agent.
---

# CNKB — Code Ninjas with Knowledge Base

Voice AI agent skill for **CN /w KB** (Code Ninjas with Knowledge Base).

Analyze transcripts, audit prompt quality, and push approved updates — all wired to the live Retell agent.

## Agent Quick Reference

| Field | Value |
|-------|-------|
| **Agent** | CN /w KB |
| **Agent ID** | `agent_0c6c32b61cb506fefb6ac247f4` |
| **LLM ID** | `llm_44111168b1a2a469f50891b26e34` |
| **Voice** | 11labs-Cimo |
| **Language** | en-US |

**Full config:** `AgentConfig.md`

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Analyze** | "analyze cnkb", "check cnkb", "cnkb transcripts", "audit cnkb" | `Workflows/Analyze.md` |

## Examples

**Example 1: Full analysis**
```
User: "Analyze CNKB"
→ Invokes Analyze workflow
→ Pulls latest transcripts via MCP list_calls + get_transcript
→ Runs 14-rule analysis via MCP analyze_transcripts
→ Pulls current prompt via MCP get_agent_prompt
→ Presents findings + prompt recommendations
→ Waits for approval before pushing any changes
```

**Example 2: Quick check**
```
User: "How's CNKB doing?"
→ Invokes Analyze workflow
→ Shows recent call stats + any critical issues
→ Recommendations only if issues found
```
