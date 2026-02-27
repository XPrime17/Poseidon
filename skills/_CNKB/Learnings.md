# CNKB — Learnings

Running log of findings from transcript analysis and prompt updates. Newest first.

---

## Known Patterns

Issues that have been observed and should be checked on every analysis run.

| Pattern | First Seen | Status | Fix Applied |
|---------|-----------|--------|-------------|
| Day-of-week missing from slot offers | 2026-02-08 | **VERIFIED 2026-02-27** — consistently includes day of week | R1 (Feb 8) + R3 (Feb 11): Added instruction + "you ALWAYS know the day" anti-hallucination rule |
| Teaser line causes pricing confusion | 2026-02-08 | **VERIFIED 2026-02-27** — no teaser phrases in 14 transcripts | R3 (Feb 8) removed text + R1 (Feb 11): Added explicit anti-teaser instruction |
| No repeat-caller frustration handling | 2026-02-08 | **VERIFIED 2026-02-11** — Mike call (Feb 23) also handled correctly | R4: Added frustrated repeat caller section |
| Junior program not in KB | 2026-02-08 | Open — needs KB update. Lisa call (Feb 23) handled via staff callback | N/A — KB content gap, not prompt issue |
| Sibling discount not in KB | 2026-02-08 | Open — needs KB update. Karen call (Feb 23) deferred to staff | N/A — KB content gap, not prompt issue |
| Em dashes in LLM output despite ban | 2026-02-11 | **PERSISTENT** — 32 occurrences in Feb 27 analysis. LLM generates as natural writing pattern. Cosmetic — no conversion impact. | R2 (Feb 11) + EM DASH BAN section in prompt. gpt-4.1 ignores instruction. |
| LLM improvises phrases not in prompt (anti-patterns) | 2026-02-11 | **RESOLVED** — anti-teaser fix worked. No new improvised phrases detected. | R1 (Feb 11): Added anti-teaser. |
| Info overload — bundling questions in one turn | 2026-02-11 | Still occurs — Maria call (Feb 23) bundled 2 questions. Isolated (1/14 calls). | Existing "ask ONE question at a time" instruction. May need per-stage reinforcement. |
| Repeated enthusiasm words | 2026-02-27 | New — "perfect"/"awesome"/"great" repeated 23 times across calls | Prompt says "Vary enthusiastic responses" but vocabulary is limited. Low impact. |

---

## Performance Trend

| Date | Calls Analyzed | Connected | Tours Booked | Booking Rate | Fixes Applied |
|------|---------------|-----------|-------------|-------------|---------------|
| 2026-02-08 | 10 | 10 | 0 | **0%** | 4 (day-of-week, re-ask, teaser, repeat-caller) |
| 2026-02-11 | 15 | 7 | 2 | **29%** | 3 (anti-teaser, em dash, day-of-week v2) |
| 2026-02-27 | 20 | 14 | 10 | **71%** | 0 (no changes — agent performing well) |

---

## Analysis Log

### 2026-02-27 — Third Analysis Run
- **Calls analyzed:** 20 (2026-02-22 to 2026-02-26), 14 connected, 14 with transcripts
- **Findings:** 3 critical (all 1 call), 70 warnings, 19 info
- **Critical issues:** Question bundling on Maria call only (2 questions in 1 turn). Isolated, not systemic.
- **Warnings:** Em dashes (32, persistent LLM behavior), repeated enthusiasm (23), timezone over-mention (14, likely analyzer false positive), long response (1)
- **Fixes applied:** None — agent booking at 71%, no changes justified
- **Booking rate:** 10/14 connected = 71% (massive improvement from 29% on Feb 11)
- **Notable calls:** Brian/Ryan handled AI/future-of-coding questions expertly. Karen/Alex+Bella handled sibling inquiry with staff deferral. Mike (frustrated repeat caller) handled gracefully per R4. Call screening loop detected and agent exited correctly.
- **Verification results:** R5 (anti-teaser) VERIFIED, R6 (em dash) RECURRED (cosmetic), R7 (day-of-week) VERIFIED
- **Key insight:** The agent has hit a strong performance plateau at 71% booking rate. Remaining issues are cosmetic (em dashes, word variety). The biggest remaining conversion gaps are NOT prompt issues — they're operational: (1) calls that go to voicemail, (2) wrong-location leads, (3) callers who are only interested in non-Create programs. Focus should shift from prompt tuning to lead quality and operational improvements.

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
| R5 (Feb 11): Anti-teaser instruction | 2026-02-11 | 2+ calls with pricing questions | **VERIFIED 2026-02-27** — 0 teaser phrases across 14 transcripts. Patricia, Tom, David calls all gave clean pricing. |
| R6 (Feb 11): Em dash cleanup | 2026-02-11 | 3+ calls | **RECURRED 2026-02-27** — 32 em dash instances across 16 calls. gpt-4.1 generates em dashes as natural pattern regardless of instruction. Cosmetic only — no conversion impact. Accepted as LLM limitation. |
| R7 (Feb 11): Day-of-week strengthening | 2026-02-11 | 2+ calls with date offers | **VERIFIED 2026-02-27** — Maria, Karen, Lisa calls all include day-of-week with slot offers. Consistent across all booking calls. |
