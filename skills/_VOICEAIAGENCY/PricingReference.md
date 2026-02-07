# Pricing Reference

Tier pricing, COGS breakdown, margins, and ROI calculation logic.

---

## Tier Pricing Model

### Starter ($500 setup / $297-497/mo)

**Included:**
- 1 AI agent (inbound only)
- Up to 200 calls/month
- Basic FAQ + booking
- Single calendar integration
- Weekly performance email
- Standard business hours coverage

**COGS at 200 calls/mo (~$30-50)** → Margin: 87-93%

**Best for:** Low-volume businesses, gyms, small shops, proof-of-concept

### Professional ($1,500-2,500 setup / $697-997/mo)

**Included:**
- 1-2 AI agents (inbound + optional outbound reminders)
- Up to 500 calls/month
- Full FAQ + booking + transfer logic
- CRM integration (GHL, Calendly, etc.)
- Call recording + transcription
- Monthly review call
- 24/7 coverage (after-hours handling)

**COGS at 500 calls/mo (~$60-115)** → Margin: 84-91%

**Best for:** Dental, HVAC, med spa, most service businesses

### Enterprise ($3,000-5,000 setup / $1,497-1,997/mo)

**Included:**
- Multi-agent system (3+ agents for different departments/locations)
- Unlimited calls
- Complex routing + IVR replacement
- Multi-location support
- Custom integrations (EHR, PMS, proprietary systems)
- Dedicated account manager (you)
- SLA: 99.9% uptime, < 1s response time

**COGS at 1000+ calls/mo (~$120-230)** → Margin: 85-92%

**Best for:** Multi-location practices, legal firms, large service companies

---

## COGS Breakdown

### Per-Minute Costs (2-minute average call)

| Component | Low Estimate | High Estimate |
|-----------|-------------|---------------|
| Voice AI Platform (Vapi) | $0.05/min | $0.10/min |
| STT (Deepgram) | $0.0043/min | $0.0065/min |
| LLM (GPT-4o-mini) | $0.005/min | $0.015/min |
| TTS (ElevenLabs) | $0.015/min | $0.030/min |
| Telephony (Twilio) | $0.01/min | $0.014/min |
| **Per-minute total** | **$0.08/min** | **$0.17/min** |
| **Per 2-min call** | **$0.16** | **$0.34** |

### Monthly COGS by Volume

| Calls/Month | Low COGS | High COGS | At $697/mo retainer |
|-------------|----------|-----------|---------------------|
| 100 | $16 | $34 | 95-98% margin |
| 200 | $32 | $68 | 90-95% margin |
| 500 | $80 | $170 | 76-89% margin |
| 1,000 | $160 | $340 | 51-77% margin |
| 2,000 | $320 | $680 | 2-54% margin |

**Key insight:** Margin compresses at high volume on lower tiers. Enterprise pricing protects margins for 1000+ call clients.

---

## ROI Calculator Logic

### Input Variables
```
missed_calls_per_day     # How many calls go unanswered
business_days_per_month  # Usually 22
booking_conversion_rate  # % of calls that become appointments (default: 40%)
avg_ticket_value         # Average revenue per appointment
monthly_retainer         # What client pays you
```

### Calculation
```
monthly_missed_calls = missed_calls_per_day × business_days_per_month
recovered_bookings = monthly_missed_calls × booking_conversion_rate
recovered_revenue = recovered_bookings × avg_ticket_value
roi_ratio = recovered_revenue / monthly_retainer
payback_days = monthly_retainer / (recovered_revenue / business_days_per_month)
```

### Example by Niche

| Niche | Missed/Day | Conv Rate | Avg Ticket | Monthly Recovery | At $697/mo | ROI |
|-------|-----------|-----------|------------|-----------------|------------|-----|
| Dental | 12 | 40% | $350 | $36,960 | $697 | 53:1 |
| HVAC | 8 | 35% | $250 | $15,400 | $697 | 22:1 |
| Med Spa | 6 | 45% | $500 | $29,700 | $997 | 30:1 |
| Gym | 10 | 50% | $50 | $5,500 | $397 | 14:1 |
| Legal | 5 | 30% | $400 | $13,200 | $997 | 13:1 |
| Real Estate | 8 | 25% | $300 | $13,200 | $697 | 19:1 |

---

## Setup Fee Justification

| Component | Hours | Rate | Cost |
|-----------|-------|------|------|
| Discovery + intake | 1-2 | $150/hr | $150-300 |
| Prompt engineering | 2-4 | $150/hr | $300-600 |
| Platform configuration | 1-2 | $150/hr | $150-300 |
| CRM/calendar integration | 1-3 | $150/hr | $150-450 |
| Testing + QA | 1-2 | $150/hr | $150-300 |
| Soft launch monitoring | 2-3 | $100/hr | $200-300 |
| **Total effort** | **8-16 hrs** | | **$1,100-2,250** |

Setup fee covers your real labor. NOT a profit center — it's cost recovery + commitment signal.

---

## Discount & Negotiation Rules

| Scenario | Offer | Never Go Below |
|----------|-------|----------------|
| Annual prepay | 2 months free (17% off) | 10% off |
| Multi-location | -10% per additional location | -15% |
| Referral deal | Waive setup fee | Half setup |
| Pilot/trial | 14 days, setup fee credited if they sign | 7 days |
| "Too expensive" | Drop a tier, not the price | Keep margins > 80% |

**The golden rule:** Never compete on price. Compete on results. Show the ROI math and the price becomes irrelevant.
