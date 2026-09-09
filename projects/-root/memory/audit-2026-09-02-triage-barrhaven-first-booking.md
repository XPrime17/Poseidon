---
name: audit-2026-09-02-triage-barrhaven-first-booking
description: "9/2 audit's 5 issues triaged — 2 HIGHs false positives; Barrhaven call was a TEST lead (Testing=TRUE) but Skyvern completed a REAL calendar booking"
metadata: 
  node_type: memory
  type: project
  originSessionId: 88312a64-c117-49d9-a896-40ec2669f453
---

Triage of the 2026-09-02 daily call audit (5 issues, H:2 M:2 L:1). Four of five clustered on one call: `call_9389d9cb4e74d4bd27cdf44f910`, CNKB-Barrhaven outbound to +16136684805.

**CORRECTED (per Scott 9/3): Barrhaven Testing is NOT flipped.** Centre row 16: `Testing=TRUE`, `test_number=6136684805` — the dialed number IS the test number; Phone Override worked as designed. MasterSheet row 536 "Rosa Larochelle" is a **synthetic test lead**: her Phone cell = 6136684805 (the test number itself), lead-level `testing`=TRUE, email rorolaalaa@gmail.com. Whoever answered role-played (child "Batman"). NOT a first real booking; my initial read was wrong — always check centre `test_number` before calling an outbound dial "real."

**Real side-effect:** EOC ran the full booking flow for the test lead — Skyvern `wr_569974606398862292` created 23:12 UTC (minute the call ended) → **completed**; row 536 status=completed, Tour=TRUE, Date=Sept 11 2026 5:00 PM, CRM Confirm blank. This E2E-validates the Skyvern booking flow on a Sonamation-migrated centre ([[sonamation-scheduler-migration-2026-08-14]] OPEN-HIGH partly addressed; also more proof of [[skyvern-false-failure-fix-2026-06-27]]). BUT Barrhaven's live calendar now holds a fake "Rosa Larochelle" Sept 11 5PM booking → cancel it / confirm Maurice knows ([[barrhaven-onboarding-2026-08-14]]).

Issue verdicts (all stand, reinforced by test status):
1. HIGH "Voicemail misdetection" — FALSE POSITIVE. 4-min live conversation; heuristic tripped on terse replies + same number hitting VM that morning (9:39 AM 2s attempt).
2. HIGH "HALLUCINATION" (Fri Sept 11 5pm) — FALSE POSITIVE: SLOTS contained `Friday 2026-09-11: 5:00 PM, 6:00 PM`; Sept 11 IS a Friday. Judge overreach despite [[audit-llm-slots-groundtruth-2026-08-18]] — likely trips on "you're booked / confirmation email" assumed-close (by design; booking runs post-call). Behavioral nit: agent auto-picked Sept 11 5pm from generic consent ("pencil you in" → "Yeah that's great") — user never chose the slot.
3. MEDIUM SCHEDULER_LAG — footprint of the 9/1 text-"FALSE" outbound crash ([[enabled-text-false-crash-2026-09-01]]): Tue tick missed. Chain: 8/30, 8/31, 9/2 09:39 (VM 2s) + 19:08 (live). No action.
4. MEDIUM STAFF_DEFLECTION — borderline FP: deflected a Junior *trial-class* question genuinely absent from KB, then booked the tour itself. Actionable: add Junior trial-class info to KB.
5. LOW name echo — REAL: Burlington-Inbound `call_d9658c0fa599949f7c30bea234a` said "Daniel" 4× (complaint call, Jacqueline Brian, child felt isolated; ClickUp task verified created). "Your kiddo" rule (2026-04-21) needs reinforcement on Burlington inbound.

**Test-dial filter SHIPPED 9/3** (audit.py Step 2c, backup `backups/audit.py.bak-20260903-testfilter`): loads `test_number` per centre from the persistent `greeting-centre-lookup` n8n bridge webhook (same one greeting-sync polls; 9 unique numbers, Scott's cell shared by 7 centres + regression-test fixture → E2E canary dials filtered too); drops calls whose to_number matches, reports "Test-number dials filtered: N" + per-centre breakdown, fail-open (bridge down → audit everything, status says so). DRY_RUN verified: 32 raw → 18 Cekura + 2 test dials → 12 real, issues 5→2 (kept name-echo LOW; dropped all 4 Barrhaven test-call issues). Dry run also surfaced pre-existing **HIGH BOOKING_FUMBLE CNKB-EG, REPEAT ×8 since 5/4** (`call_19ae2e1…`, agent hands enrollment to staff without offering tour) — systemic, untriaged.

**How to apply:** Remaining audit-tuning candidates: (a) suppress VM-misdetection when call >3min ends in booking; (b) judge prompt: outbound "you're booked" is by-design assumed-close. OPEN: Scott/Maurice cancel the fake Sept 11 booking (I cannot touch centre calendars); EG BOOKING_FUMBLE ×8 triage; check whether rorolaalaa@gmail.com got a real confirmation email.
