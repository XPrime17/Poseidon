---
name: vm-callback-test-number-2026-08-26
description: "Attempt-2 voicemail static_text quoted col I test_number (Scott's cell / test lines) fleet-wide — wrong-column bug in Retry Scheduler dial node; fixed to centre_landline 2026-08-26"
metadata: 
  node_type: memory
  type: project
  originSessionId: e0d42a6a-e981-48c0-a236-c6586e584ff1
---

**Root cause of the 8/25 audit's 2 HIGH (rule 5K) findings — and retroactively of the [[voicemail-hallucination-fix-2026-07-16]] incident.** The Retry Scheduler (`rt0aEuDnFv3ZCl1y`) node **`Retell: Retry Call`** builds a per-call `agent_override.agent.voicemail_option` static_text for attempt 2 only ("Hi <First>… call us back at <NUMBER>…"). The `<NUMBER>` expression read **Centre Lookup col I `test_number`** instead of col E `centre_landline`. Col I = 905-967-2357 (Scott's cell) for EG/Burlington/Leaside/Riverside/Kanata/Barrhaven; 905-220-0332 for StCath. So every attempt-2 voicemail told real leads to call the test line.

**Why 7/16's diagnosis was wrong:** that session checked prompt/KB/dynamic vars/agent-level `voicemail_option` and concluded gpt-4.1 hallucinated the number. It never checked the dial request body's per-call `agent_override` — which supersedes the agent-level config. Proven: Jul 11 (Alison) + Jul 13 (Lexie) StCath VMs speak the identical template with 905-220-0332, `retry_attempt: 2`, BEFORE the 7/16 fix shipped. Lesson: **when a "hallucinated" value exactly matches a config cell, hunt for a deterministic source in every layer including per-call API overrides before blaming the LLM.**

**Fix (shipped + live-verified 2026-08-26):** expression now `centre_landline || outbound_number`, digits-normalized `.slice(-10)` (col E values carry a leading 1 that broke the 3-3-4 formatter). Backup + after-state: `/root/n8n-backups/vm-callback-wrong-column-2026-08-26/`. Regression gate: PASS for this change (sole FAIL = pre-existing Barrhaven `clickup_user_ids` gap, parallel workstream).

**Blast radius (scan of all calls since Jul 10):** 10 real leads heard a test number — StCath: Alison 7/11, Lexie 7/13, Kelsey 8/14, Brianna 8/22 (905-220-0332); EG: Rachel 8/14, Andrea 8/25; Burlington: Amanda 8/22, Jennifer Cram 8/25; Leaside: Deborah 8/22, TANYA 8/23 (Scott's cell). Retry cadence continues for recent ones with the correct number. Rule 5K worked as designed.

**OPEN:** (1) ~~col E blank for Pickering/Leaside~~ BACKFILLED 2026-08-26 from CN profile API (`services.codeninjas.com/api/v1/facility/profile/slug/<slug>` — Google scrape blocked; API is the KB crawler's own source so numbers match injected KB): Pickering E3=16475133102, Leaside E8=14165463114, write re-read-verified, gate re-run (same pre-existing Barrhaven FAIL only). Riverside/Sudbury col E still blank (Riverside Testing=TRUE, Sudbury not live) → their attempt-2 VMs quote the outbound DID fallback. (2) ~~Verify next real attempt-2 VM speaks the landline~~ **CONFIRMED 2026-08-27:** three attempt-2 VMs (Pickering 647-513-3102, Burlington 905-332-0707, StCath 289-974-0871) each spoke their own col E centre_landline, verified against Centre Lookup; nightly 5K clean (0 issues). (3) Retry Scheduler path still untested by E2E harness (lead-reactivation#67).

**Audit hardening shipped same day (commit 32d56d4 in /root/daily-call-audit):** (1) `issue-history.json` repeat-offender tracking — signature = kind+phone-in-evidence (else kind+centre), REPEAT ×N annotation w/ first-seen date, subject-line escalation, 90d prune, seeded from all 135 past reports; (2) rule 5K now correlates same out-of-KB number across ≥2 centres in one run → "deterministic shared source, NOT a hallucination"; (3) 5K evidence/KIND_LEGEND rewritten to point at config layers first. Live-verified: manual 8/26 run rendered REPEAT ×6 + cross-centre note on both flags (Resend 29067bed).

