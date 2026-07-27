---
name: leaside-inbound-double-greeting-2026-07-27
description: Leaside inbound greeted twice on forwarded calls → removed Stage 1 greeting duplication + begin_message_delay
metadata: 
  node_type: memory
  type: project
  originSessionId: 6473ff0a-0b96-4c84-ab86-16b1944896c9
---

Leaside inbound went live (Sharmila set Rogers no-answer forwarding via **\*741** → forward target +16475841523, bound to inbound agent_50a754cd5b9ba4ec988c764427 / llm_cfedf58fd1274e15835042d8b6c8; see [[leaside-inbound-forward-target-2026-07-16]]). Sharmila reported a **double "hi" greeting**.

**Root cause:** TWO greeting sources. Retell `begin_message` ("Thanks for calling Code Ninjas Leaside! This is Cimo, an AI receptionist on a recorded line. How can I help you today?") plays automatically (start_speaker=agent), AND `## Stage 1` in the prompt ALSO scripted a greeting ("Thanks for calling Code Ninjas Leaside! This is Cimo. How can I help you today?"). On forwarded calls the opening is clipped while \*741 connects, caller says "Hello?", LLM then delivers the Stage 1 greeting = second hi. Confirmed live: call_993603c973885ddce1c4bfa9882.

**Fix (2026-07-27):** rewrote Stage 1 → "you have ALREADY greeted; do NOT re-greet/re-introduce; if caller opens with 'hello?'/silence reply only 'Hi! How can I help you today?'". Set agent `begin_message_delay_ms=1500` to stop forwarded-call clipping. Verified (old block gone, guard present, delay=1500). Backup: `/root/n8n-backups/leaside-inbound-double-greeting-2026-07-27/` (agent.json+llm.json). Revert = restore general_prompt + set delay back to null.

**FAN-OUT DONE (2026-07-27):** same Stage 1 greeting-dup existed on all 4 other live inbound clones (EG llm_6d77f366, StCath llm_769e0ba6, Burlington llm_fd20e83f, Kanata llm_7cd3dd91) — theirs used the "- Greeting (already in begin_message): ..." bullet form but still carried the full greeting text. Rewrote Stage 1 (same do-not-re-greet guard) + `begin_message_delay_ms=1500` on all 4, verified. Backups `/root/n8n-backups/inbound-double-greeting-fanout-2026-07-27/`.

**FUTURE CENTRES COVERED:** `provision-inbound.ts` (SOURCE_INBOUND_AGENT_ID = EG inbound agent_17d623c8 / llm_6d77f366) clones EG's LLM (loc-swapped) + agent via `{...src}` (only strips ids/timestamps). Since EG source is now fixed, every new centre inherits the corrected prompt AND begin_message_delay_ms=1500 automatically — verified by construction. My replacement Stage 1 block is location-agnostic so it clones cleanly.

**OPEN — Sharmila's 2nd report "the name is the agent":** NOT reproducible in config — agent says "Cimo" in every transcript. Scott to ask Sharmila what she means (caller-ID/CNAM? spoken name? SMS signature? dashboard label?). Task parked pending her answer.
