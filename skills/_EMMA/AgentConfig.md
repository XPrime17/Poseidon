# Emma — Agent Configuration

**This file contains the baked-in Retell configuration for Emma.**

Used by workflows to avoid manual ID lookups.

## Retell IDs

| Field | Value |
|-------|-------|
| **Agent Name** | Code Ninjas Lead Reactivation - Emma |
| **Agent ID** | `agent_552e57364711f0eec51afa512a` |
| **LLM ID** | `llm_77cfa44e3394885ff3e25d95c4f2` |
| **LLM Model** | gpt-4.1 |
| **Version** | 17 |

## Voice Configuration

| Field | Value |
|-------|-------|
| **Voice** | 11labs-Hailey |
| **Voice Temperature** | 1.3 |
| **Voice Speed** | 1.14 |
| **Language** | en-US |

## Behavior Settings

| Field | Value |
|-------|-------|
| **Interruption Sensitivity** | 0.9 |
| **Enable Backchannel** | true |
| **End Call After Silence** | 20000ms |

## Integration

| Field | Value |
|-------|-------|
| **Webhook** | `https://lead-reactivation.scott-james1717.workers.dev/webhook/retell` |
| **Post-Call Analysis Model** | gpt-4.1-mini |

## MCP Tools Used

These Retell MCP server tools are used by the Analyze workflow:

- `list_calls` — Fetch recent calls (filter by agent_id above)
- `get_transcript` — Get full transcript for a specific call
- `analyze_transcripts` — Run 14-rule best practices analysis
- `get_agent_prompt` — Pull current prompt (resolves LLM ID automatically)
- `update_agent_prompt` — Push approved prompt changes (REQUIRES APPROVAL)
