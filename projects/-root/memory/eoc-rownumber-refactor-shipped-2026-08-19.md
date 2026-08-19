---
name: eoc-rownumber-refactor-shipped-2026-08-19
description: "EOC row-number refactor SHIPPED + live-verified 2026-08-19 — first-match-by-lead_id killed in outbound EOC, scheduler, orphan sweep, and E2E harness cleanup. Two hard-won n8n gotchas: appendOrUpdate can't match row_number (silently appends), and node renames need INBOUND connection rewires."
metadata: 
  node_type: memory
  type: project
  originSessionId: 98c352d4-e211-462c-8cb6-310f21340ae3
---

# EOC row-number refactor — SHIPPED 2026-08-19 (built from [[eoc-rownumber-refactor-spec]])

Deploy: `/root/deploy-eoc-rownumber-2026-08-19.py` (+2 live follow-up patches, all reflected in the script). Backups: `/root/n8n-backups/eoc-rownumber-2026-08-19/` (pre-deploy + pre-fix2 for all 4 wfs).

## As built
- **Dial metadata:** outbound `Retell:  Call Prospect` (6sPwo7ngPyTWfmwM) sends `metadata.lead_id` (appended value — Append output has NO row_number, verified exec 28107). Scheduler `Retell: Retry Call` (rt0aEuDnFv3ZCl1y) sends `metadata.lead_id` + `metadata.sheet_row` (row_number via Filter Eligible full-read passthrough).
- **EOC (4p1V0wESn3kZySt6):** `Set lead_id` prefers `body.call.metadata?.lead_id` (legacy derivation fallback, `?.`-guarded) + new `sheet_row` assignment. Sheets lookup renamed **Fetch Lead Matches** (ALL lead_id matches, error output → Semaphore unchanged) → new Code picker named **Fetch Lead Details** (pinned sheet_row match, else newest = max row_number; outputs picked row + `identity_ok` + `matched_rows`) — all ~120 downstream `$('Fetch Lead Details')` refs untouched.
- **Writers now `operation=update` matching `row_number`:** EOC ×4 (Update Lead - Retry/Completed, Set Tour True/False), scheduler ×2 (Update Lead Pre-Call, Reset Lead on Error), orphan sweep `Fix Orphaned Leads` (H7sxzNFsME4wkeJp).
- **Exhausted-email gate:** `identity_ok=false` → email diverts to Scott with `[ROW-IDENTITY MISMATCH]` subject prefix instead of the centre (kills the [[phantom-exhausted-email-row2-2026-08-19]] class).
- **E2E harness cleanup rebuilt** (joLG6ji6JEMW6aaW): was appendOrUpdate-by-lead_id (live-demonstrated the disease: marked old dup row 403 done, left fresh canary row 493 stuck `calling`). Now Find Lead Rows → Pick Open Rows (calling/retry_pending only) → Any Open? → Mark Lead Done (update by row_number); no-op returns clean 200.

## GOTCHA 1 (cost 2 junk rows): n8n `appendOrUpdate` CANNOT match on `row_number`
row_number is a virtual column, not a sheet header — appendOrUpdate finds no match and **silently appends a partial junk row**. Must use `operation: "update"`, which matches row_number natively. This means the 8/18 sweep fix in [[nanp-guard-orphan-rownumber-2026-08-18]] was latently broken (never fired on a real orphan, so no junk produced) — corrected today.

## GOTCHA 2: renaming an n8n node requires rewiring INBOUND connections
`connections` is keyed by source node; renaming a target leaves sources pointing at the old name. First deploy left `Skip Cekura Tests → 'Fetch Lead Details'` (now the picker) so the Sheets lookup never ran (caught by synthetic exec 28171).

## Verification (all synthetic EOC webhooks against the 9-dup `E2E-9059672357` fixture)
- exec 28179: no pin → picker chose newest row 493 of 9 matches, updated IN PLACE ✔
- exec 28180: pin sheet_row=444 → exactly row 444 updated ✔
- exec 28181: pin 9999 (bogus) → `identity_ok=false`, fell back to newest ✔
- matched_rows stable at 9 across all → zero appends ✔; junk rows 494/495 deleted; fixture rows left terminal (403/493 done, rest exhausted).
- Static gate: PipelineRegressionCheck baseline (only pre-existing Barrhaven FAIL). E2E canary PASS (after-hours run: pipeline healthy, dial correctly withheld — so no REAL call has carried the new metadata yet).

## Open / residual
- **First real dial with metadata pending** — next business-hours lead or Thursday 19:00 ET canary exercises dial→EOC live end-to-end. Check the fresh canary row completes ITSELF.
- Scrape-requeue writers (`Requeue - Scrape Timeout`, `Scrape Cap - Manual Review` in both outbound + scheduler wfs) still lead_id-first-match (error-branch `$json` provenance; spec-scoped out). Low exposure.
- Sheet-utility scripts kept: `/root/mastersheet-read-2026-08-19.py`, `/root/ms-ops-2026-08-19.py` (temp-webhook read/batchUpdate/delete-rows).
- lead-reactivation#62 root cause is now fixed at origin (sweep heal was the mitigation) — candidate to close.
