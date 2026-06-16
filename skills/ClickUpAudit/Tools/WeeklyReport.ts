#!/usr/bin/env bun
/**
 * WeeklyReport.ts - Phase 4: the scheduled agent.
 *
 * Runs Overdue.ts + Closure.ts (in --json mode), composes an HTML summary,
 * emails it via the M365 Power Automate webhook, and writes the report to the
 * Poseidon reports server. Designed to be driven by cron on Poseidon.
 *
 * Usage:
 *   bun WeeklyReport.ts                     # dry run: build + print + write HTML, NO email
 *   bun WeeklyReport.ts --email             # also send the email
 *   bun WeeklyReport.ts --email --to a@b.c  # override recipient
 *   bun WeeklyReport.ts --closure-days 7    # closure lookback window (default 7)
 *   bun WeeklyReport.ts --html-out PATH     # where to write the HTML (default reports dir)
 *
 * Env: CLICKUP_PERSONAL_TOKEN, EMAIL_SEND_WEBHOOK_URL, EMAIL_WEBHOOK_API_KEY (from ~/.claude/.env)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

// ---- env ----
for (const p of [join(homedir(), ".claude", ".claude", ".env"), join(homedir(), ".claude", ".env"), join(process.cwd(), ".env")]) {
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf-8").split("\n")) {
      const t = line.trim();
      if (t && !t.startsWith("#") && t.includes("=")) {
        const i = t.indexOf("=");
        const k = t.slice(0, i);
        let v = t.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!process.env[k]) process.env[k] = v;
      }
    }
    break;
  }
}

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const argVal = (f: string, d: string) => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] ? argv[i + 1] : d; };
const DO_EMAIL = argv.includes("--email");
const TO = argVal("--to", "scott.james@codeninjas.com");
const CLOSURE_DAYS = argVal("--closure-days", "7");
const DEFAULT_REPORT_DIR = "/var/www/reports/clickup-audit";
const HTML_OUT = argVal("--html-out", join(DEFAULT_REPORT_DIR, "index.html"));

async function runJson(tool: string, extra: string[] = []): Promise<any> {
  const proc = Bun.spawn(["bun", join(here, tool), "--json", ...extra], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  await proc.exited;
  if (proc.exitCode !== 0) throw new Error(`${tool} failed (${proc.exitCode}): ${err.slice(0, 300)}`);
  try { return JSON.parse(out); } catch { throw new Error(`${tool} did not return JSON: ${out.slice(0, 200)}`); }
}

const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- gather ----
const overdue = await runJson("Overdue.ts");
const closure = await runJson("Closure.ts", ["--days", CLOSURE_DAYS]);

const reportDate = new Date().toISOString().slice(0, 10);
const totalImproper = (closure.results || []).reduce((a: number, r: any) => a + r.violations.length, 0);
const totalChecked = (closure.results || []).reduce((a: number, r: any) => a + r.checked, 0);

// ---- HTML ----
const card = (label: string, value: string | number, color: string) =>
  `<td style="padding:14px 18px;background:${color}1a;border:1px solid ${color}55;border-radius:10px;text-align:center;">
     <div style="font-size:30px;font-weight:700;color:${color};">${value}</div>
     <div style="font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:.5px;">${label}</div>
   </td>`;

const overdueByAssignee = (overdue.byAssignee || [])
  .map((a: any) => `<tr><td style="padding:4px 10px;">${esc(a.assignee)}</td><td style="padding:4px 10px;text-align:right;font-weight:600;">${a.count}</td></tr>`).join("");

const overdueByList = (overdue.byList || [])
  .map((l: any) => `<tr><td style="padding:4px 10px;">${esc(l.list)}</td><td style="padding:4px 10px;text-align:right;font-weight:600;">${l.count}</td></tr>`).join("");

const closureBlocks = (closure.results || []).map((r: any) => {
  const rate = r.checked ? Math.round((r.clean / r.checked) * 100) : 0;
  const col = rate >= 80 ? "#16a34a" : rate >= 50 ? "#d97706" : "#dc2626";
  const rows = (r.violations || []).slice(0, 25).map((v: any) =>
    `<tr>
       <td style="padding:5px 10px;border-top:1px solid #eee;"><a href="${v.url}" style="color:#2563eb;text-decoration:none;">${esc(v.name)}</a></td>
       <td style="padding:5px 10px;border-top:1px solid #eee;color:#64748b;">${esc(v.assignees.join(", ") || "unassigned")}</td>
       <td style="padding:5px 10px;border-top:1px solid #eee;color:#b45309;">${esc(v.missing.join(", "))}</td>
     </tr>`).join("");
  const more = r.violations.length > 25 ? `<div style="color:#94a3b8;font-size:12px;padding:6px 10px;">…and ${r.violations.length - 25} more</div>` : "";
  return `<div style="margin:18px 0;">
    <div style="font-weight:700;font-size:15px;">${esc(r.list)}</div>
    <div style="color:${col};font-weight:600;margin:2px 0 8px;">${r.clean}/${r.checked} closed properly (${rate}%) · ${r.violations.length} flagged</div>
    ${r.violations.length ? `<table style="width:100%;border-collapse:collapse;font-size:13px;"><tr style="color:#64748b;font-size:11px;text-transform:uppercase;"><td style="padding:4px 10px;">Task</td><td style="padding:4px 10px;">Owner</td><td style="padding:4px 10px;">Missing</td></tr>${rows}</table>${more}` : `<div style="color:#16a34a;font-size:13px;padding:4px 10px;">✓ All clean this week</div>`}
  </div>`;
}).join("");

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a;">
<div style="max-width:760px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:#0f172a;color:#fff;padding:22px 28px;">
    <div style="font-size:20px;font-weight:700;">ClickUp Audit — Weekly Report</div>
    <div style="color:#94a3b8;font-size:13px;">Codeninjas workspace · ${reportDate}</div>
  </div>
  <div style="padding:24px 28px;">
    <table style="width:100%;border-collapse:separate;border-spacing:10px;"><tr>
      ${card("Overdue", overdue.totalOverdue ?? 0, "#dc2626")}
      ${card("Improperly closed", totalImproper, "#d97706")}
      ${card("Open, no due date", overdue.noDueDate ?? 0, "#0891b2")}
    </tr></table>

    <h3 style="margin:24px 0 6px;font-size:15px;">Closure compliance <span style="color:#94a3b8;font-weight:400;font-size:13px;">(last ${CLOSURE_DAYS}d · were tasks actually finished?)</span></h3>
    ${closureBlocks || '<div style="color:#94a3b8;">No policy lists configured.</div>'}

    <h3 style="margin:28px 0 6px;font-size:15px;">Overdue load</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="width:50%;vertical-align:top;">
        <div style="color:#64748b;font-size:11px;text-transform:uppercase;padding:4px 10px;">By owner</div>${overdueByAssignee || '<tr><td style="padding:4px 10px;color:#16a34a;">None 🎉</td></tr>'}
      </td><td style="width:50%;vertical-align:top;">
        <div style="color:#64748b;font-size:11px;text-transform:uppercase;padding:4px 10px;">By list</div>${overdueByList}
      </td></tr>
    </table>

    <div style="margin-top:26px;padding-top:14px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
      Generated by the ClickUpAudit agent on Poseidon. Read-only — no ClickUp data was modified.
      ${overdue.capped ? "<br><b style='color:#dc2626;'>⚠ Overdue scan hit its page cap — numbers may be partial.</b>" : ""}
    </div>
  </div>
</div></body></html>`;

// ---- write HTML ----
try {
  mkdirSync(dirname(HTML_OUT), { recursive: true });
  writeFileSync(HTML_OUT, html);
  console.log(`📝 Wrote report to ${HTML_OUT}`);
} catch (e: any) {
  console.error(`⚠ Could not write HTML to ${HTML_OUT}: ${e.message}`);
}

// ---- console summary ----
console.log(`\nClickUp Weekly Audit — ${reportDate}`);
console.log(`  Overdue: ${overdue.totalOverdue}  |  Improperly closed (${CLOSURE_DAYS}d): ${totalImproper}/${totalChecked}  |  No due date: ${overdue.noDueDate}`);

// ---- email ----
if (DO_EMAIL) {
  const url = process.env.EMAIL_SEND_WEBHOOK_URL;
  if (!url) { console.error("❌ EMAIL_SEND_WEBHOOK_URL not set — cannot email."); process.exit(1); }
  const apiKey = process.env.EMAIL_WEBHOOK_API_KEY || "";
  const subject = `ClickUp Audit ${reportDate}: ${overdue.totalOverdue} overdue, ${totalImproper} improperly closed`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({ to: TO, subject, body: html, isHtml: true, apiKey }),
  });
  if (res.ok || res.status === 202) {
    console.log(`✅ Email sent to ${TO} (${res.status})`);
  } else {
    console.error(`❌ Email failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    process.exit(1);
  }
} else {
  console.log(`(dry run — pass --email to send to ${TO})`);
}
