---
name: CNKB Prompt Rev 2026-05-09 — Fast-Track + Silence-Resume + EG-Inbound No-Pause
description: Three surgical patches shipped 2026-05-09 — outbound: stop re-pitching after parent asks to book + re-ask pending question after silence-recovery; inbound: wait for weekday/weekend reply before fetching slots
type: project
originSessionId: 2c97f9cb-4cdb-4e97-bcba-8723ce37c09d
---
# CNKB Prompt Rev 2026-05-09 — Fast-Track + Silence-Resume

Two related "context-collapse" bugs surfaced from one live call (call_5499f166200778f0a537716c8e0). Patched same day in two surgical revs.

## Rev 1 — Fast-Track no-pitch-after-buy

**Why:** Scott said "Can you book me into a tour, please?" and the St. Catharines agent collected age + name (correctly fast-tracking on those) BUT then dropped back into Stage 3 and asked the gaming/Minecraft question + delivered the value-prop pitch + re-invited him to a tour he had already asked for. Classic "kept selling after the buy."

**How to apply:** When future "agent re-pitches after booking intent" complaints arrive, this rev is the latest fix. If issue recurs, the fix wasn't enough — escalate to a stronger Stage-3 gate.

## Two surgical edits applied

### Edit 1 — Stage 2 routing line
**OLD:**
```
- **If they request a specific tour time:** immediately go to Fast-Track Booking
```
**NEW:**
```
- **If they ask to book a tour OR request a specific tour time** (e.g., "can you book me in", "schedule me", "I want a tour"): immediately go to Fast-Track Booking. Do NOT continue Stage 2 or 3.
```

### Edit 2 — Fast-Track Booking section (new paragraph between Triggers and When triggered)
```
**Once triggered, you are committed.** Do NOT ask the Minecraft/Roblox question, do NOT pitch what kids build, do NOT re-invite the parent to a tour. They already asked. Collect age → name (optional) → weekday-vs-weekend preference → offer 3 SLOTS → confirm. Nothing else.
```

## Pushed to 7 active outbound LLMs (2026-05-09 17:29 UTC)

| Centre | LLM ID | Status |
|---|---|---|
| EG (master) | llm_44111168b1a2a469f50891b26e34 | ✅ verified |
| Pickering | llm_9b4bcc9bd77a2bd3c3c04ed579b1 | ✅ verified |
| Riverside | llm_512d93c0c71e0ef00e318b3e9fc0 | ✅ verified |
| Burlington | llm_35ce5dd8697541ec0e97f0dcfde0 | ✅ verified |
| Leaside | llm_4cfa990bea7bfcbf67060e8c8f72 | ✅ verified |
| Sudbury | llm_247d6d98f7073c6d31d54f26f53d | ✅ verified |
| St. Catharines | llm_5b4dbab1bf6dcc5007c61c2726ff | ✅ verified |

Each prompt grew by exactly +388 chars. Patch script: `/root/cnkb-fasttrack-patch.ts` (idempotent — safe to re-run).

## Rev 2 — Silence-Recovery Resume

**Why:** Same call, end of conversation. After confirming the booking, agent asked "Is there anything else you'd like to know before we hang up?" Scott was processing → silence → agent fired silence-recovery interjection "Hmm, I'm having trouble hearing you. Are you still there?" Scott said "Yep" (meaning *I'm here*). Agent treated "Yep" as the answer to the *original* pre-silence question ("anything else?") → jumped to Stage 6 close + hung up. Felt abrupt to Scott.

### Edit — Handling Silence/Technical Issues
Inserted between the trigger line and the no-response fallback:
```
- **After they confirm they're still there** (e.g., "yep", "yes", "I'm here", "uh-huh"): briefly acknowledge ("Oh great!"), then RE-ASK your prior pending question verbatim. Do NOT treat their confirmation as the answer to that prior question, and do NOT skip ahead to the next stage.
```

Each prompt grew by +285 chars. Patch script: `/root/cnkb-silence-resume-patch.ts` (idempotent). Pushed 2026-05-09 17:47 UTC, all 7 verified live.

## Common pattern (both revs)
Both bugs were "context-collapse" — the LLM's working memory of the *current* pending question got overwritten by an intervening exchange (Stage 3 follow-ups in Rev 1, silence-recovery interjection in Rev 2), and the parent's reply got applied to the wrong anchor. Fix pattern: explicit, top-level rule that names the trap and tells the agent which question to RE-ASK.

## Rev 3 — EG-Inbound No-Pause (Stage 2D fix)

**Why:** Real EG inbound call later same day (call_37019267bbe033ee4f89ab771d5). Agent asked "weekday or weekend?" but did NOT pause for the caller's reply — immediately fired the `get_tour_slots` function and dumped slots from BOTH day types, defeating the point of asking the preference. Same family bug: contradictory `BEFORE SPEAKING, call the function` directive at top of Stage 2D conflicted with step 1 (the question), and the wait between question + function call was implicit, not explicit.

### Edit — Stage 2D: Schedule the Tour
Removed the `BEFORE SPEAKING, call the get_tour_slots function...` opener. Added explicit step 2 "WAIT for the caller's reply" with the *why* embedded so the LLM doesn't optimize around it. Renumbered downstream steps.

Pushed only to EG-Inbound LLM `llm_6d77f36696f6fbfad97d03fa5ef8` (other inbound clones don't have a `get_tour_slots` function configured the same way). +202 chars. Patch tool: `/tmp/eg-inbound-patch.ts` (one-shot — script doesn't need to persist since the patch is idempotent and applied).

## Inbound clones NOT patched (Rev 1 + 2)
Leaside-Inbound, StCatharines-Inbound, CNKB-StCatharines-Inbound have different prompt structure (begin_message starts with "Hi, thanks for calling..."). The Fast-Track Booking section may or may not exist there. Re-evaluate if a similar issue surfaces on inbound.

## Cekura regression suite
The 7-scenario suite on agent 13260 (per memory cekura-regression-inventory.md) does NOT specifically cover the "user asks to book a tour, agent stops pitching" path. Add a regression scenario for this before the next prompt rev.
