#!/usr/bin/env bun
/**
 * Overdue.ts - Read-only overdue-task analysis for the Codeninjas ClickUp workspace.
 *
 * Sweeps all OPEN tasks workspace-wide, filters to those past their due date,
 * and reports overdue load by list and by assignee, with age buckets. Honors
 * the ignore lists in Config/audit-config.json so CRM/record lists don't pollute
 * the accountability picture. GET-only — never writes.
 *
 * Usage:
 *   bun Overdue.ts [--json] [--out FILE] [--max-pages N] [--top N]
 *
 *   --json        Machine-readable output
 *   --out FILE    Write JSON payload to FILE
 *   --max-pages N Pagination safety cap (100 tasks/page, default 40)
 *   --top N       How many worst tasks to list (default 15)
 *
 * Env: CLICKUP_PERSONAL_TOKEN (from ~/.claude/.env)
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

// ---- env load ----
const envPaths = [
  join(homedir(), ".claude", ".claude", ".env"),
  join(homedir(), ".claude", ".env"),
  join(process.cwd(), ".env"),
];
for (const p of envPaths) {
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf-8").split("\n")) {
      const t = line.trim();
      if (t && !t.startsWith("#") && t.includes("=")) {
        const i = t.indexOf("=");
        const k = t.slice(0, i);
        if (!process.env[k]) process.env[k] = t.slice(i + 1);
      }
    }
    break;
  }
}

const API = "https://api.clickup.com/api/v2";
const TOKEN = process.env.CLICKUP_PERSONAL_TOKEN;
if (!TOKEN) {
  console.error("Error: CLICKUP_PERSONAL_TOKEN not set in ~/.claude/.env");
  process.exit(1);
}

// ---- config ----
const here = dirname(fileURLToPath(import.meta.url));
const cfgPath = join(here, "..", "Config", "audit-config.json");
const cfg = JSON.parse(readFileSync(cfgPath, "utf-8"));
const TEAM_ID: string = cfg.teamId;
const IGNORE_SPACE_IDS: string[] = cfg.ignoreSpaceIds || [];
const IGNORE_SPACE_NAMES: string[] = cfg.ignoreSpaceNames || [];
const IGNORE_LIST_PATTERNS: string[] = cfg.ignoreListNamePatterns || [];
const IGNORE_LIST_IDS: string[] = cfg.ignoreListIds || [];
const BUCKETS: { label: string; maxDays: number | null }[] = cfg.overdue?.buckets || [];

const C = {
  reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", cyan: "\x1b[36m", mag: "\x1b[35m",
};

const argv = process.argv.slice(2);
const argVal = (f: string, d: string) => {
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : d;
};
const AS_JSON = argv.includes("--json");
const OUT = argVal("--out", "");
const MAX_PAGES = parseInt(argVal("--max-pages", "40"), 10);
const TOP = parseInt(argVal("--top", "15"), 10);

async function api(endpoint: string): Promise<any> {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { Authorization: TOKEN!, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API ${res.status} on ${endpoint}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

function isIgnored(spaceId: string, spaceName: string, listName: string, listId: string): boolean {
  if (IGNORE_LIST_IDS.includes(listId)) return true;
  if (IGNORE_SPACE_IDS.includes(spaceId)) return true;
  if (IGNORE_SPACE_NAMES.some((n) => spaceName?.toLowerCase() === n.toLowerCase())) return true;
  if (IGNORE_LIST_PATTERNS.some((p) => (listName || "").toLowerCase().includes(p.toLowerCase()))) return true;
  return false;
}

const NOW = Date.now();
const DAY = 86400000;

interface OverdueTask {
  id: string; name: string; list: string; space: string;
  assignees: string[]; dueDate: number; daysOverdue: number; url: string;
}

// The filtered team-tasks endpoint returns space as {id} with no name, so build
// an id->name map up front for clean grouping and reliable name-based ignores.
async function spaceNameMap(): Promise<Map<string, string>> {
  const m = new Map<string, string>();
  const spaces = (await api(`/team/${TEAM_ID}/space`)).spaces || [];
  for (const s of spaces) m.set(s.id, s.name);
  return m;
}

async function sweepOverdue(spaceNames: Map<string, string>) {
  const overdue: OverdueTask[] = [];
  let page = 0, capped = false, openScanned = 0, noDue = 0, ignored = 0;

  while (page < MAX_PAGES) {
    const q = new URLSearchParams({
      page: String(page),
      include_closed: "false",
      subtasks: "true",
      order_by: "due_date",
    });
    const data = await api(`/team/${TEAM_ID}/task?${q.toString()}`);
    const tasks: any[] = data.tasks || [];
    if (tasks.length === 0) break;

    for (const t of tasks) {
      const statusType = t.status?.type;
      if (statusType === "closed" || statusType === "done") continue;
      openScanned++;

      const spaceId = t.space?.id || "";
      const spaceName = spaceNames.get(spaceId) || t.space?.name || "?";
      const listName = t.list?.name || "?";
      const listId = t.list?.id || "";
      if (isIgnored(spaceId, spaceName, listName, listId)) { ignored++; continue; }

      const due = t.due_date ? parseInt(t.due_date) : null;
      if (!due) { noDue++; continue; }
      if (due >= NOW) continue; // not overdue

      overdue.push({
        id: t.id,
        name: t.name,
        list: listName,
        space: spaceName,
        assignees: (t.assignees || []).map((a: any) => a.username || a.email || `user:${a.id}`),
        dueDate: due,
        daysOverdue: Math.floor((NOW - due) / DAY),
        url: `https://app.clickup.com/t/${t.id}`,
      });
    }
    page++;
    if (page >= MAX_PAGES && tasks.length > 0) capped = true;
  }
  return { overdue, capped, openScanned, noDue, ignored, pagesScanned: page };
}

function bucketOf(days: number): string {
  for (const b of BUCKETS) {
    if (b.maxDays === null) return b.label;
    if (days <= b.maxDays) return b.label;
  }
  return BUCKETS.length ? BUCKETS[BUCKETS.length - 1].label : `${days}d`;
}

const spaceNames = await spaceNameMap();
const { overdue, capped, openScanned, noDue, ignored, pagesScanned } = await sweepOverdue(spaceNames);

// aggregate
const byList = new Map<string, OverdueTask[]>();
const byAssignee = new Map<string, OverdueTask[]>();
const byBucket = new Map<string, number>();
for (const t of overdue) {
  const lk = `${t.space} › ${t.list}`;
  if (!byList.has(lk)) byList.set(lk, []);
  byList.get(lk)!.push(t);
  const who = t.assignees.length ? t.assignees : ["(unassigned)"];
  for (const a of who) {
    if (!byAssignee.has(a)) byAssignee.set(a, []);
    byAssignee.get(a)!.push(t);
  }
  const b = bucketOf(t.daysOverdue);
  byBucket.set(b, (byBucket.get(b) || 0) + 1);
}

if (AS_JSON || OUT) {
  const payload = {
    generatedAt: new Date().toISOString(),
    teamId: TEAM_ID,
    totalOverdue: overdue.length,
    openScanned, noDueDate: noDue, ignored, capped, pagesScanned,
    byBucket: Object.fromEntries(byBucket),
    byList: [...byList.entries()].map(([k, v]) => ({ list: k, count: v.length })).sort((a, b) => b.count - a.count),
    byAssignee: [...byAssignee.entries()].map(([k, v]) => ({ assignee: k, count: v.length })).sort((a, b) => b.count - a.count),
    worst: [...overdue].sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, TOP),
  };
  const json = JSON.stringify(payload, null, 2);
  if (OUT) writeFileSync(OUT, json);
  if (AS_JSON) console.log(json);
  else console.log(`${C.green}Wrote JSON to ${OUT}${C.reset}`);
  process.exit(0);
}

// ---- human report ----
console.log(`\n${C.bold}${C.cyan}ClickUp Overdue Report${C.reset} ${C.dim}— ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC${C.reset}\n`);
console.log(`${C.bold}${C.red}${overdue.length} overdue tasks${C.reset} ${C.dim}(across ${openScanned} open work-tasks; ${ignored} ignored as records; ${noDue} open with no due date)${C.reset}\n`);

console.log(`${C.bold}By age${C.reset}`);
for (const b of BUCKETS) {
  const n = byBucket.get(b.label) || 0;
  const bar = "█".repeat(Math.min(40, n));
  const col = b.label === "30d+" ? C.red : b.label === "8-30d" ? C.yellow : C.green;
  console.log(`  ${b.label.padEnd(6)} ${col}${String(n).padStart(3)}${C.reset} ${col}${bar}${C.reset}`);
}

console.log(`\n${C.bold}By list${C.reset}`);
for (const [k, v] of [...byList.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(v.length).padStart(3)}  ${C.green}${k}${C.reset}`);
}

console.log(`\n${C.bold}By assignee${C.reset} ${C.dim}(who is carrying overdue load)${C.reset}`);
for (const [k, v] of [...byAssignee.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const oldest = Math.max(...v.map((t) => t.daysOverdue));
  console.log(`  ${String(v.length).padStart(3)}  ${C.cyan}${k}${C.reset} ${C.dim}(oldest ${oldest}d)${C.reset}`);
}

console.log(`\n${C.bold}Worst ${TOP} (most overdue)${C.reset}`);
for (const t of [...overdue].sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, TOP)) {
  console.log(`  ${C.red}${String(t.daysOverdue).padStart(4)}d${C.reset}  ${t.name.slice(0, 48).padEnd(48)} ${C.dim}${t.assignees.join(",") || "unassigned"} · ${t.list}${C.reset}`);
}

if (capped) {
  console.log(`\n${C.red}⚠ Hit the ${MAX_PAGES}-page cap — results may be PARTIAL. Re-run with --max-pages higher.${C.reset}`);
}
console.log("");
