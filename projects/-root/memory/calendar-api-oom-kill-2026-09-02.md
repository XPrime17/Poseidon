---
name: calendar-api-oom-kill-2026-09-02
description: calendar-api.service OOM-kill 9/2 — global OOM killed its chrome child + a 1.3GB pm2 bun app; self-healed in 5s; droplet memory chronically tight
metadata: 
  node_type: memory
  type: project
  originSessionId: d667fe83-1aae-409c-babc-151da8298c4c
---

**Incident (2026-09-02 16:36–16:40 UTC / 12:39 PM EDT):** 2GB droplet hit global OOM. Kernel killed calendar-api's `chrome-headless` scrape child (92MB RSS — victim, not cause) → unit `Failed with result 'oom-kill'` → TourForce alert. `Restart=always` brought it back in 5s; zero lasting impact (outbound scrape failures requeue, inbound falls to safe "unavailable").

**Real memory hog:** a `bun` process under `pm2-root.service` (pid 234629) at **1.3GB anon RSS** — also killed, which took pm2 down; pm2 resurrected 16:40:13 with all 5 apps small (webhook-server, voice-chat, report-server, quiz-battle, tourforce-portal). Which bun app leaked was NOT identified (all fresh post-restart). If it recurs, catch it live via `ps aux --sort=-%mem` before it dies.

**Why:** droplet runs ~755MB available with 3.5GB/4GB swap consumed — six long-lived interactive `claude` sessions (pts/2,4,5,7,8,9, some since Aug 11) hold most of the swap. Any transient spike (Playwright scrape + a leaking bun) tips it over.

**How to apply:**
- `scraper-watchdog.timer` (5min, `/root/scraper_watchdog.py`) is the thing doing "clean" calendar-api restarts — restarts when oldest cache age > 1800s. It fired 19:45 UTC for barrhaven at exactly 1800s: the serialized refresh loop cycles slowly under load, so caches routinely age 1200–1800s. Marginal by design; watchdog restarts are benign backstops, not incidents.
- Alert timestamps say "EDT" but are actually PDT-clocked (12:40 PM alert = 16:39:56 UTC = 12:39 EDT — coincidence checked via journal, trust journal not the alert label).
- pm2 memory guard SHIPPED 9/3 (Scott approved): `max_memory_restart 300M` on webhook-server/voice-chat/report-server/quiz-battle (tourforce-portal already had 512M), all restarted + health-probed (webhook-server :3847/health 200, voice-chat :3000), `pm2 save` persisted to dump.pm2. Note: the bash-wrapped apps `exec` into bun, so pm2 monitors the real process — guard is effective. webhook-server = /opt/email-webhook (MyStudio webhook + email API, port 3847).
- STILL OPEN: close stale claude TTY sessions (pts/2,4,5,7,8,9) to reclaim ~3.5GB swap — Scott's call, emailed 9/3 msg 1a0650f31946f2a1.
- Pickering 502 CORRECTED + FIXED 9/3: NOT every-cycle — Sonamation throws transient 502s on ~7% of calls (1929 OK vs 156 fail since 8/25), guid was always right; "missing from cache" was just post-restart timing. Shipped retry-on-5xx w/ backoff (1.5s/3s) in `/root/sonamation_slots.py` `_get` (backup `.bak-2026-09-03`), service restarted, all 7 centres incl. pickering verified caching. Relates to [[sonamation-scheduler-migration-2026-08-14]].
