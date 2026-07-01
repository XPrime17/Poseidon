---
name: orphan-sweep-dup-leadid-2026-07-01
description: "Orphan Sweep detects stuck 'calling' leads but its appendOrUpdate-on-lead_id write silently no-ops on duplicate ids; filed as lead-reactivation#62"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2a94dc9c-cd9f-4bf8-ae3d-50c74f8e619f
---

Health check 2026-07-01 found 8 leads stuck at `status=calling` (oldest since 2026-05-03), 7 synthetic + 1 real (Chetan Bhatiya, Pickering, `testing=False`, stuck 6/27). Manually swept all 8 by `row_number` range (set `status=completed`, `lead_id=""`, `last_outcome=orphan_swept`) → verified 0 stuck calling, 0 duplicate active lead_ids. Chetan's canonical `retry_pending` row (425) was intact, so no real lead was lost.

Root cause (symptom clear only — bug still live): **Orphan Sweep `H7sxzNFsME4wkeJp` node `Fix Orphaned Leads` uses `operation=appendOrUpdate` matching on `lead_id`, which is NOT unique.** `Find Orphans` correctly emits all 8 every run (execution history: Find=8/Fix=8 for weeks), but `appendOrUpdate` updates only the FIRST (lowest-row) match per id. Chetan's `retry_pending` twin at row 425 matched before the orphan `calling` row 437, so 437 never healed and re-appeared every 2h forever. This is the runbook's Failure Mode #4 (duplicate lead_id + appendOrUpdate); the sweep itself births the duplicates when an append-instead-of-update fires.

Filed **XPrime17/lead-reactivation#62** (bug, priority-high). Proposed fix (NOT yet shipped, awaiting Scott): change `Fix Orphaned Leads` to deterministic per-row `values:batchUpdate` keyed on `row_number` (pass `row_number` through `Find Orphans`), add a dedup guard, and alert if `Find Orphans` stays non-zero across consecutive runs (fix isn't landing).

**Why:** A cron that reports "success" with non-zero item counts looked healthy for weeks while doing nothing — real leads silently stopped getting called.
**How to apply:** Never match `appendOrUpdate` on a column that can duplicate; use `row_number` range updates for in-run read→fix. When a scheduled fixer keeps re-finding the same items, the WRITE is failing, not the detector. Related: [[e2e-leadflow-regression-harness-2026-06-24]], [[systemcheck-skill]].
