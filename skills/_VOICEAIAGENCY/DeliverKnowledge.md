# DELIVER Knowledge Base

Domain knowledge for onboarding clients, reporting performance, and retaining accounts.

---

## 5-Step Onboarding Flow

### Step 1: Intake (Day 1)
**Collect from client:**
- Business name, address, phone number(s), website
- Hours of operation (regular + holiday)
- Staff names, roles, direct lines
- Services offered + pricing
- Top 20 FAQ answers
- Existing CRM/scheduling system
- Insurance providers accepted (if applicable)
- Cancellation/no-show policies
- Special instructions or preferences

**Deliverable:** Completed intake form → feeds into PromptBuilder

### Step 2: Agent Configuration (Days 2-3)
- Build prompt using 4-section framework (via PromptBuilder tool)
- Configure voice AI platform (Vapi/Retell)
- Set up telephony (Twilio number or port existing)
- Connect CRM/calendar integration (GHL, Calendly, etc.)
- Configure transfer rules + escalation paths
- Set up call recording + transcription

**Deliverable:** Working agent in staging environment

### Step 3: Internal Testing (Days 4-5)
- Run QA test suite (via AgentAudit tool — 14-point checklist)
- Test all conversation flows
- Verify booking/CRM integration
- Test transfer/escalation paths
- Load test for latency under concurrent calls
- Client listens to test call recordings

**Deliverable:** QA report with pass/fail on all 14 points

### Step 4: Soft Launch (Days 6-10)
- Route 20-30% of calls to AI agent
- Monitor every call transcript for first 48 hours
- Daily check-in with client
- Iterate on prompt based on real conversations
- Fix any edge cases that appear

**Deliverable:** Daily performance snapshot sent to client

### Step 5: Full Launch + Handoff (Days 11-14)
- Route 100% of calls to AI agent
- Set up client dashboard access
- Deliver first weekly performance report
- Schedule monthly review cadence
- Document: what the agent does, how to escalate, who to contact

**Deliverable:** Handoff document + dashboard access + first report

---

## 6 Key Performance Metrics

### The Dashboard

| Metric | What It Measures | Target | Red Flag |
|--------|-----------------|--------|----------|
| **Answer Rate** | % of calls answered by agent | > 95% | < 85% |
| **Avg Call Duration** | Mean length of conversations | 1-3 min | > 5 min (stuck) or < 30s (hanging up) |
| **Booking Rate** | % of calls resulting in appointment | > 35% | < 20% |
| **Transfer Rate** | % of calls escalated to human | < 15% | > 30% (agent can't handle) |
| **Cost Per Call** | Total monthly cost / total calls | < $1.50 | > $3.00 |
| **Client ROI** | Revenue from agent-booked appointments vs. cost | > 5:1 | < 2:1 |

### How to Calculate Each

**Answer Rate:**
```
(Calls answered by agent / Total incoming calls) × 100
Source: Vapi/Retell dashboard
```

**Booking Rate:**
```
(Appointments booked by agent / Total calls handled) × 100
Source: CRM + voice platform cross-reference
```

**Cost Per Call:**
```
(Voice AI platform cost + telephony + LLM tokens) / Total calls
Typical: $0.10-0.15/min voice + $0.01-0.05/call LLM
At 500 calls, 2 min avg = ~$110-150/mo COGS
```

**Client ROI:**
```
(Agent-booked appointments × avg ticket value) / Monthly retainer
Example: 80 bookings × $350 / $697 = 40:1 ROI
```

---

## Retention Playbook

### Monthly Review Cadence

**Week 1:** Automated performance report (via PerformanceReport workflow)
**Week 2:** Quick async check-in — "Anything the agent should handle differently?"
**Week 4:** 15-minute review call — metrics walkthrough, expansion opportunities

### Client Health Score (0-100)

| Factor | Weight | Scoring |
|--------|--------|---------|
| Call volume trend | 20% | Growing = 100, Flat = 60, Declining = 20 |
| Performance metrics | 25% | All green = 100, Some yellow = 60, Red = 20 |
| Client engagement | 20% | Responds to check-ins = 100, Slow = 50, Ghost = 0 |
| Payment status | 20% | On time = 100, Late = 40, Overdue = 0 |
| Expansion signals | 15% | Asking about more agents = 100, Satisfied = 60, Complaints = 20 |

**Health score actions:**
- **80-100:** Green — upsell opportunity, ask for referral
- **60-79:** Yellow — proactive check-in, find improvement opportunities
- **40-59:** Orange — urgent review, call client, address issues
- **0-39:** Red — retention intervention, executive escalation

### Churn Prevention Triggers

| Signal | Action |
|--------|--------|
| Client hasn't logged into dashboard in 30 days | Send metrics highlight email |
| Call volume dropped > 20% month-over-month | Investigate cause, offer optimization |
| Client missed monthly review | Reschedule immediately, send report |
| Payment failed or late | Personal outreach within 24 hours |
| Agent performance metric went red | Proactive fix + notification to client |
| Client expressed dissatisfaction | Same-day call, action plan within 48 hours |

### Upsell Opportunities

| Trigger | Offer |
|---------|-------|
| Agent handling > 300 calls/month on Starter | Upgrade to Professional |
| Client asks about second location | Multi-location Enterprise package |
| High booking rate + client happy | Add outbound appointment reminder agent |
| Client asks about after-hours | Add 24/7 coverage agent |
| Client mentions other departments | Add department-specific agents |

---

## Dashboard Setup

### Client-Facing Dashboard (GHL or Custom)

**Required Views:**
1. **Daily snapshot** — calls today, bookings today, transfers
2. **Weekly trend** — 7-day rolling average of all 6 metrics
3. **Call log** — individual calls with transcript links
4. **Monthly summary** — PDF-ready report for stakeholders

### Internal Agency Dashboard

**Required Views:**
1. **Client overview** — all clients with health scores
2. **Revenue pipeline** — MRR, churn rate, expansion revenue
3. **Agent performance** — cross-client metrics comparison
4. **Alert feed** — red flag notifications across all clients

---

## Communication Templates

### Weekly Performance Email
```
Subject: [Business Name] Voice AI — Week of [Date] 📊

Hi [Name],

Here's your weekly snapshot:

📞 Calls handled: [X] (↑/↓ [Y]% vs last week)
📅 Appointments booked: [X] ([Z]% booking rate)
⏱️ Avg call duration: [X]m [Y]s
🔄 Transfers to your team: [X] ([Z]%)
💰 Estimated revenue from bookings: $[X]

[One insight or recommendation]

Let me know if anything needs adjusting!
```

### Monthly Review Agenda
1. Performance metrics walkthrough (5 min)
2. Call highlights — best and worst (3 min)
3. Prompt/agent improvements made (2 min)
4. Upcoming changes or requests (3 min)
5. Expansion discussion (2 min)
