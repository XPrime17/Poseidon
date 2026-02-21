# SyncPrompt

Batch-sync the CNKB prompt from the source LLM to all centre clone LLMs.

## Why This Exists

Each CNKB centre clone has its own Retell LLM copy because Retell pins agents to a specific LLM version and blocks version changes via API. When you update the prompt on the original CNKB (East Gwillimbury) LLM, the changes don't propagate to clones. This tool pushes the source prompt to all clones.

## Usage

```bash
# Check which clones are in sync vs drifted
bun SyncPrompt.ts --status

# Preview what would change (default dry-run)
bun SyncPrompt.ts

# Push changes to all clones
bun SyncPrompt.ts --push

# Push to specific clones only
bun SyncPrompt.ts --push --only Canton,Rayford
```

## What Gets Synced

| Field | Synced? | Notes |
|-------|---------|-------|
| `general_prompt` | Yes | The full system prompt |
| `begin_message` | Yes | The opening line template |
| Dynamic variables | No | Set per-agent (LOCATION_NAME, SLOTS, etc.) |
| Voice/language | No | Set per-agent config |
| Webhook | No | Set per-agent config |
| KB IDs | No | Shared across all |

## Workflow

1. Edit the prompt on the **original CNKB LLM** (via Retell dashboard or MCP `update_agent_prompt`)
2. Run `bun SyncPrompt.ts` to preview changes
3. Run `bun SyncPrompt.ts --push` to distribute

## Clone Registry

| Centre | Agent ID | LLM ID |
|--------|----------|--------|
| East Gwillimbury (source) | `agent_0c6c32b61cb506fefb6ac247f4` | `llm_44111168b1a2a469f50891b26e34` |
| Canton | `agent_f10e56ab67fddf22bd60def599` | `llm_d25bbc493b20eb095ab92bceb116` |
| StoneOak | `agent_cd531f218c39d6125098cf7abc` | `llm_c26de057ffe1ff9a71366e95c447` |
| RoundRock | `agent_d06452d16a225cfbf207890350` | `llm_7b795d82b19f42562ef0abaf857f` |
| Rayford | `agent_9c1c8996e054e87f6b76aa8a0a` | `llm_118c93e692e7255083a56043c3e9` |
| Burlington | `agent_2f5419fc0c45a24a02bb820cce` | `llm_97ac9c35e7387a448b927ce509b6` |
| Pickering | `agent_9d24e87943bc3b8105261bf308` | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` |

## Adding a New Clone

1. Create a new LLM copy: `POST /create-retell-llm` with current prompt
2. Create the agent clone pointing to the new LLM
3. Add the entry to the `CLONES` array in `SyncPrompt.ts`
4. Update this help file's clone registry
