---
name: retell-press-digit-rollout
description: "press_digit tool wired to 7 of 8 active outbound CNKB clones to bypass call-control / robocall-blocker gates ('press 9 to get through')."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4bb62092-eb24-47e7-8dc5-e4936c81436f
---

**Shipped 2026-05-13** — added Retell `press_digit` tool + prompt sub-section to 7 outbound CNKB LLMs. Bypasses carrier call-control screens (Nomorobo, Ooma, etc.) that require pressing a digit to connect.

**Tool config:**
```json
{
  "type": "press_digit",
  "name": "press_digit",
  "description": "Press a DTMF digit to bypass a call-control gate ...",
  "speak_after_execution": false
}
```
`speak_after_execution: false` is critical — we want silence after the press, waiting for the human.

**Prompt sub-section** (inserted in the `## Handling Call Screening Systems` section, just above `**LOOP DETECTION:**`):
- Detect "press X" / "press X to get through" / "call control" patterns
- Invoke `press_digit` immediately, do NOT say "Sure, I'll hold"
- Try once more if the prompt repeats, then fall back to LOOP DETECTION

**Coverage status:**
| LLM | Tool | Prompt |
|---|---|---|
| CNKB-EG | ✅ | ✅ |
| CNKB-Burlington | ✅ | ✅ |
| CNKB-Pickering | ✅ | ✅ |
| CNKB-Leaside | ✅ | ✅ |
| CNKB-Riverside | ✅ | ✅ |
| CNKB-Sudbury | ✅ | ✅ |
| CNKB-StCatharines | ✅ | ✅ |
| Emma (Lead Reactivation) | ✅ tool only | ❌ no matching anchor in prompt |

**Why Emma is partial:** Different prompt structure (older agent, no `Handling Call Screening Systems` section). Tool exists but LLM has no instructions to invoke it. Open question: does Emma even encounter call-control? Probably less common since its leads are warmer/older.

**Triggering case:** Pickering call `call_f2fbc5c0f72e0700c765fca555b` 2026-05-12 22:13 — agent hit "press 9" screen, said "Sure, I'll hold!", lost the lead.

**Audit follow-on (suggested, not shipped):** Add `CALL_CONTROL_NOT_BYPASSED` check to audit.py — outbound call ended with no conversation AND transcript contains "press [digit]" phrasing AND `press_digit` tool was NOT invoked. Catches future regressions in case prompt updates accidentally dilute the rule.

Related: [[outbound-junior-deflection]] (other CNKB outbound bug class), [[lead-reactivation]] (broader outbound architecture).
