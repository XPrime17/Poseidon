# PAI Memory

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

## Cekura Integration (2026-02-12)
- **MCP Server**: Added to Claude Code — `https://api.cekura.ai/mcp` with `X-CEKURA-API-KEY` header
- **REST API**: `https://api.cekura.ai` — 70+ endpoints
- **API Key**: `c1d54ef4f8e8ed6e5e94033d78b4765060a5a116030e7281a03ed926efb1e2fc`
- **Scott's org**: Sub-Zero Automations (org ID: 3101) | Project: Scott Frederick James Project (ID: 3782)
- **Key endpoints**: `POST /test_framework/v1/scenarios/run_scenarios/` (run tests), `GET /test_framework/v1/results/` (get results)
- **GitHub Action**: `cekura-ai/cekura-github-actions@v1.0.0`

### Cekura Agents
- **Emma/bob** (ID 13253): Retell `agent_552e57364711f0eec51afa512a`, phone `+12494492726`, `assistant_provider: retell` — **WORKING**
- **CNKB/Cimo** (ID 13260): Retell `agent_0c6c32b61cb506fefb6ac247f4`, phone `+12899030611`, `assistant_provider: retell` — **NOT YET WORKING**
- Duplicate "bob (Copy)" (ID 13254) exists — should be deleted

### Cekura Critical Config for Retell Agents
- MUST set `assistant_provider: "retell"`, `retell_api_key`, AND `chat_assistant_id` (use same as `assistant_id` for voice-only)
- `contact_number` MUST match a Retell phone number registered to THAT agent's `assistant_id` — mismatches cause silent timeout
- Batch runs (multiple scenarios at once) ALL timeout — run scenarios ONE AT A TIME
- Results take 5-7 minutes to process (pending → in_progress → evaluating → completed)

### Cekura Scenarios Created
- **Emma** (5): 139026 (Happy Path), 139027 (Wrong Number), 139028 (AI Disclosure), 139029 (Not Interested), 139030 (Frustrated Caller)
- **CNKB** (5): 139031 (Happy Path Pricing), 139032 (Fast-Track), 139033 (Unavailable Time), 139034 (Identity Test), 139035 (Callback)

### Cekura Metrics Created (IDs 118268-118273)
- Tour Booking Success, One Question Per Turn, Slot Validation Accuracy, AI Disclosure Handling, Graceful Rejection Handling, Natural Conversation Flow

### Known Issues
- Template variables (`{{LOCATION_NAME}}`, `{{FIRST_NAME}}`) appear raw in transcripts — Cekura doesn't pass dynamic vars to Retell
- CNKB calls not triggering despite correct config — phone `+12899030611` imported into Retell on xprime trunk, but Cekura still times out. Needs more debugging.
- `One Question Per Turn` metric scored 0/5 on Emma happy path — may need prompt tuning

### Twilio Infrastructure
- Account SID: stored in session context (not committed)
- Only 2 SIP trunks in this account: `xprime.pstn.twilio.com` (working) and `cneg-retell-ai-agent.pstn.twilio.com`
- Emma uses `+12494492726` on xprime trunk
- CNKB uses `+12899030611` on xprime trunk (added this session)
- Canton/Rayford/RoundRock/StoneOak trunks are in DIFFERENT Twilio accounts — don't use those numbers for Cekura

## Workflow Separation (CRITICAL)
- **Speed-to-lead (CNKB)** → cloud n8n (`xprime17.app.n8n.cloud`) — Scott updates manually
- **Lead reactivation (Emma)** → Cloudflare Worker + repo n8n (`/root/lead-reactivation-github`)
- These are DIFFERENT systems — don't conflate them
- **TODO (lead-reactivation):** Add `retell_agent_id` to `centres` table, update Worker + n8n to use per-centre agent IDs (currently hardcoded to Emma)

## ChatDash Integration (2026-02-20)
- **Account:** Connected to Retell via API key
- **Architecture:** One Retell agent clone per centre → one ChatDash agent per client
- **Canton test:** CNKB-Canton (`agent_f10e56ab67fddf22bd60def599`) → phone `+17744062037` (outbound only) → ChatDash webhook `6998716d34ff0eb25cde47fe`
- **Retell API key:** `key_eb01765f71b0a93b347d324af573`
- **ChatDash agent-per-client rule:** Since Sept 2025, one agent = one client (no sharing)
- **Clone process (UPDATED 2026-02-21):** GET agent → strip `agent_id`, `version`, `is_published`, `last_modification_timestamp` → POST create-agent. **CRITICAL: Do NOT strip `response_engine.version`** — Retell defaults to version 0 (first LLM version ever, likely with hardcoded location). Instead, **create a NEW LLM copy** for each clone so version 0 = current prompt. Retell API blocks version changes on existing agents.
- **Each clone gets its OWN LLM copy.** Prompt changes must be applied to ALL LLM copies individually.
- **LLM mapping (all fixed 2026-02-21):**
  - Original CNKB (East Gwillimbury): `llm_44111168b1a2a469f50891b26e34` (v39)
  - CNKB-Canton: `llm_d25bbc493b20eb095ab92bceb116`
  - CNKB-StoneOak: `llm_c26de057ffe1ff9a71366e95c447`
  - CNKB-RoundRock: `llm_7b795d82b19f42562ef0abaf857f`
  - CNKB-Rayford: `llm_118c93e692e7255083a56043c3e9`
  - CNKB-Burlington: `llm_97ac9c35e7387a448b927ce509b6`
  - CNKB-Pickering: `llm_9b4bcc9bd77a2bd3c3c04ed579b1`
- **Bug fixed 2026-02-21:** All 6 clones were pinned to LLM v0 (original East Gwillimbury prompt). Calls said wrong location. Fixed by creating new LLM copies with correct `{{LOCATION_NAME}}` prompt.
- **Partner discount:** 40% off annual Premium/Growth via [retellai.com/app-partner/chatdash](https://www.retellai.com/app-partner/chatdash)

## Spanish Voice AI Research (2026-02-17)

### Key Finding: Do NOT Use Multi Mode on Working English Agents
- Retell `language: "multi"` degrades English performance: WER +1-7pts, turn detection -7pts (~97% → ~90%), ASR latency +50-110ms
- No vendor (Retell, Deepgram, ElevenLabs) claims multi mode equals single-language mode for English
- TTS is the exception: multilingual TTS models (Cartesia Sonic-3, ElevenLabs Flash v2.5) match or beat English-only predecessors
- **Recommendation: Dedicated Spanish agent (Option 2) over multi mode (Option 1)** — protects English quality

### Retell Spanish Support
- Full support: `es-ES` (Spain), `es-419` (Latin America), `multi` (auto-detect)
- 50+ languages total, Spanish is first-tier since multilingual launch
- No per-language surcharge — same $0.07/min
- LLM prompt MUST explicitly say "respond in Spanish" — `language` param only controls STT/TTS
- Use `usted` formality for business calls (Mexican Spanish convention)

### Platform Rankings for Spanish Voice AI
- **Retell** (current): Best overall — stay here, add dedicated Spanish agent ($0.07-0.12/min)
- **ElevenLabs Conv AI**: Best voice quality, 500+ Spanish voices, weaker telephony ($0.10-0.15/min)
- **Vapi**: Works but true cost 2.6-6x advertised $0.05/min ($0.13-0.31/min real)
- **Synthflow**: Good Spanish, $375/mo minimum, customer support red flags
- **Bland AI**: Spanish enterprise-gated, unreliable in production — avoid
- **PlayAI**: Meta acquired team July 2025, platform future uncertain — avoid
- **Air AI**: Dead platform, FTC lawsuit Aug 2025 — never recommend

### Implementation Plan (When Ready)
- Create new Retell agent with `language: es-419`, Mexican-accent ElevenLabs voice (e.g., "Leo")
- Write full Spanish prompt with `usted` formality, Code Ninjas context
- Route via IVR ("Press 1 for English, 2 para Espanol") or n8n webhook language detection
- Stone Oak is 64.7% Hispanic — Spanish is revenue capture, not a feature request
- No education franchise has deployed Spanish AI voice agents — first-mover advantage
- GitHub issue: XPrime17/lead-reactivation#19 (Ana Hockman callback + Spanish research)

### Multi-Mode Performance Data (Benchmarks)
| Component | English-Only (en-US) | Multi Mode | Delta |
|-----------|---------------------|------------|-------|
| STT WER | 6.8-9.1% | 8-15% | +1-7 pts |
| Turn Detection | ~97% accuracy | ~90% accuracy | -7 pts |
| ASR Latency | ~190ms | <300ms | +50-110ms |
| TTS Quality | Baseline | Same or better | No degradation |

### Voice Recommendations for Spanish
- **ElevenLabs "Leo"**: Energetic warm Mexican male — best for Stone Oak demographics
- Use `eleven_flash_v2_5` (multilingual, 75ms) NOT `eleven_multilingual_v2` (500-800ms) for agents
- **Cartesia Sonic-3**: 90ms, 42 languages, matches or beats Sonic-English — good alternative
- Voice selection matters more than language param for accent quality

## Voice AI Agency Skill
- Built 2026-02-06: 30 files (27 internal + 3 external)
- 12 workflows across BUILD/SELL/DELIVER pillars
- 4 CLI tools: PricingCalculator, AgentAudit, ClientTracker, PromptBuilder
- 5 named agents: Paige Mercer, Devin Cross, Riley Nakamura, Morgan Reeves, Kai Holbrook
- 11 custom traits: 4 expertise + 4 personality + 3 approach
- Client data stored in `Data/clients.json` (JSON-backed, no external deps)
