# CNEGGPT — Agent Configuration

**This file contains the baked-in Retell configuration for CNEG GPT.**

Used by workflows to avoid manual ID lookups.

## Retell IDs

| Field | Value |
|-------|-------|
| **Agent Name** | CNEG GPT |
| **Agent ID** | `agent_5938532f78787d831efea1a598` |
| **LLM ID** | `llm_1eea31d892857532c447fc95066e` |
| **Version** | 23 |

## Voice Configuration

| Field | Value |
|-------|-------|
| **Voice** | 11labs-Cimo |
| **Language** | en-US |

## MCP Tools Used

These Retell MCP server tools are used by the Analyze workflow:

- `list_calls` — Fetch recent calls (filter by agent_id above)
- `get_transcript` — Get full transcript for a specific call
- `analyze_transcripts` — Run 14-rule best practices analysis
- `get_agent_prompt` — Pull current prompt (resolves LLM ID automatically)
- `update_agent_prompt` — Push approved prompt changes (REQUIRES APPROVAL)
