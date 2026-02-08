# Emma — Learnings

Running log of findings from transcript analysis and prompt updates. Newest first.

---

## Known Patterns

Issues that have been observed and should be checked on every analysis run.

| Pattern | First Seen | Status | Fix Applied |
|---------|-----------|--------|-------------|
| GPT-4.1 generates em dashes despite prompt using hyphens | 2026-02-08 | Fixed — awaiting v19 calls | Added explicit em dash prohibition + restructured "check in" transition |
| Overeager AI disclosure on "why can't you call back?" | 2026-02-08 | Open — needs prompt fix | N/A — pending approval |
| No fast-track booking for eager parents | 2026-02-08 | Open — needs prompt fix | N/A — pending approval |
| Agent version mismatch (v16 vs v19) | 2026-02-08 | Open — operational | N/A — Retell config issue |

---

## Analysis Log

### 2026-02-08 — Second Analysis (Follow-up)
- **Calls analyzed:** 10 (2026-01-31 to 2026-02-07)
- **Findings:** 1 critical, 3 warnings, 3 info
- **Critical:** Overeager AI disclosure — agent revealed being AI when parent asked "why can't you call back?" (not an AI question)
- **Warnings:** No fast-track booking flow for eager parents; overlapping speech timing; agent version mismatch (all calls v16, LLM at v19)
- **Verification:** Em dash fix CANNOT be verified — no v19 calls exist yet. All 10 calls ran pre-fix prompt.
- **Fixes applied:** None yet (pending approval for R1 fast-track + R2 AI disclosure fix)
- **Key insight:** The biggest blocker is the version mismatch — v19 fixes haven't been tested because the agent is still running v16 calls.

### 2026-02-08 — Initial Analysis

**Calls analyzed:** 10 fetched, 8 with transcripts
**Date range:** 2026-01-31 to 2026-02-07

**Findings:**
- Critical: 0
- Warnings: 6 (all em dash related)
- Info: 0

**Issue detail:**
- Em dashes appeared in 5/8 transcripts (62.5%)
- Primary hot spot: `"wanted to check in—umm"` transition (4 calls)
- Secondary: `"five pm—all times"` before timezone (1 call)
- Tertiary: `"James—life gets busy"` parenthetical (1 call)

**Root cause:** GPT-4.1 generates em dashes in output even when the prompt only uses regular hyphens. The model needs explicit negative instruction, not just positive examples.

**Fixes applied (both approved by Scott):**
1. Added to Communication Style section: `NEVER use em dashes (—) or en dashes (–). Always use a regular hyphen (-) or start a new sentence. TTS engines read em dashes as awkward pauses.`
2. Restructured Stage 2 "check in" transition with exact model text: `"I just wanted to check in. Is finding a coding program for your child still on your radar?"`

**Prompt change:** 13,127 → 13,317 chars (+190)

**Verification status:** PENDING — need 5+ new calls post-fix to confirm em dashes eliminated

---

## Verification Queue

Fixes awaiting confirmation from future transcript analysis.

| Fix | Applied | Calls Needed | Status |
|-----|---------|-------------|--------|
| Em dash prohibition rule | 2026-02-08 | 5+ new calls | PENDING |
| "Check in" transition rewrite | 2026-02-08 | 5+ new calls | PENDING |
