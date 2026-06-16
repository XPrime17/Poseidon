#!/usr/bin/env bun
/**
 * Closure.ts - Closure-compliance audit. Answers Scott's core question:
 * "Are tasks actually being finished, or is someone just flipping the status?"
 *
 * For each list with a policy in Config/audit-config.json, it pulls tasks closed
 * within the window and checks that the required EVIDENCE OF WORK is present:
 *   - requireNote            : at least one comment on the task
 *   - requireAssignee        : someone was assigned (who did it?)
 *   - requireChecklistComplete : no unresolved checklist items
 *   - requireNoOpenSubtasks  : no still-open subtasks under a closed parent
 *   - requiredCustomFields[] : named custom fields have a value
 *
 * Tasks missing required evidence are flagged as "closed without <X>". GET-only.
 *
 * Usage:
 *   bun Closure.ts [--days 30] [--json] [--out FILE]
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

const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, "..", "Config", "audit-config.json"), "utf-8"));
const POLICY: Record<string, any> = cfg.closurePolicy || {};

const C = {
  reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", mag: "\x1b[35m",
};

const argv = process.argv.slice(2);
const argVal = (f: string, d: string) => {
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : d;
};
const DAYS = parseInt(argVal("--days", "30"), 10);
const AS_JSON = argv.includes("--json");
const OUT = argVal("--out", "");
const SINCE = Date.now() - DAYS * 86400000;

async function api(endpoint: string): Promise<any> {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { Authorization: TOKEN!, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API ${res.status} on ${endpoint}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// closed tasks in a list within the window (paginated)
async function closedTasksInList(listId: string): Promise<any[]> {
  const out: any[] = [];
  for (let page = 0; page < 20; page++) {
    const q = new URLSearchParams({
      page: String(page),
      include_closed: "true",
      subtasks: "true",
      order_by: "updated",
      date_updated_gt: String(SINCE),
    });
    const data = await api(`/list/${listId}/task?${q.toString()}`);
    const tasks: any[] = data.tasks || [];
    if (tasks.length === 0) break;
    out.push(...tasks);
    if (tasks.length < 100) break;
  }
  return out;
}

async function commentCount(taskId: string): Promise<number> {
  try {
    const data = await api(`/task/${taskId}/comment`);
    return (data.comments || []).length;
  } catch {
    return -1; // unknown
  }
}

// Count markdown checkboxes "- [ ]" / "- [x]" in text. These onboarding tasks
// embed their definition-of-done in the description, not in native checklists.
function markdownSteps(text: string): { total: number; unchecked: number } {
  if (!text) return { total: 0, unchecked: 0 };
  const re = /^[ \t]*[-*]\s+\[( |x|X)\]/gm;
  let total = 0, unchecked = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    total++;
    if (m[1] === " ") unchecked++;
  }
  return { total, unchecked };
}

async function fullTask(taskId: string): Promise<any | null> {
  try {
    return await api(`/task/${taskId}`);
  } catch {
    return null;
  }
}

interface Violation {
  list: string; id: string; name: string; url: string;
  assignees: string[]; closedDaysAgo: number; missing: string[];
}

const results: { list: string; checked: number; clean: number; violations: Violation[] }[] = [];

for (const [listId, pol] of Object.entries(POLICY)) {
  if (listId.startsWith("_")) continue;
  const label = pol.label || listId;
  let checked = 0, clean = 0;
  const violations: Violation[] = [];

  const tasks = await closedTasksInList(listId);
  for (const t of tasks) {
    const statusType = t.status?.type;
    const dateClosed = t.date_closed ? parseInt(t.date_closed) : null;
    const isClosed = statusType === "closed" || statusType === "done" || !!dateClosed;
    if (!isClosed) continue;
    if (dateClosed && dateClosed < SINCE) continue;
    // skip subtasks themselves; we audit closable work items (keep parents)
    checked++;

    const missing: string[] = [];

    if (pol.requireAssignee && (t.assignees || []).length === 0) missing.push("assignee");

    if (pol.requireNote) {
      const n = await commentCount(t.id);
      if (n === 0) missing.push("note/comment");
    }

    if (pol.requireDescriptionStepsComplete) {
      // list endpoint may truncate/omit description — fetch full task to be sure
      const full = await fullTask(t.id);
      const text = (full?.description || full?.text_content || t.description || t.text_content || "") as string;
      const { total, unchecked } = markdownSteps(text);
      if (total > 0 && unchecked > 0) missing.push(`${unchecked}/${total} steps incomplete`);
    }

    if (pol.requireChecklistComplete) {
      const unresolved = (t.checklists || []).reduce(
        (acc: number, cl: any) => acc + (cl.unresolved ?? (cl.items || []).filter((i: any) => !i.resolved).length),
        0
      );
      if (unresolved > 0) missing.push(`${unresolved} open checklist item(s)`);
    }

    // Required custom fields = base list-level fields + per-task-type sub-rules.
    // taskTypeRules let one list demand different evidence per task type, e.g. On-Ramp:
    // Onboard→Contact Outcome; 3-Week→+Parent Satisfaction; 3-Month→+Referral.
    const requiredFields = new Map<string, string>(); // fieldName -> task-type label ("" = base)
    for (const want of pol.requiredCustomFields || []) requiredFields.set(want, "");
    const nameLC = (t.name || "").toLowerCase();
    for (const rule of pol.taskTypeRules || []) {
      if (!rule?.match || !nameLC.includes(String(rule.match).toLowerCase())) continue;
      const typeLabel = rule.label || rule.match;
      for (const want of rule.requiredCustomFields || []) {
        if (!requiredFields.has(want) || requiredFields.get(want) === "") requiredFields.set(want, typeLabel);
      }
    }
    for (const [want, typeLabel] of requiredFields) {
      const cf = (t.custom_fields || []).find((c: any) => c.name === want);
      const empty =
        !cf || cf.value === undefined || cf.value === null || cf.value === "" ||
        (Array.isArray(cf.value) && cf.value.length === 0);
      if (empty) missing.push(typeLabel ? `${want} (${typeLabel})` : `field:${want}`);
    }

    if (missing.length === 0) {
      clean++;
    } else {
      violations.push({
        list: label,
        id: t.id,
        name: t.name,
        url: `https://app.clickup.com/t/${t.id}`,
        assignees: (t.assignees || []).map((a: any) => a.username || a.email || `user:${a.id}`),
        closedDaysAgo: dateClosed ? Math.floor((Date.now() - dateClosed) / 86400000) : -1,
        missing,
      });
    }
  }

  // requireNoOpenSubtasks: a closed parent with any non-closed child in the pulled set
  if (POLICY[listId].requireNoOpenSubtasks) {
    const byId = new Map(tasks.map((t: any) => [t.id, t]));
    const openChildrenByParent = new Map<string, number>();
    for (const t of tasks) {
      if (!t.parent) continue;
      const st = t.status?.type;
      if (st !== "closed" && st !== "done") {
        openChildrenByParent.set(t.parent, (openChildrenByParent.get(t.parent) || 0) + 1);
      }
    }
    for (const [parentId, openCount] of openChildrenByParent) {
      const parent: any = byId.get(parentId);
      if (!parent) continue;
      const st = parent.status?.type;
      const dc = parent.date_closed ? parseInt(parent.date_closed) : null;
      if (!(st === "closed" || st === "done" || dc)) continue;
      const existing = violations.find((v) => v.id === parentId);
      if (existing) existing.missing.push(`${openCount} open subtask(s)`);
      else {
        violations.push({
          list: label, id: parentId, name: parent.name,
          url: `https://app.clickup.com/t/${parentId}`,
          assignees: (parent.assignees || []).map((a: any) => a.username || `user:${a.id}`),
          closedDaysAgo: dc ? Math.floor((Date.now() - dc) / 86400000) : -1,
          missing: [`${openCount} open subtask(s)`],
        });
        clean = Math.max(0, clean - 1);
      }
    }
  }

  results.push({ list: label, checked, clean, violations });
}

if (AS_JSON || OUT) {
  const payload = { generatedAt: new Date().toISOString(), lookbackDays: DAYS, results };
  const json = JSON.stringify(payload, null, 2);
  if (OUT) writeFileSync(OUT, json);
  if (AS_JSON) console.log(json);
  else console.log(`${C.green}Wrote JSON to ${OUT}${C.reset}`);
  process.exit(0);
}

// ---- human report ----
console.log(`\n${C.bold}${C.cyan}ClickUp Closure-Compliance Report${C.reset} ${C.dim}— last ${DAYS}d, ${new Date().toISOString().slice(0, 10)}${C.reset}\n`);

let totalViol = 0, totalChecked = 0;
for (const r of results) {
  totalViol += r.violations.length;
  totalChecked += r.checked;
  const rate = r.checked ? Math.round((r.clean / r.checked) * 100) : 0;
  const col = rate >= 80 ? C.green : rate >= 50 ? C.yellow : C.red;
  console.log(`${C.bold}${r.list}${C.reset}`);
  console.log(`  ${col}${r.clean}/${r.checked} closed properly (${rate}%)${C.reset}  ${C.dim}· ${r.violations.length} flagged${C.reset}`);
  for (const v of r.violations.sort((a, b) => b.closedDaysAgo - a.closedDaysAgo)) {
    console.log(`    ${C.red}✗${C.reset} ${v.name.slice(0, 44).padEnd(44)} ${C.dim}${v.assignees.join(",") || "unassigned"}${C.reset}`);
    console.log(`      ${C.yellow}missing: ${v.missing.join(", ")}${C.reset} ${C.dim}· closed ${v.closedDaysAgo}d ago · ${v.url}${C.reset}`);
  }
  console.log("");
}

console.log(`${C.bold}Summary:${C.reset} ${totalViol} improperly-closed task(s) across ${totalChecked} checked in ${results.length} policy list(s).`);
if (totalChecked === 0) {
  console.log(`${C.dim}(No closed tasks in the window for the policy lists — try a larger --days.)${C.reset}`);
}
console.log("");
