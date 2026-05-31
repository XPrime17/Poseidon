---
name: kbcrawler-summer-camp-flag
description: KB crawler flags centres missing summer camps Jan-Jun; surfaces in nightly email banner + subject tag
metadata: 
  node_type: memory
  type: project
  originSessionId: fb113d38-c744-4f42-9e79-741f86cb023c
---

## KB Crawler — Summer Camp Flag (added 2026-05-26)

Nightly KB crawler (`/root/kb-crawler/crawl.ts`) now flags centres that haven't published summer camps to their website.

**Detection rule:** During Jan–Jun (local month 0-5), check the facility camps API (`/api/v1/facility/camps/upcoming/{facilityId}`) for any camp with `startDateTime` in Jun/Jul/Aug of the current year (UTC). Zero matches → "missing". Outside Jan-Jun → silent ("n/a"). API errors → "n/a" (don't poison the flag).

**Surfacing:**
- Yellow callout banner at top of nightly summary email (only when ≥1 centre flagged)
- New "Summer Camps" column in per-centre results table (✓ / ⚠ missing / -)
- Subject line gets `— ⚠ N missing summer camps` suffix when flagged

**Why:** Centres that miss the summer publishing window lose tour bookings during their highest-intent season. The crawler already pulls camp data nightly; surfacing the absence costs nothing.

**How to apply:** When Scott asks about a centre missing summer camps mid-year, check the latest crawler email for the banner. If a centre is flagged but actually has summer camps, the bug is upstream in services.codeninjas.com — not the crawler.

**First-run baseline (2026-05-26 dry run):** 9 centres ok, Sudbury missing, Riverside API 400 (n/a). Watch Sudbury's next email for confirmation or upstream-data fix.

Related: [[kbcrawler-skill]]
