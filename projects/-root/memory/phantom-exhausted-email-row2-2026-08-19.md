---
name: phantom-exhausted-email-row2-2026-08-19
description: "Duplicate \"Lead Exhausted Nicole Bruce\" emails were phantoms — MasterSheet row 2 had Nicole's contact data under lead_id Scott-9059672357; Scott's test-call EOCs first-matched it. Row repaired + 6 legacy Scott rows renamed."
metadata: 
  node_type: memory
  type: project
  originSessionId: e3c79643-001f-4f80-85a8-26d7373f0fab
---

**2026-08-18:** Scott got two identical "Lead Exhausted: Nicole Bruce — East Gwillimbury" emails (13:01 + 21:01 UTC) to the centre inbox + BCC. Both PHANTOM.

**Root cause:** MasterSheet row 2 = ancient (April) exhausted row with **Nicole Bruce's data (9057178984, mrsbruce.n@gmail.com) but lead_id `Scott-9059672357`** (legacy corruption). Scott's HubSpot-test voicemail EOCs (attempt 1 exec 28078, attempt 4 exec 28131) derived lead_id Scott-9059672357 → `Fetch Lead Details` first-matched row 2 → attempt_count=4 → Calculate Next Call said exhausted → `Email: Lead Exhausted` rendered Nicole's row data. Same first-match class as [[nanp-guard-orphan-rownumber-2026-08-18]]/#62. Side effect: Scott's attempt-3 BOOKING completion also landed on row 2 (completed), then 28131 re-exhausted it — his real row 491 was closed manually.

**Nicole Bruce reality:** her row-2 history is long-dead; she has a FRESH Aug-18 inquiry `Bruce-9057178984` (row 493) being worked on normal cadence. Staff should IGNORE the exhausted emails; the AI is still dialing her. (Old row First=Nicole vs new First=Bruce — name-order parse differs between eras.)

**Fix applied (Sheets batchUpdate, 7 cells, verified):** row 2 lead_id → `Nicole-9057178984` (no collision; new inquiry is Bruce-…); stale Scott test rows 134/159/160/162/163/167 → `Scott-9059672357-legacyNNN` so a future Scott test call's EOC matches only its own fresh row. Full-sheet scan found 5 other lead_id≠First-Phone mismatches (rows 6/8/10/12 empty-First, 67 zero-padded, 180/184 phone-mismatch, 301 MANUAL-REPLAY, 317 RECOV tag, 333 empty-First) — all terminal + not fetchable by any future EOC derivation → left as-is.

**Still open (larger refactor, known):** EOC `Fetch Lead Details`/updates are first-match-by-lead_id; any future dup lead_id can reproduce this. Real fix = row_number-scoped EOC updates or unique lead_ids (append timestamp). Sweep self-heals stuck rows every 2h but does NOT catch phantom emails.
