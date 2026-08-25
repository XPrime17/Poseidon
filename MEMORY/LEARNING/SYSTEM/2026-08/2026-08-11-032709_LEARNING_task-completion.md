---
capture_type: LEARNING
timestamp: 2026-08-11 03:27:09 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-08-11
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

🤖 PAI ALGORITHM ═════════════

**✅ Spec written: `/root/spec-percentre-greeting-2026-08-11.md`** — grounded in the live code, not just the May memory. I verified the current Centre Lookup headers (A–R, so the new column is **S: `ai_intro_addition`**), read the StCath one-off script, and traced exactly where both onboarding paths set greetings today (`onboard-centre.ts` step4b and `provision-inbound.ts` both clone EG and do an "East Gwillimbury → name" swap).

**The design in one paragraph:** each greeting becomes a fixed compliance skeleton (AI + recorded-line disclosure, agent name, location) with one optional slot filled from column S — empty cell means today's standard greeting, so shipping this changes nothing until a cell is populated. The critical departure from the StCath one-off: we **regenerate instead of anchor-replace**. That script only works by matching three known wording variants and throws the moment a prompt drifts — that's the failure mode I designed out. Inbound `begin_message` gets fully rebuilt from the skeleton (it's short; `begin_message_delay_ms` from the Leaside fix is untouched); the outbound Stage 1 sentence gets wrapped once in sentinel markers so future updates only touch the block between them.

**What gets built (~half a day):** a shared `greeting-template.ts` compose/validate lib, a `set-greeting.ts` CLI (`--dry-run`, `--all`, per-apply backups, idempotent — blanking a cell and re-running is also the revert path), compose calls added to both onboarding scripts so future centres inherit it, and a LOW audit rule that catches greeting drift. Validation blocks the known footguns: ≤220 chars, no phone-number digit runs (would trip audit 5K), no disclosure negation, no URLs. Rollout step 1 grandfathers StCath's option-C wording into its own column-S cell, so the one-off folds into the framework instead of surviving as a special case.

**Three decisions only you can make** (spec §9): whether the fleet *default* should evolve to StCath's warm "AI is what we teach" framing (the May memory leaned that way — it's a one-string change later either way); whether Burlington just mirrors StCath now since Shauna owns both (open since May, becomes a 10-second cell edit); and whether the onboarding email should mention customization as an offered option without violating the two-asks policy.

Housekeeping: your `sheet-read.py` helper died mid-run and left an active temp workflow in n8n — I cleaned it up. Spec is memory-indexed as awaiting your review; say "build it" and I'll start at step 1.

**LEARN:** The "task #30" reference in the May memory doesn't map to GitHub issue #30 (that's the unrelated user_declined bug) — noted in the new memory so nobody chases the wrong number again.

🗣️ **PAI:** Spec's on disk, Scott — column S, regenerate-don't-anchor, half-day build. Three calls are yours: fleet default wording, Burlington mirror, and the onboarding email mention.

</details>
