---
name: Inbound KB injection via pre-call webhook
description: EG Inbound uses dynamic-variable KB injection (same as outbound). Google Doc → n8n → Retell phone-number inbound_webhook_url → agent prompt
type: project
originSessionId: d6b5ab44-7a3a-4f8f-9d31-dab3a6089bda
---
## Architecture (LIVE 2026-04-19, EG pilot)

```
Google Doc KB (staff-editable)
    │ (authenticated fetch)
n8n workflow QFxDu1MBooL332PN "Inbound Pre-Call KB Injection - EG"
    │ (webhook response)
Retell Phone Number inbound_webhook_url
    │ (dynamic_variables.knowledge_base)
Agent LLM prompt {{knowledge_base}}
```

## Components

- **Google Doc (EG):** `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` (shared with Burlington + St. Catharines)
- **n8n workflow:** `QFxDu1MBooL332PN` — webhook `POST https://xprime17.app.n8n.cloud/webhook/inbound-kb-injection-eg`
- **n8n node graph:** Webhook → Get KB (googleDocs.get) → Code (build `{call_inbound:{dynamic_variables:{knowledge_base:"..."}}}`) → Respond to Webhook
- **Retell:** `inbound_webhook_url` set on both phone numbers `+12898038797` and `+12899030611`
- **LLM `knowledge_base_ids`:** CLEARED (RAG disabled — we no longer use Retell's vector search)
- **Latency:** ~2.3s for n8n webhook (Bell forwarding budget is ~20s, safe)

## Gotchas learned

1. **Retell's pre-call webhook lives on the Phone Number, not the Agent.** Field is `inbound_webhook_url`, updated via `PATCH /update-phone-number/{number}`. Trying to set it on the Agent silently no-ops.
2. **n8n `googleDocs.get` returns `{documentId, content}`** with plaintext already flattened — no need to walk `body.content[]`.
3. **Webhook response must follow Retell spec:** `{call_inbound: {dynamic_variables: {knowledge_base: "..."}}}`. The `call_inbound` wrapper is required.

## Multicentre architecture (refactored 2026-04-19)

Workflow now supports any centre via a hardcoded phone→Doc map in the "Resolve Centre" Code node. Node graph:

```
Webhook → Resolve Centre → KB Missing? ──true──→ Build Response (empty KB) → Respond
                               │
                               └──false──→ Get KB → Build Response → Respond
```

- **Resolve Centre** reads `call_inbound.to_number`, looks up `PHONE_TO_CENTRE`, emits `{documentURL, centre_id, kb_missing}`
- **KB Missing?** IF node routes unknown numbers around Get KB (fail-open — empty KB rather than error)
- **Build Response** wraps the content in `{call_inbound:{dynamic_variables:{knowledge_base:"..."}}}`
- Every execution writes `to_number` and `kb_missing` to Resolve Centre output — search n8n executions for `kb_missing=True` to find misconfigured phones

## Recipe: Adding a new centre

**Key architectural note:** Centres enrolled in the outbound calling program already have a dedicated Retell phone number (see Centre Lookup Sheet `from_number` column). **Reuse that number for inbound — do not buy a new one.** EG is the exception because its `from_number` in the Lookup Sheet is the shared Emma caller-ID (`+12494492726`), not a dedicated EG number — that's why EG needed a separate inbound number (`+12898038797`).

1. **Create Retell inbound agent** (clone CNKB-EG-Inbound if it's a CNKB franchise)
2. **Assign the inbound agent to the centre's existing Retell phone number** (`PATCH /update-phone-number/{number}` with `inbound_agent_id`). No new number purchase needed for centres in the outbound program.
3. **Set the phone's `inbound_webhook_url`** → `https://xprime17.app.n8n.cloud/webhook/inbound-kb-injection-eg` (same workflow serves all centres)
4. **Add entry to `PHONE_TO_CENTRE`** in the Resolve Centre code node:
   ```javascript
   '+1XXXYYYZZZZ': { centre_id: 'slug', documentURL: 'https://docs.google.com/document/d/DOC_ID/edit' },
   ```
5. Get the Doc URL from Centre Lookup Sheet `knowledge_base` column (already populated per centre)
6. **Configure Bell forwarding** (if Canadian centre) — see EG Inbound Pilot memory for 4-ring pattern
7. **Smoke test** — `curl` the webhook with the new to_number, confirm KB content returns

Known Doc URLs from Centre Lookup Sheet:
- EG: `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` (shared with Burlington + StCatharines)
- Pickering: `1j3AX1R61Tz4-R_zTrCyGL--XBq2GMS9afuqFjrprmDY`
- Leaside: `1hDmMP6565YUXbXu9srTpADGBhZy8xt4woODiqfsoSDI`
- Canton: `1FcDoohcYF9ebcevauiDcB45gwPEgpNptbg0eqNmx-1k`
- Stone Oak: `1J8RRlubaPakeybPeeTlauUbm2v8Uj56H1H60GajpCyo`
- Round Rock: `1xDuBS9UIJwvQpt6U6lU0gnLsukTKz5QGu4YG5lt_ajY`
- Rayford: `1Mj68G0eoO8f4cgJG8IkojhHd_Msrwndc8YDK-6TvGZ4`
- Sudbury: `1iNj4XgFsH2RGPxFSMY-ytDii-7Tl9qTSqTDVpfLgH4I`
- Riverside: *empty in sheet — needs Doc created*

## Migration path (sheet-based lookup — future)

Current hardcoded map is fine for 3-5 centres. When inbound expands to 8+:
- Add `inbound_number` column to Centre Lookup Sheet (via HTTP Request + Google Sheets OAuth per MEMORY)
- Replace Resolve Centre Code node with: Google Sheets Lookup by `inbound_number` → existing `knowledge_base` column
- No other changes needed; downstream nodes use `documentURL` generically

## Content quality caveat

Dynamic injection means the LLM quotes KB verbatim. **Keep the Google Doc accurate** — wrong info in the Doc = wrong info in the agent's mouth. Worth auditing Doc content against the website (EG Doc currently says generic "4pm-7pm store hours" but website footer says "Tue-Fri: 3-7, Sat: 9:30-3" — discrepancy to reconcile).

## Rollback

If something breaks:
1. `PATCH /update-phone-number/{number}` with `{"inbound_webhook_url": null}` — disables pre-call webhook
2. `PATCH /update-retell-llm/llm_6d77f36696f6fbfad97d03fa5ef8` with `{"knowledge_base_ids": ["knowledge_base_5144c616b2046679"]}` — re-enables RAG
3. Back to pre-2026-04-19 behavior

## Related

- [EG Inbound Pilot](eg-inbound-pilot.md) — overall architecture
- [KB Dynamic Injection (Outbound)](kb-dynamic-injection.md) — same pattern for outbound agents
