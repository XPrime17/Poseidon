---
name: scheduler-pairing-phantom-attempts-2026-08-22
description: Merge KB+Slots positional pairing broke on partial scrape failure → phantom attempts exhausted Amanda/Jaclyn with zero calls; Pickering was Sonamation-migrated but unconfigured; broken sheet-proxy silently no-oped the 8/21 stagger — issue
metadata: 
  node_type: memory
  type: project
  originSessionId: 07c2f2da-2c13-43ca-8da2-a72b86302836
---

Health check 2026-08-22 caught an outage-class bug chain in Retry Scheduler `rt0aEuDnFv3ZCl1y` (proof: exec 28565):

1. **Positional-pairing bug (latent, exposed by cache-first):** Get KB ∥ Get Availability → `Merge KB + Slots` (combineByPosition). Partial scrape failure (some items → requeue branch) misaligns the streams → `Retell: Retry Call` `$('Filter Eligible').item` lineage ambiguous → per-item "Multiple matches found" → items die on the DISCONNECTED error output. `Update Lead Pre-Call` already incremented → **phantom attempts, no call placed**. Pre-cache the successes were always a batch PREFIX (first-in-lock wins) so positions aligned by accident; cache-first made mid-batch successes possible.
2. **Pickering unconfigured:** Sonamation-migrated but absent from `CENTRES`/`SONAMATION_GUIDS` → live scrape failed EVERY tick → its 3 leads (Shannon/aliyah/Ashley) requeued forever, forcing perpetual partial-failure batches (which drove #1). FIXED: guid `43e81fe2-44b4-4806-8aae-b3b843755bd8` added 8/22, cache now serves 22 slots. **Riverside not audited — check before its first outbound lead.**
3. **`scrape_retries` column doesn't exist in the MasterSheet** → the requeue cap-5 → manual_review can never fire. Part of #67.
4. **Broken sheet-proxy no-op writes:** `/tmp/sheet-proxy.py` original had `sendBody` as a string expression → n8n httpRequest sent EMPTY bodies; Google returns 200 with `updatedRange` but writes NOTHING. The 8/21 stagger went through a proxy built from that script → **stagger never landed** (why all 5 leads were co-eligible next morning). Script now fixed in place (`sendBody:True, contentType:'json'`). **Rule: after any Sheets write, re-READ and compare — `updatedRange` alone is a lie.**

Damage + repair (8/22, all read-back verified): Amanda exhausted w/ 0 real calls → attempts=0 retry_pending; Jaclyn exhausted w/ 1 real → attempts=1; Brianna stuck calling w/ 4 (1 real) → attempts=1; Jennifer 3→2; Shannon/aliyah/Ashley 1→0. Real-call truth from Retell `list-calls` per number. No bogus exhausted emails went out (EOC email needs a real call; sweep exhausts silently — Gmail searched clean).

Structural fix = lead-reactivation#67 (lossless Get Availability or field-based merge + scrape_retries column + reconnect dial error path w/ attempt refund). Interim: all 7 outbound centres cached → partial failure rare but the bug is still latent. Related: [[scrape-cache-first-jitter-2026-08-21]], [[sonamation-scheduler-migration-2026-08-14]], [[orphan-sweep-dup-leadid-2026-07-01]].
