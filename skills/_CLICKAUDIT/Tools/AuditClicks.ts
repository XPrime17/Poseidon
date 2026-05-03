#!/usr/bin/env bun
/**
 * _CLICKAUDIT — click-through verification runner.
 *
 * Loads a manifest of {navigate, extractClaim, click, extractActual, tolerance}
 * entries, drives a Playwright Chromium instance through each, and reports
 * claim-vs-actual mismatches.
 *
 * Usage:
 *   bun run AuditClicks.ts --manifest tourforce --url http://localhost:4000 [--auth dev-bypass] [--headed]
 */

import { chromium, type Page, type Browser } from 'playwright';
import { parseArgs } from 'util';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export type Tolerance =
  | { kind: 'exact' }
  | { kind: 'percent'; max: number }       // 0.10 = ±10%
  | { kind: 'atMost' }
  | { kind: 'atLeast' }
  | { kind: 'idMatch' };                   // actual contains claim substring

export interface Audit {
  name: string;
  navigate: string;                         // hash or path appended to base url
  extractClaim: (page: Page) => Promise<number | string>;
  click: string | ((page: Page) => Promise<void>);
  extractActual: (page: Page) => Promise<number | string>;
  tolerance: Tolerance;
  diagnose?: (claim: any, actual: any) => string;  // optional root-cause hint
  /** Skip this audit if claim is 0 or empty (avoid divide-by-zero). */
  skipIfClaimEmpty?: boolean;
}

interface Result {
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR' | 'SKIP';
  claim?: number | string;
  actual?: number | string;
  drift?: string;
  msg?: string;
  screenshot?: string;
}

function compare(claim: number | string, actual: number | string, tol: Tolerance): { pass: boolean; drift: string } {
  if (tol.kind === 'exact') {
    return { pass: claim === actual, drift: claim === actual ? '0' : `${claim} ≠ ${actual}` };
  }
  if (tol.kind === 'idMatch') {
    // Normalize: strip non-alphanumeric to handle phone formatting (e.g., "(416) 669-7541" vs "+14166697541")
    const norm = (v: any) => String(v).toLowerCase().replace(/[^a-z0-9]/g, '');
    const c = norm(claim);
    const a = norm(actual);
    if (!c) return { pass: false, drift: 'empty claim' };
    const pass = a.includes(c) || c.includes(a);
    return { pass, drift: pass ? 'match' : `"${c.slice(0, 20)}" not in destination` };
  }
  const c = Number(claim);
  const a = Number(actual);
  if (Number.isNaN(c) || Number.isNaN(a)) {
    return { pass: false, drift: `non-numeric: ${claim} vs ${actual}` };
  }
  if (tol.kind === 'atMost') {
    return { pass: a <= c, drift: a <= c ? 'ok' : `actual ${a} > claim ${c}` };
  }
  if (tol.kind === 'atLeast') {
    return { pass: a >= c, drift: a >= c ? 'ok' : `actual ${a} < claim ${c}` };
  }
  // percent
  if (c === 0) return { pass: a === 0, drift: a === 0 ? '0%' : `${a} from claim 0` };
  const drift = (a - c) / c;
  const pct = (drift * 100).toFixed(1);
  return { pass: Math.abs(drift) <= tol.max, drift: `${drift >= 0 ? '+' : ''}${pct}%` };
}

async function runAudit(audit: Audit, page: Page, baseUrl: string, idx: number): Promise<Result> {
  try {
    const url = baseUrl + (audit.navigate.startsWith('#') ? '/dashboard' + audit.navigate : audit.navigate);
    await page.goto(url, { waitUntil: 'networkidle' });
    // brief settle for React hydration + chart render
    await page.waitForTimeout(2000);

    const claim = await audit.extractClaim(page);

    if (audit.skipIfClaimEmpty && (claim === 0 || claim === '' || claim == null)) {
      return { name: audit.name, status: 'SKIP', claim, msg: 'claim empty/zero' };
    }

    if (typeof audit.click === 'string') {
      await page.click(audit.click);
    } else {
      await audit.click(page);
    }
    // Wait for hash change or DOM update
    await page.waitForTimeout(1500);

    const actual = await audit.extractActual(page);
    const cmp = compare(claim, actual, audit.tolerance);

    const result: Result = {
      name: audit.name,
      status: cmp.pass ? 'PASS' : 'FAIL',
      claim,
      actual,
      drift: cmp.drift,
    };

    if (!cmp.pass) {
      const screenshot = `/tmp/clickaudit-fail-${idx}.png`;
      await page.screenshot({ path: screenshot, fullPage: true });
      result.screenshot = screenshot;
      if (audit.diagnose) result.msg = audit.diagnose(claim, actual);
    }
    return result;
  } catch (err: any) {
    const screenshot = `/tmp/clickaudit-error-${idx}.png`;
    try { await page.screenshot({ path: screenshot, fullPage: true }); } catch {}
    return { name: audit.name, status: 'ERROR', msg: err.message, screenshot };
  }
}

function fmtRow(r: Result): string {
  const tag =
    r.status === 'PASS' ? '\x1b[32m[PASS]\x1b[0m' :
    r.status === 'FAIL' ? '\x1b[31m[FAIL]\x1b[0m' :
    r.status === 'SKIP' ? '\x1b[33m[SKIP]\x1b[0m' :
                          '\x1b[35m[ERR ]\x1b[0m';
  let out = `${tag} ${r.name}`;
  if (r.claim !== undefined || r.actual !== undefined) {
    out += `\n       claim: ${r.claim}  actual: ${r.actual}  drift: ${r.drift}`;
  }
  if (r.msg) out += `\n       ${r.msg}`;
  if (r.screenshot) out += `\n       screenshot: ${r.screenshot}`;
  return out;
}

async function main() {
  const { values } = parseArgs({
    options: {
      manifest: { type: 'string' },
      url: { type: 'string', default: 'http://localhost:4000' },
      auth: { type: 'string' },
      headed: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  });

  if (values.help || !values.manifest) {
    console.log(`
_CLICKAUDIT — click-through verification

Usage:
  bun AuditClicks.ts --manifest <name> --url <baseUrl> [--auth <token>] [--headed]

Options:
  --manifest <name>   Manifest module under ./Manifests/<name>.ts
  --url <url>         Base URL of the app (default: http://localhost:4000)
  --auth <token>      Sets localStorage.tf_access_token before each audit
  --headed            Run browser in headed mode for debugging
`);
    process.exit(values.help ? 0 : 1);
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const manifestPath = resolve(__dirname, '..', 'Manifests', `${values.manifest}.ts`);
  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(2);
  }

  const mod = await import(manifestPath);
  const audits: Audit[] = mod[values.manifest!] || mod.default;
  if (!Array.isArray(audits) || audits.length === 0) {
    console.error(`Manifest ${values.manifest} exported no audits`);
    process.exit(2);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`CLICKAUDIT — ${values.manifest} manifest`);
  console.log(`URL: ${values.url}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser: Browser = await chromium.launch({ headless: !values.headed });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Seed auth token if provided
  if (values.auth) {
    await page.goto(values.url!);
    await page.evaluate((tok) => {
      localStorage.setItem('tf_access_token', tok);
      localStorage.setItem('tf_user', JSON.stringify({ id: 'dev', email: 'dev@local', role: 'admin', centre_id: 'dev' }));
    }, values.auth);
  }

  const results: Result[] = [];
  for (let i = 0; i < audits.length; i++) {
    const r = await runAudit(audits[i], page, values.url!, i);
    console.log(fmtRow(r));
    results.push(r);
  }

  await browser.close();

  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const err = results.filter((r) => r.status === 'ERROR').length;
  const skip = results.filter((r) => r.status === 'SKIP').length;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`${pass}/${results.length} passed  —  ${fail} FAIL, ${err} ERROR, ${skip} SKIP`);
  console.log('═══════════════════════════════════════════════════════════');

  process.exit(fail + err > 0 ? 1 : 0);
}

if (import.meta.main) main();
