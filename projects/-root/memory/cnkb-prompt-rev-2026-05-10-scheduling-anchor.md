---
name: CNKB Scheduling-Anchor Prompt Rev 2026-05-10
description: Stage 4 / 2D scheduling-preference question rephrased on all 10 CNKB clones to add explicit "For timing" anchor. Prevents location-vs-timing answer ambiguity.
type: project
originSessionId: 71bb173f-0fcb-4956-b043-2f998dcc182d
---
# CNKB Scheduling-Anchor Prompt Rev — 2026-05-10

Rephrased the scheduling-preference question across all 10 active CNKB clones (7 outbound + 3 inbound). The old phrasing "What usually works better for you guys — after school during the week, or more weekend time?" lacked an explicit timing anchor, so parents could (and did) interpret it as a location/format question and answer with location words (e.g., "at the store").

**Why:** Surfaced 2026-05-10 during St. Catharines end-to-end test (call `call_facd0b7e77dfe1815943ee4bfd6`). Scott answered the timing question with "at the store" — a rational response to an ambiguous question, NOT a misheard confirmation. The agent recovered correctly (re-asked using a clearer "For timing..." anchor), but the redundancy felt awkward from the parent's POV. Root fix is upstream phrasing, not more silence-recovery patches.

**How to apply:**
- When designing voice-agent scheduling questions, lead with an explicit semantic anchor ("For timing,..." / "For scheduling,...") BEFORE the option list. Don't rely on the option words alone to convey what the question is about.
- Parallel structure helps: "weekday after-school" vs "weekend mornings" both contain timing keywords, so even a half-heard answer is more likely to land in the right bucket.
- Before piling on silence/recovery patches, check if the FIRST-ask phrasing is the actual root cause.

## New phrasing

**Outbound (7 agents):** `"Awesome! For timing, what works better for you guys - weekday after-school, or weekend mornings?"`

**Inbound (3 agents, comma variant):** `"Awesome! For timing, what works better for you guys, weekday after-school, or weekend mornings?"`

(Hyphen on outbound, comma on inbound — preserves existing punctuation conventions per the EM DASH BAN rule.)

## LLMs patched

| Agent | LLM ID |
|---|---|
| CNKB-St. Catharines | `llm_5b4dbab1bf6dcc5007c61c2726ff` |
| CN /w KB (EG outbound) | `llm_44111168b1a2a469f50891b26e34` |
| CNKB-Pickering | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` |
| CNKB-Riverside | `llm_512d93c0c71e0ef00e318b3e9fc0` |
| CNKB-Burlington | `llm_35ce5dd8697541ec0e97f0dcfde0` |
| CNKB-Leaside | `llm_4cfa990bea7bfcbf67060e8c8f72` |
| CNKB-Sudbury | `llm_247d6d98f7073c6d31d54f26f53d` |
| CNKB-EG-Inbound | `llm_6d77f36696f6fbfad97d03fa5ef8` |
| CNKB-StCatharines-Inbound | `llm_769e0ba68dc37cea573904c474fe` |
| CNKB-Leaside-Inbound | `llm_cfedf58fd1274e15835042d8b6c8` |

All 10 patches verified post-PATCH (old string absent, new string present, exactly 1 replacement per LLM). Emma (lead reactivation) and 4 offboarded agents (Round Rock, Stone Oak, Rayford, Canton) were intentionally skipped.

## Regression net

Cekura regression scenarios on agent 13260 (St. Catharines) — 7 scenarios at 248224-6 + 248701-4 per `cekura-regression-inventory.md`. Worth a baseline run to confirm the new phrasing doesn't break any scheduling-stage tests.
