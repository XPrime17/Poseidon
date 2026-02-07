# RetentionCheck Workflow

**Client health scoring and churn prevention.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the RetentionCheck workflow to assess client health"}' \
  > /dev/null 2>&1 &
```

Running **RetentionCheck** in **Voice AI Agency**...

---

## When to Use

- "Retention check on [client]"
- "Client health score"
- "Is [client] at risk of churning?"
- Monthly client health reviews
- When churn signals appear

---

## Prerequisite Knowledge

**Load before starting:**
- `DeliverKnowledge.md` — Client health score, churn prevention, retention playbook

---

## Workflow

### Step 1: Get Client Data

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts get \
  --name "[Client Name]"
```

### Step 2: Calculate Health Score (0-100)

Score each factor per DeliverKnowledge.md:

| Factor | Weight | Score | Weighted |
|--------|--------|-------|----------|
| Call volume trend (20%) | 20 | _/100 | _ |
| Performance metrics (25%) | 25 | _/100 | _ |
| Client engagement (20%) | 20 | _/100 | _ |
| Payment status (20%) | 20 | _/100 | _ |
| Expansion signals (15%) | 15 | _/100 | _ |
| **Total** | **100** | | **_/100** |

### Step 3: Classify Health

| Score | Status | Action |
|-------|--------|--------|
| 80-100 | 🟢 Green | Upsell opportunity, ask for referral |
| 60-79 | 🟡 Yellow | Proactive check-in, find improvements |
| 40-59 | 🟠 Orange | Urgent review, call client, address issues |
| 0-39 | 🔴 Red | Retention intervention, escalate |

### Step 4: Check Churn Signals

| Signal | Present? | Action Required |
|--------|----------|-----------------|
| No dashboard login in 30 days | | Send metrics highlight |
| Call volume dropped > 20% MoM | | Investigate + optimize |
| Missed monthly review | | Reschedule immediately |
| Payment failed or late | | Personal outreach in 24h |
| Performance metric went red | | Proactive fix + notify |
| Client expressed dissatisfaction | | Same-day call, action plan |

### Step 5: Generate Retention Action Plan

**For Yellow clients:**
```
1. Schedule check-in call this week
2. Prepare performance highlights to share
3. Identify one optimization to offer
4. Ask about additional needs/locations
```

**For Orange clients:**
```
1. Call client TODAY
2. Acknowledge any issues
3. Present concrete action plan with timeline
4. Offer a free agent audit
5. Follow up within 48 hours
```

**For Red clients:**
```
1. Call client IMMEDIATELY
2. Listen to their concerns (don't defend)
3. Offer 30-day free extension
4. Assign dedicated support for next 30 days
5. Daily check-ins until green
```

### Step 6: Update Client Record

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts update \
  --name "[Client Name]" \
  --health-score [score] \
  --notes "[health status and actions taken]"
```

### Step 7: Output Report

```
═══════════════════════════════════════════
  RETENTION CHECK: [Business Name]
  Date: [Date]
═══════════════════════════════════════════

HEALTH SCORE: [X]/100 [🟢/🟡/🟠/🔴]

FACTORS:
  Call Volume:    [X]/100 (trend: ↑/↓/→)
  Performance:    [X]/100
  Engagement:     [X]/100
  Payment:        [X]/100
  Expansion:      [X]/100

CHURN SIGNALS:
  [✅ None detected / ⚠️ List of signals]

ACTION PLAN:
  1. [Action item]
  2. [Action item]
  3. [Action item]

NEXT CHECK: [Date]
```

---

## Agent Delegation

**Morgan Reeves** is the primary named agent for retention. She approaches every client relationship with empathy and long-term thinking.

**Kai Holbrook** advises on strategic retention decisions for high-value clients.

---

## Related Workflows

- `PerformanceReport.md` — Metrics that feed into health score
- `AuditAgent.md` — Optimization for underperforming agents
- `OnboardClient.md` — Set expectations that prevent churn
