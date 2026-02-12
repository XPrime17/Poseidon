---
capture_type: RESEARCH
timestamp: 2026-02-11 18:04:35 PST
executor: default
agent_completion: Cekura has official MCP server, seventy plus API endpoints, and GitHub Actions.
---

# RESEARCH: Cekura has official MCP server, seventy plus API endpoints, and GitHub Actions.

**Agent:** default
**Completed:** 2026:02:11:180435

---

## Agent Output

Here is the complete research report.

---

SUMMARY: Comprehensive investigation of Cekura's programmatic access ecosystem -- MCP server, REST API, GitHub Actions, webhooks, and community integrations.

ANALYSIS:

The conventional narrative would say "Cekura is just a dashboard product, you'll need to screen-scrape or wait for an API." The data contradicts that completely. Cekura has built one of the more thorough programmatic access layers I have seen from a YC-stage startup. Here is everything found:

---

## 1. MCP SERVER -- CONFIRMED, OFFICIAL, PRODUCTION-READY

Cekura has a **first-party MCP server** documented at:
`https://docs.cekura.ai/mcp/overview`

**MCP Endpoint:** `https://api.cekura.ai/mcp`

**Claude Code Setup (one command):**
```bash
claude mcp add --transport http cekura --scope user https://api.cekura.ai/mcp --header "X-CEKURA-API-KEY:YOUR_API_KEY_HERE"
```

**Claude Desktop / Cursor / VS Code (JSON config):**
```json
{
  "mcpServers": {
    "cekura": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://api.cekura.ai/mcp",
        "--header",
        "X-CEKURA-API-KEY:${CEKURA_API_KEY}"
      ],
      "env": {
        "CEKURA_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**Prerequisites:** Node.js 20.18.1+

**MCP Tool Categories:**
- **Observability** -- Call logging, search, details retrieval, evaluation, export
- **Testing** -- Test scenario creation/execution, agent management, metric definition, result viewing
- **Schedules** -- Scheduled job creation, cronjob management, schedule updates

**Rate Limits:**
- Free: 1,000 requests/day
- Pro: 10,000 requests/day
- Enterprise: Custom

---

## 2. REST API -- EXTENSIVE, 70+ ENDPOINTS

**Base URL:** `https://api.cekura.ai`

**Authentication Header:** `X-CEKURA-API-KEY: <your-key>`

**API Key Types:**
| Type | Scope | Rotation |
|------|-------|----------|
| Admin | Full org access, billing, user mgmt | 90 days |
| Project | Single project, CI/CD recommended | 180 days |
| Read-Only | GET requests only, monitoring | Annually |

**Endpoint Categories (complete list from `llms.txt`):**

### Observability API (`/observability/v1/`)
- `POST /observe/` -- Send calls (custom integration webhook)
- `POST /elevenlabs/observe/` -- ElevenLabs-specific observability
- `GET` -- Get Call, List Calls, Get Overall Evaluation
- `POST` -- Create Evaluators from Call Logs, Evaluate Metrics, Reevaluate Calls, Send Calls
- `DELETE` -- Delete Call

### Test Framework API (`/test_framework/v1/`)
- **Agents:** Create, Get, List, Update (Full/Partial), Delete, Duplicate
- **Evaluators:** Create, Create from Transcript, Generate, Get, List, Update, Delete, Run (Voice/Text/Pipecat/Websocket)
- **Metrics:** Create, Create in Bulk, Generate, Get, List, Update, Delete, Preview, Auto-Improve
- **Results:** Get, List, Rerun, Generate Shareable Link, Delete Runs
- **Mock Tools:** Create, Get, List, Update, Delete, Execute
- **Test Profiles:** Create, Get, List, Update, Delete
- **Folders:** Create, List, Delete, Move, Rename
- **Other:** List Personalities, List Predefined Metrics, List Inbound Phone Numbers, Upload Knowledge Base Files, End Calls, Runs Improve Prompt

### Schedules API
- Create/Get/List/Update/Delete Schedule Jobs
- Create Cronjobs

### User/Organization API
- Create/Get/List/Update/Delete Projects
- Get Billing Info

### Example API Call:
```bash
curl --request GET \
  --url https://api.cekura.ai/test_framework/v1/aiagents/ \
  --header 'X-CEKURA-API-KEY: <api-key>'
```

---

## 3. GITHUB REPOS AND ACTIONS

**GitHub Organization:** `github.com/cekura-ai`

**Official GitHub Action:** [`cekura-ai/cekura-github-actions`](https://github.com/cekura-ai/cekura-github-actions) (MIT License)

**Usage:**
```yaml
- name: Cekura Run Tests
  uses: cekura-ai/cekura-github-actions@v1.0.0
  with:
    agent_id: ${{ vars.AGENT_ID }}
    scenario_ids: ${{ vars.SCENARIO_IDS }}
    api_key: ${{ secrets.CEKURA_API_KEY }}
```

**Action Inputs:**
| Input | Required | Default |
|-------|----------|---------|
| `agent_id` | Yes | -- |
| `api_key` | Yes | -- |
| `scenario_ids` | Conditional | -- |
| `tags` | Conditional | -- |
| `phone_number` | No | -- |
| `api_url` | No | `https://api.cekura.ai` |
| `frequency` | No | 1 |
| `timeout` | No | 3600s |

**Other Repos Found:**
- `voceradharam/cekura-embed` -- Embed widget
- `amanpathra2/cekura-docs-test-repo` -- Docs testing
- `sunajeb/Cekura_voice_testing` -- Community: automated weekly competitor voice agent testing

---

## 4. WEBHOOKS (INBOUND AND OUTBOUND)

### Custom Integration Webhook (send data TO Cekura):
- **Auth Header:** `X-CEKURA-API-KEY`
- **Method:** POST, JSON
- **Timing:** Must arrive within 5 minutes of call end
- **Payload:**
```json
{
  "agent_id": 123,
  "calls": [{
    "id": "unique-call-id",
    "startedAt": "2026-02-12T10:00:00Z",
    "endedAt": "2026-02-12T10:05:00Z",
    "messages": [{
      "role": "bot|user|system|function_call|function_call_result",
      "content": "message text",
      "start_time": 1707734400000,
      "end_time": 1707734405000
    }],
    "to_phone_number": "+15551234567",
    "from_phone_number": "+15559876543",
    "metadata": {},
    "endedReason": "completed"
  }]
}
```

### Outbound Webhooks (Cekura sends TO you):
- **Auth Header:** `X-CEKURA-SECRET` (configured webhook secret)
- **Event Types:**
  - `result.completed` -- Test run finished (includes `is_cronjob` flag for scheduled runs)
  - `call_log.completed` -- Observability call evaluation done
- **Provider Forwarding:** Vapi (`end-of-call-report`), Retell (`call_analyzed`)

---

## 5. THIRD-PARTY INTEGRATIONS

### Native Integrations (built-in):
- **Retell AI** -- Testing + Observability
- **VAPI** -- Testing + Observability
- **ElevenLabs** -- Testing + Observability
- **LiveKit** -- Manual + Automated testing
- **Pipecat (Daily)** -- Manual + Automated testing
- **Cisco Webex** -- App Hub listing
- **Twilio** -- Phone number import, SIP calls
- **Slack** -- Alert notifications

### CI/CD:
- **GitHub Actions** -- Official action (see above)
- **Cron Jobs** -- Built-in scheduled testing API

### NO native integration found for:
- **n8n** -- But trivially buildable via HTTP Request node + webhook
- **Zapier** -- No native app; webhook-based integration possible
- **Make (Integromat)** -- Same, HTTP module approach

### Embeddable Widgets:
- Calls Embedding, Result Embedding, Overview Embedding
- Token-based auth (`/embed/generate-token`, `/embed/refreshing-expired-token`)

---

## 6. COMMUNITY AND SOCIAL

- **X/Twitter:** [@cekuraai](https://x.com/cekuraai) (formerly Vocera)
- **Y Combinator:** [YC F24 batch](https://www.ycombinator.com/companies/cekura-ai)
- **Product Hunt:** Listed under [Vocera](https://www.producthunt.com/products/vocera)
- **LinkedIn:** [Cekura company page](https://www.linkedin.com/company/cekuraai)
- **Crunchbase:** [Vocera AI profile](https://www.crunchbase.com/organization/vocera-ai)
- **No public Discord or developer forum found** -- Support via support@cekura.ai
- **Hiring:** Forward Deployed Engineer role posted on YC
- **Smithery.ai:** No Cekura MCP listing on Smithery (they host their own MCP endpoint directly)
- **npm:** No published `@cekura/*` packages (MCP uses `mcp-remote` proxy pattern instead)

---

## 7. KEY TECHNICAL DETAILS

- **Company:** Cekura AI (formerly Vocera), YC F24, Sunnyvale CA
- **Founded:** 2024, 75+ customers within first year
- **API Base:** `https://api.cekura.ai`
- **MCP Endpoint:** `https://api.cekura.ai/mcp`
- **Dashboard:** `https://dashboard.cekura.ai`
- **Docs:** `https://docs.cekura.ai`
- **Docs Machine Index:** `https://docs.cekura.ai/llms.txt`
- **Auth Pattern:** `X-CEKURA-API-KEY` header on all requests
- **IP Whitelisting:** Available for enterprise (documented at `/documentation/advanced/ip-whitelisting`)
- **PII Redaction:** Built-in for transcripts and recordings

---

ACTIONS: Searched GitHub (gh CLI + web), npm, Smithery, web search (15+ queries), fetched 8 documentation pages, extracted full `llms.txt` index with 70+ API endpoints.

RESULTS: Cekura has a production MCP server, a comprehensive 70+ endpoint REST API, an official GitHub Action, bidirectional webhook support, embeddable widgets, and native integrations with Retell/VAPI/ElevenLabs/LiveKit/Pipecat/Webex. No npm package or Smithery listing exists because they host MCP directly.

STATUS: Complete. All four research vectors (MCP, GitHub, community integrations, social/forums) fully investigated.

CAPTURE: Cekura MCP at `https://api.cekura.ai/mcp`, auth via `X-CEKURA-API-KEY`, 70+ REST endpoints at `api.cekura.ai`, GitHub Action at `cekura-ai/cekura-github-actions@v1.0.0`, webhooks use `X-CEKURA-SECRET`, three API key types (Admin/Project/Read-Only), formerly Vocera YC F24.

NEXT:
1. Get or create a Cekura API key from `dashboard.cekura.ai`
2. Add the MCP server to Claude Code with `claude mcp add`
3. Set up n8n integration via HTTP Request nodes pointed at `api.cekura.ai`
4. Configure outbound webhooks for test result notifications

STORY EXPLANATION:
1. Cekura (formerly Vocera, YC F24) is an automated QA platform for voice and chat AI agents with 75+ customers.
2. They have an official, production MCP server at `https://api.cekura.ai/mcp` that works with Claude Code, Claude Desktop, Cursor, and VS Code.
3. The REST API exposes 70+ endpoints across observability, test framework, schedules, and user management domains.
4. Authentication uses `X-CEKURA-API-KEY` header with three key tiers: Admin (full), Project (scoped), and Read-Only.
5. An official GitHub Action (`cekura-ai/cekura-github-actions@v1.0.0`) enables CI/CD test automation with zero dependencies.
6. Bidirectional webhooks support both sending data to Cekura (custom integration) and receiving results/alerts from Cekura.
7. Native integrations exist for Retell, VAPI, ElevenLabs, LiveKit, Pipecat, and Webex -- no native n8n/Zapier but trivially buildable via HTTP.
8. No public Discord/forum exists; community interaction happens through YC, Product Hunt, X (@cekuraai), and direct support email.

COMPLETED: Cekura has official MCP server, seventy plus API endpoints, and GitHub Actions.
agentId: a6ede10 (for resuming to continue this agent's work if needed)
<usage>total_tokens: 48093
tool_uses: 51
duration_ms: 233860</usage>

---

## Metadata

**Transcript:** `/root/.claude/projects/-root/b3ab745b-25c1-4498-96a3-29811957bb6e.jsonl`
**Captured:** 2026-02-11 18:04:35 PST

---

*This output was automatically captured by UOCS SubagentStop hook.*
