---
name: testing-flag-outbound-only
description: "Centre Lookup `Testing` column is OUTBOUND-only (routes dials to test_number); has zero effect on inbound"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

The Centre Lookup **`Testing`** column (col G) is an **outbound safety switch only**. Verified by scanning all 23 active workflows 2026-07-24:

- **Only runtime consumer:** `Phone Override` node in `Outbound Call Flow - Multicentre` (`6sPwo7ngPyTWfmwM`): `phone_override = Testing ? test_number : customer_info[3]`. So `Testing=TRUE` → outbound dials the centre's **`test_number`** (e.g. 905-967-2357) instead of the real lead. Keeps a not-yet-live centre from calling real leads.
- Other matches were non-runtime: onboarding/E2E sheet-*writes* of the column (`ZyjnLwZ1CMOsqg2U`, `joLG6ji6JEMW6aaW`), a Retell credential label "Retell Testing", and doc text.
- **Inbound EOC (`3oV7SpPKWmr3xJlQ`) has ZERO refs to `Testing`.** Inbound test-detection is caller-based: `isTest = isNonCanadian || Cekura-persona-name`.

**Implication:** a centre with `Testing=TRUE` still runs inbound fully live (real ClickUp tasks to its own list + real emails to the director). Kanata & Burlington are `Testing=TRUE` only because their OUTBOUND isn't live yet; their inbound is production. Flipping `Testing→FALSE` when outbound goes live changes only the dial target. Related: [[single-number-model-fleetwide]], [[inbound-eoc-notification-gaps-2026-07-24]].
