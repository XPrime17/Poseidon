#!/usr/bin/env bun

// One-off (2026-05-02): patches Stage 3 framing across all 7 active CNKB
// outbound clones. Replaces a vague "make ONE brief, natural connection"
// instruction that let the model improvise the inaccurate "kids start with
// Minecraft and Roblox" curriculum claim (call_8183ff0a02d48c32b3773a18ec7).
//
// Usage: RETELL_API_KEY=key_xxx bun PatchMinecraftFraming.ts

const RETELL_API = "https://api.retellai.com";
const KEY = process.env.RETELL_API_KEY;
if (!KEY) {
  console.error("RETELL_API_KEY env var required");
  process.exit(1);
}

const AGENTS = [
  { agent: "agent_9d24e87943bc3b8105261bf308", llm: "llm_9b4bcc9bd77a2bd3c3c04ed579b1", name: "CNKB-Pickering" },
  { agent: "agent_c02bfb40888bba2275ea3a9f3a", llm: "llm_5b4dbab1bf6dcc5007c61c2726ff", name: "CNKB-St. Catharines" },
  { agent: "agent_ccad25c0d5aab5eac8ce8c2354", llm: "llm_247d6d98f7073c6d31d54f26f53d", name: "CNKB-Sudbury" },
  { agent: "agent_ee11bcfc9222c37df4de8bfe95", llm: "llm_512d93c0c71e0ef00e318b3e9fc0", name: "CNKB-Riverside" },
  { agent: "agent_1f8c2799630cd6524fa8176e6d", llm: "llm_4cfa990bea7bfcbf67060e8c8f72", name: "CNKB-Leaside" },
  { agent: "agent_075f92a824314e958918af3d9c", llm: "llm_35ce5dd8697541ec0e97f0dcfde0", name: "CNKB-Burlington" },
  { agent: "agent_0c6c32b61cb506fefb6ac247f4", llm: "llm_44111168b1a2a469f50891b26e34", name: "CN /w KB (EG)" },
];

const OLD = `**Based on their answer, make ONE brief, natural connection to Code Ninjas, then immediately invite to a tour.** Keep it conversational — don't give a scripted pitch. The connection should show how their child's interest (gaming, tech, or even no interest yet) fits what kids do at Code Ninjas. Then: "The best way to see if it clicks is to pop in for a quick tour - you and your kiddo can check out the space. Would that work?"`;

const NEW = `**Based on their answer, make ONE brief, natural connection to Code Ninjas, then immediately invite to a tour.** Keep it conversational — don't give a scripted pitch.

**CRITICAL — what NOT to say:** Do NOT claim kids "start with" Minecraft or Roblox, or that the curriculum "begins with" their favorite games. That is inaccurate. At Code Ninjas, kids learn coding fundamentals first (Scratch, then JavaScript) and build their own games over time.

**Correct framing (vary the wording, do not repeat verbatim):**
- If they like Minecraft / Roblox: "Oh perfect, kids who love Minecraft and Roblox usually have a blast here. They get to build their own games as they pick up real coding skills."
- If they like other games or tech: a brief, accurate connection without claiming the curriculum starts with that game.
- If no gaming interest yet: "Totally fine, a lot of kids discover gaming through what they build here."

Then: "The best way to see if it clicks is to pop in for a quick tour - you and your kiddo can check out the space. Would that work?"`;

async function patch(a: typeof AGENTS[0]) {
  const getRes = await fetch(`${RETELL_API}/get-retell-llm/${a.llm}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  if (!getRes.ok) {
    return { name: a.name, ok: false, error: `GET ${getRes.status}: ${await getRes.text()}` };
  }
  const llm = await getRes.json();
  const oldPrompt = llm.general_prompt as string;

  if (!oldPrompt.includes(OLD)) {
    return { name: a.name, ok: false, error: "OLD paragraph not found verbatim (already patched?)" };
  }

  const occurrences = oldPrompt.split(OLD).length - 1;
  const newPrompt = oldPrompt.replace(OLD, NEW);

  const patchRes = await fetch(`${RETELL_API}/update-retell-llm/${a.llm}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ general_prompt: newPrompt }),
  });
  if (!patchRes.ok) {
    return { name: a.name, ok: false, error: `PATCH ${patchRes.status}: ${await patchRes.text()}` };
  }
  return { name: a.name, ok: true, occurrences, oldLen: oldPrompt.length, newLen: newPrompt.length };
}

const results = await Promise.all(AGENTS.map(patch));
for (const r of results) {
  if (r.ok) {
    console.log(`✓ ${r.name}: replaced ${r.occurrences}× | ${r.oldLen} → ${r.newLen} chars`);
  } else {
    console.log(`✗ ${r.name}: ${r.error}`);
  }
}
