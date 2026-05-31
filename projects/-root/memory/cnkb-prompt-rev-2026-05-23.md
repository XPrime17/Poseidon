---
name: CNKB Prompt Rev 2026-05-23 — KB-driven age gate + MANUAL precedence + JR fix
description: Shipped 4 prompt edits to 7 outbound + 2 inbound CNKB LLMs. Crawler also patched (JR→Junior). Enables centre-defined intermediate programs like Create Prep without per-centre prompt forks.
type: project
originSessionId: dfcce36f-cdf2-4142-82a5-a8d73d8d6185
---
Shipped 2026-05-23. Triggered by Shauna's St. Catharines feedback (Junior pronounced "jay-arr"; can she override site with manual notes?).

**Four prompt edits, all 9 active CNKB LLMs:**

1. **MANUAL NOTES precedence** (in Knowledge Base Usage section, top): MANUAL overrides AUTO-GENERATED when they conflict. Centre director's local truth wins.
2. **"JR" pronunciation rule** (in Technical Voice Requirements): defensive fallback to "Junior" if "JR" appears in manual notes.
3. **Booking Autonomy ages**: 5-6 → 5-7; added "centre-defined intermediate programs" to staff-followup list.
4. **Stage 3 age gate is now KB-driven** (outbound only — inbound has no age gate, separate gap): consults KB for matching program at this centre, routes Create→tour / Junior→handoff / intermediate-program→handoff / no-match→out-of-range.

**Crawler change**: `/root/kb-crawler/crawl.ts` line 708, `.replace(/\bJR\b/g, "Junior")` on autoContent before hash. Re-ran live across all 11 centres 2026-05-23 14:46Z — 9 updated, 1 unchanged (Sudbury — no JR content), 1 errored (Riverside — known API 400, doc needs creating).

**Why:** Locked Create=8-14 globally (Scott 2026-05-23, see create-age-range.md). Shauna at St. Catharines is adding "Create Prep (ages 7-8)" as her centre's intermediate program — KB-driven gate means we don't need to fork prompts per centre.

**How to apply:** When updating CNKB prompts further, use the scripts at `/root/cnkb-outbound-prompt-rev-2026-05-23.ts` and `/root/cnkb-inbound-prompt-rev-2026-05-23.ts` as templates. Run `--dry-run` first, verify with grep against /tmp output.

**Effects per centre (after Scott confirms Shauna's tour-vs-handoff question for Create Prep):**
- 9 of 10 centres: identical behavior. Their KB lists Junior + Create only; 7-yo → Junior handoff (vs. old "7-14 Create tour" — fixes a latent routing bug).
- St. Catharines (after Shauna adds Create Prep to manual notes): 7-8-yo → "intermediate program" branch → staff handoff (safe default; flip to tour with one-line patch once Shauna confirms).

**LLMs updated (9):**
- Outbound: CN /w KB (EG canonical), CNKB-Burlington, CNKB-Pickering, CNKB-Leaside, CNKB-Riverside, CNKB-Sudbury, CNKB-St. Catharines.
- Inbound: CNKB-EG-Inbound, CNKB-Leaside-Inbound (only MANUAL + JR edits; no age gate exists in inbound prompts — see follow-up task).

**NOT done (parked):**
- n8n KB-injection order flip (workflow 6sPwo7ngPyTWfmwM "Get KB" node). Prompt rule may be enough; verify via Cekura first.
- Original scope reframe (non-Create Q&A loop) — separate decision.
- Inbound age-gate gap (5-yo can book Create tour inbound) — separate rev.
- Shauna question: Create Prep tour or staff handoff? Default is handoff for now.

**Cekura baseline next:** existing 7 scenarios on agent 13260 likely need ~2 updates for age-7 routing. Add 4 new: (a) St.Cath 7-yo → Create Prep handoff, (b) EG 7-yo → Junior handoff, (c) MANUAL vs AUTO conflict, (d) JR-pronunciation TTS check.
