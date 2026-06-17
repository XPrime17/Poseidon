---
capture_type: LEARNING
timestamp: 2026-06-16 01:32:27 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Scott — bottom line: a single Playwright scrape wedged with no deadline and never let go of the one global lock the whole system shares, so every live slot lookup queued behind it forever. The cache hid it for 19 hours and the Heartbeat alarm was broken, so nobody knew until you ran the check. The durable fix is a 90-second watchdog on the scrape plus a bounded lock — three small edits that turn a permanent deadlock into a self-healing blip. Want me to ship them?

**Date:** 2026-06-16
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

🤖 PAI ALGORITHM ═════════════ (ISC #5–6 above)

**🧠 THINK** — The scraper has one global mutex, `extraction_lock`, that *two* independent things grab: the background cache refresher and the on-demand `/extract-calendar` HTTP route. Both grab it with a bare, **infinite-wait** `with extraction_lock:`, and inside it they run a Playwright scrape with **no overall deadline**. So the failure is structural, not a fluke.

**📋 PLAN → 🔨 BUILD → ⚡ EXECUTE** — Reconstructed the timeline from the cache timestamp + logs and mapped it onto the code paths.

**✅ VERIFY — What actually happened (the timeline)**

1. `calendar_api.py:116` starts a background thread that loops forever refreshing every centre's cache (`refresh_centre` → `:89 with extraction_lock:` → `:91 asyncio.run(extract_all_weeks())`).
2. The cache's `last_updated` froze at **03:29 UTC**. That's the last refresh that *returned*. The very next refresh cycle **hung inside the locked scrape and never returned** — so from ~03:29 the global lock was held continuously, and the cache stopped updating.
3. It stayed invisible for ~19h because every *read* path (`/health`, `/slots`, n8n's cached Get-Availability) uses a **different** lock (`cache_lock`) and happily served the frozen 03:29 data.
4. At **22:30 UTC** the first *live* scrape since the hang arrived (Orit's outbound call). It hit `:151 with extraction_lock:` → blocked on the lock the dead refresher still held → logged `(waiting for lock)` forever. Every subsequent request (22:35, 22:40, my probes at 01:08/01:10) stacked up behind it. **Deadlock.**
5. `systemctl restart` killed the wedged Chromium and reset the lock → instant recovery.

**Root cause — why the holder never let go.** A `with`-lock *does* release on a normal exception, so an ordinary timeout wouldn't deadlock. This was a **silent hang** — an `await` that never returned and never raised. Three code gaps made that possible and fatal:

- **No wall-clock deadline on the scrape.** `asyncio.run(extract_all_weeks())` (`:91`/`:154`) has no overall timeout. Individual steps have timeouts (`goto` 30s, `wait_for_selector` 45s), but `browser.close()` (`extract_…:190`) has none, isn't in a `finally`, and `wait_for_load_state('domcontentloaded')` is unbounded. A wedged Chromium child (5-day-old process, peak RSS ~605 MB — the known Playwright leak) makes one of those awaits block indefinitely.
- **Unbounded lock acquire.** `with extraction_lock:` waits *forever*. One stuck holder ⇒ every caller hangs, no backpressure, no fail-open to cache.
- **Single global lock = single point of failure.** One hung centre-scrape freezes all live extraction for every centre.

And it went undetected because the **Heartbeat Monitor was broken** (the race I fixed in the last step) — the one alarm that watches freshness never fired.

**🛡️ Mitigation — how we stop it recurring** (prioritized; ⭐ = converts "infinite deadlock" → "self-healing")

| # | Fix | Where | Effect |
|---|-----|-------|--------|
| ⭐1 | Wrap the scrape in `asyncio.wait_for(extract_all_weeks(), timeout=90)` | `:91`, `:154` | A hung scrape now *raises*, the `with` releases the lock, service self-recovers. **Single highest-value fix.** |
| ⭐2 | Bounded acquire: `extraction_lock.acquire(timeout=120)` → on failure serve cache / return 503 | `:89`, `:151` | A stuck holder can no longer hang every caller; callers fail-open to cache. |
| ⭐3 | `try/finally` around the browser; `await asyncio.wait_for(browser.close(), 15)` | `extract_…:149–190` | Guarantees Chromium teardown; stops zombie/wedge accumulation. |
| 4 | Watchdog: external check "cache age > 30 min ⇒ `systemctl restart calendar-api`" (or systemd `WatchdogSec` + `sd_notify`) | new timer | Auto-recovers even if 1–3 are bypassed; would've fixed last night at ~04:00 instead of 01:13. |
| 5 | Nightly preventive `systemctl restart` after the 2 AM KB crawl | systemd timer | Caps the known Playwright memory-leak/wedge risk. Cheap insurance. |
| 6 | Add a **scraper-staleness probe** to Heartbeat Monitor + `/_SYSTEMCHECK` (cache `last_updated` age, and lock-held duration) | n8n + skill | Closes the detection gap so the next freeze pages you in minutes, not when someone runs a manual check. |
| 7 | (Optional) per-centre locks instead of one global lock | `:12` | One wedged centre no longer blocks the others. |

Fixes **1–3** are small, self-contained edits to two files and eliminate the deadlock class entirely; **4** and **6** are the safety net + detection. I'd ship 1–3 + 4 first.

**🧠 LEARN** — Three compounding failures: a resource that can hang with no deadline, a lock with no escape hatch, and a broken alarm. The cache that makes the system resilient for reads is exactly what hid the outage for 19 hours. Worth saving as a droplet-ops memory.

Want me to implement fixes **1–3** in the scraper plus the **stale-cache auto-restart watchdog (4)** now? They're low-risk and I can verify each with a forced-hang test before declaring done. I'll hold off on touching the live service until you give the word.

🗣️ Poseidon: Scott — bottom line: a single Playwright scrape wedged with no deadline and never let go of the one global lock the whole system shares, so every live slot lookup queued behind it forever. The cache hid it for 19 hours and the Heartbeat alarm was broken, so nobody knew until you ran the check. The durable fix is a 90-second watchdog on the scrape plus a bounded lock — three small edits that turn a permanent deadlock into a self-healing blip. Want me to ship them?

</details>
