---
name: scrape-timeout-requeue-2026-06-29
description: 6/26 E2E canary FAILED was a synthetic scrape-collision on the 90s timeout; fixed by node-timeout + graceful requeue (no drop) on both Get Availability scrape nodes
metadata: 
  node_type: memory
  type: project
  originSessionId: 6d2aa5f7-a237-40b5-9839-ea3eb0a6aa8b
---

**6/26 "ALERT: E2E lead-flow canary FAILED" diagnosis + fix (shipped 2026-06-29).**

ROOT CAUSE: canary exec 22120 (Thu 6/25 23:00 UTC = 19:00 ET) ran `status=canceled` at exactly **90.0s** — hit the outbound workflow `executionTimeout:90`. `Get Availability` does a live ~33.5s `/extract-calendar` scrape behind a global lock; three synthetic scrapes stacked within 11 min (22115/22116 backfill canaries + 22120 weekly E2E) serialized behind the lock → the third blew past 90s → n8n killed it AFTER `Append row in sheet` but BEFORE `Retell: Call Prospect` → lead queued, dial never fired. **Zero production blast radius** — only the 3 synthetic test leads collided with each other; real lead 22092 (22:16) + all 6/26+ execs (incl. 20/20 recovery) = success. Same fragility flagged in [[core-backfill-batch-collapse-2026-06-24]].

FIX (Scott's design — requeue, don't drop; keep live scrape for freshness since outbound has no latency budget): on BOTH live-scrape sites —
- `6sPwo7ngPyTWfmwM` Outbound Call Flow (first/ASAP attempt; 90s timeout)
- `rt0aEuDnFv3ZCl1y` Retry Scheduler (re-dials; runs every 90 min + 6:30pm ET)

added a CATCHABLE node-level timeout (`options.timeout=35000`, `retryOnFail=false`) so a stuck scrape fires the node error output instead of the 90s hard-kill, then wired the error branch to REQUEUE the lead (`status=retry_pending`, `next_call_after=now`) — serviced on the next scheduler tick (≤90 min; we explicitly accepted that over building a fast lane, since a faster cron = more scrape-lock contention). Cap = 5 lifetime scrape failures → `status=manual_review` + Gmail alert to Scott (so a dead scraper can't loop forever). A requeue NEVER burns a real call attempt.

KEY GOTCHA (paired-item): crossing GA's error output severs `.item` lineage.
- Outbound: GA's input/error item = the CENTRE-lookup row (from `Enabled?`) — has no `lead_id`. Use `$('Append row in sheet').first().json.lead_id` (safe; outbound is single-lead).
- Scheduler: GA's input item = the full lead row (`Update Lead Pre-Call` output), preserved on the error output. Use per-item `$json.*` (`$json.lead_id`, un-burn via `(parseInt($json.attempt_count)||1)-1`, `scrape_retries=(parseInt($json.scrape_retries)||0)+1`). `.first()` would be WRONG there (multi-lead).
New `scrape_retries` column auto-creates on first appendOrUpdate write (verified).

VERIFY: PipelineRegressionCheck PASS. Forced-timeout live test (set outbound GA timeout→100ms, inject synthetic lead, restore) — exec 22568 `success` in 13s (no 90s cancel), Requeue node wrote `status=retry_pending, scrape_retries=1`, dial correctly withheld. Outbound path is LIVE-PROVEN; scheduler path is verified-by-construction (same mechanism, `$json` refs validated against real PreCall data shape) but NOT live-fired — offered to Scott as optional follow-up.

Backups + deploy/forcetest/patch scripts: `/root/n8n-backups/scrape-timeout-requeue-2026-06-29/`. Deploy = `deploy.py` (idempotent), expression fix = `patch2.py`. n8n PUT requires settings whitelist (strip `availableInMCP`/`timeSavedMode`). RETELL_API_KEY lives in `/root/.claude/.env` (not /root/.env). Resolves the open canary item in [[e2e-leadflow-regression-harness-2026-06-24]].
