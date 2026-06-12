---
name: kanata-burlington-onboarding-2026-06-12
description: "Kanata fully provisioned (outbound, testing mode) + Burlington onboarding completed — resource IDs and remaining manual go-live items"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0102d5a3-1122-4106-8599-442881c95519
---

Shauna (StCath director) is onboarding **Kanata** + **Burlington** (both hers). Done 2026-06-12:

## Kanata (NEW — provisioned via onboard-centre.ts, testing=TRUE)
- Twilio **+16137028134** (sub-acct ACe4304d…, trunk kanata-cnkb.pstn.twilio.com) — single-number model
- Retell LLM `llm_46f528077e86fca2a2a2549e2793`, agent `agent_aac09671305b8903483ceee6df` (CNKB-Kanata); verified: prompt substituted, press_digit + boosted_keywords carried over, phone bound outbound
- Cekura agent **18978**, scenarios 286449/286450, per-centre Tier-2 cron **511** (`40 6 1-7,15-21 * 3` ET)
- KB doc `1Xk3UZDXjezBRfr044ixrwD9x3sxgpqA47owz6DSVwtw` (we own; shared writer→shauna.chan silently); in centres.json + crawled + sheet col O
- ClickUp folder 90118050948, Inbound `901113946914` / Outbound `901113946915`; col M=87436757
- Centre Lookup **row 15** (`kanata-on-ca`); TourForce portal Supabase: centres + centre_agents rows inserted
- Onboarding + checklist emails sent to Scott (the `ok is not defined` FAILs were log-only; side effects completed — fixed in commit `9b9e332`)

## Burlington (was provisioned Mar 2026, testing=TRUE)
- Row 11 col L=cnstcatharines@gmail.com, M=87436757 → staff-follow-up tasks now assign to Shauna
- Onboarding email re-sent to Scott (Resend `6f20e27d`) for forwarding to Shauna

## Inbound (ADDED same day — both-directions policy [[feedback-onboard-both-directions]])
- Burlington: LLM `llm_fd20e83f9191565301bf0d31e445`, agent `agent_7950e8ff24a902abfd3d5b34cc` (CNKB-Burlington-Inbound); +12899071911 bound both directions; sheet E11 set; KB smoke 6830 chars ✓
- Kanata: LLM `llm_7cd3dd91ca0bf25b408c1bc31d19`, agent `agent_c3d64fc094dccb0fa486bde5f9` (CNKB-Kanata-Inbound); +16137028134 bound both directions; KB smoke 4644 chars ✓
- Both webhook_url → n8n `inbound-end-of-call` directly (NOT EG's ChatDash — clone had leaked it, repointed)
- PHONE_TO_CENTRE registry has both numbers → correct KB docs; pre-call wf QFxDu1MBooL332PN active
- NOT in gate `LIVE_INBOUND_CENTRE_IDS` yet — add when Shauna sets up no-answer forwarding

## REMAINING MANUAL (before go-live)
1. **ChatDash for Kanata** (API blocked — UI): create agent CNKB-Kanata + client (login shauna.kanata), set forwarding URL to n8n EOC webhook. Outbound EOC won't fire until this is wired.
2. **Hiya** branded caller ID for +16137028134 ("Code Ninjas Kanata")
3. Scott forwards both onboarding emails to Shauna → she sets up CRM lead forwarding (scott.james1717+kanata-on-ca@ / +burlington-on-ca@gmail.com)
4. Verify `kanataonca@codeninjas.com` (auto-derived centre_email, row 15 col I) is real
5. After test lead passes end-to-end: flip Testing=FALSE (col G rows 11+15)
6. **Call forwarding** (Shauna, per centre): no-answer 4-ring forward of centre line → Retell number; carrier star codes vary — then add both to LIVE_INBOUND_CENTRE_IDS in PipelineRegressionCheck.py
7. Kanata added to SyncPrompt registry (now 5 clones) — future prompt revs go to 10 live LLMs

Related: [[clickup-guest-assign-autoshare]], [[cekura-tier2-percentre-crons]], [[centre-launch-two-surfaces]], [[open-followups-2026-06-10]]
