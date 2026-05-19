---
name: _CLICKAUDIT skill
description: Click-through claim verification — catches semantic drift bugs (UI claims X, drill-down shows Y) that vanilla smoke tests miss. Built 2026-05-03 after the TourForce booked-detection bug.
type: reference
originSessionId: 0f387d2b-4917-47b1-b06a-169b9f1328cd
---
# _CLICKAUDIT — Click-Through Claim Verification

**Path:** `/root/.claude/skills/_CLICKAUDIT/`
**Created:** 2026-05-03 (after Tours-Booked-shows-0-when-110-exist bug)

## Purpose
Catches the bug class **"UI claim ≠ destination after click"** — e.g., doughnut hover says "71 calls", click drills to 0 records. Vanilla smoke tests can't see this; they only check page-loads-and-elements-exist.

## Architecture
- **Manifest** = TS array of `{navigate, extractClaim, click, extractActual, tolerance}` per audit
- **Runner** (`Tools/AuditClicks.ts`) drives Playwright, captures CLAIM before click, ACTUAL after, computes drift
- **Tolerances:** `exact | percent | atMost | atLeast | idMatch` (idMatch normalizes non-alphanumerics for phone/ID matching)
- **Failures** save full-page screenshots to `/tmp/clickaudit-fail-*.png`

## Usage
```bash
bun run ~/.claude/skills/_CLICKAUDIT/Tools/AuditClicks.ts \
  --manifest tourforce \
  --url http://localhost:4000 \
  --auth dev-bypass
```

## Manifests
- `Manifests/tourforce.ts` — 7 audits covering Analytics stat cards, doughnut slices, row→detail

## Known TourForce findings (2026-05-03)
First run found **3 real bugs in the time-period drill-downs**: Booking Rate / Total Calls / Doughnut Booked all ignore the analytics period selector. Click "Booking Rate" while viewing 30d → lands on Tours Booked showing all-time 110, not 30d's 25. **Open follow-up.**

## When to extend the manifest
- After adding any new clickable surface in the portal
- When adding a new analytics metric or drill-down
- For any dashboard where aggregate-vs-row consistency matters

## Why this exists
Pattern found: aggregator and per-row layer can compute the same metric different ways (boolean vs string truthy, duration heuristic vs categorical bucket, fetch window of 100 vs 500). Click-through audit is the only test that catches all three classes at once.
