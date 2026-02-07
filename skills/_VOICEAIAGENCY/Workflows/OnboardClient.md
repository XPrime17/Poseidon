# OnboardClient Workflow

**5-step client onboarding from signed contract to full launch.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the OnboardClient workflow to set up a new client"}' \
  > /dev/null 2>&1 &
```

Running **OnboardClient** in **Voice AI Agency**...

---

## When to Use

- "Onboard [client name]"
- "New client setup for [business]"
- "Start onboarding [business]"
- After a proposal is accepted

---

## Prerequisite Knowledge

**Load before starting:**
- `DeliverKnowledge.md` — 5-step onboarding flow, metrics, templates

---

## Workflow

### Step 1: Register Client

Add client to tracker:

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts add \
  --name "[Business Name]" \
  --niche [niche] \
  --contact "[Contact Name]" \
  --email "[email]" \
  --phone "[phone]" \
  --tier [starter|professional|enterprise] \
  --status onboarding
```

### Step 2: Intake (Day 1)

Collect from client (per DeliverKnowledge.md Step 1):
- Business details: name, address, phone, website, hours
- Staff: names, roles, direct lines
- Services + pricing
- Top 20 FAQ answers
- CRM/scheduling system details
- Insurance providers (if applicable)
- Policies: cancellation, no-show, payment
- Special instructions

**Deliverable:** Completed intake document

### Step 3: Build Agent (Days 2-3)

Invoke BuildAgent workflow:
- Prompt engineering (PromptEngineer workflow)
- Tech stack setup (TechStackSetup workflow)
- CRM/calendar integration

**Deliverable:** Working agent in staging environment

### Step 4: Test (Days 4-5)

Invoke QaTest workflow:
- 14-point audit (AgentAudit tool)
- All 10 test scenarios
- Integration verification
- Client reviews test call recordings

**Deliverable:** QA report with pass/fail

### Step 5: Soft Launch (Days 6-10)

- Route 20-30% of calls to agent
- Monitor every transcript for first 48 hours
- Daily check-in with client
- Iterate on prompt based on real data
- Fix edge cases

Update client status:
```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts update \
  --name "[Business Name]" --status active
```

### Step 6: Full Launch + Handoff (Days 11-14)

- Route 100% of calls to agent
- Set up client dashboard access
- Deliver first performance report (PerformanceReport workflow)
- Schedule monthly review cadence
- Create handoff document

**Deliverable:** Handoff doc + dashboard access + first report

---

## Onboarding Checklist

- [ ] Client registered in ClientTracker
- [ ] Intake form completed
- [ ] Agent prompt built and approved
- [ ] Platform configured
- [ ] CRM/calendar integrated
- [ ] QA test passed (14/14)
- [ ] All 10 test scenarios passed
- [ ] Soft launch started
- [ ] 48-hour monitoring completed
- [ ] Full launch activated
- [ ] Dashboard access provided
- [ ] First performance report delivered
- [ ] Monthly review scheduled
- [ ] Handoff document created

---

## Agent Delegation

**Morgan Reeves** is the primary named agent for client onboarding. She ensures every client feels cared for and nothing falls through the cracks.

**Riley Nakamura** assists with technical setup during Steps 3-4.

---

## Related Workflows

- `BuildAgent.md` — Called during Step 3
- `QaTest.md` — Called during Step 4
- `PerformanceReport.md` — First report at handoff
- `RetentionCheck.md` — Ongoing health monitoring
