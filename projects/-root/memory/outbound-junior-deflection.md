---
name: Outbound CNKB-EG Junior-program deflection bug
description: Outbound agent hands off Junior program inquiries to staff instead of booking a tour — regression from working April 6 behavior
type: project
originSessionId: d6b5ab44-7a3a-4f8f-9d31-dab3a6089bda
---
## Bug: outbound agent deflects Junior program inquiries

**Observed:** 2026-04-19 on call `call_706c54189d2998abc8150dffcaf` (Mike Henvey, outbound CNKB-EG agent `agent_0c6c32b61cb506fefb6ac247f4`).

Caller expressed interest in Junior program. Agent response (verbatim):
> *"Awesome, thanks for letting me know! For the full details on our Junior program, our team handles that directly — let me have one of our staff members reach out to you. Sound good?"*

No tour pitched. No tour booked. Lead lost. Auto-email triggered: "No Booking Requested" to `scott.james1717@gmail.com`.

## Regression — was working April 6

Cekura test call on 2026-04-06 (`call_fa92320f0700471cfac407ae002`, Lisa/Sophie age 5) asked about the Junior program. Agent on that call:
- Collected child age + name (Sophie, 5)
- Offered tour slots
- Booked Saturday March 7 at 10 AM
- `appointment_booked=true`, `tour_time=10 AM`, `tour_date=March 7`

So the same LLM was correctly booking Junior tours on April 6 and deflecting them on April 19. Something changed between those dates.

## Suspected causes (not yet confirmed)

1. **Prompt edit** — LLM `llm_44111168b1a2a469f50891b26e34` may have had a "Non-Create Program" instruction added that over-triggers. Check version history.
2. **KB content change** — Outbound uses dynamic KB injection from Google Doc. A recent Doc edit may have added text that reads like "Junior is handled by staff" to the model.
3. Unlikely: model drift (gpt-4.1 at temp 0 is deterministic).

## Not yet diagnosed

Task #28 in the current session is to pull the current LLM prompt and find the specific section causing the deflection. Not completed yet — queued but not executed.

## Related Cekura regression to add

Task #29: add a Cekura scenario against outbound CNKB-EG — "parent inquires about Junior program for 5-year-old, must book tour, not deflect." Run it whenever the prompt is changed. Not yet built.

## Why it matters for expansion

The outbound CNKB-EG LLM is the SOURCE prompt that gets cloned to each new centre's LLM (10 clones exist per MEMORY.md). If this bug lives in the source, every clone has it. Any centre receiving a Junior-program outbound call right now is likely deflecting and losing the lead — not just EG.

## Fix priority

High. Each deflected Junior call = a lost lead that already raised their hand via form. The fix is likely a prompt section edit, not infrastructure.
