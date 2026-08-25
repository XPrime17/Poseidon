---
name: percentre-greeting-spec-2026-08-11
description: "Per-centre greeting customization BUILT & LIVE 2026-08-12 — cols S/T, set-greeting.ts, Shauna self-serve doc + greeting-sync.timer (10min)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 79b5558c-4bf9-49dd-a16a-b8025ec6510c
---

2026-08-11: Scott asked to spec the per-centre greeting templating that was left as follow-up "#30" after [[stcath-custom-intro-2026-05-25]] (note: NOT GitHub issue #30, which is an unrelated user_declined bug). Spec at `/root/spec-percentre-greeting-2026-08-11.md`, status DRAFT awaiting Scott.

Key design decisions:
- New Centre Lookup **col S `ai_intro_addition`** (headers confirmed A–R as of 2026-08-11; resolve by name). Empty cell = standard greeting.
- Greeting = fixed compliance skeleton (AI + recorded-line disclosure, agent/location name) + one direction-agnostic slot. **Regenerate, don't anchor-replace**: begin_message fully rebuilt; outbound Stage 1 wrapped once in `[AI-INTRO-BLOCK-START/END]` markers (StCath one-off's known-variant matching throws on drift — that's the failure mode being designed out).
- Components: `scripts/lib/greeting-template.ts` + `scripts/set-greeting.ts` CLI (`--all`, `--dry-run`, backups, idempotent) + compose calls in onboard-centre.ts/provision-inbound.ts post-clone + LOW audit rule (greeting drift).
- Validation: ≤220 chars, no ≥7-digit runs (5K interplay), no disclosure negation, no URLs, plain text.
- Rollout grandfathers StCath option-C wording into col S row 1.

Open Qs for Scott: (1) flip fleet default to StCath's warm framing? (2) Burlington mirror (Shauna, pending since May)? (3) mention in onboarding email (informational, not a third ask)?

Estimate ~half day. Not built yet.

**v2 2026-08-12 (Scott's call):** directors iterate WITHOUT Scott in the loop — supersedes operator-review non-goal. Pilot = dedicated "Greeting Doc" for Shauna covering StCath + Burlington (answers the May Burlington question: she controls it). Deliberately NOT the KB doc (nothing in call path reads it). Flow: doc edit → `greeting-sync.timer` (droplet systemd, 10min) → n8n doc-read webhook → parse (allowlist 2 centres) → validate → write col S → `set-greeting.ts` → email Shauna live/rejected, BCC Scott FYI. Validator + slot-only structure replaces human review; optional LLM brand-check recommended. Revert = she types "standard". Total build ≈ 1 day. Still DRAFT/not built.

**✅ BUILT & LIVE 2026-08-12** (spec §12 = as-built). Pieces: `lead-reactivation/scripts/{lib/greeting-template.ts,set-greeting.ts,greeting-sync.ts}`; Centre Lookup cols S/T (S12=StCath option-C); Shauna's doc `1miBIjACXp7gr4yEOXCuxS25W5WCnpN8vGJ0QDHN1OfU` (writer: shauna+scott, silent share); n8n bridge wf `6wXOMIw0uxmDZq56` (sheet read/guarded-write + Gmail notify; doc I/O via existing kb-gdocs-read/write); `/root/greeting-sync-config.json` = containment allowlist; `greeting-sync.timer` 10min. E2E PROVEN: Burlington apply+revert byte-exact, phone-number rejection blocked+emailed, fleet --all dry-run = all no-op. Markers dropped for local slot regex (refuses on drift). OPEN: Scott must announce doc to Shauna (draft in transcript); audit drift rule, Cekura-Cimo check (pre-first-rename), EG outbound not CNKB-named (unmanaged by resolver), regression-test row shares Burlington agent (canary hears her wording). Backups: /root/greeting-framework/recon + /root/retell-backups/greeting-*.

**2026-08-25 outage + fix:** sync was DEAD 8/15 14:10→8/25 — a bare `fetch` (no timeout) in bridgeGet/bridgePost hung in ep_poll; oneshot service stuck "activating" so the timer never re-fired (silent-wedge class). Fixed: 30s AbortSignal on ALL fetches + `TimeoutStartSec=180` in the unit; wedged proc killed, timer resumed. Doc was UNCHANGED the whole window → zero Shauna edits lost (she hadn't used the feature at all as of 8/25). Code committed+pushed `624a3fd` (greeting files only; pre-existing unrelated onboard-centre.ts modifications left uncommitted). Lesson: oneshot+timer units MUST carry TimeoutStartSec — a hung run starves the schedule invisibly.

**+Agent name slot (2026-08-12, Scott):** col T `agent_name` + `Agent name:` doc line. Verified live: "Cimo" = 5× per general_prompt (persona, if-asked-name, screening script, VM line) + 1× begin_message → prompt-wide word-boundary rename, current name parsed from live begin_message (no state dependency). Validate: single capitalized word, no real staff names (impersonation), warn on common-word names; must check outbound `voicemail_option` text too. Name ≠ voice (doc instructions note). +1h effort.
