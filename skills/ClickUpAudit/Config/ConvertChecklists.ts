#!/usr/bin/env bun
/**
 * ConvertChecklists.ts - Convert markdown "- [ ]" steps embedded in a task's
 * DESCRIPTION into a native ClickUp checklist (which rolls up to a progress %,
 * shows on the card, and can be enforced by the closure audit).
 *
 * Targets the Students list by default, tasks whose name matches the lifecycle
 * prefixes (Onboard / 3-Week Check-In / 3-Month Check-In). Idempotent: skips a
 * task that already has a checklist with the target name.
 *
 * Usage:
 *   bun ConvertChecklists.ts                 # DRY RUN (default) — shows plan, no writes
 *   bun ConvertChecklists.ts --apply         # actually create the checklists
 *   bun ConvertChecklists.ts --include-closed # also process closed tasks (default: open only)
 *   bun ConvertChecklists.ts --checklist-name "Action Items"
 *
 * Env: CLICKUP_PERSONAL_TOKEN (from ~/.claude/.env)
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

for (const p of [join(homedir(), ".claude", ".claude", ".env"), join(homedir(), ".claude", ".env"), join(process.cwd(), ".env")]) {
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf-8").split("\n")) {
      const t = line.trim();
      if (t && !t.startsWith("#") && t.includes("=")) { const i = t.indexOf("="); const k = t.slice(0, i); if (!process.env[k]) process.env[k] = t.slice(i + 1); }
    }
    break;
  }
}

const API = "https://api.clickup.com/api/v2";
const TOKEN = process.env.CLICKUP_PERSONAL_TOKEN;
if (!TOKEN) { console.error("CLICKUP_PERSONAL_TOKEN not set"); process.exit(1); }

const argv = process.argv.slice(2);
const argVal = (f: string, d: string) => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] ? argv[i + 1] : d; };
const APPLY = argv.includes("--apply");
const INCLUDE_CLOSED = argv.includes("--include-closed");
const LIST = argVal("--list", "901113048282");
const CHECKLIST_NAME = argVal("--checklist-name", "Action Items");
const PREFIXES = ["onboard", "3-week check-in", "3-month check-in"];

async function api(endpoint: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${API}${endpoint}`, { ...init, headers: { Authorization: TOKEN!, "Content-Type": "application/json", ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(`API ${res.status} ${endpoint}: ${(await res.text()).slice(0, 200)}`);
  return res.status === 204 ? {} : res.json();
}

function parseSteps(text: string): { name: string; resolved: boolean }[] {
  const out: { name: string; resolved: boolean }[] = [];
  for (const line of (text || "").split("\n")) {
    const m = line.match(/^[ \t]*[-*]\s+\[( |x|X)\]\s*(.+?)\s*$/);
    if (m) out.push({ name: m[2], resolved: m[1] !== " " });
  }
  return out;
}

// gather tasks
const tasks: any[] = [];
for (let p = 0; p < 20; p++) {
  const d = await api(`/list/${LIST}/task?include_closed=${INCLUDE_CLOSED}&page=${p}`);
  const t = d.tasks || [];
  if (!t.length) break;
  tasks.push(...t);
  if (t.length < 100) break;
}

const targets = tasks.filter((t) => {
  const n = (t.name || "").toLowerCase();
  return PREFIXES.some((p) => n.startsWith(p));
});

console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — list ${LIST}, ${INCLUDE_CLOSED ? "open+closed" : "open only"}`);
console.log(`Found ${targets.length} lifecycle task(s) to consider.\n`);

let created = 0, skipped = 0, noSteps = 0;
for (const t of targets) {
  const full = await api(`/task/${t.id}`);
  const existing = (full.checklists || []).find((c: any) => (c.name || "").toLowerCase() === CHECKLIST_NAME.toLowerCase());
  if (existing) { skipped++; console.log(`  ⏭  ${t.name} — already has "${CHECKLIST_NAME}" checklist`); continue; }
  const steps = parseSteps(full.description || full.text_content || "");
  if (!steps.length) { noSteps++; console.log(`  ⚠  ${t.name} — no markdown steps found in description`); continue; }

  if (!APPLY) {
    console.log(`  ➕ ${t.name}  →  "${CHECKLIST_NAME}" with ${steps.length} items:`);
    for (const s of steps) console.log(`        [${s.resolved ? "x" : " "}] ${s.name}`);
    created++;
    continue;
  }

  // create checklist + items
  const cl = await api(`/task/${t.id}/checklist`, { method: "POST", body: JSON.stringify({ name: CHECKLIST_NAME }) });
  const clId = cl.checklist?.id;
  for (const s of steps) {
    await api(`/checklist/${clId}/checklist_item`, { method: "POST", body: JSON.stringify({ name: s.name, resolved: s.resolved }) });
  }
  created++;
  console.log(`  ✅ ${t.name} — created "${CHECKLIST_NAME}" (${steps.length} items)`);
}

console.log(`\n${APPLY ? "Created" : "Would create"}: ${created} · skipped(existing): ${skipped} · no-steps: ${noSteps}`);
if (!APPLY) console.log(`Run with --apply to make these changes.`);
