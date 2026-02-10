---
name: SyncToKB
description: Read Google Doc content and sync it to the Supabase centres.knowledge_base column
---

# SyncToKB Workflow

The core workflow: reads content from a Google Doc and writes it to the Supabase `centres.knowledge_base` column. The Cloudflare Worker then injects this content into `{{knowledge_base}}` at call time via `retell_llm_dynamic_variables`.

## Architecture

```
Google Doc (source of truth)
    ↓ n8n gdocs-read webhook
Claude reads content
    ↓ Supabase REST API PATCH
centres.knowledge_base column updated
    ↓ (at next call)
Worker reads centre → passes as retell_llm_dynamic_variables.knowledge_base
    ↓
Retell substitutes {{knowledge_base}} in prompt
```

## When to Use

- "Sync KB for [centre/agent]"
- "Push KB content to Supabase"
- "Update the knowledge base"
- After editing a Google Doc and wanting changes live for calls

## Prerequisites

- n8n running with `gdocs-read` workflow activated
- Centre's Google Doc ID and Supabase centre ID in `AgentDocs.md`
- Supabase credentials available

## Supabase Connection

```
URL: https://uajdbjotlqvyursytlph.supabase.co
Table: centres
Column: knowledge_base (text, nullable)
```

## Steps

1. **Resolve centre** -- Look up in `AgentDocs.md` to get Google Doc ID and Supabase centre ID
2. **Read Google Doc** -- Call n8n webhook:
   ```bash
   curl -s -X POST http://localhost:5678/webhook/gdocs-read \
     -H "Content-Type: application/json" \
     -d '{"doc_id": "GOOGLE_DOC_ID"}'
   ```
3. **Preview content** -- Show the user the content that will be synced, with word/character count
4. **Get approval** -- Use AskUserQuestion: "Sync this content to [centre] in Supabase?"
5. **Write to Supabase** -- PATCH the centres row:
   ```bash
   curl -s -X PATCH \
     "https://uajdbjotlqvyursytlph.supabase.co/rest/v1/centres?id=eq.CENTRE_ID" \
     -H "apikey: SERVICE_KEY" \
     -H "Authorization: Bearer SERVICE_KEY" \
     -H "Content-Type: application/json" \
     -H "Prefer: return=representation" \
     -d '{"knowledge_base": "CONTENT_HERE"}'
   ```
6. **Verify** -- Read back the updated row to confirm:
   ```bash
   curl -s \
     "https://uajdbjotlqvyursytlph.supabase.co/rest/v1/centres?id=eq.CENTRE_ID&select=id,location_name,knowledge_base" \
     -H "apikey: SERVICE_KEY" \
     -H "Authorization: Bearer SERVICE_KEY"
   ```
   - Confirm content length matches what was sent
   - Confirm `updated_at` timestamp is recent
7. **Report** -- Show sync result with content length and confirmation

## Quality Gates

- Content must be non-empty
- User must approve before writing
- Supabase PATCH must return 200 with updated row
- Read-back content length must match what was written

## Error Handling

- **n8n unavailable**: Fall back to asking user to paste doc content manually
- **Empty doc**: Warn user, do not sync empty content
- **Supabase write failed**: Show HTTP status and error body
- **Content mismatch**: Re-read and compare, report discrepancy

## Supabase Service Key

Located in: `/root/lead-reactivation-github/insert-test-leads.ts` line 9
Or use environment variable: `SUPABASE_SERVICE_KEY`
