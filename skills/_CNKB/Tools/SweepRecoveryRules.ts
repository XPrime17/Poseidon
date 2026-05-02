#!/usr/bin/env bun
/**
 * SweepRecoveryRules.ts
 *
 * Sweeps the EG-inbound improvements into the rest of the active agent fleet:
 * 1. Pending-question recovery rule → spliced into "## Communication Style"
 * 2. Mid-call identity-question rule → spliced into "## Identity"
 * 3. boosted_keywords → PATCHed onto the agent (per-centre name token)
 *
 * Inbound agents also get the Option A disclosure swapped into begin_message.
 *
 * Strategy:
 *   - Surgical string splices (idempotent — checks for marker before inserting).
 *   - Inbound agents (CNKB-EG-Inbound is the reference) get the Option A
 *     disclosure swapped into begin_message.
 *   - Outbound agents already have AI/recorded disclosure in Stage 1; we leave
 *     begin_message alone.
 *   - Skips agents tagged [OFFBOARDED-...].
 *
 * Run:  bun /root/.claude/skills/_CNKB/Tools/SweepRecoveryRules.ts [--dry]
 */

const RETELL_KEY = process.env.RETELL_API_KEY;
if (!RETELL_KEY) {
  console.error("ERROR: RETELL_API_KEY env var not set");
  process.exit(1);
}
const DRY = process.argv.includes("--dry");

const RECOVERY_RULE_MARKER = "Pending-question recovery (CRITICAL)";
const IDENTITY_MARKER = "Mid-call identity questions";

const RECOVERY_RULE_BULLET =
  `- **${RECOVERY_RULE_MARKER}:** If the caller's reply doesn't match the question you just asked, FIRST consider that it may be a misheard short confirmation. Common phone-call confirmations that get mistranscribed: "it is" → "who's this", "yep" → "yeah", "that's me" → "that's mean", "speaking" → "speak in", "uh-huh" → "uh huh". If you JUST asked a yes/no question (especially "is this number the best one to reach you" or any phone-confirmation question) and the caller's reply is short and ambiguous, treat it as a YES and continue. Do NOT re-introduce yourself, do NOT abandon the slot, do NOT start over. If the reply is clearly off-topic (not a possible confirmation), answer their tangent in ONE short sentence then re-ask your pending question verbatim.`;

const baseBoostedKeywords = [
  "it is",
  "that is right",
  "that's right",
  "that is correct",
  "correct",
  "yep",
  "yeah",
  "yes it is",
  "that is me",
  "that's me",
  "speaking",
  "mhm",
  "uh-huh",
  "Code Ninjas",
  "Junior",
  "Create",
  "Roblox",
  "Minecraft",
];

interface AgentTarget {
  agent_id: string;
  agent_name: string;
  centre_name: string; // e.g. "Burlington"
  persona_name: string; // e.g. "Cimo" or "Emma"
  is_inbound: boolean;
  // For inbound agents only — the new begin_message
  inbound_begin_message?: string;
}

const TARGETS: AgentTarget[] = [
  // SKIP: agent_17d623c8a8f95fc674288d0e00 (CNKB-EG-Inbound — already done)
  {
    agent_id: "agent_50a754cd5b9ba4ec988c764427",
    agent_name: "CNKB-Leaside-Inbound",
    centre_name: "Leaside",
    persona_name: "Cimo",
    is_inbound: true,
    inbound_begin_message:
      "Thanks for calling Code Ninjas Leaside! This is Cimo, an AI receptionist on a recorded line. How can I help you today?",
  },
  // Outbound CNKB clones (active)
  { agent_id: "agent_c02bfb40888bba2275ea3a9f3a", agent_name: "CNKB-St. Catharines", centre_name: "St. Catharines", persona_name: "Cimo", is_inbound: false },
  { agent_id: "agent_ccad25c0d5aab5eac8ce8c2354", agent_name: "CNKB-Sudbury",        centre_name: "Sudbury",        persona_name: "Cimo", is_inbound: false },
  { agent_id: "agent_ee11bcfc9222c37df4de8bfe95", agent_name: "CNKB-Riverside",      centre_name: "Riverside",      persona_name: "Cimo", is_inbound: false },
  { agent_id: "agent_1f8c2799630cd6524fa8176e6d", agent_name: "CNKB-Leaside",        centre_name: "Leaside",        persona_name: "Cimo", is_inbound: false },
  { agent_id: "agent_9d24e87943bc3b8105261bf308", agent_name: "CNKB-Pickering",      centre_name: "Pickering",      persona_name: "Cimo", is_inbound: false },
  { agent_id: "agent_075f92a824314e958918af3d9c", agent_name: "CNKB-Burlington",     centre_name: "Burlington",     persona_name: "Cimo", is_inbound: false },
  { agent_id: "agent_0c6c32b61cb506fefb6ac247f4", agent_name: "CN /w KB",            centre_name: "",                persona_name: "Cimo", is_inbound: false },
  // Emma (different persona, no centre name in keyword set)
  { agent_id: "agent_552e57364711f0eec51afa512a", agent_name: "Code Ninjas Lead Reactivation - Emma", centre_name: "", persona_name: "Emma", is_inbound: false },
];

function buildIdentityRule(personaName: string, centreName: string): string {
  const orgPhrase = centreName ? `Code Ninjas ${centreName}` : "Code Ninjas";
  return `\n- **${IDENTITY_MARKER}** (caller asks "who's this", "who are you", "what's your name" AFTER the greeting, especially during data collection): respond in ONE short sentence — "I'm ${personaName}, the AI assistant for ${orgPhrase}." — then IMMEDIATELY re-ask whatever question was pending. Do NOT re-pitch your role with multiple sentences. Do NOT explain that you "help families get information." Keep it tight: identify yourself in one breath, then resume.\n- If a question was NOT pending (e.g., right after greeting), follow the one-sentence identity reply with whatever your normal next-step prompt is.`;
}

function buildBoostedKeywords(target: AgentTarget): string[] {
  const list = [...baseBoostedKeywords];
  list.push(target.persona_name);
  if (target.centre_name) list.push(target.centre_name);
  return list;
}

interface Splice {
  before: string;
  after: string;
  inserted: number;
  notes: string[];
}

function splicePrompt(prompt: string, target: AgentTarget): Splice {
  let out = prompt;
  let inserted = 0;
  const notes: string[] = [];

  // 1. Splice recovery rule into Communication Style
  if (out.includes(RECOVERY_RULE_MARKER)) {
    notes.push("recovery rule already present, skipped");
  } else {
    // Find the "## Communication Style" section and append our bullet at its end
    // (i.e. before the next "## " section header).
    const csIdx = out.indexOf("## Communication Style");
    if (csIdx === -1) {
      notes.push("WARN: no '## Communication Style' section found, recovery rule NOT inserted");
    } else {
      const nextSecIdx = out.indexOf("\n## ", csIdx + 1);
      if (nextSecIdx === -1) {
        notes.push("WARN: could not find next section after Communication Style");
      } else {
        // Insert RIGHT BEFORE the next section, preserving a clean newline.
        const insertion = `${RECOVERY_RULE_BULLET}\n\n`;
        out = out.slice(0, nextSecIdx + 1) + insertion + out.slice(nextSecIdx + 1);
        inserted++;
        notes.push("inserted recovery rule");
      }
    }
  }

  // 2. Splice identity rule into Identity section
  if (out.includes(IDENTITY_MARKER)) {
    notes.push("identity rule already present, skipped");
  } else {
    const identityIdx = out.indexOf("## Identity");
    if (identityIdx === -1) {
      notes.push("WARN: no '## Identity' section found, identity rule NOT inserted");
    } else {
      // Insert at end of Identity section (before next "## ").
      const nextSecIdx = out.indexOf("\n## ", identityIdx + 1);
      if (nextSecIdx === -1) {
        notes.push("WARN: could not find next section after Identity");
      } else {
        const idRule = buildIdentityRule(target.persona_name, target.centre_name);
        // Trim trailing newlines off the existing section before splicing
        const before = out.slice(0, nextSecIdx);
        const after = out.slice(nextSecIdx);
        out = before.trimEnd() + idRule + "\n" + after;
        inserted++;
        notes.push("inserted identity rule");
      }
    }
  }

  return { before: prompt, after: out, inserted, notes };
}

async function getAgent(agent_id: string): Promise<any> {
  const r = await fetch(`https://api.retellai.com/get-agent/${agent_id}`, {
    headers: { Authorization: `Bearer ${RETELL_KEY}` },
  });
  if (!r.ok) throw new Error(`get-agent ${agent_id} HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

async function getLLM(llm_id: string): Promise<any> {
  const r = await fetch(`https://api.retellai.com/get-retell-llm/${llm_id}`, {
    headers: { Authorization: `Bearer ${RETELL_KEY}` },
  });
  if (!r.ok) throw new Error(`get-llm ${llm_id} HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

async function patchAgent(agent_id: string, body: object): Promise<any> {
  const r = await fetch(`https://api.retellai.com/update-agent/${agent_id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${RETELL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`patch-agent ${agent_id} HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

async function patchLLM(llm_id: string, body: object): Promise<any> {
  const r = await fetch(`https://api.retellai.com/update-retell-llm/${llm_id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${RETELL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`patch-llm ${llm_id} HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

async function processOne(target: AgentTarget): Promise<void> {
  console.log(`\n━━━ ${target.agent_name} (${target.agent_id}) ━━━`);

  const agent = await getAgent(target.agent_id);
  const llm_id = agent?.response_engine?.llm_id;
  if (!llm_id) {
    console.log(`  SKIP: no llm_id on agent`);
    return;
  }
  const llm = await getLLM(llm_id);
  const oldPrompt: string = llm.general_prompt ?? "";
  const oldBegin: string = llm.begin_message ?? "";

  // Detect lingering \! escapes (any field)
  const escapeMatches = [
    ...oldPrompt.matchAll(/\\[!?.]/g),
    ...oldBegin.matchAll(/\\[!?.]/g),
  ];
  if (escapeMatches.length > 0) {
    console.log(`  ⚠️  Found ${escapeMatches.length} \\<punct> escape(s) — will strip`);
  }

  // 1. Splice prompt
  const splice = splicePrompt(oldPrompt, target);
  let newPrompt = splice.after;
  // Strip any \! \? \. escapes
  newPrompt = newPrompt.replace(/\\([!?.])/g, "$1");

  // 2. Begin message handling
  let newBegin = oldBegin.replace(/\\([!?.])/g, "$1");
  if (target.is_inbound && target.inbound_begin_message) {
    newBegin = target.inbound_begin_message;
  }

  // 3. Boosted keywords (set on agent)
  const newBoosted = buildBoostedKeywords(target);

  console.log(`  splice notes: ${splice.notes.join(" | ")}`);
  console.log(`  prompt: ${oldPrompt.length} → ${newPrompt.length} chars`);
  console.log(`  begin_message change: ${oldBegin !== newBegin ? "YES" : "no"}`);
  console.log(`  boosted_keywords (current): ${JSON.stringify(agent.boosted_keywords ?? null)}`);
  console.log(`  boosted_keywords (new):     ${JSON.stringify(newBoosted)}`);

  if (DRY) {
    console.log(`  [DRY RUN] no writes`);
    return;
  }

  // Apply LLM update if anything changed
  const llmBody: Record<string, any> = {};
  if (newPrompt !== oldPrompt) llmBody.general_prompt = newPrompt;
  if (newBegin !== oldBegin) llmBody.begin_message = newBegin;
  if (Object.keys(llmBody).length > 0) {
    await patchLLM(llm_id, llmBody);
    console.log(`  ✓ LLM updated`);
  } else {
    console.log(`  · LLM unchanged`);
  }

  // Apply agent update for boosted_keywords
  await patchAgent(target.agent_id, { boosted_keywords: newBoosted });
  console.log(`  ✓ boosted_keywords applied`);
}

async function main() {
  console.log(`Mode: ${DRY ? "DRY RUN" : "LIVE"}`);
  console.log(`Targets: ${TARGETS.length}`);
  for (const t of TARGETS) {
    try {
      await processOne(t);
    } catch (e) {
      console.error(`  ✗ ERROR on ${t.agent_name}: ${(e as Error).message}`);
    }
  }
  console.log(`\nDone.`);
}

main();
