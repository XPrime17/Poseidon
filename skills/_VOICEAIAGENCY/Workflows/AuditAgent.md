# AuditAgent Workflow

**Run an optimization audit on a deployed voice AI agent.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the AuditAgent workflow to optimize a deployed agent"}' \
  > /dev/null 2>&1 &
```

Running **AuditAgent** in **Voice AI Agency**...

---

## When to Use

- "Audit [client]'s agent"
- "Optimize the agent for [business]"
- "Agent performance check"
- When PerformanceReport shows red metrics
- Quarterly optimization reviews

---

## Prerequisite Knowledge

**Load before starting:**
- `BuildKnowledge.md` — 14 mistakes, QA targets, prompt best practices
- `DeliverKnowledge.md` — 6 key metrics for context

---

## Workflow

### Step 1: Run 14-Point Audit

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/AgentAudit.ts \
  --agent-name "[Agent Name]"
```

### Step 2: Review Call Transcripts

Analyze 10-20 recent call transcripts:
- Identify patterns in failed or transferred calls
- Find repeated questions not in knowledge base
- Note conversation points where caller gets confused
- Look for prompt injection attempts
- Check sentiment trends

### Step 3: Compare Against Baselines

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Answer rate | | > 95% | |
| Booking rate | | > 35% | |
| Transfer rate | | < 15% | |
| Avg duration | | 1-3m | |
| Cost/call | | < $1.50 | |
| Injection resistance | | 100% | |

### Step 4: Identify Optimizations

**Prompt optimizations:**
- Missing FAQ answers to add
- Conversation flow improvements
- Better escalation triggers
- Silence handling improvements
- Greeting personalization

**Technical optimizations:**
- LLM model changes (faster/cheaper/better)
- TTS voice adjustments
- Function call efficiency
- Integration reliability

**Knowledge base updates:**
- New services or pricing
- Seasonal information
- Staff changes
- Policy updates

### Step 5: Implement Changes

For each optimization:
1. Document the change
2. Implement in staging
3. Test with relevant scenarios
4. Deploy to production
5. Monitor for 48 hours

### Step 6: Generate Audit Report

```
═══════════════════════════════════════════
  AGENT AUDIT REPORT: [Agent Name]
  Client: [Business Name]
  Date: [Date]
═══════════════════════════════════════════

14-POINT CHECKLIST: [X/14 PASSED]
  [List each with ✅/❌]

TRANSCRIPT ANALYSIS (reviewed [X] calls):
  • [Pattern 1 found]
  • [Pattern 2 found]
  • [Pattern 3 found]

OPTIMIZATIONS APPLIED:
  1. [Change] — Expected impact: [metric improvement]
  2. [Change] — Expected impact: [metric improvement]

OPTIMIZATIONS RECOMMENDED (client approval needed):
  1. [Change] — Why: [rationale]

NEXT AUDIT: [Date — usually 90 days]
```

---

## Agent Delegation

**Paige Mercer** audits prompt quality and knowledge base coverage.
**Morgan Reeves** provides client context and relationship awareness.

---

## Related Workflows

- `QaTest.md` — Initial QA at build time
- `PerformanceReport.md` — Metrics that trigger audits
- `PromptEngineer.md` — Fix prompt issues found in audit
