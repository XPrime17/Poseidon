---
name: Cekura CNKB regression inventory
description: Inventory of the 7 regression scenarios on Cekura agent 13260 (EG outbound) that guard the 2026-04-20/21 prompt rev. Includes scenario IDs, tags, what each tests, and the validated baseline results.
type: reference
originSessionId: fb1283ef-1d84-48b4-865b-263821fdbd91
---
# Cekura CNKB regression inventory

**Cekura agent:** `13260` (`CNKB - Cimo` = EG outbound, retell_agent_id `agent_0c6c32b61cb506fefb6ac247f4`)
**Project:** `3782`
**Test profile:** `8397` (Tier1 - Happy Path - Patricia Williams) — provides PHONE, SLOTS, LOCATION_NAME=East Gwillimbury, FIRST_NAME=CEKURA_TEST
**Tag to fire whole suite:** `tier1,regression` OR `fix-2026-04-20,fix-2026-04-21`

## The 7 scenarios

| ID | Name | Tags | Tests |
|---|---|---|---|
| **248224** | Age Gate - Under Range (4yo) | `age-gate`, `fix-2026-04-20` | 4yo child → agent closes politely, no Create tour, no Junior pivot |
| **248225** | Age Gate - Junior Pivot (5yo) | `age-gate`, `fix-2026-04-20` | 5yo → agent pivots to Junior, offers staff follow-up, no Create tour |
| **248226** | Relative Date + Name Optional Booking | `date-handling`, `name-optional`, `fix-2026-04-20` | "next Tuesday" → agent defers to SLOTS (no date guess); name withheld → books with "the guest" |
| **248701** | Booking Autonomy - No Staff Deflection | `booking-autonomy`, `fix-2026-04-21` | Clean booking → agent confirms directly, no "team will confirm" |
| **248702** | Stage 6 Soft-Hold on Check Calendar | `soft-hold`, `fix-2026-04-21` | "let me check calendar" → agent pencils in a slot, not staff callback |
| **248703** | Age 7 Boundary - Create Path | `age-gate`, `fix-2026-04-21` | ⚠️ STALE — expects 7yo→Create, but per the 2026-05-23 age correction ([[create-age-range]]) all 7yos now route to Junior. This scenario scores EO=0 on BOTH the current live prompt and any trim (confirmed 2026-06-01, run 594624). Update its expected_outcome_prompt to expect Junior before trusting it as a guard. |
| **248704** | Name Placeholder Wording - "the guest" | `name-optional`, `fix-2026-04-21` | Name withheld → exact "lock you in under 'the guest'" language + booking completes |

## Baseline (all passed on prompt v-Apr21)
- Run 466896: scenarios 248224-6 — all Expected Outcome 5/5
- Run 470328: scenarios 248701-4 — all Expected Outcome 5/5, Tour Booking Success 5/5, Natural Flow 5/5

## Interpreting pass/fail
**IMPORTANT:** Scenarios 248224 (4yo) and 248225 (5yo) show `success: False` overall because Cekura's composite score includes `Tour Booking Success: 0` — but that is the DESIRED outcome for those scenarios (we don't want to book a Create tour for a 4 or 5 year old). **Always read Expected Outcome as the authoritative gauge, NOT overall success.**

For the other 5 scenarios, `success: True` AND `Tour Booking Success: 5` is the correct result.

## How to run the whole suite
```
mcp__cekura__scenarios_run_scenarios_create({
  agent_id: 13260,
  scenarios: [248224, 248225, 248226, 248701, 248702, 248703, 248704],
  name: "Regression - fix-2026-04-2X",
  frequency: 1,
  mode: "same_number"
})
```
Wall-clock ~5-8 min depending on Cekura parallelism. Cost ~$2-4 in voice/TTS.

## When to re-run
- Before and after ANY prompt change to the 11 CNKB LLMs
- Before and after changes to the EG outbound agent's `post_call_analysis_data`
- After any significant change to Retell-side defaults (voicemail, voice engine, model)

## Adding new regression coverage
When shipping new prompt rules that forbid or require specific agent behaviour, add a scenario here with:
- A role description that drives the agent toward the edge case
- An `expected_outcome_prompt` that NAMES the banned or required phrases so the judge has something to grip
- Tag with `tier1`, `regression`, and `fix-YYYY-MM-DD` for the prompt rev
- Attach `test_profile: 8397` (unless the test needs a different SLOTS set)
- Add to this inventory
