---
name: _KB
description: Voice AI Knowledge Base manager. Read/write Google Docs and sync content to Supabase for prompt injection. USE WHEN kb, knowledge base, sync kb, read doc, write doc, update kb, kb content, google doc, sync doc.
---

# _KB -- Voice AI Knowledge Base Manager

Manage knowledge base content across Google Docs (source of truth) and Supabase (sync target). The Cloudflare Worker injects KB content into `{{knowledge_base}}` at call time via `retell_llm_dynamic_variables`.

## Architecture

```
Google Doc (source of truth, per centre)
    ↓ n8n gdocs-read webhook (self-hosted)
Claude reads content
    ↓ Supabase REST API
centres.knowledge_base column updated
    ↓ (at next call creation)
Worker passes as retell_llm_dynamic_variables.knowledge_base
    ↓
Retell substitutes {{knowledge_base}} in agent prompt
```

**Key:** KB is per-centre, not per-agent. All agents at a centre share the same KB content.

### n8n Instances

| Instance | URL | Purpose | KB Role |
|----------|-----|---------|---------|
| **Self-hosted (Docker)** | `http://138.197.171.204:5678` | _KB Google Docs read/write | Active -- gdocs-read, gdocs-write workflows |
| **Cloud** | `https://xprime17.app.n8n.cloud` | Other automations | Not used for _KB |

**_KB uses the self-hosted instance only.** Webhooks are at `localhost:5678` from the droplet's perspective.

## Centre Registry

See `AgentDocs.md` for the mapping of centres to Google Doc IDs and Supabase centre IDs.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ReadDoc** | "read kb doc", "show kb content", "read [centre] doc" | `Workflows/ReadDoc.md` |
| **WriteDoc** | "write kb doc", "update kb doc", "add to [centre] doc" | `Workflows/WriteDoc.md` |
| **SyncToKB** | "sync kb", "sync [centre] kb", "push kb", "update kb" | `Workflows/SyncToKB.md` |
| **ViewKB** | "view kb", "kb status", "check kb" | `Workflows/ViewKB.md` |

## Prerequisites

1. **n8n self-hosted** running on `localhost:5678` (Docker container `n8n` on droplet `138.197.171.204`) with Google Docs OAuth2 credential (ID: `1`)
2. **n8n workflows** imported and activated: `gdocs-read` (`RQt8auabMaJqoOTB`) and `gdocs-write` (`titk07qAVIOFeqcI`)
3. **Supabase** access (service key in lead-reactivation-github repo)
4. **Note:** Do NOT use the cloud instance (`xprime17.app.n8n.cloud`) for _KB workflows

## n8n Setup

Import the workflow JSON files from this skill directory:
- `GDocsRead.n8n.json` -- webhook at `POST /webhook/gdocs-read`
- `GDocsWrite.n8n.json` -- webhook at `POST /webhook/gdocs-write`

## Examples

**Read a doc:**
```
User: "Read the East Gwillimbury KB doc"
--> Workflows/ReadDoc.md
--> curl to n8n gdocs-read webhook
--> Display doc content
```

**Sync to Supabase:**
```
User: "Sync East Gwillimbury KB"
--> Workflows/SyncToKB.md
--> Read Google Doc via n8n
--> PATCH centres.knowledge_base in Supabase
--> Next Emma/CNEG call picks up new content automatically
```

**Check current KB:**
```
User: "What's in the East Gwillimbury KB?"
--> Workflows/ViewKB.md
--> Query Supabase centres table
--> Show current knowledge_base content and length
```
