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
- **Leaside doc:** `1hDmMP6565YUXbXu9srTpADGBhZy8xt4woODiqfsoSDI` — OAuth account has read-only access. Needs editor share.
- **Riverside:** No Google Doc ID. Needs doc created + ID added to `centres.json`.
- **Leaside slug:** Corrected to `leaside-on-ca` (not `on-leaside` which the calendar API uses)
- **Self-hosted n8n webhook bug:** Webhooks show "activated" in logs but never register. All KB workflows moved to cloud.

## How to apply
- When checking KB freshness or troubleshooting agent knowledge, check `journalctl -u kb-crawler.service` for last run
- When adding a new centre, add to `centres.json` and ensure Google Doc is shared with OAuth account as Editor
- Leaside KB will remain stale until the doc permission is fixed
