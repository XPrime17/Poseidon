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

## Voice AI Agency Skill
- Built 2026-02-06: 30 files (27 internal + 3 external)
- 12 workflows across BUILD/SELL/DELIVER pillars
- 4 CLI tools: PricingCalculator, AgentAudit, ClientTracker, PromptBuilder
- 5 named agents: Paige Mercer, Devin Cross, Riley Nakamura, Morgan Reeves, Kai Holbrook
- 11 custom traits: 4 expertise + 4 personality + 3 approach
- Client data stored in `Data/clients.json` (JSON-backed, no external deps)
