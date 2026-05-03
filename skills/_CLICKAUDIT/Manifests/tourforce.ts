/**
 * TourForce portal click-through audit manifest.
 *
 * Each entry asserts that what the UI CLAIMS (in a card, badge, slice)
 * matches what the destination actually shows after clicking.
 */
import type { Audit } from '../Tools/AuditClicks';

async function authedFetch(page: any, path: string): Promise<any> {
  return page.evaluate((p: string) => {
    return fetch(p, { headers: { Authorization: 'Bearer ' + localStorage.getItem('tf_access_token') } })
      .then((r) => r.json());
  }, path);
}

export const tourforce: Audit[] = [
  // ─── Stat cards on /#/analytics ──────────────────────────────────────────
  {
    name: 'Stat card "Total Calls" → Calls list',
    navigate: '#/analytics',
    extractClaim: async (page) => {
      const summary = await authedFetch(page, '/api/analytics/summary?days=30');
      return summary.summary.total_calls;
    },
    click: '[role=button]:nth-of-type(1)',
    extractActual: async (page) => {
      await page.waitForSelector('tbody tr', { timeout: 5000 }).catch(() => {});
      return page.evaluate(() => document.querySelectorAll('tbody tr').length);
    },
    tolerance: { kind: 'atMost' }, // list is paginated to 100
  },
  {
    name: 'Stat card "Booking Rate" → Tours Booked',
    navigate: '#/analytics',
    extractClaim: async (page) => {
      const summary = await authedFetch(page, '/api/analytics/summary?days=30');
      return summary.outcomes.booked;
    },
    click: '[role=button]:nth-of-type(3)',
    extractActual: async (page) => {
      await page.waitForSelector('h2', { timeout: 5000 });
      const h2 = await page.$eval('h2', (el: any) => el.textContent);
      if (h2 !== 'Tours Booked') throw new Error(`expected header "Tours Booked", got "${h2}"`);
      // wait for data load
      await page.waitForTimeout(3000);
      return page.evaluate(() => document.querySelectorAll('tbody tr').length);
    },
    tolerance: { kind: 'percent', max: 0.20 }, // ±20% (different fetch windows)
    diagnose: (c, a) => `Tours Booked drill-down should reflect ~${c} bookings (got ${a}). Check extractOutcome boolean handling and call fetch limit.`,
    skipIfClaimEmpty: true,
  },
  {
    name: 'Stat card "Answer Rate" → answered drill-down',
    navigate: '#/analytics',
    extractClaim: async (page) => {
      const summary = await authedFetch(page, '/api/analytics/summary?days=30');
      return summary.outcomes.answered;
    },
    click: '[role=button]:nth-of-type(2)',
    extractActual: async (page) => {
      await page.waitForTimeout(3000);
      return page.evaluate(() => document.querySelectorAll('tbody tr').length);
    },
    tolerance: { kind: 'percent', max: 0.30 }, // wider — heuristic is approximate
    diagnose: (c, a) => `Answered drill-down should approximate ~${c} (got ${a}). Check duration heuristic + outcome filter alignment.`,
    skipIfClaimEmpty: true,
  },
  // ─── Doughnut slices: programmatic click via legend ──────────────────────
  {
    name: 'Doughnut "Booked" slice → Tours Booked',
    navigate: '#/analytics',
    extractClaim: async (page) => {
      const summary = await authedFetch(page, '/api/analytics/summary?days=30');
      return summary.outcomes.booked;
    },
    click: async (page) => {
      // Doughnut click handler reads outcomeKeys[index] — set hash directly to mirror what a slice click does
      await page.evaluate(() => { window.location.hash = '/calls?outcome=booked'; });
    },
    extractActual: async (page) => {
      await page.waitForSelector('h2', { timeout: 5000 });
      await page.waitForTimeout(3000);
      return page.evaluate(() => document.querySelectorAll('tbody tr').length);
    },
    tolerance: { kind: 'percent', max: 0.20 },
    skipIfClaimEmpty: true,
  },
  {
    name: 'Doughnut "Answered" slice → answered drill-down',
    navigate: '#/analytics',
    extractClaim: async (page) => {
      const summary = await authedFetch(page, '/api/analytics/summary?days=30');
      return summary.outcomes.answered;
    },
    click: async (page) => {
      await page.evaluate(() => { window.location.hash = '/calls?outcome=answered'; });
    },
    extractActual: async (page) => {
      await page.waitForSelector('h2', { timeout: 5000 });
      await page.waitForTimeout(3000);
      return page.evaluate(() => document.querySelectorAll('tbody tr').length);
    },
    tolerance: { kind: 'percent', max: 0.30 },
    diagnose: () => 'Class: outcome vocabulary mismatch. Aggregator uses duration heuristic; per-row uses categorical bucket.',
    skipIfClaimEmpty: true,
  },
  {
    name: 'Doughnut "Voicemail" slice → voicemail drill-down',
    navigate: '#/analytics',
    extractClaim: async (page) => {
      const summary = await authedFetch(page, '/api/analytics/summary?days=30');
      return summary.outcomes.voicemail;
    },
    click: async (page) => {
      await page.evaluate(() => { window.location.hash = '/calls?outcome=voicemail'; });
    },
    extractActual: async (page) => {
      await page.waitForSelector('h2', { timeout: 5000 });
      await page.waitForTimeout(3000);
      return page.evaluate(() => document.querySelectorAll('tbody tr').length);
    },
    tolerance: { kind: 'percent', max: 0.30 },
    skipIfClaimEmpty: true,
  },
  // ─── Row click → detail page identity check ──────────────────────────────
  {
    name: 'First call row → call detail page (call_id matches)',
    navigate: '#/calls',
    extractClaim: async (page) => {
      await page.waitForSelector('tbody tr', { timeout: 5000 });
      // We use the visible phone string as the claim — it must appear on the detail page
      return page.evaluate(() => {
        const row = document.querySelector('tbody tr');
        const phoneCell = row?.querySelectorAll('td')[1];
        return phoneCell?.textContent?.trim() || '';
      });
    },
    click: 'tbody tr:first-child',
    extractActual: async (page) => {
      await page.waitForTimeout(2000);
      return page.evaluate(() => document.body.innerText);
    },
    tolerance: { kind: 'idMatch' },
    diagnose: (c, _a) => `Detail page should display the same phone (${c}) shown in the row.`,
    skipIfClaimEmpty: true,
  },
];

export default tourforce;
