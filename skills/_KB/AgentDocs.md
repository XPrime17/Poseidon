# Centre-to-Document Registry

Maps each centre to its Google Doc (content source). KB content is dynamically injected into voice agent prompts via `retell_llm_dynamic_variables.knowledge_base`.

The KB content flows: **Google Doc → n8n reads at call time → `{{knowledge_base}}` in prompt**

## Registry

| Centre ID | Location | Google Doc ID | Agents | KB Status |
|-----------|----------|---------------|--------|-----------|
| `east-gwillimbury-on-ca` | East Gwillimbury | `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` | CNEG, CNKB-EG, Emma, Inbound-EG | Auto-crawled |
| `pickering-on-ca` | Pickering | `1j3AX1R61Tz4-R_zTrCyGL--XBq2GMS9afuqFjrprmDY` | CNKB-Pickering | Auto-crawled |
| `leaside-on-ca` | Leaside | `1hDmMP6565YUXbXu9srTpADGBhZy8xt4woODiqfsoSDI` | CNKB-Leaside, Inbound-Leaside | Read-only (needs editor share) |
| `ma-canton` | Canton | `1FcDoohcYF9ebcevauiDcB45gwPEgpNptbg0eqNmx-1k` | CNKB-Canton | Auto-crawled |
| `tx-san-antonio-stone-oak-1` | Stone Oak | `1J8RRlubaPakeybPeeTlauUbm2v8Uj56H1H60GajpCyo` | CNKB-StoneOak | Auto-crawled |
| `tx-round-rock-ryans-crossing` | Round Rock | `1xDuBS9UIJwvQpt6U6lU0gnLsukTKz5QGu4YG5lt_ajY` | CNKB-RoundRock | Auto-crawled |
| `tx-spring-rayford` | Rayford | `1Mj68G0eoO8f4cgJG8IkojhHd_Msrwndc8YDK-6TvGZ4` | CNKB-Rayford | Auto-crawled |
| `sudbury-on-ca` | Sudbury | `1iNj4XgFsH2RGPxFSMY-ytDii-7Tl9qTSqTDVpfLgH4I` | CNKB-Sudbury | Auto-crawled |
| `st-catharines-on-ca` | St. Catharines | `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` | CNKB-StCatharines | Shares EG doc |
| `burlington-on-ca` | Burlington | `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` | CNKB-Burlington | Shares EG doc |
| `ct-riverside` | Riverside | — | CNKB-Riverside | Needs doc created |

## Auto-Crawl (via _KBCRAWLER)

The nightly KB crawler (`/root/kb-crawler/crawl.ts`) runs at 2 AM ET via systemd timer. It:
1. Fetches structured data from `services.codeninjas.com` API
2. Transforms it into `<doc>` tags (10K char cap)
3. Writes to the Google Doc (auto-generated section)
4. Preserves the manual notes section

See `_KBCRAWLER` skill for details.

## Key Insight

The KB is **per-centre, not per-agent**. All agents at a centre share the same KB content via the Google Doc. Update the centre's Google Doc to update knowledge for ALL agents at that location.
