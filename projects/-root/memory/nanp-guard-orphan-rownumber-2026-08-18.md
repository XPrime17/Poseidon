---
name: nanp-guard-orphan-rownumber-2026-08-18
description: "Two hardening fixes shipped 2026-08-18 after the post-booking re-dial incident — NANP phone validation+normalization in Sanitize & Validate, and"
metadata: 
  node_type: memory
  type: project
  originSessionId: e3c79643-001f-4f80-85a8-26d7373f0fab
---

Shipped together on 2026-08-18 (follow-up to the [[hubspot-migration]] post-booking re-dial incident; both would have prevented it).

**1. NANP guard — `Sanitize & Validate` in outbound `6sPwo7ngPyTWfmwM`**
`deploy-nanp-guard-2026-08-18.py`, backup `n8n-backups/hubspot-lead-branch-2026-08-18/*.pre-nanp.json`. validatePhone was length-only (10–11 digits) so typo'd `+11905967235` was dialed and baked into lead_id. Now: 11-digit must start with 1; 10-digit core must match `^[2-9]\d{2}[2-9]\d{6}$`; **returned value normalized to the 10-digit core** — this also makes append-side lead_id == EOC's to_number-derived lead_id (kills the mismatch class). Invalid → existing Sanitization Failed alert, no append/dial. Offline 12/12 incl. the incident number. Gotcha for future node edits: n8n jsCode blank lines carry two trailing spaces (`\n  \n`) — exact-string patches must match them.

**2. #62 fix — Orphan Sweep `H7sxzNFsME4wkeJp`**
`deploy-orphan-sweep-rownumber-2026-08-18.py`, backup `n8n-backups/orphan-sweep-rownumber-2026-08-18/`. Fix Orphaned Leads matched on lead_id (first-match → dup lead_ids never healed, 7 stuck E2E rows since July). Now Find Orphans passes `row_number` through and the Sheets node matches on it — each stuck row heals itself. **Plus regression-test guard**: stuck rows with centre_id `regression-test` are exhausted, never re-queued (else the weekly Thursday canary row would re-dial Scott's cell 2h after every run — EOC still completes the first duplicate E2E lead_id, so the fresh canary row sticks at `calling` every week; sweep now cleans it silently).

**Pre-req cleanup done first:** 12 stale rows verified-then-closed to `exhausted` via Sheets batchUpdate (7 E2E `calling` rows 444/470/474/478/482/484/488; 5 at-cap `retry_pending` rows 214 test-Sudbury, 327 Synth-Riverside, 396 Orit EG, 403 E2E, 425 Chetan Pickering) so the first fixed sweep run had nothing unintended to re-queue.

**Verify:** gate = pre-existing baseline only (Barrhaven clickup_user_ids, 2 env-key WARNs). Sweep runs every 2h — first post-fix run should log 0 orphans. NOT fixed (larger refactor, known limitation): the EOC's own appendOrUpdate lead_id first-match behavior — dup lead_ids in the sheet can still receive a wrong-row completion write; the sweep now self-heals the fallout every 2h.
