---
name: date-fabrication-guard-2026-09-02
description: Fleet-wide inbound prompt guard — dates/camp weeks/schedule facts are KB-only; fixes Pickering camp-dates hallucination (Madhu 8/31); all 7 inbound LLMs incl. EG golden source
metadata: 
  node_type: memory
  type: project
  originSessionId: 53d20541-52e0-4410-8e94-d20438423e43
---

**Shipped 2026-09-02 (Scott: "fix the hallucination... Retell prompt strengthening"):** the Pickering camp-dates fabrication ([[pickering-inbound-provisioned-2026-08-22]], call_576891277ca…, agent invented "Aug 31–Sep 4" camp week + LEGO Robotics themes with zero camp content in KB) is the *date-confabulation* class: the camps rule covered "what camps exist" but nothing forbade inventing WHEN. Same failure shape as [[slot-weekday-hallucination-fix-2026-06-30]], one layer up.

**Fix:** hard-rule bullet "**Dates, Times & Schedule Facts — HARD RULE**" inserted directly after the shared KB-only bullet (`- **ONLY provide information that exists in {{knowledge_base}} - never improvise…**`) in ALL 7 inbound LLMs: EG (`llm_6d77f366…`, GOLDEN SOURCE — clones inherit), StCath (`llm_769e0ba6…`), Burlington (`llm_fd20e83f…`), Kanata (`llm_7cd3dd91…`), Leaside (`llm_cfedf58f…`), Pickering (`llm_744a8d1c…`), Barrhaven (`llm_22ca8d05…`, pre-live so it launches guarded). Each verified post-write (guard ×1, exact length delta). Backups: `/root/cnkb-camp-dates-guard-2026-09-02/<name>.<llm_id>.txt`.

**Why (rule text):** dates/date-ranges/session weeks/start dates/schedule times = KB-only; never compute/infer/"recall"; clarify the question freely but deflect the answer ("Our team has the exact dates — I'll have someone reach out"). Audit's LLM HALLUCINATION HIGH remains the tripwire if it recurs.

**OPEN (updated 9/2 later same day):** (1) ~~outbound guard~~ SHIPPED — fanned to 9 outbound LLMs w/ {{SLOTS}} carve-out, see [[cekura-camp-date-regression-2026-09-02]]. (2) ~~live confirm~~ DONE on EG via Cekura scenario 335777 (run 839321 PASS — clean deflection under push); Pickering-specific test-dial optional. (3) Madhu still needs the staff correction call re the invented dates.
