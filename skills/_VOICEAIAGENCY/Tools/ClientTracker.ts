#!/usr/bin/env bun

/**
 * ClientTracker - Voice AI Agency Client Lifecycle Management
 *
 * JSON-backed client database for tracking agency clients through
 * the lifecycle: prospect → onboarding → active → churned.
 *
 * Usage:
 *   bun run ClientTracker.ts add --name "Smile Dental" --niche dental --status prospect
 *   bun run ClientTracker.ts get --name "Smile Dental"
 *   bun run ClientTracker.ts update --name "Smile Dental" --status active
 *   bun run ClientTracker.ts list
 *   bun run ClientTracker.ts list --status active
 *   bun run ClientTracker.ts remove --name "Smile Dental"
 *
 * @version 1.0.0
 */

import { parseArgs } from "util";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const HOME = process.env.HOME || "/root";
const DATA_DIR = `${HOME}/.claude/skills/_VOICEAIAGENCY/Data`;
const DATA_FILE = `${DATA_DIR}/clients.json`;

interface Client {
  name: string;
  niche: string;
  status: "prospect" | "onboarding" | "active" | "paused" | "churned";
  contact?: string;
  email?: string;
  phone?: string;
  tier?: string;
  setupDate?: string;
  launchDate?: string;
  lastReport?: string;
  healthScore?: number;
  monthlyRetainer?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientDB {
  clients: Client[];
  version: string;
}

function loadDB(): ClientDB {
  if (!existsSync(DATA_FILE)) {
    return { clients: [], version: "1.0.0" };
  }
  const content = readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(content) as ClientDB;
}

function saveDB(db: ClientDB): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function findClient(db: ClientDB, name: string): Client | undefined {
  return db.clients.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

function formatClient(c: Client): string {
  const lines: string[] = [];
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`  ${c.name}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`  Niche:     ${c.niche}`);
  lines.push(`  Status:    ${c.status.toUpperCase()}`);
  if (c.tier) lines.push(`  Tier:      ${c.tier}`);
  if (c.contact) lines.push(`  Contact:   ${c.contact}`);
  if (c.email) lines.push(`  Email:     ${c.email}`);
  if (c.phone) lines.push(`  Phone:     ${c.phone}`);
  if (c.monthlyRetainer) lines.push(`  Retainer:  $${c.monthlyRetainer}/mo`);
  if (c.healthScore !== undefined) lines.push(`  Health:    ${c.healthScore}/100`);
  if (c.setupDate) lines.push(`  Setup:     ${c.setupDate}`);
  if (c.launchDate) lines.push(`  Launch:    ${c.launchDate}`);
  if (c.lastReport) lines.push(`  Last Rpt:  ${c.lastReport}`);
  if (c.notes) lines.push(`  Notes:     ${c.notes}`);
  lines.push(`  Created:   ${c.createdAt}`);
  lines.push(`  Updated:   ${c.updatedAt}`);
  return lines.join("\n");
}

async function main() {
  const args = Bun.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(`
ClientTracker - Voice AI Agency Client Lifecycle Management

USAGE:
  bun run ClientTracker.ts <command> [options]

COMMANDS:
  add       Add a new client
  get       Get client details
  update    Update client fields
  list      List all clients (optionally filter by status)
  remove    Remove a client
  stats     Show agency statistics

OPTIONS (for add/update):
  --name <name>           Client/business name (required)
  --niche <niche>         Industry niche
  --status <status>       prospect | onboarding | active | paused | churned
  --contact <name>        Primary contact person
  --email <email>         Contact email
  --phone <phone>         Contact phone
  --tier <tier>           starter | professional | enterprise
  --retainer <amount>     Monthly retainer amount
  --health-score <0-100>  Client health score
  --setup-date <date>     Setup date
  --launch-date <date>    Launch date
  --last-report <date>    Last report date
  --notes <text>          Free-text notes

OPTIONS (for list):
  --status <status>       Filter by status

EXAMPLES:
  # Add a new prospect
  bun run ClientTracker.ts add --name "Smile Dental" --niche dental --status prospect

  # Onboard a client
  bun run ClientTracker.ts update --name "Smile Dental" --status onboarding --tier professional

  # Check client details
  bun run ClientTracker.ts get --name "Smile Dental"

  # List active clients
  bun run ClientTracker.ts list --status active

  # Agency stats
  bun run ClientTracker.ts stats
`);
    return;
  }

  // Parse remaining args
  const { values } = parseArgs({
    args: args.slice(1),
    options: {
      name: { type: "string" },
      niche: { type: "string" },
      status: { type: "string" },
      contact: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      tier: { type: "string" },
      retainer: { type: "string" },
      "health-score": { type: "string" },
      "setup-date": { type: "string" },
      "launch-date": { type: "string" },
      "last-report": { type: "string" },
      notes: { type: "string" },
      output: { type: "string", short: "o", default: "text" },
    },
  });

  const db = loadDB();
  const now = new Date().toISOString().split("T")[0];

  switch (command) {
    case "add": {
      if (!values.name) {
        console.error("Error: --name is required");
        process.exit(1);
      }
      if (findClient(db, values.name)) {
        console.error(`Error: Client "${values.name}" already exists. Use 'update' instead.`);
        process.exit(1);
      }
      const newClient: Client = {
        name: values.name,
        niche: values.niche || "unknown",
        status: (values.status as Client["status"]) || "prospect",
        contact: values.contact,
        email: values.email,
        phone: values.phone,
        tier: values.tier,
        monthlyRetainer: values.retainer ? parseFloat(values.retainer) : undefined,
        healthScore: values["health-score"] ? parseInt(values["health-score"]) : undefined,
        setupDate: values["setup-date"],
        launchDate: values["launch-date"],
        lastReport: values["last-report"],
        notes: values.notes,
        createdAt: now,
        updatedAt: now,
      };
      db.clients.push(newClient);
      saveDB(db);

      if (values.output === "json") {
        console.log(JSON.stringify(newClient, null, 2));
      } else {
        console.log(`✅ Added client: ${newClient.name} (${newClient.status})`);
      }
      break;
    }

    case "get": {
      if (!values.name) {
        console.error("Error: --name is required");
        process.exit(1);
      }
      const client = findClient(db, values.name);
      if (!client) {
        console.error(`Error: Client "${values.name}" not found`);
        process.exit(1);
      }
      if (values.output === "json") {
        console.log(JSON.stringify(client, null, 2));
      } else {
        console.log(formatClient(client));
      }
      break;
    }

    case "update": {
      if (!values.name) {
        console.error("Error: --name is required");
        process.exit(1);
      }
      const idx = db.clients.findIndex(
        (c) => c.name.toLowerCase() === values.name!.toLowerCase()
      );
      if (idx === -1) {
        console.error(`Error: Client "${values.name}" not found`);
        process.exit(1);
      }
      const client = db.clients[idx];
      if (values.niche) client.niche = values.niche;
      if (values.status) client.status = values.status as Client["status"];
      if (values.contact) client.contact = values.contact;
      if (values.email) client.email = values.email;
      if (values.phone) client.phone = values.phone;
      if (values.tier) client.tier = values.tier;
      if (values.retainer) client.monthlyRetainer = parseFloat(values.retainer);
      if (values["health-score"]) client.healthScore = parseInt(values["health-score"]);
      if (values["setup-date"]) client.setupDate = values["setup-date"];
      if (values["launch-date"]) client.launchDate = values["launch-date"];
      if (values["last-report"]) client.lastReport = values["last-report"];
      if (values.notes) client.notes = values.notes;
      client.updatedAt = now;
      saveDB(db);

      if (values.output === "json") {
        console.log(JSON.stringify(client, null, 2));
      } else {
        console.log(`✅ Updated client: ${client.name}`);
      }
      break;
    }

    case "list": {
      let clients = db.clients;
      if (values.status) {
        clients = clients.filter((c) => c.status === values.status);
      }

      if (values.output === "json") {
        console.log(JSON.stringify(clients, null, 2));
        return;
      }

      if (clients.length === 0) {
        console.log("No clients found.");
        return;
      }

      console.log(`\n  CLIENTS${values.status ? ` (${values.status})` : ""}: ${clients.length} total\n`);
      console.log(
        "  " +
          "Name".padEnd(25) +
          "Niche".padEnd(15) +
          "Status".padEnd(12) +
          "Tier".padEnd(15) +
          "Health"
      );
      console.log("  " + "─".repeat(75));
      for (const c of clients) {
        console.log(
          "  " +
            c.name.padEnd(25) +
            c.niche.padEnd(15) +
            c.status.padEnd(12) +
            (c.tier || "-").padEnd(15) +
            (c.healthScore !== undefined ? `${c.healthScore}/100` : "-")
        );
      }
      break;
    }

    case "remove": {
      if (!values.name) {
        console.error("Error: --name is required");
        process.exit(1);
      }
      const removeIdx = db.clients.findIndex(
        (c) => c.name.toLowerCase() === values.name!.toLowerCase()
      );
      if (removeIdx === -1) {
        console.error(`Error: Client "${values.name}" not found`);
        process.exit(1);
      }
      const removed = db.clients.splice(removeIdx, 1)[0];
      saveDB(db);
      console.log(`✅ Removed client: ${removed.name}`);
      break;
    }

    case "stats": {
      const statusCounts: Record<string, number> = {};
      let totalRetainer = 0;
      let avgHealth = 0;
      let healthCount = 0;

      for (const c of db.clients) {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
        if (c.monthlyRetainer && c.status === "active") {
          totalRetainer += c.monthlyRetainer;
        }
        if (c.healthScore !== undefined && c.status === "active") {
          avgHealth += c.healthScore;
          healthCount++;
        }
      }

      if (values.output === "json") {
        console.log(JSON.stringify({
          totalClients: db.clients.length,
          byStatus: statusCounts,
          mrr: totalRetainer,
          avgHealthScore: healthCount > 0 ? Math.round(avgHealth / healthCount) : null,
        }, null, 2));
        return;
      }

      console.log(`\n${"═".repeat(40)}`);
      console.log(`  AGENCY STATISTICS`);
      console.log(`${"═".repeat(40)}`);
      console.log(`\n  Total Clients:  ${db.clients.length}`);
      for (const [status, count] of Object.entries(statusCounts)) {
        console.log(`    ${status.padEnd(15)} ${count}`);
      }
      console.log(`\n  MRR (active):   $${totalRetainer.toLocaleString()}`);
      if (healthCount > 0) {
        console.log(`  Avg Health:     ${Math.round(avgHealth / healthCount)}/100`);
      }
      console.log();
      break;
    }

    default:
      console.error(`Unknown command: ${command}. Use --help for usage.`);
      process.exit(1);
  }
}

main().catch(console.error);
