# BuildAgent Workflow

**Full agent build orchestrator — combines PromptEngineer + TechStackSetup + QaTest into a single end-to-end build.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the BuildAgent workflow to build a complete voice AI agent"}' \
  > /dev/null 2>&1 &
```

Running **BuildAgent** in **Voice AI Agency**...

---

## When to Use

- "Build me a voice agent for [business]"
- "Create a complete agent for [niche]"
- "Full agent build for [client]"
- Any request that implies the full build pipeline

---

## Prerequisite Knowledge

**Load before starting:**
- `BuildKnowledge.md` — Paige's 4-section framework, 14 mistakes, QA targets
- `TechStack.md` — Platform selection and configuration
- `NichePlaybook.md` — Niche-specific agent configuration (if niche specified)

---

## Workflow

### Step 1: Gather Requirements

Use AskUserQuestion to collect:
- Business name
- Niche/industry
- Primary agent function (booking, FAQ, intake, dispatch)
- Preferred voice AI platform (default: Vapi)
- CRM/calendar system
- Any special requirements

### Step 2: Run PromptEngineer Sub-Workflow

Follow `Workflows/PromptEngineer.md` to create the agent prompt:
1. Build 4-section prompt using Paige's framework
2. Reference NichePlaybook.md for niche-specific configuration
3. Use PromptBuilder tool for scaffold:

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PromptBuilder.ts \
  --niche [niche] --business "[Business Name]"
```

**Delegate to Paige Mercer (named agent) for prompt writing if available.**

### Step 3: Run TechStackSetup Sub-Workflow

Follow `Workflows/TechStackSetup.md` to configure the tech stack:
1. Select platform (Vapi/Retell/Bland)
2. Configure STT/LLM/TTS pipeline
3. Set up telephony (Twilio)
4. Connect CRM/calendar integration

**Delegate to Riley Nakamura (named agent) for tech configuration if available.**

### Step 4: Run QaTest Sub-Workflow

Follow `Workflows/QaTest.md` to validate the agent:
1. Run AgentAudit tool (14-point checklist):

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/AgentAudit.ts \
  --agent-name "[Agent Name]"
```

2. Test all 10 scenarios from BuildKnowledge.md
3. Verify latency targets

### Step 5: Deliver Build Package

**Output to user:**
1. Complete agent prompt (4 sections)
2. Platform configuration (JSON/YAML)
3. Integration setup instructions
4. QA audit report (14-point checklist results)
5. Recommended monitoring setup

---

## Quality Gates

- [ ] Prompt contains all 4 sections (Identity, Knowledge, Flow, Guardrails)
- [ ] None of the 14 common mistakes present
- [ ] Platform configuration is complete and tested
- [ ] CRM/calendar integration verified
- [ ] All 10 test scenarios pass
- [ ] Latency < 1.0s first response
- [ ] Prompt injection test passed

---

## Agent Delegation

| Sub-task | Named Agent | Fallback |
|----------|-------------|----------|
| Prompt engineering | Paige Mercer | Do it yourself using BuildKnowledge.md |
| Tech configuration | Riley Nakamura | Follow TechStack.md directly |
| QA testing | Riley Nakamura | Run AgentAudit.ts tool |
| Niche strategy | Kai Holbrook | Reference NichePlaybook.md |

---

## Related Workflows

- `PromptEngineer.md` — Standalone prompt engineering
- `TechStackSetup.md` — Standalone tech configuration
- `QaTest.md` — Standalone QA testing
- `OnboardClient.md` — After build, onboard the client
