# CNKB — Agent Configuration

**This file contains the baked-in Retell configuration for CN /w KB.**

Used by workflows to avoid manual ID lookups.

## Retell IDs

| Field | Value |
|-------|-------|
| **Agent Name** | CN /w KB |
| **Agent ID** | `agent_0c6c32b61cb506fefb6ac247f4` |
| **LLM ID** | `llm_44111168b1a2a469f50891b26e34` |
| **Version** | 34 |

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
