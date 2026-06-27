---
name: core-backfill-batch-collapse-2026-06-24
description: Manual CORE backfill burst dialed only 1 of 21 — batch-collapse bug
metadata: 
  node_type: memory
  type: project
  originSessionId: f8bfdd2b-0701-4ca3-bd14-646188c71cfb
---

2026-06-24 ~19:29 ET: Scott had me fire the CORE-classifier backfill early (n8n `QdsKZXl5clf26jsd`, one-shot, normally armed 6/25 18:00 ET). Had to flip the in-code date guard `now.day===25 → 24` and bump the cron to fire (exec `22020`, success). All **21/21** synthetic `New CORE Program Inquiry` emails injected to `scott.james1717+<slug>@gmail.com`. Backfill then **deactivated** so the 6/25 cron can't double-fire. Backup: `/root/n8n-backups/backfill-QdsKZXl5clf26jsd-20260624-232741.json`.

**BUT only 1 of 21 actually dialed.** Pipeline `6sPwo7ngPyTWfmwM` (Outbound Call Flow - Multicentre) exec `22021`: Gmail Trigger=21 items, Extract Centre=21, then **Classify Lead collapses 21→1** (node processes only the first item when a poll batches multiple). Lone survivor reached `Retell: Call Prospect` → +12896876082 = **Nadine Gageiro (EG)**. The other **20 were dropped** AND consumed from the inbox (Gmail trigger won't re-emit them).

This is the **batch-lead detection gap = GitHub lead-reactivation#61**, now confirmed in production. I warned Scott pre-fire and offered throttling; he said fire now.

**Remediation:** re-inject the remaining 20 ONE AT A TIME, spaced > the Gmail-trigger poll interval so each lead gets its own pipeline execution. Dropped 20 = Pickering ×11, StCath ×5, Leaside ×3, EG ×1 (Jasmine Punni). Real fix for #61: make Classify Lead + downstream run per-item (loop/SplitInBatches) instead of first-item-only.

Supersedes the "21 backfill armed for 6/25" line in [[core-classifier-drop-2026-06-24]].

---
**UPDATE 2026-06-25 — #61 code fix applied, but burst recovery is INFEASIBLE (throttle required).**

Scott chose "fix #61 first, then burst." Applied per-item fix to pipeline `6sPwo7ngPyTWfmwM`:
- `Classify Lead` (Code) was `runOnceForAllItems` + single `return [{...}]` → collapsed N→1. Now `$input.all().map(...)` index-matched to `$('Gmail Trigger').all()`.
- `Format Slots` (Code) had the SAME single-return bug → would re-collapse the slots branch. Now maps per-item. `Merge1` is **combine-by-position, 3 inputs** (Edit Fields2 / Get KB / Format Slots); it re-pairs correctly as long as branches keep equal count+order. Edge risk: a mid-branch `Valid Input?` drop would mis-pair — acceptable for clean leads, noted as residual.
- Static `PipelineRegressionCheck.py` = **PASS**. Backup: `/root/n8n-backups/outbound-pipeline-6sPwo7ngPyTWfmwM-20260625-224629.json`.
- API PUT note: n8n public API rejects `settings.availableInMCP` + `settings.timeSavedMode` ("must NOT have additional properties") — filter settings to allowed keys on PUT; those two cosmetic keys reset to default.

**Why a burst still can't work (THE key finding):** `Get Availability` node POSTs to `http://138.197.171.204:5001/extract-calendar` = a **live browser scrape ~33.5s/lead**, serialized on the scraper's global extraction lock, and the workflow `executionTimeout=90s`. So:
- 20 in one batch execution = 20×33.5s ≈ 11 min ≫ 90s → canceled after ~2 leads.
- 20 injected fast = lock pile-up → cascade of 90s cancels.
- Proven live: a 2-lead canary (markers CANARY-A/B → regression-test → test #+19059672357) ran as 2 overlapping execs `22115`/`22116`, both canceled at exactly 90s, lastNode `Get KB`, dial never fired. Canary rows cleaned up (status=done).
- Isolated single leads are healthy (~31-50s, e.g. exec `22092`).

**Correct recovery = throttled SERIALIZED injection:** inject 1 → wait for that execution to finish → next. ~17-20 min for 20. The #61 code fix only safely covers ~1 lead/execution given the 33s-scrape vs 90s-timeout ceiling; it does NOT enable true bursts.

**STATUS: Scott chose HOLD 2026-06-25 (~18:55 ET). No calls placed. 20 still pending** = Pickering ×11, StCath ×5, Leaside ×3, EG ×1 (Jasmine Punni). Resume = run throttled-serialized recovery on his command (in-window 9-20 ET). Latent fragility to watch: `executionTimeout=90s` vs a 33.5s scrape leaves thin margin — a scrape spike could time out even single leads; consider raising timeout or moving `Get Availability` to the cached `/retell/get-slots/<slug>` endpoint.

---
**RESOLVED 2026-06-26 ~13:17 ET — all 20 recovered, DIALED 20/20.** Scott said fire. Ran `/tmp/recover20.py` (serialized: inject→wait-for-finish→next; no cleanup since real leads stay in MasterSheet for retry). Pulled the 20 live from the backfill Build node (excluded Nadine). Every lead reached `Retell: Call Prospect` and dialed its OWN parent number (0 mismatches, 0 not-dialed, each in its own execution 22171–22264). ~25 min, in-window. Result file `/tmp/recover20_results.json`.

**Live proof the #61 fix works:** exec `22217` batched 2 items in one poll — Titilope Kuku-Oke (ours) DIALED + an unrelated real inbound CORE lead (Tabitha Cisneros, "New CORE Inquiry for Code Ninjas **Spring-Rayford, TX**", 832-909-2971) correctly routed to `Not Enabled`. `Classify Lead` items=2 (NOT collapsed) — pre-fix one would've been dropped. My script's "DROPPED: 1" summary line was a false-positive bucket overlap (the drop was the TX lead, not one of our 20).

**New observation to surface:** a real CORE inbound lead for a **US/Texas** centre (Spring-Rayford, TX) is landing in the `scott.james1717` inbox and being dropped as Not Enabled — possible HQ mis-forward or out-of-scope expansion lead. Not our Ontario pipeline's job, but worth flagging to Scott/HQ. #61 issue itself is now functionally fixed (per-item Classify+Format); residual = combineByPosition mis-pair edge on mid-branch drops + 90s/33.5s timeout margin (both noted above).
