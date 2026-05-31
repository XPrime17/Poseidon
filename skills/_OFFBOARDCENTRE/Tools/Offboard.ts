#!/usr/bin/env bun
/**
 * Offboard a Code Ninjas centre from the voice AI pipeline.
 *
 * Modes: soft (reversible), hard (terminal), reactivate (undo soft).
 *
 * Usage:
 *   bun Offboard.ts --centre <centre_id> --mode <soft|hard|reactivate> [--dry-run] [--yes] [--hard-i-know]
 *
 * See: ~/.claude/skills/_OFFBOARDCENTRE/SKILL.md
 */

import { parseArgs } from "node:util";
import { mkdirSync, writeFileSync, appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// ─────────── config — secrets from env, public IDs inline ───────────
function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env var: ${name}\nExport from 1Password or shell. See SKILL.md "Environment" section.`);
    process.exit(1);
  }
  return v;
}
const RETELL_KEY = reqEnv("RETELL_API_KEY");
const N8N_KEY = reqEnv("N8N_CLOUD_API_KEY");
const RESEND_KEY = reqEnv("RESEND_API_KEY");
const CLICKUP_TOKEN = reqEnv("CLICKUP_API_TOKEN");
const SHEETS_WRITE_CRED = reqEnv("N8N_SHEETS_WRITE_CRED_ID");
const SHEETS_READ_CRED = reqEnv("N8N_SHEETS_READ_CRED_ID");

const RETELL_BASE = "https://api.retellai.com";
const N8N_API = "https://xprime17.app.n8n.cloud/api/v1";
const CENTRE_LOOKUP_ID = "1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0";
const LEADS_SHEET_ID = "1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A";
const CLICKUP_VOICE_AI_SPACE = "90114119602";
const ARCHIVE_ROOT = "/root/offboard-archives";
const AUDIT_LOG = `${ARCHIVE_ROOT}/log.jsonl`;
const FOLLOWUPS_FILE = "/root/.claude/skills/_OFFBOARDCENTRE/ManualFollowups.md";
const SCOTT_EMAIL = "scott.james@codeninjas.com";

// ─────────── types ───────────
type Mode = "soft" | "hard" | "reactivate";
interface CentreRow {
  centre_id: string;
  timezone: string;
  enabled: boolean;
  location_name: string;
  from_number: string;
  testing: boolean;
  test_number: string;
  centre_email: string;
  director: string;
  agent_id: string;
  knowledge_base: string;
}
interface Inventory {
  centre: CentreRow;
  agent: { agent_id: string; agent_name: string; original_name?: string };
  phone: { phone_number: string; outbound_agent_id: string | null; inbound_agent_id: string | null; nickname: string };
  active_leads: Array<{ row: number; lead_id: string; first: string; last: string; phone: string; status: string }>;
  clickup_folder?: { id: string; name: string };
}

// ─────────── arg parsing ───────────
const { values } = parseArgs({
  options: {
    centre: { type: "string" },
    mode: { type: "string", default: "soft" },
    "dry-run": { type: "boolean", default: false },
    yes: { type: "boolean", default: false },
    "hard-i-know": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (values.help || !values.centre) {
  console.log(`Offboard a Code Ninjas centre from the voice AI pipeline.

Usage:
  bun Offboard.ts --centre <centre_id> --mode <soft|hard|reactivate> [--dry-run] [--yes] [--hard-i-know]

Flags:
  --centre <id>      Required. centre_id from Centre Lookup Sheet (e.g. ma-canton, tx-spring-rayford)
  --mode <m>         soft (default) | hard | reactivate
  --dry-run          Print proposed mutations, do not execute
  --yes              Skip confirmation prompt (soft + reactivate)
  --hard-i-know      Required to skip the second confirmation in hard mode (combine with --yes)
  --help             Show this message

Examples:
  bun Offboard.ts --centre ma-canton --mode soft --dry-run
  bun Offboard.ts --centre tx-spring-rayford --mode soft --yes
  bun Offboard.ts --centre tx-san-antonio-stone-oak-1 --mode hard --yes --hard-i-know
  bun Offboard.ts --centre ma-canton --mode reactivate
`);
  process.exit(values.help ? 0 : 1);
}

const mode = values.mode as Mode;
if (!["soft", "hard", "reactivate"].includes(mode)) {
  err(`Invalid mode: ${mode}. Must be soft, hard, or reactivate.`);
  process.exit(1);
}

// ─────────── helpers ───────────
function log(msg: string) { console.log(`  ${msg}`); }
function err(msg: string) { console.error(`  ✗ ${msg}`); }
function ok(msg: string) { console.log(`  ✓ ${msg}`); }
function todo(msg: string) { console.log(`  ⚠ MANUAL: ${msg}`); }
function hr() { console.log("─".repeat(72)); }

const TODAY = new Date().toISOString().slice(0, 10);

async function retellGet(path: string) {
  const r = await fetch(`${RETELL_BASE}${path}`, { headers: { Authorization: `Bearer ${RETELL_KEY}` } });
  if (!r.ok) throw new Error(`Retell ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}
async function retellPatch(path: string, body: unknown) {
  const r = await fetch(`${RETELL_BASE}${path}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${RETELL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Retell PATCH ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}
async function retellDelete(path: string) {
  const r = await fetch(`${RETELL_BASE}${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${RETELL_KEY}` } });
  if (!r.ok && r.status !== 404) throw new Error(`Retell DELETE ${path}: ${r.status} ${await r.text()}`);
  return r.status;
}

function csvParse(csv: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [], cell = "", inQ = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (inQ) {
      if (c === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { cur.push(cell); cell = ""; }
      else if (c === "\n") { cur.push(cell); rows.push(cur); cur = []; cell = ""; }
      else if (c !== "\r") cell += c;
    }
  }
  if (cell || cur.length) { cur.push(cell); rows.push(cur); }
  return rows;
}

async function readSheetCsv(sheetId: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`Sheets read ${sheetId}: ${r.status}`);
  return csvParse(await r.text());
}

// ─────────── n8n temp webhook (Sheets writes) ───────────
async function n8nReq(path: string, init: RequestInit = {}) {
  const r = await fetch(`${N8N_API}${path}`, {
    ...init,
    headers: { "X-N8N-API-KEY": N8N_KEY, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`n8n ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

// Full schemas for write operations (all sheet columns must be present)
const LEADS_COLUMNS = [
  "centre_id", "testing", "lead_id", "First", "Last", "Phone", "Email", "Tour", "Date", "Time",
  "CRM Confirm", "status", "attempt_count", "next_call_after", "last_outcome", "last_call_at",
  "attempt_1_at", "attempt_1_outcome", "attempt_2_at", "attempt_2_outcome",
  "attempt_3_at", "attempt_3_outcome", "attempt_4_at", "attempt_4_outcome",
];
const LOOKUP_COLUMNS = [
  "centre_id", "timezone", "enabled", "location_name", "from_number", "Testing",
  "test_number", "centre_email", "Director", "agent_id", "knowledge_base",
];

/**
 * Read a Google Sheet via a one-shot temp n8n webhook workflow.
 * Returns the rows as objects keyed by header name.
 */
async function sheetsReadViaN8n(opts: { sheetId: string; sheetName: string }): Promise<Array<Record<string, string>>> {
  const webhookId = `offb-r-${Date.now()}`;
  const wf = {
    name: `[TEMP] Offboard Sheets Read ${webhookId}`,
    nodes: [
      {
        parameters: { httpMethod: "POST", path: webhookId, responseMode: "lastNode", options: {} },
        id: "n1", name: "Webhook", type: "n8n-nodes-base.webhook",
        typeVersion: 2, position: [250, 300],
      },
      {
        parameters: {
          documentId: { __rl: true, value: opts.sheetId, mode: "id" },
          sheetName: { __rl: true, value: opts.sheetName, mode: "name" },
          options: {},
        },
        id: "n2", name: "Sheets", type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.7, position: [500, 300],
        credentials: { googleSheetsOAuth2Api: { id: SHEETS_READ_CRED, name: "Google Sheets account" } },
      },
      {
        parameters: { jsCode: "return [{ json: { rows: $input.all().map(i => i.json) } }];" },
        id: "n3", name: "Pack", type: "n8n-nodes-base.code",
        typeVersion: 2, position: [750, 300],
      },
    ],
    connections: {
      Webhook: { main: [[{ node: "Sheets", type: "main", index: 0 }]] },
      Sheets: { main: [[{ node: "Pack", type: "main", index: 0 }]] },
    },
    settings: { executionOrder: "v1" },
  };
  const created: any = await n8nReq("/workflows", { method: "POST", body: JSON.stringify(wf) });
  const wid = created.id;
  try {
    await n8nReq(`/workflows/${wid}/activate`, { method: "POST" });
    await new Promise(res => setTimeout(res, 1500));
    const hookUrl = `https://xprime17.app.n8n.cloud/webhook/${webhookId}`;
    const r = await fetch(hookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    if (!r.ok) throw new Error(`Read webhook: ${r.status} ${await r.text()}`);
    const j: any = await r.json();
    return j.rows ?? [];
  } finally {
    try { await n8nReq(`/workflows/${wid}/deactivate`, { method: "POST" }); } catch {}
    try { await n8nReq(`/workflows/${wid}`, { method: "DELETE" }); } catch {}
  }
}

/**
 * Mutate Google Sheets via a one-shot temp n8n webhook workflow.
 * Pattern: create → activate → POST payload → deactivate → delete.
 */
async function sheetsMutateViaN8n(opts: {
  sheetId: string;
  sheetName: string;
  matchColumn: string;
  rows: Array<Record<string, string>>;
  allColumns: string[];          // ALL columns in the sheet (for schema)
  writeColumns: string[];        // columns we actually write (others marked removed:true)
}): Promise<number> {
  const webhookId = `offb-w-${Date.now()}`;
  const valueMap = Object.fromEntries(
    opts.writeColumns.map(c => [c, `={{ $json["${c}"] }}`])
  );
  const schema = opts.allColumns.map(c => ({
    id: c, displayName: c, required: false, defaultMatch: c === opts.matchColumn,
    display: true, type: "string", canBeUsedToMatch: true,
    removed: !opts.writeColumns.includes(c),
  }));
  const wf = {
    name: `[TEMP] Offboard Sheets Write ${webhookId}`,
    nodes: [
      {
        parameters: { httpMethod: "POST", path: webhookId, responseMode: "lastNode", options: {} },
        id: "n1", name: "Webhook", type: "n8n-nodes-base.webhook",
        typeVersion: 2, position: [250, 300],
      },
      {
        parameters: { jsCode: "const p = $input.all()[0].json; const rows = p.body?.rows ?? p.rows ?? []; return rows.map(r => ({ json: r }));" },
        id: "n2", name: "Split", type: "n8n-nodes-base.code",
        typeVersion: 2, position: [500, 300],
      },
      {
        parameters: {
          operation: "appendOrUpdate",
          documentId: { __rl: true, value: opts.sheetId, mode: "id" },
          sheetName: { __rl: true, value: opts.sheetName, mode: "list" },
          columns: {
            mappingMode: "defineBelow",
            value: valueMap,
            matchingColumns: [opts.matchColumn],
            schema,
          },
          options: {},
        },
        id: "n3", name: "Sheets", type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.7, position: [750, 300],
        credentials: { googleSheetsOAuth2Api: { id: SHEETS_WRITE_CRED, name: "Google Sheets account" } },
      },
    ],
    connections: {
      Webhook: { main: [[{ node: "Split", type: "main", index: 0 }]] },
      Split: { main: [[{ node: "Sheets", type: "main", index: 0 }]] },
    },
    settings: { executionOrder: "v1" },
  };
  const created: any = await n8nReq("/workflows", { method: "POST", body: JSON.stringify(wf) });
  const wid = created.id;
  try {
    await n8nReq(`/workflows/${wid}/activate`, { method: "POST" });
    await new Promise(res => setTimeout(res, 1500));
    const hookUrl = `https://xprime17.app.n8n.cloud/webhook/${webhookId}`;
    const r = await fetch(hookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: opts.rows }),
    });
    if (!r.ok) throw new Error(`Webhook trigger: ${r.status} ${await r.text()}`);
    return opts.rows.length;
  } finally {
    try { await n8nReq(`/workflows/${wid}/deactivate`, { method: "POST" }); } catch {}
    try { await n8nReq(`/workflows/${wid}`, { method: "DELETE" }); } catch {}
  }
}

// ─────────── inventory ───────────
async function buildInventory(centreId: string): Promise<Inventory> {
  log(`reading Centre Lookup Sheet…`);
  const lookup = await readSheetCsv(CENTRE_LOOKUP_ID);
  const header = lookup[0];
  const idx = (k: string) => header.indexOf(k);
  const row = lookup.find(r => r[idx("centre_id")] === centreId);
  if (!row) throw new Error(`Centre ${centreId} not found in Centre Lookup Sheet`);
  const centre: CentreRow = {
    centre_id: row[idx("centre_id")],
    timezone: row[idx("timezone")],
    enabled: row[idx("enabled")].toUpperCase() === "TRUE",
    location_name: row[idx("location_name")],
    from_number: row[idx("from_number")],
    testing: row[idx("Testing")].toUpperCase() === "TRUE",
    test_number: row[idx("test_number")],
    centre_email: row[idx("centre_email")],
    director: row[idx("Director")],
    agent_id: row[idx("agent_id")],
    knowledge_base: row[idx("knowledge_base")],
  };

  log(`fetching Retell agent ${centre.agent_id.slice(0, 25)}…`);
  const agentResp: any = await retellGet(`/get-agent/${centre.agent_id}`);
  const agent = { agent_id: agentResp.agent_id, agent_name: agentResp.agent_name };

  log(`fetching Retell phone numbers…`);
  const phones: any[] = await retellGet(`/list-phone-numbers`);
  // Retell deprecated singular *_agent_id (removal after 2026-03-31) for weighted
  // *_agents arrays. Read from the array, falling back to legacy fields, and resolve
  // to a single agent_id so the inventory snapshot schema stays unchanged.
  const outAgent = (p: any) => p.outbound_agents?.[0]?.agent_id ?? p.outbound_agent_id ?? null;
  const inAgent = (p: any) => p.inbound_agents?.[0]?.agent_id ?? p.inbound_agent_id ?? null;
  const phoneRow = phones.find(p => outAgent(p) === centre.agent_id || inAgent(p) === centre.agent_id);
  const phone = phoneRow ? {
    phone_number: phoneRow.phone_number,
    outbound_agent_id: outAgent(phoneRow),
    inbound_agent_id: inAgent(phoneRow),
    nickname: phoneRow.nickname ?? "",
  } : { phone_number: "", outbound_agent_id: null, inbound_agent_id: null, nickname: "" };

  log(`reading Leads MasterSheet for active leads…`);
  const leadRows = await sheetsReadViaN8n({ sheetId: LEADS_SHEET_ID, sheetName: "All Centres" });
  const active_leads: Inventory["active_leads"] = [];
  for (const r of leadRows) {
    if ((r["centre_id"] ?? "") !== centreId) continue;
    const status = (r["status"] ?? "") as string;
    if (status !== "retry_pending" && status !== "calling") continue;
    active_leads.push({
      row: 0,
      lead_id: r["lead_id"] ?? "",
      first: r["First"] ?? "",
      last: r["Last"] ?? "",
      phone: r["Phone"] ?? "",
      status,
    });
  }

  log(`checking ClickUp space ${CLICKUP_VOICE_AI_SPACE}…`);
  let clickup_folder: Inventory["clickup_folder"];
  try {
    const r = await fetch(`https://api.clickup.com/api/v2/space/${CLICKUP_VOICE_AI_SPACE}/folder?archived=false`, {
      headers: { Authorization: CLICKUP_TOKEN },
    });
    if (r.ok) {
      const j: any = await r.json();
      const f = (j.folders ?? []).find((x: any) => x.name.toLowerCase() === centre.location_name.toLowerCase());
      if (f) clickup_folder = { id: f.id, name: f.name };
    }
  } catch (e) { /* non-fatal */ }

  return { centre, agent, phone, active_leads, clickup_folder };
}

// ─────────── inventory print ───────────
function printInventory(inv: Inventory) {
  hr();
  console.log(`CENTRE INVENTORY  —  ${inv.centre.location_name}  (${inv.centre.centre_id})`);
  hr();
  console.log(`  Director:        ${inv.centre.director} <${inv.centre.centre_email}>`);
  console.log(`  Timezone:        ${inv.centre.timezone}`);
  console.log(`  Enabled (now):   ${inv.centre.enabled}`);
  console.log(`  KB doc:          ${inv.centre.knowledge_base ? "yes" : "(none)"}`);
  console.log(`  Retell agent:    ${inv.agent.agent_name}  (${inv.agent.agent_id})`);
  console.log(`  Phone:           ${inv.phone.phone_number || "(unbound)"}  nick="${inv.phone.nickname}"`);
  console.log(`                   outbound→${inv.phone.outbound_agent_id ?? "null"}  inbound→${inv.phone.inbound_agent_id ?? "null"}`);
  console.log(`  Active leads:    ${inv.active_leads.length}  (statuses: retry_pending|calling)`);
  if (inv.active_leads.length) {
    inv.active_leads.slice(0, 5).forEach(l => console.log(`                   • ${l.lead_id}  ${l.first} ${l.last}  ${l.phone}  [${l.status}]`));
    if (inv.active_leads.length > 5) console.log(`                   …and ${inv.active_leads.length - 5} more`);
  }
  console.log(`  ClickUp folder:  ${inv.clickup_folder ? `${inv.clickup_folder.name} (${inv.clickup_folder.id})` : "(none)"}`);
  hr();
}

function printPlan(mode: Mode, inv: Inventory, followups: FollowupEntry[] = []) {
  console.log(`PROPOSED MUTATIONS  —  mode: ${mode}`);
  hr();
  if (mode === "reactivate") {
    console.log(`  • Set Centre Lookup enabled=TRUE for ${inv.centre.centre_id}`);
    console.log(`  • Strip [OFFBOARDED-…] prefix from agent name`);
    console.log(`  • Re-bind phone agent (from inventory.json snapshot)`);
    hr();
    return;
  }
  console.log(`  • Drain ${inv.active_leads.length} active leads → status=cancelled_offboard`);
  console.log(`  • Set Centre Lookup enabled=FALSE for ${inv.centre.centre_id}`);
  console.log(`  • Rename Retell agent → "[OFFBOARDED-${TODAY}] ${inv.agent.agent_name}"`);
  console.log(`  • Unbind phone ${inv.phone.phone_number} (clear outbound + inbound agent)`);
  if (mode === "hard") {
    console.log(`  • ⚠ DELETE Retell phone ${inv.phone.phone_number} (releases Twilio number — IRREVERSIBLE)`);
    console.log(`  • ⚠ Archive KB Google Doc (manual handoff: rename in Drive)`);
    if (inv.clickup_folder) console.log(`  • ⚠ Archive ClickUp folder ${inv.clickup_folder.name}`);
    console.log(`  • ⚠ Archive Cekura scenarios bound to agent (manual: invoke Cekura MCP after this run)`);
  }
  console.log(`  • Generate exit report at ${ARCHIVE_ROOT}/${inv.centre.centre_id}-${TODAY}/`);
  console.log(`  • Append audit log entry`);
  if (followups.length) console.log(`  • Email ${followups.length} manual followup${followups.length === 1 ? "" : "s"} to Scott`);
  hr();
  if (followups.length) printFollowups([...followups]);
}

// ─────────── prompts ───────────
async function confirm(prompt: string): Promise<boolean> {
  process.stdout.write(`${prompt} [y/N] `);
  for await (const line of console as any) {
    return line.trim().toLowerCase() === "y" || line.trim().toLowerCase() === "yes";
  }
  return false;
}

// ─────────── mutations ───────────
async function drainLeads(inv: Inventory): Promise<number> {
  if (!inv.active_leads.length) { ok(`drain: no active leads`); return 0; }
  const rows = inv.active_leads.map(l => ({
    lead_id: l.lead_id,
    status: "cancelled_offboard",
    last_outcome: `offboarded_${TODAY}`,
  }));
  const n = await sheetsMutateViaN8n({
    sheetId: LEADS_SHEET_ID,
    sheetName: "gid=0",
    matchColumn: "lead_id",
    rows,
    allColumns: LEADS_COLUMNS,
    writeColumns: ["lead_id", "status", "last_outcome"],
  });
  ok(`drain: ${n} leads → cancelled_offboard`);
  return n;
}

async function flipLookup(inv: Inventory, enabled: boolean): Promise<void> {
  await sheetsMutateViaN8n({
    sheetId: CENTRE_LOOKUP_ID,
    sheetName: "gid=0",
    matchColumn: "centre_id",
    rows: [{ centre_id: inv.centre.centre_id, enabled: enabled ? "TRUE" : "FALSE" }],
    allColumns: LOOKUP_COLUMNS,
    writeColumns: ["centre_id", "enabled"],
  });
  ok(`Centre Lookup: enabled=${enabled ? "TRUE" : "FALSE"}`);
}

async function renameAgent(inv: Inventory, prefix: boolean): Promise<string> {
  const tag = `[OFFBOARDED-${TODAY}] `;
  let newName: string;
  if (prefix) {
    newName = inv.agent.agent_name.startsWith("[OFFBOARDED-") ? inv.agent.agent_name : `${tag}${inv.agent.agent_name}`;
  } else {
    newName = inv.agent.agent_name.replace(/^\[OFFBOARDED-\d{4}-\d{2}-\d{2}\] /, "");
  }
  await retellPatch(`/update-agent/${inv.agent.agent_id}`, { agent_name: newName });
  ok(`agent renamed: "${newName}"`);
  return newName;
}

async function unbindPhone(inv: Inventory): Promise<void> {
  if (!inv.phone.phone_number) { ok(`phone: nothing to unbind`); return; }
  await retellPatch(`/update-phone-number/${inv.phone.phone_number}`, {
    // Empty weighted arrays unbind all agents (replaces deprecated *_agent_id: null).
    outbound_agents: [],
    inbound_agents: [],
  });
  ok(`phone ${inv.phone.phone_number}: unbound`);
}

async function rebindPhone(inv: Inventory, snapshot: any): Promise<void> {
  if (!inv.phone.phone_number) return;
  await retellPatch(`/update-phone-number/${inv.phone.phone_number}`, {
    // Rebuild weighted arrays from snapshotted agent ids (empty = was unbound).
    outbound_agents: snapshot.phone.outbound_agent_id ? [{ agent_id: snapshot.phone.outbound_agent_id, weight: 1 }] : [],
    inbound_agents: snapshot.phone.inbound_agent_id ? [{ agent_id: snapshot.phone.inbound_agent_id, weight: 1 }] : [],
  });
  ok(`phone ${inv.phone.phone_number}: re-bound to original agent`);
}

async function deletePhone(inv: Inventory): Promise<void> {
  if (!inv.phone.phone_number) return;
  await retellDelete(`/delete-phone-number/${inv.phone.phone_number}`);
  ok(`phone ${inv.phone.phone_number}: DELETED (Twilio number released)`);
}

async function archiveClickUpFolder(inv: Inventory): Promise<void> {
  if (!inv.clickup_folder) { ok(`ClickUp: no folder for ${inv.centre.location_name}`); return; }
  const r = await fetch(`https://api.clickup.com/api/v2/folder/${inv.clickup_folder.id}`, {
    method: "PUT",
    headers: { Authorization: CLICKUP_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ archived: true }),
  });
  if (!r.ok) throw new Error(`ClickUp archive: ${r.status} ${await r.text()}`);
  ok(`ClickUp folder ${inv.clickup_folder.name}: archived`);
}

// ─────────── exit report ───────────
async function generateExitReport(inv: Inventory, mode: Mode, actions: string[]): Promise<string> {
  const dir = `${ARCHIVE_ROOT}/${inv.centre.centre_id}-${TODAY}`;
  mkdirSync(dir, { recursive: true });

  // Pull last 100 calls from Retell for the agent
  log(`pulling Retell call history…`);
  let calls: any[] = [];
  try {
    const r = await fetch(`${RETELL_BASE}/v2/list-calls`, {
      method: "POST",
      headers: { Authorization: `Bearer ${RETELL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filter_criteria: { agent_id: [inv.agent.agent_id] }, limit: 100 }),
    });
    if (r.ok) calls = await r.json();
  } catch (e) { err(`call dump failed: ${(e as Error).message}`); }

  // Stats
  const realAreaCodes: Record<string, string[]> = {
    "ma-canton": ["508", "774", "617", "781"],
    "tx-spring-rayford": ["832", "713", "281", "346"],
    "tx-san-antonio-stone-oak-1": ["210", "726", "830"],
    "tx-round-rock-ryans-crossing": ["512", "737"],
    "east-gwillimbury-on-ca": ["905", "289", "365"],
    "leaside-on-ca": ["416", "647", "437"],
    "pickering-on-ca": ["905", "289", "365"],
    "ma-sudbury": ["508", "774", "978", "351"],
    "ct-riverside": ["203", "475", "860"],
    "burlington-on-ca": ["905", "289", "365"],
    "st-catharines-on-ca": ["905", "289"],
  };
  const acs = realAreaCodes[inv.centre.centre_id] ?? [];
  const isRealLead = (c: any) => {
    const lid = (c.metadata?.lead_id ?? "") as string;
    if (/AI-|Scott-|CEKURA|TEST|DUMMY/i.test(lid)) return false;
    const phone = (c.to_number ?? "") as string;
    if (!acs.length) return true;
    return acs.some(ac => phone.includes(`+1${ac}`));
  };
  const realCalls = calls.filter(isRealLead);
  const tours = realCalls.filter(c => c.call_analysis?.custom_analysis_data?.appointment_booked === true).length;
  const stats = {
    centre_id: inv.centre.centre_id,
    location_name: inv.centre.location_name,
    offboard_date: TODAY,
    offboard_mode: mode,
    total_calls: calls.length,
    real_calls: realCalls.length,
    tours_booked: tours,
    conversion_pct: realCalls.length ? +(tours / realCalls.length * 100).toFixed(2) : 0,
    last_call_date: calls[0]?.start_timestamp ? new Date(calls[0].start_timestamp).toISOString().slice(0, 10) : null,
  };

  writeFileSync(`${dir}/inventory.json`, JSON.stringify(inv, null, 2));
  writeFileSync(`${dir}/stats.json`, JSON.stringify(stats, null, 2));
  writeFileSync(`${dir}/calls-${inv.centre.centre_id}.json`, JSON.stringify(calls, null, 2));

  // Director email draft
  const draftEmail = `Subject: Voice AI pilot — ${inv.centre.location_name} offboarding

Hi ${inv.centre.director.split(" ")[0]},

Wrapping up the voice AI pilot for ${inv.centre.location_name} as of ${TODAY}.

Final numbers:
• Real leads called: ${stats.real_calls}
• Tours booked: ${stats.tours_booked}
• Conversion: ${stats.conversion_pct}%
• Last activity: ${stats.last_call_date ?? "N/A"}

What's been done on our end:
${actions.map(a => `• ${a}`).join("\n")}

What this means for you:
• No new leads will be called for ${inv.centre.location_name}
• Open leads in the queue have been cancelled
• Your phone number ${inv.phone.phone_number} ${mode === "hard" ? "has been released" : "is no longer routing to the agent"}

If you'd like to discuss results, pivot to inbound, or revisit later — happy to chat.

Scott
`;
  writeFileSync(`${dir}/director-email.md`, draftEmail);

  const readme = `# Offboarding Archive — ${inv.centre.location_name}

**Date**: ${TODAY}
**Mode**: ${mode}
**Centre ID**: ${inv.centre.centre_id}

## Actions Taken

${actions.map(a => `- ${a}`).join("\n")}

## Stats Snapshot

- Total Retell calls: ${stats.total_calls}
- Real leads (excluding tests): ${stats.real_calls}
- Tours booked: ${stats.tours_booked}
- Conversion: ${stats.conversion_pct}%
- Last call: ${stats.last_call_date ?? "N/A"}

## Files

- \`inventory.json\` — full pre-offboard state (used by Reactivate workflow)
- \`stats.json\` — conversion stats
- \`calls-${inv.centre.centre_id}.json\` — last 100 Retell calls
- \`director-email.md\` — DRAFT email to ${inv.centre.director} (NOT sent)

## To Reactivate (soft offboards only)

\`\`\`
bun ~/.claude/skills/_OFFBOARDCENTRE/Tools/Offboard.ts --centre ${inv.centre.centre_id} --mode reactivate
\`\`\`

## Manual Followups

${mode === "hard" ? `- Rename KB Google Doc: ${inv.centre.knowledge_base}
  → New title prefix: [ARCHIVED-${TODAY}]
- Cekura: invoke mcp__cekura__scenarios_list filtered by agent_id ${inv.agent.agent_id}, then folder-move to [Archived]
` : "- (none — soft mode only flips routing flags)"}
`;
  writeFileSync(`${dir}/README.md`, readme);
  ok(`exit report: ${dir}`);
  return dir;
}

// ─────────── manual followups registry ───────────
interface FollowupEntry {
  id: string;
  applies_to: Array<"soft" | "hard">;
  condition: string;
  title: string;
  where: string;
  details: string;
  urgency: string;
}

function loadFollowups(): FollowupEntry[] {
  const md = readFileSync(FOLLOWUPS_FILE, "utf8");
  const m = md.match(/```FOLLOWUPS_JSON\n([\s\S]*?)\n```/);
  if (!m) throw new Error("ManualFollowups.md missing FOLLOWUPS_JSON block");
  return JSON.parse(m[1]);
}

function applyTemplate(s: string, inv: Inventory): string {
  const kbUrl = inv.centre.knowledge_base || "(no KB)";
  return s
    .replaceAll("{centre_id}", inv.centre.centre_id)
    .replaceAll("{location_name}", inv.centre.location_name)
    .replaceAll("{director}", inv.centre.director)
    .replaceAll("{centre_email}", inv.centre.centre_email)
    .replaceAll("{phone_number}", inv.phone.phone_number || "(no phone)")
    .replaceAll("{agent_id}", inv.agent.agent_id)
    .replaceAll("{agent_name}", inv.agent.agent_name)
    .replaceAll("{kb_url}", kbUrl)
    .replaceAll("{date}", TODAY);
}

function checkCondition(cond: string, inv: Inventory): boolean {
  switch (cond) {
    case "always": return true;
    case "has_phone": return !!inv.phone.phone_number;
    case "has_kb": return !!inv.centre.knowledge_base;
    case "has_clickup": return !!inv.clickup_folder;
    case "has_cekura": return true; // we don't enumerate Cekura inline; assume possible
    case "is_inbound": return !!inv.phone.inbound_agent_id;
    default: return true;
  }
}

function selectFollowups(mode: Mode, inv: Inventory): FollowupEntry[] {
  if (mode === "reactivate") return [];
  return loadFollowups()
    .filter(f => f.applies_to.includes(mode))
    .filter(f => checkCondition(f.condition, inv))
    .map(f => ({
      ...f,
      title: applyTemplate(f.title, inv),
      where: applyTemplate(f.where, inv),
      details: applyTemplate(f.details, inv),
    }));
}

function printFollowups(items: FollowupEntry[]) {
  if (!items.length) return;
  hr();
  console.log(`MANUAL FOLLOWUPS  —  ${items.length} item${items.length === 1 ? "" : "s"} Scott handles by hand`);
  hr();
  const urgencyOrder = ["before_call_routing_changes", "within_24h", "within_week", "whenever"];
  items.sort((a, b) => urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency));
  for (const f of items) {
    console.log(`  ☐ [${f.urgency}] ${f.title}`);
    console.log(`     where: ${f.where}`);
    console.log(`     ${f.details}`);
  }
  hr();
}

function followupsMarkdown(items: FollowupEntry[], inv: Inventory, mode: Mode): string {
  const urgencyOrder = ["before_call_routing_changes", "within_24h", "within_week", "whenever"];
  items.sort((a, b) => urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency));
  const lines = [`# Manual Followups — ${inv.centre.location_name} (${mode})`, "",
    `**Centre**: ${inv.centre.centre_id} · **Date**: ${TODAY} · **Mode**: ${mode}`, "",
    `${items.length} action${items.length === 1 ? "" : "s"} below. Tick each off as you handle them.`, ""];
  for (const f of items) {
    lines.push(`## ☐ ${f.title}`);
    lines.push(`- **Urgency**: ${f.urgency}`);
    lines.push(`- **Where**: ${f.where}`);
    lines.push(`- **Details**: ${f.details}`);
    lines.push("");
  }
  return lines.join("\n");
}

async function emailFollowups(items: FollowupEntry[], inv: Inventory, mode: Mode, reportDir: string): Promise<void> {
  const urgencyColor: Record<string, string> = {
    "before_call_routing_changes": "#dc2626",
    "within_24h": "#ea580c",
    "within_week": "#ca8a04",
    "whenever": "#65a30d",
  };
  const urgencyOrder = ["before_call_routing_changes", "within_24h", "within_week", "whenever"];
  items.sort((a, b) => urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency));

  const rows = items.map(f => `
    <li style="margin-bottom:14px;padding:10px;background:#f8fafc;border-left:3px solid ${urgencyColor[f.urgency] ?? "#64748b"};border-radius:4px">
      <div style="font-weight:600;color:#0f172a">☐ ${escapeHtml(f.title)}</div>
      <div style="font-size:12px;color:${urgencyColor[f.urgency] ?? "#64748b"};margin:4px 0;text-transform:uppercase;letter-spacing:0.5px">${f.urgency.replaceAll("_", " ")}</div>
      <div style="font-size:13px;color:#475569;margin:4px 0"><b>Where:</b> ${escapeHtml(f.where)}</div>
      <div style="font-size:13px;color:#334155">${escapeHtml(f.details)}</div>
    </li>`).join("");

  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:20px;color:#1e293b">
<h1 style="color:#0f172a">${escapeHtml(inv.centre.location_name)} offboarded (${mode})</h1>
<p>The skill handled everything it could. <b>${items.length} item${items.length === 1 ? "" : "s"} need your hands</b> below — vendors and admin tasks outside the automation reach.</p>
<p style="font-size:13px;color:#64748b">Centre: <code>${inv.centre.centre_id}</code> · Date: ${TODAY} · Exit report: <code>${reportDir}</code></p>
<h2 style="color:#0f172a;border-bottom:2px solid #cbd5e1;padding-bottom:6px">Checklist</h2>
<ol style="list-style:none;padding:0">${rows}</ol>
<p style="color:#64748b;font-size:12px;margin-top:24px">Generated by Poseidon · _OFFBOARDCENTRE skill</p>
</body></html>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      from: "Poseidon <onboarding@resend.dev>",
      to: SCOTT_EMAIL,
      subject: `[Offboard ${mode}] ${inv.centre.location_name} — ${items.length} manual item${items.length === 1 ? "" : "s"}`,
      html,
    }),
  });
  if (!r.ok) throw new Error(`Resend: ${r.status} ${await r.text()}`);
  const j: any = await r.json();
  ok(`followups email sent (id=${j.id})`);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function appendAuditLog(entry: Record<string, unknown>) {
  mkdirSync(ARCHIVE_ROOT, { recursive: true });
  appendFileSync(AUDIT_LOG, JSON.stringify({ ts: new Date().toISOString(), actor: "poseidon", ...entry }) + "\n");
}

// ─────────── reactivate path ───────────
function findLatestExitReport(centreId: string): string | null {
  if (!existsSync(ARCHIVE_ROOT)) return null;
  const dirs = readdirSync(ARCHIVE_ROOT)
    .filter(d => d.startsWith(`${centreId}-`))
    .sort()
    .reverse();
  for (const d of dirs) {
    const p = join(ARCHIVE_ROOT, d, "inventory.json");
    if (existsSync(p)) return p;
  }
  return null;
}

function lastModeForCentre(centreId: string): Mode | null {
  if (!existsSync(AUDIT_LOG)) return null;
  const lines = readFileSync(AUDIT_LOG, "utf8").trim().split("\n").reverse();
  for (const line of lines) {
    try {
      const j = JSON.parse(line);
      if (j.centre_id === centreId) return j.mode;
    } catch {}
  }
  return null;
}

// ─────────── main ───────────
async function main() {
  console.log(`\n_OFFBOARDCENTRE — ${mode.toUpperCase()} mode  ${values["dry-run"] ? "[DRY RUN]" : ""}\n`);

  const inv = await buildInventory(values.centre!);
  const followups = selectFollowups(mode, inv);
  printInventory(inv);
  printPlan(mode, inv, followups);

  if (values["dry-run"]) {
    console.log("DRY RUN complete. Re-run without --dry-run to execute.\n");
    process.exit(0);
  }

  // Confirmations
  if (!values.yes) {
    if (!await confirm(`Proceed with ${mode} offboard of ${inv.centre.location_name}?`)) {
      err("aborted by user"); process.exit(1);
    }
  }
  if (mode === "hard" && !values["hard-i-know"]) {
    console.log("\n⚠ HARD MODE — irreversible actions ahead:");
    console.log(`  • Twilio number ${inv.phone.phone_number} will be released to carrier pool`);
    console.log(`  • Cekura scenarios will require manual archival`);
    console.log(`  • KB doc rename will require manual handoff in Drive`);
    if (!await confirm(`Type 'yes' to confirm IRREVERSIBLE hard offboard:`)) {
      err("hard offboard aborted"); process.exit(1);
    }
  }

  // Reactivate path
  if (mode === "reactivate") {
    const reportPath = findLatestExitReport(inv.centre.centre_id);
    if (!reportPath) { err(`no exit report found for ${inv.centre.centre_id}`); process.exit(1); }
    const lastMode = lastModeForCentre(inv.centre.centre_id);
    if (lastMode === "hard") {
      err(`last offboard for ${inv.centre.centre_id} was HARD — cannot reactivate. Re-onboard fresh.`);
      process.exit(1);
    }
    log(`loading snapshot from ${reportPath}`);
    const snapshot = JSON.parse(readFileSync(reportPath, "utf8"));
    await flipLookup(inv, true);
    inv.agent.agent_name = inv.agent.agent_name; // already loaded
    await renameAgent(inv, false);
    await rebindPhone(inv, snapshot);
    appendAuditLog({ mode: "reactivate", centre_id: inv.centre.centre_id, reactivated_from: reportPath, actions: ["lookup_enabled", "agent_unrenamed", "phone_rebound"] });
    console.log("\n✓ Reactivate complete.\n");
    return;
  }

  // Soft + Hard execution (shared steps)
  const actions: string[] = [];
  try {
    const drained = await drainLeads(inv);
    actions.push(`drained ${drained} active leads`);
    await flipLookup(inv, false);
    actions.push("centre lookup disabled");
    const newName = await renameAgent(inv, true);
    actions.push(`agent renamed → "${newName}"`);
    await unbindPhone(inv);
    actions.push("phone unbound from agent");

    if (mode === "hard") {
      await deletePhone(inv);
      actions.push(`phone ${inv.phone.phone_number} DELETED (Twilio released)`);
      if (inv.clickup_folder) {
        await archiveClickUpFolder(inv);
        actions.push(`ClickUp folder ${inv.clickup_folder.name} archived`);
      }
      todo(`Rename KB doc → "[ARCHIVED-${TODAY}] ..." at ${inv.centre.knowledge_base}`);
      todo(`Cekura: invoke mcp__cekura__scenarios_list (agent_id=${inv.agent.agent_id}) then folder-move to "[Archived]"`);
      actions.push("manual followups: KB rename + Cekura archival logged in README");
    }

    const reportDir = await generateExitReport(inv, mode, actions);

    // Write manual followups checklist + email Scott
    if (followups.length) {
      writeFileSync(`${reportDir}/manual-followups.md`, followupsMarkdown([...followups], inv, mode));
      ok(`manual-followups.md written (${followups.length} items)`);
      try {
        await emailFollowups([...followups], inv, mode, reportDir);
        actions.push(`emailed ${followups.length} manual followups to ${SCOTT_EMAIL}`);
      } catch (e) {
        err(`followups email failed: ${(e as Error).message} — checklist still saved at ${reportDir}/manual-followups.md`);
      }
    }

    appendAuditLog({ mode, centre_id: inv.centre.centre_id, actions, exit_report: reportDir, manual_followups: followups.length, irreversible: mode === "hard" });
    console.log(`\n✓ ${mode} offboard complete. Exit report: ${reportDir}\n`);
  } catch (e) {
    err(`offboard failed mid-execution: ${(e as Error).message}`);
    appendAuditLog({ mode, centre_id: inv.centre.centre_id, actions, error: (e as Error).message, partial: true });
    console.log(`\n⚠ Partial state — see audit log. Reactivate with --mode reactivate to attempt rollback.\n`);
    process.exit(1);
  }
}

main().catch(e => { err(`fatal: ${e.message}`); process.exit(1); });
