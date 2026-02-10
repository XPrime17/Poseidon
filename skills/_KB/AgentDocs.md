# Centre-to-Document Registry

Maps each centre to its Google Doc (content source) and Supabase record (sync target).

The KB content flows: **Google Doc → Supabase `centres.knowledge_base` → Worker → `{{knowledge_base}}` in prompt**

## Registry

| Centre ID | Location | Google Doc ID | Agent(s) | KB Status |
|-----------|----------|---------------|----------|-----------|
| `east-gwillimbury-on-ca` | East Gwillimbury | `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` | CNEG, CNKB, Emma | Has 346 chars |
| `ma-canton` | Canton | TBD | Emma | Empty |
| `test-centre-e2e` | Test Centre E2E | N/A | Test only | N/A |

## How It Works

1. Each **centre** has a `knowledge_base` column in Supabase
2. Each centre has a corresponding **Google Doc** as its source of truth
3. When syncing: read the Google Doc → write content to `centres.knowledge_base`
4. The **Cloudflare Worker** reads `centre.knowledge_base` at call creation time
5. It passes the content as `retell_llm_dynamic_variables.knowledge_base`
6. **Retell** substitutes `{{knowledge_base}}` in the agent's prompt

## Key Insight

The KB is **per-centre, not per-agent**. Emma (lead reactivation) and CNEG/CNKB (inbound) all use the same centre's KB when calling leads from that centre. Update the centre's Google Doc to update knowledge for ALL agents at that location.

## Supabase Connection

```
Project: uajdbjotlqvyursytlph
URL: https://uajdbjotlqvyursytlph.supabase.co
Table: centres
Column: knowledge_base (text, nullable)
```

## Google Doc URLs

Construct the edit URL: `https://docs.google.com/document/d/{DOC_ID}/edit`

East Gwillimbury: `https://docs.google.com/document/d/1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek/edit`
