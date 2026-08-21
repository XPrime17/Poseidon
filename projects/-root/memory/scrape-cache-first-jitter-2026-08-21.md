---
name: scrape-cache-first-jitter-2026-08-21
description: "Shipped cache-first /extract-calendar (108ms vs 33s, zero n8n changes) + 0-30min retry-cadence jitter — fixes multi-lead scheduler-tick starvation; HubSpot scheduler API = future"
metadata: 
  node_type: memory
  type: project
  originSessionId: 07c2f2da-2c13-43ca-8da2-a72b86302836
---

Fix for the scrape-lock starvation (multi-lead ticks dialed ~1 lead/90min, rest burned `scrape_retries` toward the cap-5 manual_review dump — see [[testing-flag-string-false-misdial-2026-08-20]] redial saga). Shipped 2026-08-20 ~23:45 ET, Scott-approved:

1. **Cache-first `/extract-calendar`** in `/root/calendar_api.py`: `refresh_centre` + the live-scrape path now store `raw_result` (full `weeks` payload) in `slots_cache`; `/extract-calendar` resolves the centre against `CENTRES` and serves the cached payload when younger than `CACHE_MAX_AGE_S=1800`, else falls through to the original Sonamation/live-scrape path (requeue safety net in n8n untouched). **Zero n8n changes** — response shape identical, extra `served_from_cache`/`cache_age_seconds` keys ignored by Format Slots. Verified live: StCath 108ms, `weeks[].slots[]` shape intact, 28 slots. Dial throughput now independent of batch size.
2. **Retry-cadence jitter** in EOC `4p1V0wESn3kZySt6` `Calculate Next Call`: 6:30pm retries get `+ Math.floor(Math.random()*31)` minutes. Kept ≤30min deliberately — eligibility after ~7:06pm misses the last in-hours tick (ticks: 18:30 daily cron, 19:06, then 20:36 which the 8pm calling-hours gate blocks) and would slide leads to next morning.

Backups/revert: `/root/backups-code/scrape-cache-first-2026-08-21/calendar_api.py.bak` (then `systemctl restart calendar-api`); EOC pre-change JSON `/root/n8n-backups/scrape-cache-first-2026-08-21-eoc-before.json`. calendar_api.py now snapshotted in private `tourforce-ops` repo (`scripts/calendar_api.py` + `sonamation_slots.py` + `systemd/calendar-api.service`, commit e5c8df6) — droplet copy at `/root/calendar_api.py` remains authoritative; re-snapshot after future edits.

Regression gate after ship: no NEW failures (Barrhaven clickup_user_ids FAIL = parallel onboarding workstream, ignore per Scott 8/14; 16474963276 unbound warning pre-existing).

**OPEN:** (a) 8/21 staggered dials Amanda 09:30/Jaclyn 11:00/Breanne 12:30/Shannon 14:00/aliyah 15:30 ET should each hit the cache and dial — verify. (b) Pickering + Riverside not in `CENTRES` → no cache, still live-scrape fallback per lead; add them once slot volume justifies browser-refresh load. (c) Strategic: connect to each centre's HubSpot scheduler API for availability+booking (Scott has an API key) — filed lead-reactivation#66, would eventually replace scraping AND Skyvern booking. Related: [[sonamation-scheduler-migration-2026-08-14]], [[scraper-lock-deadlock-fix-2026-06-16]], [[scrape-timeout-requeue-2026-06-29]], [[retry-cadence-ab-2026-06-10]].
