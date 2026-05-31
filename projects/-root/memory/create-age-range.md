---
name: Create program age range is 8-14 (global)
description: Code Ninjas Create program serves ages 8-14 across all centres. Junior covers 5-7. Prompts must reflect this globally — no centre-specific overrides.
type: project
originSessionId: dfcce36f-cdf2-4142-82a5-a8d73d8d6185
---
Create = 8-14, Junior = 5-7. Global, not centre-specific.

**Why:** Scott confirmed on 2026-05-23 during outbound scope-increase review. Prior prompt rev (2026-04-21) had Create=7-14, Junior=5-6 — that was wrong. EG's crawled KB already says CREATE (ages 8-14), JR (ages 5-7), so the source of truth (services.codeninjas.com) and the prompt were already inconsistent. 7-year-olds were being routed to Create tours that the centres won't actually accept.

**How to apply:**
- Any prompt rev touching age gates must use 8-14 for Create and 5-7 for Junior.
- Out-of-range (under 5, over 14) message unchanged.
- 7-year-olds → Junior path (NOT Create), which means scope of Junior handling matters more now than before — every 7-yo lead now flows through it.
- When updating the outbound prompt on llm_44111168b1a2a469f50891b26e34 (and the 9 cloned LLMs), search for `7`, `seven`, `5-6`, `5–6`, `five to six`, `5-7`, `5–7` and any "fourteen" boundary references — replace consistently.
- Also check inbound LLMs (EG: llm_6d77f36696f6fbfad97d03fa5ef8, Leaside: llm_cfedf58fd1274e15835042d8b6c8) — they may have their own age gates.
- Cekura: existing 7 regression scenarios on agent 13260 may have age-specific assertions that break (a "7-year-old wants Create" scenario would have been GREEN before, RED after). Re-baseline.
