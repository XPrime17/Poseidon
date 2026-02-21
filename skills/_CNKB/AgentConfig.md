# CNKB — Agent Configuration

**This file contains the baked-in Retell configuration for CN /w KB.**

Used by workflows to avoid manual ID lookups.

## Source Agent (East Gwillimbury)

| Field | Value |
|-------|-------|
| **Agent Name** | CN /w KB |
| **Agent ID** | `agent_0c6c32b61cb506fefb6ac247f4` |
| **LLM ID** | `llm_44111168b1a2a469f50891b26e34` |
| **Version** | 39 |

## Voice Configuration

| Field | Value |
|-------|-------|
| **Voice** | 11labs-Cimo |
| **Language** | en-US |

## Knowledge Base

| Field | Value |
|-------|-------|
| **Google Doc ID** | `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` |
| **Retell KB ID** | TBD (discover via `list_knowledge_bases`) |
| **KB Skill** | `_KB` -- use for reading/writing doc and syncing to Retell KB |

## Centre Clone Registry

Each clone has its own LLM copy (Retell blocks version changes on agents).
Prompt updates must be pushed to all clones using `SyncPrompt.ts`.

| Centre | Agent ID | LLM ID |
|--------|----------|--------|
| East Gwillimbury (source) | `agent_0c6c32b61cb506fefb6ac247f4` | `llm_44111168b1a2a469f50891b26e34` |
| Canton | `agent_f10e56ab67fddf22bd60def599` | `llm_d25bbc493b20eb095ab92bceb116` |
| StoneOak | `agent_cd531f218c39d6125098cf7abc` | `llm_c26de057ffe1ff9a71366e95c447` |
| RoundRock | `agent_d06452d16a225cfbf207890350` | `llm_7b795d82b19f42562ef0abaf857f` |
| Rayford | `agent_9c1c8996e054e87f6b76aa8a0a` | `llm_118c93e692e7255083a56043c3e9` |
| Burlington | `agent_2f5419fc0c45a24a02bb820cce` | `llm_97ac9c35e7387a448b927ce509b6` |
| Pickering | `agent_9d24e87943bc3b8105261bf308` | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` |

## Prompt Sync Workflow

1. Edit the prompt on the **source LLM** (via Retell dashboard or MCP `update_agent_prompt`)
2. Run `bun Tools/SyncPrompt.ts --status` to check drift
3. Run `bun Tools/SyncPrompt.ts --push` to distribute to all clones

## MCP Tools Used

These Retell MCP server tools are used by the Analyze workflow:

- `list_calls` — Fetch recent calls (filter by agent_id above)
- `get_transcript` — Get full transcript for a specific call
- `analyze_transcripts` — Run 14-rule best practices analysis
- `get_agent_prompt` — Pull current prompt (resolves LLM ID automatically)
- `update_agent_prompt` — Push approved prompt changes (REQUIRES APPROVAL)
