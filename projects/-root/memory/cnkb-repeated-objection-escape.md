---
name: cnkb-repeated-objection-escape
description: CNKB prompt fix — agents now escape to staff after 2 repeats of a disputed point instead of looping forever
metadata: 
  node_type: memory
  type: project
  originSessionId: b5d4a694-b7e7-4e5e-8c50-67402b3a926a
---

Shipped 2026-06-07 to all 9 live CNKB clones (6 outbound: EG, Pickering, Leaside, Riverside, Burlington, St. Catharines; 3 inbound: EG/StCath/Leaside-Inbound). New prompt section **"# Repeated-Objection Escape (CRITICAL)"**: if a parent disputes the SAME point 2+ times after it's been answered, the agent acknowledges once and hands off to staff (staff_followup_needed=true, reason='disputed_info') instead of re-explaining.

**Why:** the existing "Loop detection" rule only covered IVR/call-screening machines, NOT a human repeating an objection. Combined with the "just to recap…" politeness rule, a confused parent (e.g. insisting Create starts at 7) could loop the agent ~22 times / 10 min. Surfaced via a synthetic age-7 web test against the offboarded RoundRock agent, but the gap was in the live shared template too.

**How to apply:** patched in-place per-LLM (script `/tmp/patch_loop.py` pattern — fetch each clone's own prompt, splice block before `# Stages`/`# Call Flow`, idempotent on marker) to PRESERVE per-centre customizations. Do NOT use SyncPrompt full-overwrite for this — it would clobber [[stcath-custom-intro-2026-05-25]]. Validated by new Cekura scenario **281290 "Age 7 Repeated Dispute - Loop Escape"** (agent 13260) via Retell WebRTC — PASS (2 explanations → hand-off). Text-sim path fails on Retell agents ("Cannot start a chat session"); use `scenarios_run_retell_webrtc`. Related: [[create-age-range]], [[cnkb-prompt-rev-2026-05-23]].
