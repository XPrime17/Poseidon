# GenerateProposal Workflow

**Generate a professional proposal document with ROI math for a prospect.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the GenerateProposal workflow to create a client proposal"}' \
  > /dev/null 2>&1 &
```

Running **GenerateProposal** in **Voice AI Agency**...

---

## When to Use

- "Generate a proposal for [prospect]"
- "Write a proposal for [business]"
- "Create an ROI proposal"
- "Send [prospect] pricing"

---

## Prerequisite Knowledge

**Load before starting:**
- `SellKnowledge.md` — Pricing strategy, qualifying questions
- `PricingReference.md` — Tier pricing, COGS, ROI calculator

---

## Workflow

### Step 1: Collect Proposal Inputs

Use AskUserQuestion if not already known:
- Business name and contact
- Niche
- Estimated call volume (calls/day)
- Average ticket value
- Current missed call rate (or estimate)
- Recommended tier (Starter/Professional/Enterprise)
- Any custom requirements

### Step 2: Calculate ROI

Run PricingCalculator:

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PricingCalculator.ts \
  --niche [niche] \
  --calls [monthly_volume] \
  --ticket [avg_ticket_value] \
  --missed [missed_calls_per_day]
```

### Step 3: Build Proposal Document

**Structure:**

```markdown
═══════════════════════════════════════════════════
  VOICE AI PROPOSAL
  Prepared for: [Business Name]
  Date: [Date]
  Prepared by: [Your Name]
═══════════════════════════════════════════════════

## THE PROBLEM

[Business Name] receives approximately [X] calls per day.
Based on industry data, approximately [Y]% go unanswered,
resulting in an estimated [Z] missed opportunities per month.

At an average ticket value of $[V], this represents
$[lost_revenue]/month in unrealized revenue.

## THE SOLUTION

A custom AI voice agent for [Business Name] that:
✅ Answers every call in under 1 second
✅ Books appointments directly into your calendar
✅ Handles FAQs about services, hours, and pricing
✅ Transfers complex calls to your team
✅ Works 24/7 — nights, weekends, holidays

## YOUR ROI

| Metric | Current | With AI Agent |
|--------|---------|---------------|
| Calls answered | ~[X]% | 99%+ |
| Missed calls/month | ~[Y] | ~0 |
| Bookings from calls | ~[Z]/mo | ~[Z×1.4]/mo |
| Monthly revenue impact | $0 (lost) | +$[recovered]/mo |
| **Annual revenue impact** | | **+$[annual]** |

**Your investment:** $[retainer]/month
**Your return:** $[recovered]/month
**ROI:** [ratio]:1

## PACKAGE: [TIER NAME]

**Setup:** $[setup] (one-time)
**Monthly:** $[retainer]

Includes:
- [Feature list for selected tier]
- [From PricingReference.md]

## TIMELINE

Week 1: Discovery + agent build
Week 2: Internal testing + soft launch
Week 3: Full launch + monitoring
Ongoing: Monthly reviews + optimization

## NEXT STEPS

1. Approve this proposal
2. Schedule 30-min discovery call
3. We build your custom agent in [X] days
4. You start recovering missed revenue

## GUARANTEE

14-day pilot period. If the agent doesn't book at least [X]
appointments in the first two weeks, setup fee is refunded.
```

### Step 4: Personalize

- Reference specific details from discovery/demo
- Include any custom requirements discussed
- Add niche-specific metrics from NichePlaybook.md
- Include testimonial or case study if available

### Step 5: Deliver

Output as formatted markdown ready to:
- Copy into Google Docs / Notion
- Export as PDF
- Email to prospect

---

## Agent Delegation

**Devin Cross** is the primary named agent for proposal generation. He frames everything in revenue terms.

**Kai Holbrook** can review proposals for strategic positioning.

---

## Related Workflows

- `PrepareDemo.md` — Demo that led to this proposal
- `ProspectResearch.md` — Research that found this prospect
- `OnboardClient.md` — After proposal acceptance, onboard
