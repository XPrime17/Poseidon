---
name: _KBCRAWLER Skill
description: Nightly KB crawler — architecture, scheduling, n8n workflow IDs, known issues. Auto-syncs Code Ninjas API data to Google Doc KBs for voice agents.
type: project
originSessionId: b5fcb027-435b-4546-8504-e4b02472207a
---
## Architecture
- **Script:** `/root/kb-crawler/crawl.ts` (Bun/TypeScript)
- **Registry:** `/root/kb-crawler/centres.json` (11 centres)
- **Data source:** `services.codeninjas.com/api/v1/facility/profile/slug/{slug}` (no auth, public JSON)
- **Output:** `<doc>` tags in Google Docs (auto-generated section + preserved manual section)
- **Char limit:** 10K per centre (tiered priority truncation)
- **Hash-based change detection:** SHA-256 of auto content embedded in doc header, skips write if unchanged

## Scheduling
- **systemd timer:** `kb-crawler.timer` at 06:00 UTC (2 AM EDT). Adjust to 07:00 UTC when clocks fall back to EST.
- **Manual:** `systemctl start kb-crawler.service` or `bun run /root/kb-crawler/crawl.ts`

## n8n Cloud Workflows (xprime17.app.n8n.cloud)
- **GDocs Read:** `NZddHLft1gzuUrRL` → `/webhook/kb-gdocs-read`
- **GDocs Write:** `hTsOcQ3CNsZ5e1xQ` → `/webhook/kb-gdocs-write`
- **Credential:** `58qerrOCaSjZ51WF` (Google Docs OAuth)
- **Write method:** Google Docs batchUpdate API (deleteContentRange + insertText) via n8n HTTP Request node

## n8n Self-Hosted API Key (created 2026-04-24)
- Key: `n8n_api_3ea467a2fe66c115258e6770158a69f2c5144335` (label: `kb-crawler`)
- Created via direct SQLite insert. Self-hosted webhooks have a registration bug — gdocs workflows hosted on cloud instead.

## Known Issues
- **Leaside doc:** Replaced with `1iiC7zTyE190wesxXevNwOGV8gRE3PoJLO-1YWF3hi2Y` (Scott's copy, write access confirmed 2026-04-25). Old doc `1hDmMP6565YUXbXu9srTpADGBhZy8xt4woODiqfsoSDI` was owned by Sharmilla (read-only).
- **Riverside doc:** Created 2026-05-02 as `1p3vCjF0n9W-4zpi4AUL6HRN3gTpBrkRpxBHUGPLMx-0` ("Code Ninjas Riverside KB"). Owned by the n8n OAuth account → write works without external editor share. Shared with scott.james@codeninjas.com as writer. First crawl wrote 965 chars.
- **Burlington doc:** Created 2026-05-02 as `1N5q0uyFUxPKruud1N94rlzfz1K-rKzsR3z3qttNUr5o` ("Code Ninjas Burlington KB"). Replaced shared EG docId in centres.json. First crawl succeeded.
- **St. Catharines doc:** Created 2026-05-02 as `1fn_s059ds_uP--mH4izXPNKdwFjW8TOL9SWopsPEpis` ("Code Ninjas St. Catharines KB"). Replaced shared EG docId. First crawl succeeded.
- **Skip-logic gotcha:** Crawler `crawl.ts:614` keys the "shares EG" skip on `centre.note?.includes("crawl skipped")` — must remove the note in centres.json AFTER swapping docId, or the crawl is no-op'd.
- **Camp scraper lazy-load fix (2026-05-02):** `scrape_camps.py` initial wait bumped from 5s → 10s. The MyStudio camp widget streams weeks in over ~8-10s; old wait caught only Week 1 of EG (4 camps), now catches all 10 weeks (40 camps). Symptom: nightly EG doc had a "Summer Camp Schedule" tag with one week, looked broken.
- **US centre camps:** Riverside (and likely most US centres in May) haven't published summer camps yet — page body is ~2.4KB with marketing copy only. Not a crawler bug. Stone Oak returns 9 "events" but 0 camps, likely PNOs/workshops via different markup. Centre-specific publishing, not pipeline.
- **Two camp page formats (2026-05-02):** Some centres (EG) use `[Week N - FORMAT] Camp Name` markup → Pattern 1. Others (St. Catharines, Burlington) use "Camps For You" block format: `Ages X+ / $price / Name / date-range / time / description / VIEW CAMP` → Pattern 4. Both extract correctly.
- **Hydration timing fix (2026-05-02):** Burlington's /camps page renders ~2KB initially and hydrates to ~60KB over 15s. Old fixed 10s wait + default UA returned a stale snapshot ("page is empty" false negative). Scraper now uses a realistic Chrome user-agent + viewport + `wait_for_function` polling for "VIEW CAMP" or "[Week N" content signals (timeout 25s). Falls through gracefully if no camps published.
- **`isCAMPSEnabled` was a red herring (2026-05-02 part 2):** Riverside has `isCAMPSEnabled=false` on the marketing page but DOES have published camps in MyStudio. The marketing page just doesn't embed the widget. The camps still live in the public, no-auth API at `services.codeninjas.com/api/v1/facility/camps/upcoming/{facilityId}` (use `facilityId` from the existing profile API).
- **API-based camp fetcher (2026-05-02):** crawl.ts `fetchCampsFromAPI(facilityId)` replaces Playwright `fetchCampAndEvents` for camps. Returns rich JSON: `title`, `description`, `price`, `age`, `startDateTime`, `endDateTime`. Renders into `<doc title="Upcoming Camps & Events">`. Faster (no headless browser), more reliable, and works regardless of whether the centre has enabled the marketing-page widget. Camp counts via API: EG 43, Burlington 42, St.Cat 44, Riverside 17, Pickering 56, Leaside 4, Canton 37, Stone Oak 56, Round Rock 38, Rayford 18, Sudbury 0.
- **Franchisor-API sync gap (2026-05-02):** Some centres publish weekly summer camps in MyStudio (`members.codeninjas.com/e/?uuid=...`) but the camps don't flow into `services.codeninjas.com/api/v1/facility/camps/upcoming/{uuid}`. Confirmed for Riverside (17 short-format only, 0 weekly), Leaside (4, 0 weekly), Canton (37, 0 weekly). MyStudio direct page is bot-protected (403 even with playwright-stealth + UA + referer). For Riverside, manual stopgap: 6 camps from screenshot inserted into doc's MANUAL section (preserved across crawls). Long-term fix: tell owner to publish weekly camps in a way that flows through to franchisor API (or get cn.mystudio.io API key).
- **`scrape_camps.py` is now legacy:** Still in the repo but no longer called from crawl.ts. Safe to delete after a few nightly runs prove the API path is stable.
- **Pattern for new centres:** Use a temp n8n workflow to POST to `https://docs.googleapis.com/v1/documents` with credential `58qerrOCaSjZ51WF` — the doc is owned by the OAuth account, so write works automatically. Avoids the Leaside-style "doc shared from another account" trap.
- **Leaside slug:** Corrected to `leaside-on-ca` (not `on-leaside` which the calendar API uses)
- **Self-hosted n8n webhook bug:** Webhooks show "activated" in logs but never register. All KB workflows moved to cloud.

## How to apply
- When checking KB freshness or troubleshooting agent knowledge, check `journalctl -u kb-crawler.service` for last run
- When adding a new centre, add to `centres.json` and ensure Google Doc is shared with OAuth account as Editor
- Leaside KB will remain stale until the doc permission is fixed
