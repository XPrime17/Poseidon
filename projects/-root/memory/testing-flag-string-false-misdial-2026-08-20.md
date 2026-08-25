---
name: testing-flag-string-false-misdial-2026-08-20
description: "Text \"FALSE\" in Centre Lookup Testing cells is truthy in JS — Burlington's first real HubSpot lead dialed Scott's test number; cells fixed to booleans + Phone Override hardened"
metadata: 
  node_type: memory
  type: project
  originSessionId: 07c2f2da-2c13-43ca-8da2-a72b86302836
---

2026-08-20: Burlington + Kanata `Testing` cells in Centre Lookup (H11/H13) held the **text string "FALSE"** (typed during the HubSpot go-live flip) while all other centres had real booleans. Outbound Phone Override was `Testing ? test_number : real` — a non-empty string is truthy — so Burlington's first real HubSpot lead (Amanda Kendall, 905-464-2701) dialed Scott's test number 905-967-2357 at 11:24 ET (`voicemail_hangup`, exec 28372; call_effc8b8644cc… = 5s, Retell detected voicemail mid-greeting and hung up — NO message actually landed on Scott's VM, just a missed call). The wrong number was also baked into her MasterSheet row (`Phone` + `lead_id`), so retries would have kept hitting Scott.

Fixes (all live):
1. H11/H13 → real booleans via `batchUpdate.repeatCell` `boolValue` (plain `values.update` writes were silently coerced back to text by the cell format — repeatCell is the reliable way).
2. Phone Override hardened: `String(Testing).toLowerCase() === 'true'` (only other `.Testing` ref is the benign append-audit column; scheduler has none).
3. Amanda's row 504 repaired: Phone/lead_id → 9054642701, attempts reset to 0, `next_call_after` = now → scheduler redial.

**Redial saga (8/20 evening):** scheduler ticks 28441 (6:30pm) + 28449 (7:06pm) picked Amanda up with the CORRECT number but the batch of 6 eligible leads stacked behind the calendar scraper's global lock → only ~1 lead dials per 90-min tick, rest requeue and burn `scrape_retries` toward the cap-5 `manual_review` dump. Mitigation: staggered the 5 stuck leads' `next_call_after` one-per-tick across 8/21 (Amanda 09:30, Jaclyn 11:00, Breanne 12:30, Shannon 14:00, aliyah 15:30 ET). **OPEN:** confirm all 5 dial on 8/21; SYSTEMIC: with HubSpot volume live, multi-lead ticks will recur — real fix = scheduler `Get Availability` should hit the fresh slots cache (10-min crawler, see /health) instead of live `/extract-calendar`, or serialize with waits. Needs Scott's sign-off.

**Why it matters:** HubSpot go-live evidence — all 3 of Shauna's centres ARE live (StCath: Jaclyn Blanchard + Brianna Prasad real leads 8/20; Burlington: Amanda Kendall 8/20; Kanata: Zap wiring proven with Scott's test deal 8/19, no organic lead yet). Shauna believed otherwise — corrected.

**OUTCOME 2026-08-23: Amanda BOOKED** — attempt 2 (19:07 ET) converted: tour Fri Aug 29 11:30 AM for Gabriel (12, Create), Skyvern completed + confirmation email sent. Misdial → repair → rescue → conversion, end to end.

Gotcha for future flips: when toggling `Testing`, verify the cell is a real boolean (read with `valueRenderOption=UNFORMATTED_VALUE`), not typed text. Related: [[testing-flag-outbound-only]], [[n8n-brace-escape-invalid-syntax-2026-08-20]], [[eoc-rownumber-refactor-shipped-2026-08-19]].
