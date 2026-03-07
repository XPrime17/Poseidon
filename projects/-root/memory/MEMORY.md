# PAI Memory

## Context Isolation Rules (CRITICAL)
- **Retell** = voice AI platform (agents, LLMs, clones, calls, prompts). OPERATIONAL system.
- **Cekura** = testing/evaluation platform (scenarios, metrics, test runs). QA TOOL.
- When Scott asks about agents, calls, prompts, clones → Retell section. Do NOT load Cekura.
- When Scott asks about testing, scenarios, metrics → Cekura section.
- Only cross-reference when Scott explicitly asks to test a Retell agent via Cekura.

## Architecture — Lead System (UPDATED 2026-03-06)
- **Cloudflare Worker is ABANDONED.** All retry logic lives in n8n + Google Sheets.
- **Active n8n workflows** on `xprime17.app.n8n.cloud`:
  - `Outbound Call Flow - Multicentre` (6sPwo7ngPyTWfmwM) — initial calls + retry pickup
  - `[TEST] End Of Call - Retry System` (4p1V0wESn3kZySt6) — post-call routing, retry scheduling
- **State store:** Google Sheets (Leads MasterSheet), NOT Supabase
- **Do NOT check Worker health or Supabase for retry state**
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
- **Read-only**: CSV export via `https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv`
- **Write**: Temp webhook workflow on n8n cloud → activate → trigger → delete
- **Write credential**: `yjVHcEWrpyDmxkvv` | **Read credential**: `ybuxqM8F2NkyCA7e`
- **Schema rule**: `appendOrUpdate` requires ALL sheet columns (unused = `removed: true`)
- **n8n API**: `active` is read-only on PUT. Use `/activate` and `/deactivate` endpoints.

## Email Delivery
- ALWAYS use Resend HTTP API — never sendmail/SMTP
- API key: `re_jZ1fNYUk_Nb3DrrinayxqTTMGYtyMiKCj`
- Sender: `onboarding@resend.dev` | Scott's email: `scott.james@codeninjas.com`

## Scott's Preferences
- Architecture diagrams ALWAYS use Art skill → PNG (never ASCII/markdown)
- ALWAYS provide full absolute path to generated images
- n8n has TWO instances: self-hosted Docker (`138.197.171.204:5678`) and cloud (`xprime17.app.n8n.cloud`)
- **n8n self-hosted API key is EXPIRED** — only cloud instance works with current key

## n8n API
- **Cloud API key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzE0ODRiZS1mNjg1LTQ3M2EtYmUxNC0xOTZkOTdlZDE0YTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4NjY3MDI5fQ.Ky5Z-77U6ldB6STvg7JJ4ULXb58Htdt7L-QUCwhI0Yk`
- **Cloud URL**: `https://xprime17.app.n8n.cloud/api/v1/`

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
| CNKB-StoneOak | (clone) | — | `llm_c26de057ffe1ff9a71366e95c447` | WORKING |
| CNKB-RoundRock | (clone) | — | `llm_7b795d82b19f42562ef0abaf857f` | WORKING |
| CNKB-Rayford | (clone) | — | `llm_118c93e692e7255083a56043c3e9` | WORKING |
| CNKB-Burlington | (clone) | — | `llm_97ac9c35e7387a448b927ce509b6` | WORKING |
| CNKB-Pickering | (clone) | — | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` | WORKING |
| CNKB-Leaside | `agent_1f8c2799630cd6524fa8176e6d` | `+16475841523` | `llm_4cfa990bea7bfcbf67060e8c8f72` | WORKING |
| CNKB-Riverside | `agent_ee11bcfc9222c37df4de8bfe95` | `+12036484197` | `llm_512d93c0c71e0ef00e318b3e9fc0` | WORKING |
| CNKB-Sudbury | `agent_ccad25c0d5aab5eac8ce8c2354` | `+19786627576` | `llm_247d6d98f7073c6d31d54f26f53d` | WORKING |

### Retell Prompt Hash
- Last update (2026-03-07): hash `df15579d6021` (source) / `03824faa85ba` (Sudbury clone)
- Fix: Pricing Anti-Hallucination — removed hardcoded $175/$249, replaced with KB-defer
- Source prompt: 27,858 chars

### Clone Process
- Each clone gets OWN LLM copy. Prompt changes must be applied to ALL LLM copies individually.
- Location names hardcoded in clone LLMs (not dynamic vars). Source uses `{{LOCATION_NAME}}`.

### Twilio Infrastructure
- **Sub-account pattern:** Each centre gets sub-account + SIP trunk + phone number
- **Sub-accounts:** Brampton SW, Burlington, Canton, Leaside, Pickering, Rayford, Round Rock, Stone Oak, Sudbury
- **SIP credential RULE:** MUST use unique usernames per centre (e.g., `sudbury`, `leaside`), NOT `xprime`
- **Debug `telephony_provider_permission_denied`:** Check Retell `auth_username` matches Twilio cred username, verify uniqueness
- `onboard-centre.ts` automates full chain: sub-account → buy number → SIP creds → trunk → Retell import
- **Riverside** still on shared xprime trunk (pre-automation)

### Onboarding Script
- Step 0: Auto-discovery from codeninjas.com (sitemap → slug → services API)
- **(2026-03-06 fix)** Sub-account creation URL was nested incorrectly
- **(2026-03-07 fix)** SIP credential username was hardcoded to `xprime` — now uses per-centre `slugName`

---

## Cekura Testing Platform (QA TOOL)
- See `cekura-testing.md` for full details (config, scenarios, metrics, crons, known issues)
- **Subscription:** Balance at -3.39 as of 2026-03-06 — needs top-up
- **Clone Cekura IDs:** Canton=13779, StoneOak=13780, RoundRock=13781, Rayford=13782, Burlington=13783, Pickering=13784, Leaside=13788, Riverside=14125, Sudbury=14388

---

## _KB Skill Setup — LEFT OFF (2026-02-10)
- BLOCKER: scott.james1717@gmail.com needs to be added as test user in Google Cloud Console
- See previous memory for full details

## Voice AI Agency — TourForce (DECIDED 2026-03-02)
- **Name:** TourForce | **Domain:** tourforce.ai (AVAILABLE)
- **Formation status:** PENDING — awaiting accountant + lawyer feedback
- See `tourforce-branding.md`, `subzero-formation.md`

## Spanish Voice AI Research (2026-02-17)
- Do NOT use multi mode on working English agents — degrades performance
- Recommendation: Dedicated Spanish agent. GitHub issue: XPrime17/lead-reactivation#19
- See `spanish-voice-ai.md`

## Topic Files Index
| File | Contents |
|------|----------|
| `lead-reactivation.md` | Full architecture, retry cadence, ChatDash, pending steps |
| `cekura-testing.md` | Cekura config, scenarios, metrics, crons, email digest |
| `tourforce-branding.md` | Agency branding bible |
| `subzero-formation.md` | Corporate formation details |
| `spanish-voice-ai.md` | Spanish voice AI research |
| `claude-code-remote.md` | Claude Code remote setup notes |
| `agency-naming.md` | Old naming brainstorm (superseded by TourForce) |
