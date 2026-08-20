---
name: testing-flag-string-false-misdial-2026-08-20
description: "Text \"FALSE\" in Centre Lookup Testing cells is truthy in JS — Burlington's first real HubSpot lead dialed Scott's test number; cells fixed to booleans + Phone Override hardened"
metadata: 
  node_type: memory
  type: project
  originSessionId: 07c2f2da-2c13-43ca-8da2-a72b86302836
---

2026-08-20: Burlington + Kanata `Testing` cells in Centre Lookup (H11/H13) held the **text string "FALSE"** (typed during the HubSpot go-live flip) while all other centres had real booleans. Outbound Phone Override was `Testing ? test_number : real` — a non-empty string is truthy — so Burlington's first real HubSpot lead (Amanda Kendall, 905-464-2701) dialed Scott's test number 905-967-2357 at 11:24 ET and left the AI intro on his voicemail (`voicemail_hangup`, exec 28372). The wrong number was also baked into her MasterSheet row (`Phone` + `lead_id`), so retries would have kept hitting Scott.

Fixes (all live):
1. H11/H13 → real booleans via `batchUpdate.repeatCell` `boolValue` (plain `values.update` writes were silently coerced back to text by the cell format — repeatCell is the reliable way).
2. Phone Override hardened: `String(Testing).toLowerCase() === 'true'` (only other `.Testing` ref is the benign append-audit column; scheduler has none).
3. Amanda's row 504 repaired: Phone/lead_id → 9054642701, attempts reset to 0, `next_call_after` = now → scheduler redial.

**Why it matters:** HubSpot go-live evidence — all 3 of Shauna's centres ARE live (StCath: Jaclyn Blanchard + Brianna Prasad real leads 8/20; Burlington: Amanda Kendall 8/20; Kanata: Zap wiring proven with Scott's test deal 8/19, no organic lead yet). Shauna believed otherwise — corrected.

Gotcha for future flips: when toggling `Testing`, verify the cell is a real boolean (read with `valueRenderOption=UNFORMATTED_VALUE`), not typed text. Related: [[testing-flag-outbound-only]], [[n8n-brace-escape-invalid-syntax-2026-08-20]], [[eoc-rownumber-refactor-shipped-2026-08-19]].
