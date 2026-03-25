# Cekura Testing Platform (QA TOOL)

Detailed Cekura configuration, scenarios, metrics, and known issues.

## Connection
- **MCP Server**: `https://api.cekura.ai/mcp` with `X-CEKURA-API-KEY` header
- **REST API**: `https://api.cekura.ai` — 70+ endpoints
- **API Key**: `c1d54ef4f8e8ed6e5e94033d78b4765060a5a116030e7281a03ed926efb1e2fc`
- **Scott's org**: Sub-Zero Automations (org ID: 3101) | Project: Scott Frederick James Project (ID: 3782)
- **Key endpoints**: `POST /test_framework/v1/scenarios/run_scenarios/`, `GET /test_framework/v1/results/`
- **GitHub Action**: `cekura-ai/cekura-github-actions@v1.0.0`

## Agent Mappings (Cekura ID → agent name)
- **Emma/bob** (Cekura ID 13253): `assistant_provider: retell` — **WORKING**
- **CNKB/Cimo** (Cekura ID 13260): `assistant_provider: retell` — **WORKING** (validated 2026-02-22)
- Duplicates 13254, 13259 deleted
- **Clone agents:** Canton 13779, StoneOak 13780, RoundRock 13781, Rayford 13782, Burlington 13783, Pickering 13784, Leaside 13788, Riverside 14125, Sudbury 14388

## Config Notes
- MUST set `assistant_provider: "retell"`, `retell_api_key`, AND `chat_assistant_id`
- MUST include `inbound: false` when creating agents (required field, not optional)
- **MUST set `outbound_auto_call: true`** — without this, Cekura creates runs but never triggers Retell calls (timeout)
- `contact_number` must be a Retell phone number with a WORKING SIP outbound credential
- **`XPrime17` SIP credential is BROKEN** — gets `telephony_provider_permission_denied` from Twilio
- Working credentials: `xprime` (on main account xprime trunk only), per-centre slugs on sub-account trunks (e.g., `sudbury`, `leaside`, `agent` for Canton)
- CNKB source + Burlington + Pickering use Emma's number (`+12494492726`) as fallback for Cekura
- Cekura passes `override_agent_id` to Retell, so from_number doesn't need to match the agent
- Batch runs (multiple scenarios at once) ALL timeout — run scenarios ONE AT A TIME
- Results take 5-7 minutes to process (pending → in_progress → evaluating → completed)
- MCP `scenarios_partial_update` BUG: sends array params as query params, use `curl -X PATCH` instead
- **Cron `agent` field overrides per-scenario agents** — cron requires top-level `agent` (can't be null, returns 400). For multi-agent testing, use SEPARATE crons per agent.
- **`test_profiles_partial_update` REPLACES entire `information` object** — must include ALL fields when updating (not a merge)
- **CEKURA_TEST sentinel:** All test profiles use `FIRST_NAME=CEKURA_TEST` so test calls are identifiable in ChatDash transcripts ("Hello CEKURA_TEST")

## Two-Tier Testing Architecture (UPDATED 2026-03-25)
- **Tier 1** (source agent 13260): 14 scenarios tagged `tier1` — full regression
- **Tier 2** (9 clones): 18 scenarios (2 each) tagged `tier2` — smoke tests for template var resolution
- **Tier 1 cron:** ID 427, **monthly 1st Monday** 6AM ET, voice mode, tag-based (`tier1`)
  - Changed 2026-03-25: was weekly Monday in text mode — text mode was broken (0% since Mar 2), switched back to voice + reduced to monthly
- **Tier 2 crons:** 8 per-agent crons (Wed, staggered 5min apart, US/Eastern):
  - 429: Canton (6:00 AM) — scenarios 213685, 213691
  - 436: Stone Oak (6:05 AM) — scenarios 213686, 213692
  - 437: Round Rock (6:10 AM) — scenarios 213687, 213693
  - 438: Rayford (6:15 AM) — scenarios 213688, 213694
  - 439: Burlington (6:20 AM) — scenarios 213689, 213695
  - 440: Pickering (6:25 AM) — scenarios 213690, 213696
  - 441: Leaside (6:30 AM) — scenarios 213711, 213712
  - 442: Riverside (6:35 AM) — scenarios 218096, 218097
  - TBD: Sudbury (6:40 AM) — scenarios 220933, 220932 (cron NOT YET created — create via dashboard: agent 14388, Wed 6:40 AM ET)
- **Location Name Accuracy metric:** ID 119652 (org-level)

## Scenarios
- **Emma** (5): 139026-139030
- **CNKB Tier 1** (14): 139031-139035, 141951, 213661-213668
- **CNKB Tier 2** (18): 213685-213696, 213711-213712, 218096-218097, 220932-220933 — 2 per clone (Location Verification + Happy Path Smoke)
- **Metric config fixes (2026-02-25):** Removed Tour Booking Success from #139035 (Callback), #141951 (Wrong Location), #213665 (Frustrated Repeat). Removed Natural Conversation Flow from #213665.

## Metrics (IDs 118268-118273, 119187, 119652)
Tour Booking Success, One Question Per Turn, Slot Validation Accuracy, AI Disclosure Handling, Graceful Rejection Handling, Natural Conversation Flow, Wrong Location Handling, Location Name Accuracy

## Email Digest (2026-02-23)
- **Script:** `/root/scripts/cekura-digest.ts` (also committed to `lead-reactivation-github/scripts/`)
- **Droplet cron:** Mon 7:30 AM ET (Tier 1), Wed 7:30 AM ET (Tier 2) — 90 min after Cekura crons fire
- **Sends to:** scott.james@codeninjas.com via Resend API
- **Subject format:** `[Cekura Tier X] ALL PASS` or `FAILURES DETECTED` + date
- **HTML email:** green/red header, per-scenario pass/fail table, custom metric scores (5-point scale)
- **Log:** `/var/log/cekura-digest.log`
- **DST note:** Crontab uses UTC (12:30 = 7:30 AM EST). During EDT (Mar–Nov), emails arrive at 8:30 AM ET — adjust crontab to `30 11` if needed

## Known Issues
- **Subscription:** Developer plan, 751 credits remaining (as of 2026-03-25). Expires 2026-04-22.
- **Text mode broken:** Cekura text mode (Retell Chat) produces 0% pass rate for CNKB agent — confirmed on Mar 2 and Mar 23 runs. Voice mode works (50% on Feb 23). Use voice mode only.
- `{{LOCATION_NAME}}` FIXED 2026-02-23 — hardcoded in all clone LLMs
- `{{first_name}}` FIXED 2026-02-24 — test profiles added
- **CEKURA_TEST sentinel** ADDED 2026-03-04
- **Tier 2 cron split** FIXED 2026-03-04
- `One Question Per Turn` metric scored 0/5 on Emma happy path — may need prompt tuning
- `XPrime17` SIP credential broken on Twilio
