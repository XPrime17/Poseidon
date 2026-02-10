---
name: WriteDoc
description: Write or append content to a Google Doc via n8n webhook
---

# WriteDoc Workflow

Write content to a Google Doc associated with a voice agent's knowledge base.

## When to Use

- "Update the CNKB doc with junior program info"
- "Add sibling discount section to KB doc"
- "Replace the KB doc content"
- After identifying content gaps from transcript analysis

## Prerequisites

- n8n running on `localhost:5678`
- `gdocs-write` workflow activated with Google Docs OAuth2 credential
- Agent's Google Doc ID in `AgentDocs.md`

## Steps

1. **Resolve agent** -- Look up the agent in `AgentDocs.md` to get the Google Doc ID
2. **Confirm content** -- Show the user what will be written and get approval
3. **Choose mode**:
   - `replace` -- Overwrite entire document content
   - `append` -- Add content to the end of the document
4. **Write doc** -- Call the n8n webhook:
   ```bash
   curl -s -X POST http://localhost:5678/webhook/gdocs-write \
     -H "Content-Type: application/json" \
     -d '{
       "doc_id": "GOOGLE_DOC_ID",
       "content": "New content here...",
       "mode": "replace"
     }'
   ```
5. **Verify** -- Confirm success response
6. **Offer sync** -- Ask if user wants to sync the updated doc to the Retell KB

## Expected Response Format

```json
{
  "success": true,
  "doc_id": "1QTvkO1d...",
  "contentLength": 4523
}
```

## Safety

- **ALWAYS** show content and get approval before writing
- **ALWAYS** read the current doc first (via ReadDoc) when using `replace` mode
- Prefer `append` mode for adding new sections
- Use `replace` mode only for full content refreshes with user approval

## Error Handling

- **n8n not running**: Suggest checking n8n on port 5678
- **Write failed**: Check OAuth2 credential permissions (needs edit access to the doc)
- **Doc not found**: Verify Doc ID in AgentDocs.md
