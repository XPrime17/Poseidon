---
name: ReadDoc
description: Read a Google Doc's content via n8n webhook
---

# ReadDoc Workflow

Read the content of a Google Doc associated with a voice agent's knowledge base.

## When to Use

- "Read the CNKB doc"
- "Show me the KB content for [agent]"
- "What's in the knowledge base doc?"
- Before syncing, to preview what will be pushed

## Prerequisites

- n8n running on `localhost:5678`
- `gdocs-read` workflow activated with Google Docs OAuth2 credential
- Agent's Google Doc ID in `AgentDocs.md`

## Steps

1. **Resolve agent** -- Look up the agent in `AgentDocs.md` to get the Google Doc ID
2. **Read doc** -- Call the n8n webhook:
   ```bash
   curl -s -X POST http://localhost:5678/webhook/gdocs-read \
     -H "Content-Type: application/json" \
     -d '{"doc_id": "GOOGLE_DOC_ID"}'
   ```
3. **Display content** -- Show the returned content with title and last modified date
4. **Offer next steps** -- Ask if user wants to edit or sync to Retell KB

## Expected Response Format

```json
{
  "title": "Document Title",
  "content": "Full document text content...",
  "lastModified": "2026-02-09T..."
}
```

## Error Handling

- **n8n not running**: Suggest `check if n8n is running on port 5678`
- **Doc not found**: Verify Doc ID in AgentDocs.md, check Google Docs sharing permissions
- **Auth error**: Google OAuth2 credential needs re-authorization in n8n UI
