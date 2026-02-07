# PerformanceReport Workflow

**Generate a performance report with the 6 key metrics for a client.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the PerformanceReport workflow to generate client metrics"}' \
  > /dev/null 2>&1 &
```

Running **PerformanceReport** in **Voice AI Agency**...

---

## When to Use

- "Performance report for [client]"
- "How is [client] doing?"
- "Client metrics for [business]"
- "Monthly report for [client]"

---

## Prerequisite Knowledge

**Load before starting:**
- `DeliverKnowledge.md` — 6 key metrics, dashboard setup, templates

---

## Workflow

### Step 1: Get Client Data

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts get \
  --name "[Client Name]"
```

### Step 2: Collect Metrics

Gather the 6 key metrics (from platform dashboard or manual input):

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Answer Rate | _% | > 95% | 🟢/🟡/🔴 |
| Avg Call Duration | _m _s | 1-3 min | 🟢/🟡/🔴 |
| Booking Rate | _% | > 35% | 🟢/🟡/🔴 |
| Transfer Rate | _% | < 15% | 🟢/🟡/🔴 |
| Cost Per Call | $_ | < $1.50 | 🟢/🟡/🔴 |
| Client ROI | _:1 | > 5:1 | 🟢/🟡/🔴 |

**Status thresholds:**
- 🟢 Green: Meeting or exceeding target
- 🟡 Yellow: Within 10% of target
- 🔴 Red: Below target — action needed

### Step 3: Trend Analysis

Compare to previous period:
- Week-over-week or month-over-month trends
- Identify improving or declining metrics
- Note any anomalies (spikes, drops)

### Step 4: Generate Insights

For each metric:
- What's driving the number
- What could improve it
- Any recommended prompt/config changes

### Step 5: Build Report

**Output format:**

```
═══════════════════════════════════════════════════
  PERFORMANCE REPORT: [Business Name]
  Period: [Start Date] — [End Date]
  Generated: [Date]
═══════════════════════════════════════════════════

SUMMARY
  Total Calls: [X]
  Appointments Booked: [Y]
  Estimated Revenue Impact: $[Z]

METRICS DASHBOARD
  📞 Answer Rate:      [X]% [🟢] (target: >95%)
  ⏱️ Avg Duration:     [X]m [Y]s [🟢] (target: 1-3m)
  📅 Booking Rate:     [X]% [🟡] (target: >35%)
  🔄 Transfer Rate:    [X]% [🟢] (target: <15%)
  💰 Cost/Call:        $[X] [🟢] (target: <$1.50)
  📈 ROI:              [X]:1 [🟢] (target: >5:1)

TRENDS (vs. last period)
  📞 Answer Rate:      [↑/↓/→] [X]%
  📅 Booking Rate:     [↑/↓/→] [X]%
  ...

INSIGHTS
  1. [Key insight about performance]
  2. [Recommended optimization]
  3. [Expansion opportunity]

NEXT STEPS
  • [Action item 1]
  • [Action item 2]
```

### Step 6: Update Client Record

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts update \
  --name "[Client Name]" \
  --last-report "[date]" \
  --notes "Report delivered. [Key findings]"
```

### Step 7: Send to Client

Use the weekly performance email template from DeliverKnowledge.md.

---

## Agent Delegation

**Morgan Reeves** is the primary named agent for performance reporting. She focuses on client-friendly communication and actionable insights.

---

## Related Workflows

- `OnboardClient.md` — First report created at onboarding handoff
- `RetentionCheck.md` — Health score informed by these metrics
- `AuditAgent.md` — Deep dive when metrics are red
