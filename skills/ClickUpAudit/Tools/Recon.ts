#!/usr/bin/env bun
/**
 * Recon.ts - Read-only ClickUp workspace mapper + closure-signal sampler.
 *
 * Phase 1 of the ClickUpAudit agent. Pulls the full space/folder/list tree and
 * sweeps recently-closed tasks (workspace-wide) to show, per list, WHAT evidence
 * of work is actually present on closed tasks. This is the data we use to design
 * the per-list closure policy (Config/closure-policy.json).
 *
 * Everything here is GET-only. No writes, ever.
 *
 * Usage:
 *   bun Recon.ts [--days N] [--max-pages N] [--json] [--out FILE]
 *
 *   --days N        Look back N days for closed tasks (default 30)
 *   --max-pages N   Safety cap on pagination, 100 tasks/page (default 30 = 3000 tasks)
 *   --json          Emit machine-readable JSON instead of the human report
 *   --out FILE      Also write the JSON payload to FILE (always written when --json)
 *
 * Env: CLICKUP_PERSONAL_TOKEN (loaded from ~/.claude/.env)
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ---- env load (mirror of _CLICKUP/Tools/ClickUpApi.ts) ----
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
const TEAM_ID = "9011711565"; // Codeninjas
const TOKEN = process.env.CLICKUP_PERSONAL_TOKEN;
if (!TOKEN) {
  console.error("Error: CLICKUP_PERSONAL_TOKEN not set in ~/.claude/.env");
  process.exit(1);
}

const C = {
  reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", cyan: "\x1b[36m", mag: "\x1b[35m",
};

// ---- arg parse ----
const argv = process.argv.slice(2);
const argVal = (f: string, d: string) => {
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : d;
};
const DAYS = parseInt(argVal("--days", "30"), 10);
const MAX_PAGES = parseInt(argVal("--max-pages", "30"), 10);
const AS_JSON = argv.includes("--json");
const OUT = argVal("--out", "");

async function api(endpoint: string): Promise<any> {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { Authorization: TOKEN!, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} on ${endpoint}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

// ---- types (loose) ----
interface ListInfo {
  id: string;
  name: string;
  spaceName: string;
  folderName: string | null;
}

interface ListStats {
  list: ListInfo;
  closedSampled: number;
  withTimeTracked: number;
  withCustomFieldValues: number;
  withAssignee: number;
  closedUnder5min: number;
  closedPastDue: number;
  totalTimeToCloseMs: number;
  timeToCloseSamples: number;
  customFieldNames: Set<string>;
  statusNames: Set<string>;
}

// ---- 1. Build the tree ----
async function buildTree(): Promise<{ lists: Map<string, ListInfo>; tree: any }> {
  const lists = new Map<string, ListInfo>();
  const spaces = (await api(`/team/${TEAM_ID}/space`)).spaces || [];
  const tree: any[] = [];

  for (const space of spaces) {
    const spaceNode: any = { name: space.name, id: space.id, folders: [], lists: [] };

    // folderless lists
    try {
      const fl = (await api(`/space/${space.id}/list`)).lists || [];
      for (const l of fl) {
        const info: ListInfo = { id: l.id, name: l.name, spaceName: space.name, folderName: null };
        lists.set(l.id, info);
        spaceNode.lists.push({ id: l.id, name: l.name, taskCount: l.task_count ?? null });
      }
    } catch (e: any) {
      spaceNode.lists.push({ error: e.message });
    }

    // folders -> lists
    try {
      const folders = (await api(`/space/${space.id}/folder`)).folders || [];
      for (const f of folders) {
        const folderNode: any = { name: f.name, id: f.id, lists: [] };
        for (const l of f.lists || []) {
          const info: ListInfo = { id: l.id, name: l.name, spaceName: space.name, folderName: f.name };
          lists.set(l.id, info);
          folderNode.lists.push({ id: l.id, name: l.name, taskCount: l.task_count ?? null });
        }
        spaceNode.folders.push(folderNode);
      }
    } catch (e: any) {
      spaceNode.folders.push({ error: e.message });
    }

    tree.push(spaceNode);
  }
  return { lists, tree };
}

// ---- 2. Sweep recently-closed tasks workspace-wide ----
async function sweepClosed(lists: Map<string, ListInfo>) {
  const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;
  const statsByList = new Map<string, ListStats>();
  let totalClosed = 0;
  let page = 0;
  let capped = false;

  const ensure = (listId: string): ListStats => {
    if (!statsByList.has(listId)) {
      const info = lists.get(listId) || {
        id: listId, name: `(unknown list ${listId})`, spaceName: "?", folderName: null,
      };
      statsByList.set(listId, {
        list: info, closedSampled: 0, withTimeTracked: 0, withCustomFieldValues: 0,
        withAssignee: 0, closedUnder5min: 0, closedPastDue: 0,
        totalTimeToCloseMs: 0, timeToCloseSamples: 0,
        customFieldNames: new Set(), statusNames: new Set(),
      });
    }
    return statsByList.get(listId)!;
  };

  while (page < MAX_PAGES) {
    const q = new URLSearchParams({
      page: String(page),
      include_closed: "true",
      subtasks: "true",
      order_by: "updated",
      // No date_closed_gt filter exists in the v2 API. date_updated_gt is a safe
      // superset: any task closed in the window was necessarily updated in it.
      "date_updated_gt": String(since),
    });
    const data = await api(`/team/${TEAM_ID}/task?${q.toString()}`);
    const tasks: any[] = data.tasks || [];
    if (tasks.length === 0) break;

    for (const t of tasks) {
      // only count genuinely closed/done tasks within window
      const statusType = t.status?.type; // open | closed | done | custom
      const dateClosed = t.date_closed ? parseInt(t.date_closed) : null;
      const isClosed = statusType === "closed" || statusType === "done" || !!dateClosed;
      if (!isClosed) continue;
      if (dateClosed && dateClosed < since) continue;

      const listId = t.list?.id;
      if (!listId) continue;
      const s = ensure(listId);
      s.closedSampled++;
      totalClosed++;
      s.statusNames.add(t.status?.status || "?");

      const timeSpent = t.time_spent ? Number(t.time_spent) : 0;
      if (timeSpent > 0) s.withTimeTracked++;

      const cfWithValues = (t.custom_fields || []).filter(
        (cf: any) => cf.value !== undefined && cf.value !== null && cf.value !== ""
      );
      if (cfWithValues.length > 0) s.withCustomFieldValues++;
      for (const cf of t.custom_fields || []) s.customFieldNames.add(cf.name);

      if ((t.assignees || []).length > 0) s.withAssignee++;

      const created = t.date_created ? parseInt(t.date_created) : null;
      if (created && dateClosed) {
        const ttc = dateClosed - created;
        if (ttc >= 0) {
          s.totalTimeToCloseMs += ttc;
          s.timeToCloseSamples++;
          if (ttc < 5 * 60 * 1000) s.closedUnder5min++;
        }
      }
      const due = t.due_date ? parseInt(t.due_date) : null;
      if (due && dateClosed && dateClosed > due) s.closedPastDue++;
    }

    page++;
    if (page >= MAX_PAGES && tasks.length > 0) capped = true;
  }

  return { statsByList, totalClosed, capped, pagesScanned: page };
}

function pct(n: number, d: number): string {
  if (d === 0) return "  -";
  return `${Math.round((n / d) * 100)}%`.padStart(3);
}

function fmtDur(ms: number): string {
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ---- main ----
const { lists, tree } = await buildTree();
const { statsByList, totalClosed, capped, pagesScanned } = await sweepClosed(lists);

if (AS_JSON || OUT) {
  const payload = {
    generatedAt: new Date().toISOString(),
    teamId: TEAM_ID,
    lookbackDays: DAYS,
    totalClosedSampled: totalClosed,
    capped,
    pagesScanned,
    tree,
    listStats: [...statsByList.values()].map((s) => ({
      listId: s.list.id,
      listName: s.list.name,
      space: s.list.spaceName,
      folder: s.list.folderName,
      closedSampled: s.closedSampled,
      pctTimeTracked: s.closedSampled ? Math.round((s.withTimeTracked / s.closedSampled) * 100) : 0,
      pctCustomFieldValues: s.closedSampled ? Math.round((s.withCustomFieldValues / s.closedSampled) * 100) : 0,
      pctAssignee: s.closedSampled ? Math.round((s.withAssignee / s.closedSampled) * 100) : 0,
      pctClosedUnder5min: s.closedSampled ? Math.round((s.closedUnder5min / s.closedSampled) * 100) : 0,
      pctClosedPastDue: s.closedSampled ? Math.round((s.closedPastDue / s.closedSampled) * 100) : 0,
      avgTimeToClose: s.timeToCloseSamples ? fmtDur(s.totalTimeToCloseMs / s.timeToCloseSamples) : "-",
      customFields: [...s.customFieldNames],
      statuses: [...s.statusNames],
    })),
  };
  const json = JSON.stringify(payload, null, 2);
  if (OUT) writeFileSync(OUT, json);
  if (AS_JSON) console.log(json);
  else console.log(`${C.green}Wrote JSON to ${OUT}${C.reset}`);
  process.exit(0);
}

// ---- human report ----
console.log(`\n${C.bold}${C.cyan}ClickUp Workspace Recon${C.reset} ${C.dim}(Codeninjas, last ${DAYS}d closed tasks)${C.reset}\n`);

console.log(`${C.bold}WORKSPACE TREE${C.reset}`);
for (const space of tree) {
  console.log(`\n${C.mag}▸ ${space.name}${C.reset} ${C.dim}(${space.id})${C.reset}`);
  for (const l of space.lists) {
    if (l.error) { console.log(`    ${C.red}list error: ${l.error}${C.reset}`); continue; }
    console.log(`    ${C.green}${l.name}${C.reset} ${C.dim}${l.id}${l.taskCount != null ? ` · ${l.taskCount} tasks` : ""}${C.reset}`);
  }
  for (const f of space.folders) {
    if (f.error) { console.log(`    ${C.red}folder error: ${f.error}${C.reset}`); continue; }
    console.log(`  ${C.blue}📁 ${f.name}${C.reset} ${C.dim}(${f.id})${C.reset}`);
    for (const l of f.lists) {
      console.log(`      ${C.green}${l.name}${C.reset} ${C.dim}${l.id}${l.taskCount != null ? ` · ${l.taskCount} tasks` : ""}${C.reset}`);
    }
  }
}

console.log(`\n\n${C.bold}CLOSURE-SIGNAL SAMPLING${C.reset} ${C.dim}(per list, closed tasks in window)${C.reset}`);
console.log(`${C.dim}Columns: #=closed sampled · Time=%w/ time tracked · CF=%w/ custom-field value · Asg=%w/ assignee · <5m=%closed under 5min · Late=%closed past due · AvgTTC=avg time-to-close${C.reset}\n`);

const rows = [...statsByList.values()].sort((a, b) => b.closedSampled - a.closedSampled);
const head = `${"List".padEnd(34)} ${"#".padStart(4)} ${"Time".padStart(5)} ${"CF".padStart(4)} ${"Asg".padStart(4)} ${"<5m".padStart(4)} ${"Late".padStart(5)} ${"AvgTTC".padStart(7)}`;
console.log(C.bold + head + C.reset);
console.log(C.dim + "-".repeat(head.length) + C.reset);
for (const s of rows) {
  const name = `${s.list.name}`.slice(0, 33).padEnd(34);
  console.log(
    `${name} ${String(s.closedSampled).padStart(4)} ${pct(s.withTimeTracked, s.closedSampled).padStart(5)} ` +
    `${pct(s.withCustomFieldValues, s.closedSampled).padStart(4)} ${pct(s.withAssignee, s.closedSampled).padStart(4)} ` +
    `${pct(s.closedUnder5min, s.closedSampled).padStart(4)} ${pct(s.closedPastDue, s.closedSampled).padStart(5)} ` +
    `${(s.timeToCloseSamples ? fmtDur(s.totalTimeToCloseMs / s.timeToCloseSamples) : "-").padStart(7)}`
  );
}

console.log(`\n${C.dim}Custom fields seen per list (helps design 'requires a note/field' rules):${C.reset}`);
for (const s of rows) {
  if (s.customFieldNames.size > 0) {
    console.log(`  ${C.green}${s.list.name}${C.reset}: ${C.dim}${[...s.customFieldNames].join(", ")}${C.reset}`);
  }
}

console.log(`\n${C.bold}Total closed sampled:${C.reset} ${totalClosed}  ${C.dim}(${pagesScanned} pages)${C.reset}`);
if (capped) {
  console.log(`${C.red}⚠ Pagination hit the ${MAX_PAGES}-page cap — results are PARTIAL. Re-run with --max-pages higher or --days smaller.${C.reset}`);
}
console.log("");
