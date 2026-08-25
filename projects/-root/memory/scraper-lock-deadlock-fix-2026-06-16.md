---
name: scraper-lock-deadlock-fix-2026-06-16
description: calendar-api scraper deadlock RCA + the timeout/lock/watchdog fixes shipped to prevent recurrence
metadata: 
  node_type: memory
  type: project
  originSessionId: f6731dab-ca98-4c2b-b81c-35f02e91227a
---

2026-06-16: calendar-api.service (138.197.171.204:5001) deadlocked — a background cache-refresh scrape hung inside the global `extraction_lock` with no wall-clock deadline, so the lock was held forever. Cache `last_updated` froze at 03:29 UTC (reads still served stale data, masking it); first live `/extract-calendar` at 22:30 UTC blocked on the held lock and every subsequent request stacked up `(waiting for lock)`. Undetected because the Heartbeat Monitor was itself broken (see [[droplet-claude-symlink-fix]] family). Restart cleared it.

Root cause: `with extraction_lock:` is an unbounded acquire, and `asyncio.run(extract_all_weeks())` had no overall timeout — a wedged Chromium (Playwright leak, 5-day proc, peak ~605MB) made an await never return.

Fixes shipped (`/root/calendar_api.py` + `/root/extract_childcarecrm_fixed4.py`, backups `.bak-20260616-013420`):
1. `run_extraction()` wraps the scrape in `asyncio.wait_for(..., timeout=90)` — a hang now raises, unwinds, releases the lock.
2. Lock acquire is bounded: `extraction_lock.acquire(timeout=120)`; HTTP route returns 503 on failure, cache-refresh skips the cycle.
3. `browser.close()` wrapped in `asyncio.wait_for(..., 15)`; route adds a 504 on TimeoutError.
4. Watchdog: `/root/scraper_watchdog.py` + `scraper-watchdog.timer` (every 5 min) restarts the service if /health is unreachable or any cache entry is stale >30 min. Has a 180s warm-up guard (cache is legitimately empty right after restart — without the guard it restart-loops).

Verified: live extraction HTTP 200, 23 EG slots, 50.9s (<90s); watchdog OK branch + warm-up skip both confirmed; timer active+enabled. **How to apply:** if the scraper ever hangs again the watchdog self-heals within ~5 min; check `journalctl -u scraper-watchdog.service`. Cache age >30min in `/health` is the canary. Relates to [[deploy-env-sourcing]].
