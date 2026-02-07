---
name: _VOICEAIAGENCY
description: Voice AI agency management system for building, selling, and delivering voice AI agents. USE WHEN voice ai agency, build voice agent, voice ai client, voice ai prospect, voice ai pricing, voice ai demo, voice ai proposal, onboard client, agent audit, niche targeting, prompt engineering voice, voice ai retention, voice ai performance.
---

## 🚨 MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the Voice AI Agency skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Voice AI Agency** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

# Voice AI Agency — BUILD / SELL / DELIVER

Private skill for managing a voice AI agency. Organized around the three pillars from Amplify Voice AI:

- **BUILD** — Construct production-quality voice AI agents
- **SELL** — Find prospects, demo, close deals
- **DELIVER** — Onboard clients, report performance, retain accounts

---

## Knowledge Base (load on-demand)

| File | Domain | Contents |
|------|--------|----------|
| `BuildKnowledge.md` | BUILD | Paige's 4-section prompt framework, 14 common mistakes, QA targets/KPIs |
| `SellKnowledge.md` | SELL | Outreach scripts, pricing strategy, demo prep, objection handling |
| `DeliverKnowledge.md` | DELIVER | 5-step onboarding, 6 key metrics, retention playbook, dashboard setup |
| `TechStack.md` | BUILD | Vapi/Retell/Bland, GHL/Make/n8n, Twilio, OpenAI/ElevenLabs reference |
| `PricingReference.md` | SELL | Tier pricing, COGS breakdown, margins, ROI calculator logic |
| `NichePlaybook.md` | SELL/DELIVER | Per-vertical strategies: dental, HVAC, med spa, gym, legal, real estate |

---

## CLI Tools

| Tool | Path | Purpose |
|------|------|---------|
| **PricingCalculator** | `Tools/PricingCalculator.ts` | Setup fees, retainer, ROI math per niche |
| **AgentAudit** | `Tools/AgentAudit.ts` | 14-point best practices checklist |
| **ClientTracker** | `Tools/ClientTracker.ts` | JSON-backed client lifecycle management |
| **PromptBuilder** | `Tools/PromptBuilder.ts` | 4-section prompt generator per niche |

```bash
# Usage examples
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PricingCalculator.ts --niche dental --calls 500
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/AgentAudit.ts --agent-name "Smile Dental Receptionist"
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts add --name "Smile Dental" --niche dental
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PromptBuilder.ts --niche dental --business "Smile Dental Clinic"
```

---

## Workflow Routing

Route to the appropriate workflow based on the request.

### BUILD Pillar — Agent Construction

| Trigger | Workflow | File |
|---------|----------|------|
| "build agent", "create voice agent", "full agent build" | **BuildAgent** — Full orchestrator (prompt + tech + QA) | `Workflows/BuildAgent.md` |
| "write prompt", "prompt engineer", "agent prompt" | **PromptEngineer** — Paige's 4-section framework | `Workflows/PromptEngineer.md` |
| "test agent", "QA", "quality check", "audit agent" | **QaTest** — Latency, edge cases, injection, KB coverage | `Workflows/QaTest.md` |
| "tech stack", "configure vapi", "setup retell", "twilio" | **TechStackSetup** — Platform configuration guide | `Workflows/TechStackSetup.md` |

### SELL Pillar — Sales & Prospecting

| Trigger | Workflow | File |
|---------|----------|------|
| "find prospects", "prospect research", "lead gen" | **ProspectResearch** — 20-30 prospect list + outreach | `Workflows/ProspectResearch.md` |
| "prepare demo", "demo script", "demo prep" | **PrepareDemo** — 60-sec demo + backup materials | `Workflows/PrepareDemo.md` |
| "generate proposal", "write proposal", "ROI proposal" | **GenerateProposal** — Proposal doc with ROI math | `Workflows/GenerateProposal.md` |
| "niche target", "which niche", "niche analysis" | **NicheTarget** — Niche scoring + selection | `Workflows/NicheTarget.md` |

### DELIVER Pillar — Client Success

| Trigger | Workflow | File |
|---------|----------|------|
| "onboard client", "new client setup", "client onboarding" | **OnboardClient** — 5-step onboarding flow | `Workflows/OnboardClient.md` |
| "performance report", "client metrics", "how is [client] doing" | **PerformanceReport** — 6 key metrics report | `Workflows/PerformanceReport.md` |
| "audit agent", "optimize agent", "agent check" | **AuditAgent** — Agent optimization audit | `Workflows/AuditAgent.md` |
| "retention check", "client health", "churn risk" | **RetentionCheck** — Client health + churn prevention | `Workflows/RetentionCheck.md` |

---

## Named Agents

Five named agents are registered in `SKILLCUSTOMIZATIONS/Agents/NamedAgents.md`:

| Agent | Role | Voice | Pillar |
|-------|------|-------|--------|
| **Paige Mercer** | Prompt Architect | Alice | BUILD |
| **Devin Cross** | The Closer / Sales | Marcus | SELL |
| **Riley Nakamura** | Systems Builder / Tech | James | BUILD |
| **Morgan Reeves** | Client Whisperer / Retention | Matilda | DELIVER |
| **Kai Holbrook** | Agency Strategist / Growth | George | Cross-cutting |

Use named agents by saying "have Paige write the prompt" or "ask Devin to prep the sales deck."

---

## Custom Traits

Voice AI custom traits are registered in `SKILLCUSTOMIZATIONS/Agents/Traits.yaml`:

**Expertise:** voiceai, promptcraft, voicetech, clientsuccess
**Personality:** closer, consultant, engineer, nurturer
**Approach:** revenuedriven, systemsthinking, relationshipfirst

Compose ad-hoc agents:
```bash
bun run ~/.claude/skills/Agents/Tools/ComposeAgent.ts --traits "voiceai,closer,revenuedriven"
```

---

## Integration

### Feeds Into
- **Agents** skill — custom traits and named agents
- **Research** skill — prospect and niche research
- **Browser** skill — demo verification, client dashboard checks

### Uses
- **ComposeAgent.ts** — dynamic agent composition with voice AI traits
- **Voice Notification Server** — phase announcements with agent-specific voices
- **Memory System** — WORK/ for active client projects, STATE/ for pipeline

---

## Data Storage

- **Client data:** `~/.claude/skills/_VOICEAIAGENCY/Data/clients.json`
- **This is a private skill** — contains business logic, client data, pricing strategies
