# PAI Memory

## Context Isolation Rules (CRITICAL)
- **Retell** = voice AI platform (agents, LLMs, clones, calls, prompts). This is the OPERATIONAL system.
- **Cekura** = testing/evaluation platform (scenarios, metrics, test runs). This is a QA TOOL.
- When Scott asks about Retell agents, calls, prompts, or clones → use Retell section. Do NOT load Cekura context.
- When Scott asks about testing, scenarios, metrics, or evaluation → use Cekura section.
- Only cross-reference when Scott explicitly asks to test a Retell agent via Cekura.

## Skill Creation Pattern
- Private skills use `_ALLCAPS` naming (e.g., `_VOICEAIAGENCY`)
- SKILL.md needs YAML frontmatter with `name` and `description` (description triggers auto-detection)
- Workflows follow pattern: voice notification → when-to-use → prerequisite knowledge → workflow steps → quality gates → agent delegation → related workflows
- Tools are TypeScript/Bun with `parseArgs`, `--help`, and `.help.md` companions
- Custom traits go in `~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/Traits.yaml` — ComposeAgent.ts deep-merges base + user
- Named agents go in `~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/NamedAgents.md`
- EXTEND.yaml is the manifest for skill customizations

## MCP Server Pattern
- MCP SDK v1.11+ requires Zod schemas (`.shape`) for tool params, not plain objects
- `McpServer` constructor: just `name` + `version`, no `capabilities`
- Tool pattern: `server.tool(name, description, ZodSchema.shape, handler(async (data) => {}))`
- Retell prompts live on the LLM object, not the agent — resolve via `agent.response_engine.llm_id`
- MCP config at `~/.claude/MCPs/` with `{name}-MCP.json` naming

## Email Delivery
- ALWAYS use Resend HTTP API — never sendmail/SMTP (SMTP relay to smtp.resend.com:587 times out)
- API key in `/etc/postfix/sasl_passwd`: `re_jZ1fNYUk_Nb3DrrinayxqTTMGYtyMiKCj`
- Pattern: `curl -s -X POST 'https://api.resend.com/emails' -H 'Authorization: Bearer KEY' -H 'Content-Type: application/json' -d '{"from":"Poseidon <onboarding@resend.dev>","to":["EMAIL"],"subject":"SUBJECT","text":"BODY"}'`
- Sender: `onboarding@resend.dev` (Resend default domain)
- Scott's email: scott.james@codeninjas.com

## Scott's Preferences
- Architecture diagrams ALWAYS use Art skill to produce PNG — never ASCII/markdown substitutes
- n8n has TWO instances: self-hosted Docker (`138.197.171.204:5678`) and cloud (`xprime17.app.n8n.cloud`)

## _KB Skill Setup — LEFT OFF (2026-02-10)
- n8n self-hosted: workflows imported (gdocs-read: RQt8auabMaJqoOTB, gdocs-write: titk07qAVIOFeqcI) + credential shell (ID: 1)
- Google Cloud project created with OAuth client ID for "Poseidon KB Manager"
- BLOCKER: scott.james1717@gmail.com needs to be added as test user in Google Cloud Console → OAuth consent screen → Test users
- After that: re-try OAuth URL, get auth code, exchange for tokens via curl on droplet, inject into n8n credential
- OAuth authorization URL is ready (uses localhost:5678 redirect)
- Architecture diagram PNG created and saved

---

## Retell Platform (OPERATIONAL — agents, prompts, calls, clones)
- **API key:** `key_eb01765f71b0a93b347d324af573`
- Prompts live on the LLM object, not the agent — resolve via `agent.response_engine.llm_id`

### Retell Agents
| Name | Agent ID | Phone | LLM ID | Status |
|------|----------|-------|--------|--------|
| Emma | `agent_552e57364711f0eec51afa512a` | `+12494492726` | (original) | WORKING |
| CNKB (East Gwillimbury) | `agent_0c6c32b61cb506fefb6ac247f4` | `+12899030611` | `llm_44111168b1a2a469f50891b26e34` (v39) | WORKING |
| CNKB-Canton | `agent_f10e56ab67fddf22bd60def599` | `+17744062037` (outbound) | `llm_d25bbc493b20eb095ab92bceb116` | WORKING |
| CNKB-StoneOak | (see clone list) | — | `llm_c26de057ffe1ff9a71366e95c447` | WORKING |
| CNKB-RoundRock | (see clone list) | — | `llm_7b795d82b19f42562ef0abaf857f` | WORKING |
| CNKB-Rayford | (see clone list) | — | `llm_118c93e692e7255083a56043c3e9` | WORKING |
| CNKB-Burlington | (see clone list) | — | `llm_97ac9c35e7387a448b927ce509b6` | WORKING |
| CNKB-Pickering | (see clone list) | — | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` | WORKING |

### Retell Clone Process (UPDATED 2026-02-21)
- GET agent → strip `agent_id`, `version`, `is_published`, `last_modification_timestamp` → POST create-agent
- **CRITICAL: Do NOT strip `response_engine.version`** — Retell defaults to version 0 (first LLM version ever)
- Instead, **create a NEW LLM copy** for each clone so version 0 = current prompt
- Retell API blocks version changes on existing agents
- **Each clone gets its OWN LLM copy.** Prompt changes must be applied to ALL LLM copies individually.
- **Bug fixed 2026-02-21:** All 6 clones were pinned to LLM v0 (original East Gwillimbury prompt). Calls said wrong location. Fixed by creating new LLM copies with correct `{{LOCATION_NAME}}` prompt.

### Retell + Prompt Hash
- Last prompt update: hash `e220cd32b067` across all 7 LLMs (source + 6 clones)
- New section added: "Non-Create Program Interest (Any Stage)" (+1,145 chars)

### Twilio Infrastructure
- Only 2 SIP trunks in this account: `xprime.pstn.twilio.com` (working) and `cneg-retell-ai-agent.pstn.twilio.com`
- Emma uses `+12494492726` on xprime trunk
- CNKB uses `+12899030611` on xprime trunk
- Canton/Rayford/RoundRock/StoneOak trunks are in DIFFERENT Twilio accounts — don't use those numbers here

### ChatDash Integration (2026-02-20)
- **Architecture:** One Retell agent clone per centre → one ChatDash agent per client
- **Canton test:** CNKB-Canton → ChatDash webhook `6998716d34ff0eb25cde47fe`
- **Agent-per-client rule:** Since Sept 2025, one agent = one client (no sharing)
- **Partner discount:** 40% off annual Premium/Growth via retellai.com/app-partner/chatdash

---

## Cekura Testing Platform (QA TOOL — scenarios, metrics, evaluation)
- **MCP Server**: Added to Claude Code — `https://api.cekura.ai/mcp` with `X-CEKURA-API-KEY` header
- **REST API**: `https://api.cekura.ai` — 70+ endpoints
- **API Key**: `c1d54ef4f8e8ed6e5e94033d78b4765060a5a116030e7281a03ed926efb1e2fc`
- **Scott's org**: Sub-Zero Automations (org ID: 3101) | Project: Scott Frederick James Project (ID: 3782)
- **Key endpoints**: `POST /test_framework/v1/scenarios/run_scenarios/` (run tests), `GET /test_framework/v1/results/` (get results)
- **GitHub Action**: `cekura-ai/cekura-github-actions@v1.0.0`

### Cekura Agent Mappings (Cekura ID → agent name only)
- **Emma/bob** (Cekura ID 13253): `assistant_provider: retell` — **WORKING**
- **CNKB/Cimo** (Cekura ID 13260): `assistant_provider: retell` — **WORKING** (validated 2026-02-22)
- Duplicates 13254, 13259 deleted
- **6 clone agents:** Canton 13779, StoneOak 13780, RoundRock 13781, Rayford 13782, Burlington 13783, Pickering 13784

### Cekura Config Notes
- MUST set `assistant_provider: "retell"`, `retell_api_key`, AND `chat_assistant_id`
- MUST include `inbound: false` when creating agents (required field, not optional)
- **MUST set `outbound_auto_call: true`** — without this, Cekura creates runs but never triggers Retell calls (timeout)
- `contact_number` must be a Retell phone number with a WORKING SIP outbound credential
- **`XPrime17` SIP credential is BROKEN** — gets `telephony_provider_permission_denied` from Twilio
- Working credentials: `xprime` (on xprime trunk), `agent` (on centre-specific trunks)
- CNKB source + Burlington + Pickering use Emma's number (`+12494492726`) as fallback for Cekura
- Cekura passes `override_agent_id` to Retell, so from_number doesn't need to match the agent
- Batch runs (multiple scenarios at once) ALL timeout — run scenarios ONE AT A TIME
- Results take 5-7 minutes to process (pending → in_progress → evaluating → completed)
- MCP `scenarios_partial_update` BUG: sends array params as query params, use `curl -X PATCH` instead

### Cekura Two-Tier Testing Architecture (2026-02-22)
- **Tier 1** (source agent 13260): 14 scenarios tagged `tier1` — full regression
- **Tier 2** (6 clones): 12 scenarios (2 each) tagged `tier2` — smoke tests for template var resolution
- **Tier 1 cron:** ID 427, Monday 6AM ET, tag-based (`tier1`)
- **Tier 2 cron:** ID 429, Wednesday 6AM ET, scenario-based (all 12 IDs)
- **Location Name Accuracy metric:** ID 119652 (org-level)
- **Clone Cekura IDs:** Canton=13779, StoneOak=13780, RoundRock=13781, Rayford=13782, Burlington=13783, Pickering=13784
- Full details in `AgentConfig.md` Cekura Testing Architecture section

### Cekura Scenarios
- **Emma** (5): 139026-139030
- **CNKB Tier 1** (14): 139031-139035, 141951, 213661-213668
- **CNKB Tier 2** (12): 213685-213696 — 2 per clone (Location Verification + Happy Path Smoke)

### Cekura Metrics (IDs 118268-118273, 119187, 119652)
- Tour Booking Success, One Question Per Turn, Slot Validation Accuracy, AI Disclosure Handling, Graceful Rejection Handling, Natural Conversation Flow, Wrong Location Handling, Location Name Accuracy

### Cekura Known Issues
- **Subscription active** — Developer plan, 680/750 credits remaining, expires 2026-03-22
- Template variables (`{{LOCATION_NAME}}`, `{{FIRST_NAME}}`) appear raw in transcripts — Cekura doesn't pass dynamic vars
- `One Question Per Turn` metric scored 0/5 on Emma happy path — may need prompt tuning
- `XPrime17` SIP credential broken on Twilio — see Config Notes above

---

## Workflow Separation (CRITICAL)
- **Speed-to-lead (CNKB)** → cloud n8n (`xprime17.app.n8n.cloud`) — Scott updates manually
- **Lead reactivation (Emma)** → Cloudflare Worker + repo n8n (`/root/lead-reactivation-github`)
- These are DIFFERENT systems — don't conflate them
- **TODO (lead-reactivation):** Add `retell_agent_id` to `centres` table, update Worker + n8n to use per-centre agent IDs (currently hardcoded to Emma)

## Spanish Voice AI Research (2026-02-17)
- See `spanish-voice-ai.md` for full details
- Key finding: Do NOT use multi mode on working English agents — degrades performance
- Recommendation: Dedicated Spanish agent over multi mode
- Stone Oak is 64.7% Hispanic — Spanish is revenue capture
- GitHub issue: XPrime17/lead-reactivation#19

## Voice AI Agency Skill
- Built 2026-02-06: 30 files (27 internal + 3 external)
- 12 workflows across BUILD/SELL/DELIVER pillars
- 4 CLI tools: PricingCalculator, AgentAudit, ClientTracker, PromptBuilder
- 5 named agents: Paige Mercer, Devin Cross, Riley Nakamura, Morgan Reeves, Kai Holbrook
- 11 custom traits: 4 expertise + 4 personality + 3 approach
- Client data stored in `Data/clients.json` (JSON-backed, no external deps)
