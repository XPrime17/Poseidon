---
name: ViewKB
description: View current knowledge base content from Supabase centres table
---

# ViewKB Workflow

Inspect the current KB content stored in Supabase for each centre.

## When to Use

- "What's in the KB?"
- "Check KB for East Gwillimbury"
- "KB status"
- "View KB content"
- Before syncing, to see current state

## Steps

### For viewing all centres:
1. Query Supabase:
   ```bash
   curl -s "https://uajdbjotlqvyursytlph.supabase.co/rest/v1/centres?select=id,location_name,knowledge_base,updated_at" \
     -H "apikey: SERVICE_KEY" \
     -H "Authorization: Bearer SERVICE_KEY"
   ```
2. Display table with centre ID, location, KB content length, last updated

### For viewing a specific centre:
1. **Resolve centre** -- Look up centre ID in `AgentDocs.md`
2. Query Supabase for that centre
3. Display full KB content with character/word count
4. Show last updated timestamp
5. **Offer next steps** -- Sync from Google Doc, or edit content

## Output Format

```
Centre: East Gwillimbury (east-gwillimbury-on-ca)
KB Length: 346 chars
Last Updated: 2026-02-06T01:02:20Z

Content:
---
[full knowledge_base content]
---
```

## Error Handling

- **Centre not found**: Show all available centres
- **Empty KB**: Note it's empty, suggest syncing from Google Doc
