---
name: _CNEGGPT
description: Manage the CNEG GPT voice AI agent. USE WHEN analyze cneggpt, cneggpt agent, cneggpt prompt, cneggpt calls, cneggpt transcripts, check cneggpt, audit cneggpt, update cneggpt, cneg agent.
---

# CNEGGPT — Code Ninjas EG GPT

Voice AI agent skill for **CNEG GPT**.

Analyze transcripts, audit prompt quality, and push approved updates — all wired to the live Retell agent.

## Agent Quick Reference

| Field | Value |
|-------|-------|
| **Agent** | CNEG GPT |
| **Agent ID** | `agent_5938532f78787d831efea1a598` |
| **LLM ID** | `llm_1eea31d892857532c447fc95066e` |
| **Voice** | 11labs-Cimo |
| **Language** | en-US |

**Full config:** `AgentConfig.md`

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Analyze** | "analyze cneggpt", "check cneggpt", "cneggpt transcripts", "audit cneggpt" | `Workflows/Analyze.md` |

## Examples

**Example 1: Full analysis**
```
User: "Analyze CNEGGPT"
→ Invokes Analyze workflow
→ Pulls latest transcripts via MCP list_calls + get_transcript
→ Runs 14-rule analysis via MCP analyze_transcripts
→ Pulls current prompt via MCP get_agent_prompt
→ Presents findings + prompt recommendations
→ Waits for approval before pushing any changes
```

**Example 2: Quick check**
```
User: "How's CNEGGPT doing?"
→ Invokes Analyze workflow
→ Shows recent call stats + any critical issues
→ Recommendations only if issues found
```
