#!/usr/bin/env bun

/**
 * SyncPrompt - Batch-sync CNKB prompt to all centre clone LLMs
 *
 * Reads the general_prompt and begin_message from the source LLM (original CNKB)
 * and pushes them to all clone LLMs. Each clone has its own LLM copy because
 * Retell pins agents to a specific LLM version and blocks version changes.
 *
 * Usage:
 *   bun SyncPrompt.ts                  # Dry-run: show diff, don't push
 *   bun SyncPrompt.ts --push           # Push changes to all clones
 *   bun SyncPrompt.ts --status         # Show sync status of all clones
 *   bun SyncPrompt.ts --push --only Canton,Rayford   # Push to specific clones only
 *
 * @version 1.0.0
 */

import { parseArgs } from "util";

// ── Configuration ────────────────────────────────────────────────

const RETELL_API_KEY = process.env.RETELL_API_KEY ?? "key_eb01765f71b0a93b347d324af573";
const RETELL_BASE = "https://api.retellai.com";

const SOURCE_LLM = {
  name: "CN /w KB (East Gwillimbury)",
  llm_id: "llm_44111168b1a2a469f50891b26e34",
  agent_id: "agent_0c6c32b61cb506fefb6ac247f4",
};

interface CloneEntry {
  name: string;
  agent_id: string;
  llm_id: string;
}

const CLONES: CloneEntry[] = [
  { name: "Canton",     agent_id: "agent_f10e56ab67fddf22bd60def599", llm_id: "llm_d25bbc493b20eb095ab92bceb116" },
  { name: "StoneOak",   agent_id: "agent_cd531f218c39d6125098cf7abc", llm_id: "llm_c26de057ffe1ff9a71366e95c447" },
  { name: "RoundRock",  agent_id: "agent_d06452d16a225cfbf207890350", llm_id: "llm_7b795d82b19f42562ef0abaf857f" },
  { name: "Rayford",    agent_id: "agent_9c1c8996e054e87f6b76aa8a0a", llm_id: "llm_118c93e692e7255083a56043c3e9" },
  { name: "Burlington", agent_id: "agent_2f5419fc0c45a24a02bb820cce", llm_id: "llm_97ac9c35e7387a448b927ce509b6" },
  { name: "Pickering",  agent_id: "agent_9d24e87943bc3b8105261bf308", llm_id: "llm_9b4bcc9bd77a2bd3c3c04ed579b1" },
];

// ── CLI ──────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    push:   { type: "boolean", default: false },
    status: { type: "boolean", default: false },
    only:   { type: "string" },
    help:   { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (values.help) {
  console.log(`
SyncPrompt — Batch-sync CNKB prompt to all centre clone LLMs

USAGE
  bun SyncPrompt.ts                          Dry-run: show what would change
  bun SyncPrompt.ts --push                   Push source prompt to all clones
  bun SyncPrompt.ts --status                 Show sync status (in-sync / drift)
  bun SyncPrompt.ts --push --only Canton     Push to specific clone(s) only
  bun SyncPrompt.ts --push --only Canton,Rayford

OPTIONS
  --push          Actually write changes (default is dry-run)
  --status        Compare all clones against source, show drift
  --only NAME     Comma-separated clone names to target (default: all)
  -h, --help      Show this help

ARCHITECTURE
  Source LLM:  ${SOURCE_LLM.name} (${SOURCE_LLM.llm_id})
  Clones:      ${CLONES.map(c => c.name).join(", ")}

  Each clone has its own LLM copy. This tool reads the source prompt
  and pushes it to clone LLMs. The source is always the original CNKB
  LLM — edit the prompt there first, then run this tool to distribute.

FIELDS SYNCED
  - general_prompt    (the full system prompt)
  - begin_message     (the opening line)

FIELDS NOT SYNCED (clone-independent)
  - Dynamic variables (LOCATION_NAME, SLOTS, etc.) — set per-agent
  - Voice, language, webhook — set per-agent
  - Knowledge base IDs — shared across all
`);
  process.exit(0);
}

// ── Retell API helpers ───────────────────────────────────────────

interface LLMData {
  llm_id: string;
  general_prompt: string;
  begin_message: string;
  version: number;
  last_modification_timestamp: number;
}

async function getLLM(llm_id: string): Promise<LLMData> {
  const res = await fetch(`${RETELL_BASE}/get-retell-llm/${llm_id}`, {
    headers: { Authorization: `Bearer ${RETELL_API_KEY}` },
  });
  if (!res.ok) throw new Error(`GET LLM ${llm_id}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<LLMData>;
}

async function updateLLM(llm_id: string, payload: { general_prompt: string; begin_message: string }): Promise<LLMData> {
  const res = await fetch(`${RETELL_BASE}/update-retell-llm/${llm_id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${RETELL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PATCH LLM ${llm_id}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<LLMData>;
}

// ── Diff helpers ─────────────────────────────────────────────────

function promptHash(text: string): string {
  const h = new Bun.CryptoHasher("sha256");
  h.update(text);
  return h.digest("hex").slice(0, 12);
}

function shortDiff(source: string, target: string): string {
  if (source === target) return "identical";
  const srcLen = source.length;
  const tgtLen = target.length;
  const lenDiff = srcLen - tgtLen;
  const sign = lenDiff > 0 ? "+" : "";
  return `${sign}${lenDiff} chars (source: ${srcLen}, target: ${tgtLen})`;
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const targets = filterClones();

  if (values.status) {
    await showStatus(targets);
  } else {
    await syncPrompt(targets);
  }
}

function filterClones(): CloneEntry[] {
  if (!values.only) return CLONES;
  const names = values.only.split(",").map(n => n.trim().toLowerCase());
  const filtered = CLONES.filter(c => names.includes(c.name.toLowerCase()));
  if (filtered.length === 0) {
    console.error(`No clones matched: ${values.only}`);
    console.error(`Available: ${CLONES.map(c => c.name).join(", ")}`);
    process.exit(1);
  }
  return filtered;
}

async function showStatus(targets: CloneEntry[]) {
  console.log("Fetching source LLM...");
  const source = await getLLM(SOURCE_LLM.llm_id);
  const srcPromptHash = promptHash(source.general_prompt);
  const srcBeginHash = promptHash(source.begin_message);

  console.log(`\nSource: ${SOURCE_LLM.name}`);
  console.log(`  LLM:    ${SOURCE_LLM.llm_id}`);
  console.log(`  Ver:    ${source.version}`);
  console.log(`  Prompt: ${source.general_prompt.length} chars (${srcPromptHash})`);
  console.log(`  Begin:  ${source.begin_message.length} chars (${srcBeginHash})`);
  console.log();

  let inSync = 0;
  let drifted = 0;

  for (const clone of targets) {
    try {
      const cloneLLM = await getLLM(clone.llm_id);
      const clonePromptHash = promptHash(cloneLLM.general_prompt);
      const cloneBeginHash = promptHash(cloneLLM.begin_message);

      const promptMatch = clonePromptHash === srcPromptHash;
      const beginMatch = cloneBeginHash === srcBeginHash;

      if (promptMatch && beginMatch) {
        console.log(`  ${clone.name.padEnd(14)} IN SYNC  (${clonePromptHash})`);
        inSync++;
      } else {
        const issues: string[] = [];
        if (!promptMatch) issues.push(`prompt: ${shortDiff(source.general_prompt, cloneLLM.general_prompt)}`);
        if (!beginMatch) issues.push(`begin: ${shortDiff(source.begin_message, cloneLLM.begin_message)}`);
        console.log(`  ${clone.name.padEnd(14)} DRIFTED  ${issues.join(" | ")}`);
        drifted++;
      }
    } catch (err: any) {
      console.log(`  ${clone.name.padEnd(14)} ERROR    ${err.message}`);
      drifted++;
    }
  }

  console.log(`\n${inSync} in sync, ${drifted} drifted out of ${targets.length} clones`);
}

async function syncPrompt(targets: CloneEntry[]) {
  const isDryRun = !values.push;

  console.log(isDryRun ? "DRY RUN — no changes will be made\n" : "PUSH MODE — changes will be written\n");

  // Fetch source
  console.log("Fetching source LLM...");
  const source = await getLLM(SOURCE_LLM.llm_id);
  console.log(`  Source: ${SOURCE_LLM.name} v${source.version}`);
  console.log(`  Prompt: ${source.general_prompt.length} chars`);
  console.log(`  Begin:  "${source.begin_message.slice(0, 80)}..."`);
  console.log();

  // Process each clone
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const clone of targets) {
    process.stdout.write(`  ${clone.name.padEnd(14)} `);

    try {
      const cloneLLM = await getLLM(clone.llm_id);

      const promptMatch = cloneLLM.general_prompt === source.general_prompt;
      const beginMatch = cloneLLM.begin_message === source.begin_message;

      if (promptMatch && beginMatch) {
        console.log("SKIP     already in sync");
        skipped++;
        continue;
      }

      // Show what differs
      const changes: string[] = [];
      if (!promptMatch) changes.push(`prompt ${shortDiff(source.general_prompt, cloneLLM.general_prompt)}`);
      if (!beginMatch) changes.push(`begin_message differs`);

      if (isDryRun) {
        console.log(`WOULD UPDATE  (${changes.join(", ")})`);
        updated++;
      } else {
        await updateLLM(clone.llm_id, {
          general_prompt: source.general_prompt,
          begin_message: source.begin_message,
        });
        console.log(`UPDATED  (${changes.join(", ")})`);
        updated++;
      }
    } catch (err: any) {
      console.log(`FAILED   ${err.message}`);
      failed++;
    }
  }

  // Summary
  console.log();
  if (isDryRun) {
    console.log(`Dry run complete: ${updated} would update, ${skipped} already in sync, ${failed} failed`);
    if (updated > 0) {
      console.log("\nRun with --push to apply changes.");
    }
  } else {
    console.log(`Sync complete: ${updated} updated, ${skipped} already in sync, ${failed} failed`);
  }
}

// ── Run ──────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
