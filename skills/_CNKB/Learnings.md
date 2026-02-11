# CNKB — Learnings

Running log of findings from transcript analysis and prompt updates. Newest first.

---

## Known Patterns

Issues that have been observed and should be checked on every analysis run.

| Pattern | First Seen | Status | Fix Applied |
|---------|-----------|--------|-------------|
| Day-of-week missing from slot offers | 2026-02-08 | Partially fixed — inconsistent. Strengthened 2026-02-11 | R1 (Feb 8) + R3 (Feb 11): Added instruction + "you ALWAYS know the day" anti-hallucination rule |
| Teaser line causes pricing confusion | 2026-02-08 | Recurred — LLM generates it without prompt text. Re-fixed 2026-02-11 | R3 (Feb 8) removed text + R1 (Feb 11): Added explicit anti-teaser instruction |
| No repeat-caller frustration handling | 2026-02-08 | VERIFIED 2026-02-11 | R4: Added frustrated repeat caller section |
| Junior program not in KB | 2026-02-08 | Open — needs KB update | N/A — KB content gap, not prompt issue |
| Sibling discount not in KB | 2026-02-08 | Open — needs KB update | N/A — KB content gap, not prompt issue |
| Em dashes in prompt examples contradict "never use em dash" rule | 2026-02-11 | Fixed 2026-02-11 | R2 (Feb 11): Replaced all em dashes with hyphens in prompt |
| LLM improvises phrases not in prompt (anti-patterns) | 2026-02-11 | Monitoring | R1 (Feb 11): Added anti-teaser. May need broader anti-improvisation rule if pattern continues. |
| Info overload — bundling pricing + times + name request in one turn | 2026-02-11 | Open — monitoring | Existing "ask ONE question at a time" instruction not strong enough for complex multi-part questions |

---

## Analysis Log

### 2026-02-11 — Second Analysis Run
- **Calls analyzed:** 15 (2026-02-07 to 2026-02-11), 7 with transcripts
- **Findings:** 4 critical, 3 warnings, 2 info
- **Critical issues:** Teaser line recurred (LLM improvised it), day-of-week failed on Pickering call, Junior program still not in KB, sibling discount still not in KB
- **Warnings:** Em dashes in prompt examples, info overload on multi-part questions, 2 frustrated repeat callers on same day
- **Fixes applied:** 3 prompt changes pushed (R1: anti-teaser, R2: em dash cleanup, R3: day-of-week strengthening)
- **Booking rate:** 2/7 connected = 29% (up from 0% on Feb 8) — Anu (Feb 12 tour) + Roger (Feb 7 tour)
- **Key insight:** Previous fixes are working (repeat-caller handling verified, re-ask handling verified) but LLM improvisation is a new threat vector — the model generates problematic phrases not in the prompt. Need explicit anti-pattern instructions, not just removal of bad text.

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
| R1: Day-of-week in slot offers | 2026-02-08 | 3+ connected calls | PARTIALLY VERIFIED — works on Canton (Anu call), failed on Pickering (Shabber call). Strengthened 2026-02-11. |
| R2: Graceful re-ask handling | 2026-02-08 | 2+ calls with pricing questions | VERIFIED 2026-02-11 — Shabber call handled re-ask cleanly |
| R3: Teaser line removal | 2026-02-08 | 2+ calls with pricing questions | RECURRED 2026-02-11 — LLM generated "There's a lot more to it" without prompt text. Added explicit anti-teaser instruction. |
| R4: Repeat-caller handling | 2026-02-08 | 1+ frustrated caller | VERIFIED 2026-02-11 — Adam call handled gracefully, no salvage attempt |
| R5 (Feb 11): Anti-teaser instruction | 2026-02-11 | 2+ calls with pricing questions | PENDING |
| R6 (Feb 11): Em dash cleanup | 2026-02-11 | 3+ calls | PENDING |
| R7 (Feb 11): Day-of-week strengthening | 2026-02-11 | 2+ calls with date offers | PENDING |
