# CNKB — Learnings

Running log of findings from transcript analysis and prompt updates. Newest first.

---

## Known Patterns

Issues that have been observed and should be checked on every analysis run.

| Pattern | First Seen | Status | Fix Applied |
|---------|-----------|--------|-------------|
| Day-of-week missing from slot offers | 2026-02-08 | Fixed — monitoring | R1: Added day-of-week to slot presentation |
| Teaser line causes pricing confusion | 2026-02-08 | Fixed — monitoring | R3: Removed "There's a lot more to it" |
| No repeat-caller frustration handling | 2026-02-08 | Fixed — monitoring | R4: Added frustrated repeat caller section |
| Junior program not in KB | 2026-02-08 | Open — needs KB update | N/A — KB content gap, not prompt issue |
| Sibling discount not in KB | 2026-02-08 | Open — needs KB update | N/A — KB content gap, not prompt issue |

---

## Analysis Log

### 2026-02-08 — First Analysis Run
- **Calls analyzed:** 10 (2026-02-07 to 2026-02-08)
- **Findings:** 4 critical, 3 warnings, 3 info
- **Critical issues:** Missing day-of-week in slot offers, Junior program not in KB, Sibling discount not in KB, Repeat-caller frustration unhandled
- **Warnings:** Pricing repeated unnecessarily due to teaser line, Possible location-specific pricing mismatch (Pickering $267 vs Canton $289)
- **Fixes applied:** 4 prompt changes pushed (day-of-week, graceful re-ask, teaser removal, repeat-caller handling)
- **Booking rate:** 0/10 — no tours booked despite 2 successful conversations
- **Key insight:** The biggest conversion blockers are KB content gaps (junior program, sibling discounts) and day-of-week friction — parents can't book what they can't mentally schedule.

---

## Verification Queue

Fixes awaiting confirmation from future transcript analysis.

| Fix | Applied | Calls Needed | Status |
|-----|---------|-------------|--------|
| R1: Day-of-week in slot offers | 2026-02-08 | 3+ connected calls | PENDING |
| R2: Graceful re-ask handling | 2026-02-08 | 2+ calls with pricing questions | PENDING |
| R3: Teaser line removal | 2026-02-08 | 2+ calls with pricing questions | PENDING |
| R4: Repeat-caller handling | 2026-02-08 | 1+ frustrated caller | PENDING |
