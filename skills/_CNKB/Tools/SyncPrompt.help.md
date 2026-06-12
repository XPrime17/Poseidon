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

Live outbound clones only (updated 2026-06-07).

| Centre | Agent ID | LLM ID |
|--------|----------|--------|
| East Gwillimbury (source) | `agent_0c6c32b61cb506fefb6ac247f4` | `llm_44111168b1a2a469f50891b26e34` |
| Burlington | `agent_075f92a824314e958918af3d9c` | `llm_35ce5dd8697541ec0e97f0dcfde0` |
| Pickering | `agent_9d24e87943bc3b8105261bf308` | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` |
| Leaside | `agent_1f8c2799630cd6524fa8176e6d` | `llm_4cfa990bea7bfcbf67060e8c8f72` |
| Riverside | `agent_ee11bcfc9222c37df4de8bfe95` | `llm_512d93c0c71e0ef00e318b3e9fc0` |
| Kanata | `agent_aac09671305b8903483ceee6df` | `llm_46f528077e86fca2a2a2549e2793` |

**Excluded on purpose:**
- **St. Catharines** — carries a per-centre custom AI intro (Stage 1). A full-prompt sync would clobber it; patch in place.
- **Canton, StoneOak, RoundRock, Rayford** — offboarded 2026-05; removed from sync.
- **Inbound agents** (EG/StCath/Leaside-Inbound) — separate prompts, not synced by this tool.

## Adding a New Clone

1. Create a new LLM copy: `POST /create-retell-llm` with current prompt
2. Create the agent clone pointing to the new LLM
3. Add the entry to the `CLONES` array in `SyncPrompt.ts`
4. Update this help file's clone registry
