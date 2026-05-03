---
name: _CLICKAUDIT
description: Click-through verification skill. Clicks every interactive surface in a web app, captures the CLAIM each surface makes (a number, label, ID), then asserts the destination upholds that claim within tolerance. Catches semantic drift bugs that vanilla smoke tests miss — like a "71 calls" hover that drills to 0 records, or a "110 bookings" badge backed by an empty table. USE WHEN audit clicks, verify drill-down, claim mismatch, click-through audit, dashboard sanity check, hover-vs-click drift, semantic verification.
---

# _CLICKAUDIT — Click-Through Verification

Vanilla smoke tests check that pages load and elements exist. They CANNOT catch this class of bug:

- Stat card says "Booking Rate 87%" → click → drill-down shows 0 rows
- Doughnut slice tooltip says "Answered: 71" → click → filtered list returns 75 (or 0)
- Trend point says "May 1: 12 calls" → click → date-filtered list shows 4

These are **semantic mismatches between aggregator and per-row layer**. They happen because two systems compute "answered" / "booked" / "completed" using different vocabularies (string `'true'` vs boolean `true`, duration heuristic vs categorical bucket, fetch window of 100 vs 500).

`_CLICKAUDIT` runs a **claim → click → verify** loop:

1. Navigate to a page
2. For each clickable surface, EXTRACT the claim it makes (DOM scrape: text, hover tooltip, count badge)
3. Click the surface
4. Wait for navigation/state change
5. EXTRACT the actual outcome (row count, header text, item ID)
6. Compare claim vs actual with tolerance
7. Report pass/fail/drift per claim

## Usage

```bash
bun run ~/.claude/skills/_CLICKAUDIT/Tools/AuditClicks.ts \
  --manifest tourforce \
  --url http://localhost:4000 \
  --auth dev-bypass
```

### Output

```
═══════════════════════════════════════════════════════════
CLICKAUDIT — tourforce manifest
═══════════════════════════════════════════════════════════

[PASS] Stat card "Total Calls"
       claim: 200  actual: 100  tolerance: rows≤claim  drift: ok (paginated)
[PASS] Stat card "Booking Rate" → Tours Booked
       claim: 110 (badge)  actual: 110 rows  drift: 0%
[FAIL] Doughnut "Answered" slice
       claim: 71 (tooltip)  actual: 0 rows  drift: -100%
       Likely cause: outcome vocabulary mismatch
       Screenshot: /tmp/clickaudit-fail-answered.png
[PASS] Doughnut "Booked" slice
       claim: 110 (legend)  actual: 110 rows  drift: 0%

10/11 checks passed — 1 FAIL, 0 ERROR
```

## Manifest Format

Each manifest is a TypeScript module exporting an array of `Audit` entries:

```ts
import type { Audit } from '../Tools/AuditClicks';

export const tourforce: Audit[] = [
  {
    name: 'Stat card "Booking Rate" → Tours Booked',
    navigate: '#/analytics',
    extractClaim: async (page) => {
      const cards = await page.$$('[role=button]');
      const txt = await cards[2].$eval('div:first-child', (el: any) => el.textContent);
      // Booking Rate × Total Calls = expected booked count; or use card label
      return parseInt(await page.evaluate(() => {
        // pull from /api/analytics/summary outcomes.booked
        return fetch('/api/analytics/summary?days=90', {
          headers: {Authorization: 'Bearer ' + localStorage.getItem('tf_access_token')}
        }).then(r => r.json()).then(d => d.outcomes.booked);
      }));
    },
    click: '[role=button]:nth-of-type(3)',
    extractActual: async (page) => {
      await page.waitForSelector('h2');
      const h2 = await page.$eval('h2', (el: any) => el.textContent);
      if (h2 !== 'Tours Booked') throw new Error(`Expected header "Tours Booked", got "${h2}"`);
      return await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    },
    tolerance: { kind: 'percent', max: 0.10 },  // ±10%
  },
  // ...
];
```

## Tolerances

- `{ kind: 'exact' }` — actual must equal claim
- `{ kind: 'percent', max: 0.10 }` — actual within ±10% of claim
- `{ kind: 'atMost' }` — actual ≤ claim (e.g., paginated views)
- `{ kind: 'atLeast' }` — actual ≥ claim
- `{ kind: 'idMatch' }` — actual must contain claim string (for IDs/phones)

## When to Use

- Before declaring a dashboard "verified" — run this in addition to smoke tests
- After ANY change to data-shape, outcome derivation, or filter logic
- After adding a new drill-down (extend the manifest first)
- During code review of analytics/reporting features
- As a CI gate for portal PRs

## When NOT to Use

- For pure visual checks (use a screenshot diff tool)
- For pages with no clickable claims (login forms, settings)
- For non-deterministic destinations (search results that change moment to moment)

## Architecture Notes

- Reuses Playwright via the same Browser-skill infrastructure
- One Chromium instance, sequential audit execution (avoids race conditions on hash routing)
- Headless by default; `--headed` flag for debugging
- Auth: pass `--auth dev-bypass` or `--auth-token <jwt>`
- Saves screenshots of every failure to `/tmp/clickaudit-*`
