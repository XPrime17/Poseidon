# PAI Memory

## Context Isolation Rules (CRITICAL)
- **Retell** = voice AI platform (agents, LLMs, clones, calls, prompts). OPERATIONAL system.
- **Cekura** = testing/evaluation platform (scenarios, metrics, test runs). QA TOOL.
- When Scott asks about agents, calls, prompts, clones → Retell section. Do NOT load Cekura.
- When Scott asks about testing, scenarios, metrics → Cekura section.
- Only cross-reference when Scott explicitly asks to test a Retell agent via Cekura.

## Architecture — Lead System (UPDATED 2026-03-28)
- **Cloudflare Worker is ABANDONED.** All retry logic lives in n8n + Google Sheets.
- **Active n8n workflows** on `xprime17.app.n8n.cloud`:
  - `Outbound Call Flow - Multicentre` (6sPwo7ngPyTWfmwM) — initial calls (attempt 1)
  - `Retry Scheduler - Multicentre` (rt0aEuDnFv3ZCl1y) — polls every 90min (changed from 15min on 2026-03-28), makes retry calls (attempts 2-4)
  - `[TEST] End Of Call - Retry System` (4p1V0wESn3kZySt6) — post-call routing, retry scheduling
  - `Orphan Sweep - Multicentre` (H7sxzNFsME4wkeJp) — every 2hrs, catches leads stuck at `calling` >2hrs, routes to exhausted (≥4 attempts) or retry_pending (<4)
- **State store:** Google Sheets (Leads MasterSheet ID: `1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`), NOT Supabase
- **Centre Lookup Sheet ID:** `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`
- **Do NOT check Worker health or Supabase for retry state**
- **Voicemail Strategy (2026-03-09):**
  - All 11 agents have `voicemail_option: { action: { type: "hangup" } }` (agent-level default)
  - Attempt 1: hangup on voicemail (explicit `agent_override` in Outbound Call Flow)
  - Attempt 2: leaves `static_text` voicemail via `agent_override` in Retry Scheduler
  - Attempts 3-4: hangup on voicemail (default)
  - Retell API: `voicemail_option` presence enables detection (no separate `enable_voicemail_detection` needed)
  - End Of Call: `voicemail_reached` → `voicemail_left` (attempt 2) or `voicemail_hangup` (other)
- **Decline Reason Feature (2026-03-12):**
  - All 11 agents have `decline_reason` post-call analysis field: `"busy"` | `"not_interested"` | `""`
  - Prompt updated on all 10 CNKB LLMs: "Can't Talk" → retry, "Not Interested" → no retry
  - End Of Call Switch: `agent_hangup` → `Decline Reason Check` IF node → busy=retry, else=completed
  - Fixes Ashley Lang bug: leads who answer but decline were falling through with no retry
- **Gmail Trigger Gotcha:** After n8n cloud workspace downtime, Gmail triggers get stuck. Fix: deactivate/reactivate the workflow.
- **Testing Column (2026-03-12):** Added `testing` column to Leads MasterSheet (column B). TRUE for test centres (Round Rock, Leaside, Riverside, Sudbury), FALSE for live.
- **Column Population Fix (2026-03-12):** Outbound Append node now writes `testing`, `status=calling`, `attempt_count=1`, `last_call_at`. EndOfCall Retry/Completed nodes now write `attempt_count`. Set Tour True/False nodes had `CRM Confirm` silently exposed (risked blanking) — marked `removed: true`.
- **Leads MasterSheet Column Layout (2026-03-12):** A:centre_id, B:testing, C:lead_id, D:First, E:Last, F:Phone, G:Email, H:Tour, I:Date, J:Time, K:CRM Confirm, L:status, M:attempt_count, N:next_call_after, O:last_outcome, P:last_call_at, Q:(empty), R-Y:attempt_1-4 at/outcome, Z:testing(old duplicate)
- **Schema Update Rule:** When adding ANY column to Leads MasterSheet, update schema in ALL 9 write nodes: Outbound(2: Append row, Update Lead - Off Hours), EndOfCall(4: Set Tour True/False, Update Lead Retry/Completed), Retry(2: Update Lead Pre-Call, Reset Lead on Error), OrphanSweep(1: Fix Orphaned Leads)
- **Off Hours Fix (2026-03-18):** Outbound Call Flow appends lead BEFORE After Hours? check. Added "Update Lead - Off Hours" node after Off Hours email — sets status=retry_pending + next_call_after. Retry Scheduler picks it up during business hours.
- **Off Hours next_call_after Fix (2026-03-31):** Expression was `.plus({ days: 1 }).set({ hour: 9 })` — always added a day. Early-morning leads (before 9 AM) got pushed to next day instead of same-day 9 AM. Fixed: conditional `.plus({ days: hour >= 9 ? 1 : 0 })`. Triggered by Sudbury test lead at 4 AM.
- **Orphan Sweep Root Cause (2026-03-18):** End Of Call webhook runs successfully (writes last_outcome) but Google Sheets appendOrUpdate intermittently fails to persist status column. Orphan Sweep catches these.
- **Retry Scheduler Attempt Cap (2026-03-19):** Added `attempt_count >= 4` guard to Filter Eligible code. Previously had NO attempt cap — leads could retry indefinitely if End Of Call failed to update status. This caused Scott-9059672357 to reach 9 attempts under EG.
- **EG Agent ID Fix (2026-03-19):** East Gwillimbury row in Centre Lookup Sheet had empty agent_id. Retry Scheduler fallback `|| 'agent_0c6c32b61cb506fefb6ac247f4'` was being used. Now agent_id is explicitly set.
- **Retry Bugs Fixed (2026-03-12):** (1) `String()` cast on `test_number` in Retry Scheduler voicemail expression, (2) Format Slots rewritten to use `$input.all()` loop instead of `$input.item`
- **Fallback Routing Fix (2026-03-28):** Switch fallback (output 3: `user_hangup`, errors, etc.) was sending email but NOT updating Google Sheets — leads stuck as `calling`. Fix: connected `Outcome unsuccessfull` → `Lookup Centre for Retry` to feed into existing retry pipeline. Status=`retry_pending` (not `completed`) because fallback includes accidental hangups/errors.
- **Replay Technique (2026-03-28):** To re-process stuck leads, replay original `call_analyzed` payload to End Of Call webhook (`POST /webhook/ac45848d-559c-4b66-9058-5d76b8476531`). n8n cloud doesn't register webhook URLs for API-created workflows.
- See `lead-reactivation.md` for full architecture details

## Skill Creation Pattern
- Private skills: `_ALLCAPS` naming. SKILL.md needs YAML frontmatter with `name` + `description`
- Tools: TypeScript/Bun with `parseArgs`, `--help`, `.help.md` companions
- Custom traits: `~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/Traits.yaml`
- Named agents: `~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/NamedAgents.md`

## MCP Server Pattern
- MCP SDK v1.11+: Zod schemas (`.shape`) for tool params, not plain objects
- `McpServer` constructor: just `name` + `version`, no `capabilities`
- Retell prompts live on the LLM object — resolve via `agent.response_engine.llm_id`
- MCP config at `~/.claude/MCPs/` with `{name}-MCP.json` naming

## Google Sheets Write Pattern (via n8n)
- Google Sheets API NOT enabled — can't use API key
- **Read-only**: CSV export via `https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv` (NOTE: requires auth from server — fallback: use n8n execution API with `?includeData=true`)
- **Write**: Temp webhook workflow on n8n cloud → activate → trigger → delete
- **Write credential**: `yjVHcEWrpyDmxkvv` | **Read credential**: `ybuxqM8F2NkyCA7e`
- **Schema rule**: `appendOrUpdate` requires ALL sheet columns (unused = `removed: true`)
- **DANGER**: Schema entries with `removed: false` but NO value in the `value` mapping may write empty strings, **blanking existing data**. Every `removed: false` entry MUST have a corresponding value.
- **CRITICAL**: `appendOrUpdate` does NOT create new column headers. To add columns, use HTTP Request node with Google Sheets API (`PUT .../values/'Sheet'!Q1:X1`) and the OAuth credential.
- **n8n API**: `active` is read-only on PUT. Use `/activate` and `/deactivate` endpoints.
- **n8n API PUT**: strip `availableInMCP`, `timeSavedMode` from settings or PUT will 400

## Email Delivery
- ALWAYS use Resend HTTP API — never sendmail/SMTP
- API key: `re_jZ1fNYUk_Nb3DrrinayxqTTMGYtyMiKCj`
- Sender: `onboarding@resend.dev` | Scott's email: `scott.james@codeninjas.com`

## n8n Cloud Subscription
- **Plan:** Pro (€60/month, 10,000 executions) — DOWNGRADE TO STARTER APPROVED (2026-03-28). Projected ~1,341/month after optimizations.
- **Optimizations (2026-03-28):** Retry Scheduler 15min→90min (saves ~1,612/mo), Inbound Pre-Call schedule trigger disabled → webhook-only (saves ~295/mo)
- **Execution hog (resolved):** `PAI - Telegram Bot` (cfe5UmEvegyLhp8F) had 1-min schedule trigger = 1,440/day. DEACTIVATED.
- **Migration plan:** 6 non-essential workflows to move to self-hosted (Error Logger, Centre Feedback, My workflow 5, PAI Email→ClickUp, PAI Email→Jarvis, PAI Homebase Export). 6 essential stay on cloud.
- **Essential cloud workflows:** Outbound Call Flow, Retry Scheduler, End Of Call, Orphan Sweep, Listen360, Booking Verification, Centre Directory, Inbound End Of Call - EG, Session Tracker Sync
- **Self-hosted status:** UP at `138.197.171.204:5678`, needs new API key from Settings → API

## Scott's Preferences
- Architecture diagrams ALWAYS use Art skill → PNG (never ASCII/markdown)
- ALWAYS provide full absolute path to generated images
- n8n has TWO instances: self-hosted Docker (`138.197.171.204:5678`) and cloud (`xprime17.app.n8n.cloud`)
- **n8n self-hosted API key is EXPIRED** — Scott to generate new one from UI

## n8n API
- **Cloud API key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzE0ODRiZS1mNjg1LTQ3M2EtYmUxNC0xOTZkOTdlZDE0YTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4NjY3MDI5fQ.Ky5Z-77U6ldB6STvg7JJ4ULXb58Htdt7L-QUCwhI0Yk`
- **Cloud URL**: `https://xprime17.app.n8n.cloud/api/v1/`
- **n8n API PUT cleanup**: strip `updatedAt`, `createdAt`, `id`, `description`, `isArchived`, `meta`, `pinData`, `versionId`, `activeVersionId`, `versionCounter`, `triggerCount`, `shared`, `activeVersion`, `active`, `tags` from GET response before PUT

## ClickUp Integration (2026-03-20)
- **Workspace:** Codeninjas | ID: `9011711565`
- **API Token:** `pk_114277538_QASW3X3E93S0MUL39MSA89ZI90NNSYDV`
- **MCP:** Added to project config (HTTP), needs session restart + OAuth
- **Voice AI Space:** ID `90114119602`
- **EG Folder:** ID `90117795474`
- **EG Inbound Tasks List:** ID `901113422190`
- **Task format:** `[Call Type] Name - Summary` in name, structured markdown in description, tags for call_type
- **No Custom Fields** — using tags + description to avoid 60-use limit and API creation limitation

## Inbound Voice AI (UPDATED 2026-03-22)
- **Architecture:** Call forwarding from centre landline → Retell Twilio number → inbound agent answers → post-call → n8n → ClickUp task
- **EG Inbound Agent:** `agent_17d623c8a8f95fc674288d0e00` (CNKB-EG-Inbound)
- **EG Inbound LLM:** `llm_6d77f36696f6fbfad97d03fa5ef8` (gpt-4.1)
- **Phone:** `+12899030611` — inbound: EG inbound agent, outbound: original EG agent (unchanged)
- **SIP Origination:** Added `sip:sip.retellai.com` to xprime trunk (`OU078ecfd1664cf4d66106517ce5720e45`)
- **Inbound telephony confirmed working** — test call succeeded (2026-03-22)
- **Post-call analysis:** 12 fields under `call_analysis.custom_analysis_data` (NOT directly under `call_analysis`)
- **Post-call pipeline:** Retell webhook → n8n `Inbound End Of Call - EG` (3oV7SpPKWmr3xJlQ) → ClickUp task in EG Inbound list
- **n8n webhook URL:** `https://xprime17.app.n8n.cloud/webhook/inbound-end-of-call`
- **ClickUp tags created:** new_lead, schedule_change, billing_question, general_inquiry, complaint, other
- **KB attached:** `knowledge_base_5144c616b2046679` (12 EG website pages, auto-refresh enabled)
- **Location hardcoded:** "East Gwillimbury" in both prompt and begin_message (not template var)
- **`{{SLOTS}}`:** Served live via `Inbound Pre-Call - EG` webhook (scrapes calendar on-demand, no schedule cache). Schedule trigger disabled 2026-03-28.
- **Prompt source file:** `/root/inbound-prompt-eg.md`
- **Prompt fix (2026-03-22):** Added explicit gates — 2E fast-track skips 2C discovery/pitch, 2C guard prevents entry if tour already booked
- **Agent status:** NOT published yet (is_published: false). Works for testing.
- **Urgent calls:** n8n sends email via Resend to scott.james@codeninjas.com
- **Pilot plan:** EG test → Leaside (Sharmilla) → Pickering
- **Client comms:** Google Form → GitHub Issues + weekly email digest for Sharmilla (NOT BUILT YET)
- **Call forwarding cost:** $0 for local on Canadian business landlines (Bell/Rogers/Telus)
- **Retell API gotcha:** GET agent = `/get-agent/{id}`, update agent = PATCH `/update-agent/{id}`, GET LLM = `/get-retell-llm/{id}`, update LLM = PATCH `/update-retell-llm/{id}`. The `/v2/` prefix does NOT work for these.

---

## Retell Platform (OPERATIONAL)
- **API key:** `key_eb01765f71b0a93b347d324af573`
- Prompts live on the LLM object — resolve via `agent.response_engine.llm_id`

### Retell Agents
| Name | Agent ID | Phone | LLM ID | Status |
|------|----------|-------|--------|--------|
| Emma | `agent_552e57364711f0eec51afa512a` | `+12494492726` | (original) | WORKING |
| CNKB (East Gwillimbury) | `agent_0c6c32b61cb506fefb6ac247f4` | `+12899030611` | `llm_44111168b1a2a469f50891b26e34` (v39) | WORKING |
| CNKB-Canton | `agent_f10e56ab67fddf22bd60def599` | `+17744062037` | `llm_d25bbc493b20eb095ab92bceb116` | WORKING |
| CNKB-StoneOak | `agent_cd531f218c39d6125098cf7abc` | — | `llm_c26de057ffe1ff9a71366e95c447` | WORKING |
| CNKB-RoundRock | `agent_d06452d16a225cfbf207890350` | — | `llm_7b795d82b19f42562ef0abaf857f` | WORKING |
| CNKB-Rayford | `agent_9c1c8996e054e87f6b76aa8a0a` | — | `llm_118c93e692e7255083a56043c3e9` | WORKING |
| CNKB-Burlington | `agent_075f92a824314e958918af3d9c` | `+12899071911` | `llm_35ce5dd8697541ec0e97f0dcfde0` | WORKING |
| CNKB-Pickering | `agent_9d24e87943bc3b8105261bf308` | — | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` | WORKING |
| CNKB-Leaside | `agent_1f8c2799630cd6524fa8176e6d` | `+16475841523` | `llm_4cfa990bea7bfcbf67060e8c8f72` | WORKING |
| CNKB-Riverside | `agent_ee11bcfc9222c37df4de8bfe95` | `+12036484197` | `llm_512d93c0c71e0ef00e318b3e9fc0` | WORKING |
| CNKB-Sudbury | `agent_ccad25c0d5aab5eac8ce8c2354` | `+19786627576` | `llm_247d6d98f7073c6d31d54f26f53d` | WORKING |
| CNKB-StCatharines | `agent_c02bfb40888bba2275ea3a9f3a` | `+12895140137` | `llm_5b4dbab1bf6dcc5007c61c2726ff` | WORKING |

### Retell Prompt Hash
- Last update (2026-03-13): Removed child name reuse — agent collects name for CRM but uses "your kiddo" instead of repeating it. Prevents ASR transcription errors compounding.
- Previous (2026-03-12): Added "Handling Leads Who Can't Talk" + "Handling Leads Who Are Not Interested" sections
- Source prompt: ~15,800 chars (East Gwillimbury LLM)
- **Voice AI principle:** Collect but don't echo free-text fields that pass through ASR (names especially)
- All 12 CNKB LLMs updated (incl Burlington + StCatharines). Emma NOT updated (different prompt structure).
- Previous (2026-03-07): Pricing Anti-Hallucination — removed hardcoded $175/$249, replaced with KB-defer

### Clone Process
- Each clone gets OWN LLM copy. Prompt changes must be applied to ALL LLM copies individually.
- Location names hardcoded in clone LLMs (not dynamic vars). Source uses `{{LOCATION_NAME}}`.

### Twilio Infrastructure
- **Sub-account pattern:** Each centre gets sub-account + SIP trunk + phone number
- **Sub-accounts:** Brampton SW, Burlington, Canton, Leaside, Pickering, Rayford, Round Rock, Stone Oak, St. Catharines, Sudbury
- **SIP credential RULE:** MUST use unique usernames per centre (e.g., `sudbury`, `leaside`), NOT `xprime`
- **Debug `telephony_provider_permission_denied`:** Check Retell `auth_username` matches Twilio cred username, verify uniqueness
- `onboard-centre.ts` automates full chain: sub-account → buy number → SIP creds → trunk → Retell import
- **Riverside** still on shared xprime trunk (pre-automation)

### Onboarding Script
- Step 0: Auto-discovery from codeninjas.com (sitemap → slug → services API)
- **(2026-03-06 fix)** Sub-account creation URL was nested incorrectly
- **(2026-03-07 fix)** SIP credential username was hardcoded to `xprime` — now uses per-centre `slugName`
- **(2026-03-13 fix)** slugName now strips periods (`.`) — "St. Catharines" → `st-catharines` (was breaking SIP trunk domains)
- **(2026-03-13 fix)** Canadian centre slugs (`{name}-{province}-{country}`) now handled by refactored `lookupCentreSlug()` — auto-discovery works for both US and CA
- **(2026-03-13 bug)** Google Sheet webhook + email steps failing with `ok is not defined` — needs investigation

---

## Cekura Testing Platform (QA TOOL)
- See `cekura-testing.md` for full details (config, scenarios, metrics, crons, known issues)
- **Subscription:** Developer plan, 751 credits remaining (as of 2026-03-25). Expires 2026-04-22.
- **Clone Cekura IDs:** Canton=13779, StoneOak=13780, RoundRock=13781, Rayford=13782, Burlington=14706, Pickering=13784, Leaside=13788, Riverside=14125, Sudbury=14388, StCatharines=14707

---

## _KB Skill Setup — LEFT OFF (2026-02-10)
- BLOCKER: scott.james1717@gmail.com needs to be added as test user in Google Cloud Console
- See previous memory for full details

## Voice AI Agency — TourForce (DECIDED 2026-03-02)
- **Name:** TourForce | **Domain:** tourforce.ca (REGISTERED on Cloudflare, 2026-03-28)
- **tourforce.ai:** Available but not purchased ($80/yr, 2yr minimum)
- **Formation status:** PENDING — awaiting accountant + lawyer feedback
- See `tourforce-branding.md`, `subzero-formation.md`

## Spanish Voice AI Research (2026-02-17)
- Do NOT use multi mode on working English agents — degrades performance
- Recommendation: Dedicated Spanish agent. GitHub issue: XPrime17/lead-reactivation#19
- See `spanish-voice-ai.md`

## TourForce Portal (STARTED 2026-03-22)
- Custom ChatDash replacement — saves $300/month + eliminates platform restrictions
- **Location:** `/root/tourforce-portal/`
- **Stack:** Bun + Hono + Supabase Auth + Stripe + Retell API + Tailwind
- **Port:** 4000 | **Status:** Phase 1 code complete, needs manual Supabase + Stripe setup
- **Decision (2026-03-28):** Using ChatDash for now. Build custom portal in background when time allows.
- **Decision reinforced (2026-03-29):** ChatDash billing blocked by platform restriction. Custom portal eliminates Stripe Connect intermediary. Direct Stripe integration = no gatekeeper.
- **Priority improvement:** Client onboarding UX — magic link auth + billing address collection upfront
- **Chat-Dash learnings (2026-03-29):** 7 competitive advantages documented in `tourforce-portal.md`
- See `tourforce-portal.md` for full details, Chat-Dash learnings, and remaining manual steps

## ChatDash Client Portal (ACTIVE 2026-03-28, BILLING BLOCKED)
- **Portal domain:** `portal.tourforce.ca` (Cloudflare DNS → ChatDash)
- **Email whitelabeling:** Configured with SendGrid DNS records on tourforce.ca
- **Client login URL:** `portal.tourforce.ca/client/login`
- **Client onboarding:** Manual — agency creates loginId + password, shares with client (no auto-invite)
- **Billing status:** BLOCKED — "cannot make live charges" error despite verified Stripe account. Support ticket sent 2026-03-29. Likely trial/platform restriction.
- **Plan:** Using for agent management while building custom TourForce Portal as replacement
- **Stripe connected:** `acct_1T3SS88QdbWckC7C` via Stripe Connect OAuth

## Feedback
- [Retry over completed](feedback_retry_over_completed.md) — For ambiguous call disconnections, default to retry not completed

## Topic Files Index
| File | Contents |
|------|----------|
| `lead-reactivation.md` | Full architecture, retry cadence, ChatDash, pending steps |
| `cekura-testing.md` | Cekura config, scenarios, metrics, crons, email digest |
| `tourforce-branding.md` | Agency branding bible |
| `tourforce-portal.md` | Client portal — ChatDash replacement (auth, calls, billing) |
| `subzero-formation.md` | Corporate formation details |
| `spanish-voice-ai.md` | Spanish voice AI research |
| `claude-code-remote.md` | Claude Code remote setup notes |
| `session-tracker.md` | Session tracking system — hooks, Sheet, n8n workflow |
| `agency-naming.md` | Old naming brainstorm (superseded by TourForce) |
| `stripe-billing.md` | Stripe API keys, account ID, products, Chat-Dash integration |
| `tourforce-pricing.md` | 3-tier pricing model (Starter $99/Pro $249/Premium $499), feature matrix, cost data |
