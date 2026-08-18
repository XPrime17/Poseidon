---
name: audit-llm-slots-groundtruth-2026-08-18
description: "Daily call audit's LLM pass flagged slot-reading as HALLUCINATION because llm_review never fed it the injected SLOTS dynamic var — fixed by adding SLOTS ground truth (and a stronger no-slots-injected rule) to the rubric."
metadata: 
  node_type: memory
  type: project
  originSessionId: fcecc671-83dd-4f43-ad7f-1ded4a659eba
---

# Daily-audit LLM false HALLUCINATION on slot offers — fixed (2026-08-18)

The 2026-08-17 daily audit's **both** findings were false positives from one StCath call (`call_b2a9b1c03b8c6aa051c8c5a2543`, lead Sharina +12899294769):

- **HIGH HALLUCINATION** — agent offered "Tuesday, August eighteenth 4:30/5:30/6:30 pm". The injected `retell_llm_dynamic_variables.SLOTS` literally began with `Tuesday 2026-08-18: 4:30 PM, 5:30 PM, 6:30 PM` and 2026-08-18 IS a Tuesday. Verbatim correct read.
- **MEDIUM STAFF_DEFLECTION** — "Give us a call back once you've checked your calendar" after the lead firmly deferred to September and said she'd book online herself. Not a staff handoff; with full context the LLM no longer flags it.

**Root cause:** `llm_review()` in `/root/daily-call-audit/audit.py` sent ONLY the transcript; the rubric said "flag a tour date/time not in the injected slots" but the injected slots were never in the prompt — guaranteed false HIGHs whenever an agent reads slots aloud (the HALLUCINATION→HIGH floor from [[slot-weekday-hallucination-fix-2026-06-30]] amplifies these).

**Fix (shipped 2026-08-18):** `llm_review` now includes a `slots_note` built from `c["_dynamic_vars"]["SLOTS"]` (already fetched for rule 5K): when present → "ground truth, offering these is CORRECT"; when absent → "NO slots injected — any offered slot IS fabricated" (strictly stronger detection). Verified by extracting the edited function and re-running on the real call: clean ×2 with slots; control with slots stripped still fires HIGH.

**Why:** LLM-judge rules that reference context ("not in the injected X") must actually receive X, or every correct behavior is indistinguishable from fabrication.
**How to apply:** when adding an audit rule that compares speech vs injected data (SLOTS, KB, phone numbers), plumb the injected data into the judge prompt and test both a true-positive control and a false-positive repro.
