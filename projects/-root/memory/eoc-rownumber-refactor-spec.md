---
name: eoc-rownumber-refactor-spec
description: "BUILD-READY spec for the EOC row-number refactor — kill the first-match-by-lead_id disease in outbound EOC + retry scheduler. Three production symptoms already caused. Fresh-session project, ~2-3h with tests."
metadata: 
  node_type: memory
  type: project
  originSessionId: e3c79643-001f-4f80-85a8-26d7373f0fab
---

# EOC Row-Number Refactor — build spec (written 2026-08-19)

**Goal:** every post-call sheet write lands on the exact row that was dialed. Today identity is *re-derived* from dial-time dynamic variables and resolved by first-match on a non-unique lead_id — three production incidents in 24h came from this.

## Why (the three symptoms, all Aug 2026)
1. **Stuck E2E rows** (#62): weekly Thursday canary rows stuck at `calling` because EOC completed the FIRST `E2E-9059672357` duplicate, not the dialed row. Sweep now self-heals ([[nanp-guard-orphan-rownumber-2026-08-18]]) but the wrong-row write remains.
2. **Post-booking re-dial:** Scott's HubSpot-E2E booking (attempt 3) completed the wrong row → scheduler fired attempt 4 after the tour was booked ([[hubspot-migration]]).
3. **Phantom "Lead Exhausted: Nicole Bruce" emails ×2** to the centre inbox: EOC Fetch first-matched a corrupt legacy row (Nicole's data under Scott's lead_id) and emailed staff a false exhaustion ([[phantom-exhausted-email-row2-2026-08-19]]).

Data cleanup done (corrupt row 2 + 6 legacy Scott rows renamed `-legacyNNN`; 12 stale rows exhausted) — but any future duplicate lead_id (same First+Phone re-inquiry is ENOUGH, e.g. a lead re-inquiring next month) recreates the disease. Nicole's re-inquiry was one rename away from colliding with her own April row.

## Current mechanics (verified live 2026-08-19)
- **Outbound EOC `4p1V0wESn3kZySt6`** (58 nodes):
  - `Set lead_id` (set node): `{{ dyn.first_name }}-{{ dyn.PHONE }}` from the webhook's `body.call.retell_llm_dynamic_variables`.
  - `Fetch Lead Details` (Sheets): filtersUI lookup `lead_id` = derived value, **`returnFirstMatch: true`**.
  - Writers matching on `['lead_id']` (appendOrUpdate): **`Update Lead - Retry`, `Update Lead - Completed`, `Set Tour True`, `Set Tour False`**.
- **Retry Scheduler `rt0aEuDnFv3ZCl1y`**: `Get All Leads` (full read — items DO carry `row_number`) → `Filter Eligible` (code) → dial. Writers matching `['lead_id']`: **`Update Lead Pre-Call`, `Reset Lead on Error`** (+ `Requeue - Scrape Timeout`, `Scrape Cap - Manual Review` in outbound wf `6sPwo7ngPyTWfmwM`).
- **Dial nodes** (both HTTP → `api.retellai.com/v2/create-phone-call`): outbound `Retell:  Call Prospect` (note: two spaces in name), scheduler `Retell: Retry Call`. Both already send `metadata` (scheduler sends `retry_attempt`) and `retell_llm_dynamic_variables`.
- Ingestion `Append row in sheet` builds lead_id `{{ First }}-{{ phone_override }}` — post-NANP-guard both sides use the same 10-digit phone, but First still comes from a parse and can drift (Nicole's came in as "Bruce Bruce").

## Design (recommended): thread identity through Retell metadata
1. **Dial-time:** add to `metadata` in BOTH dial nodes: `lead_id` and `sheet_row` (scheduler: `$('Filter Eligible').item.json.row_number`; outbound initial call: row is fresh-appended — the Append node's output item contains `row_number` in n8n v4 output? VERIFY; if not, re-read after append or match by lead_id at dial only, where the row is seconds old and dup risk ~0. Simplest robust option: after `Append row in sheet`, the node output includes the appended row's row_number — confirm in a test execution first).
2. **EOC:** `Set lead_id` → prefer `body.call.metadata.lead_id` (fallback to current derivation for in-flight calls dialed pre-deploy; keep fallback ~1 week then optionally remove). Add `Set sheet_row` similarly.
3. **EOC Fetch:** filter on `row_number` when `metadata.sheet_row` present (filtersUI lookupColumn `row_number`), else legacy lead_id lookup. (Or keep lead_id fetch but verify fetched `row_number == metadata.sheet_row`, alert on mismatch.)
4. **All 4 EOC writers + 2 scheduler writers:** add `row_number` to mapped values and switch `matchingColumns` to `['row_number']` (exact pattern already proven in the Orphan Sweep fix — see `deploy-orphan-sweep-rownumber-2026-08-18.py`).
5. **Exhausted/staff emails:** render from the fetched row only after the row-identity check passes; on mismatch send an ALERT to Scott instead of a centre-facing email (prevents phantom class entirely).

Alternative considered (rejected): globally unique lead_ids (timestamp suffix) — breaks EOC derivation for in-flight calls, touches ingestion + scheduler + EOC simultaneously, no fallback path.

## Test plan
- Backups of all 3 workflows first (`/root/n8n-backups/eoc-rownumber-<date>/`).
- Deploy-script pattern: exact-string/param edits + sentinel + abort-on-drift (`deploy-refund-nothandled-2026-07-20.py` is the canonical example).
- Offline: none of this is jsCode-heavy except Filter Eligible passthrough — main risk is node-param drift; dry-run first.
- Gate: `PipelineRegressionCheck.py` (baseline failure: Barrhaven clickup_user_ids — pre-existing, ignore).
- Live: `E2ELeadFlowCheck.py` (fixture `regression-test`, rings Scott's cell) — after this refactor the canary's EOC should complete ITS OWN row (finally fixes the weekly stuck-row source at origin). Verify in sheet: fixture row goes `calling→completed`, no new stuck row, sweep's next run logs 0 orphans.
- Dup-safety test: temporarily append two rows with the same lead_id (test fixture), dial one via scheduler, verify the dialed row (by row_number) is the one updated; clean up.

## Gotchas (hard-won)
- n8n jsCode blank lines carry TWO TRAILING SPACES (`\n  \n`) — exact-string patches must match (cost one failed deploy 8/18).
- PUT body: strip `availableInMCP`/`timeSavedMode` from settings or the API rejects.
- Retell sends call_started/ended/analyzed webhooks — EOC's `Filter out Call Started & Ended` gates to analyzed; duplicate EOC executions per call are NORMAL (ongoing+ended+analyzed = 3 execs).
- `Skip Cekura Tests` node sits between Set lead_id and Fetch — keep it upstream of any new identity logic.
- Sheet tab name is `All Centres` (gid=0); MasterSheet id `1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`; lead_id col C, First D, Last E, status L.
- Sheets credential id `yjVHcEWrpyDmxkvv` ("Google Sheets account 3") — used by the temp-webhook read/write pattern (see session e3c79643 scripts).
- The row_number a Sheets read returns is 1-based including header (row 2 = first data row) — consistent with what appendOrUpdate row_number matching expects; the Orphan Sweep fix already relies on this.

## Context: was this part of the HubSpot migration?
No — core pipeline debt, CRM-agnostic, dating to the duplicate-lead_id design (first filed as #62 on 2026-07-01). The HubSpot migration E2E test (typo'd phone → lead_id drift → wrong-row completion) merely EXPOSED it three ways in one day. Fixing it matters more now because HubSpot-era re-inquiries (webform, low friction) make duplicate First+Phone pairs more common.
