# Statement of Work Template

Full SOW structure for Voice AI agent engagements. Customize per client.

---

## Document Structure

```
═══════════════════════════════════════════════════════════════
  STATEMENT OF WORK

  Client:         [Client Company Name]
  Provider:       Sub-Zero Automations
  Date:           [Date]
  SOW Reference:  SZA-SOW-[YYYY]-[NNN]
  Valid Through:  [Date + 30 days]
═══════════════════════════════════════════════════════════════
```

---

## 1. Project Overview

[2-3 paragraphs describing:]
- Client's business context and industry
- Current challenges (missed calls, staff burden, after-hours gaps)
- How the Voice AI solution addresses these challenges
- Expected business impact (quantified where possible)

**Example:**
> [Client Company Name] is a [industry] practice serving [location/market].
> Currently, the business receives approximately [X] calls per day, with an
> estimated [Y]% going unanswered — resulting in approximately [Z] missed
> opportunities per month and an estimated $[amount] in unrealized revenue.
>
> Sub-Zero Automations will design, build, and deploy a custom Voice AI agent
> that answers every call instantly, handles routine inquiries, books
> appointments directly into [Client]'s calendar system, and transfers
> complex calls to the appropriate team member. The solution operates 24/7,
> ensuring no call goes unanswered regardless of business hours.

---

## 2. Project Objectives

- Reduce unanswered calls from ~[X]% to near 0%
- Capture after-hours leads that currently go to voicemail
- Automate appointment booking for [specific service types]
- Reduce front-desk phone burden by [X]% to free staff for in-person service
- Provide real-time call analytics and performance visibility
- Achieve a minimum [X]:1 ROI within the first 90 days

---

## 3. Scope of Work and Deliverables

### 3.1 Voice AI Agent Design & Development
- Custom prompt engineering tailored to [Client]'s brand voice, services, and workflows
- FAQ knowledge base covering [list key topics: hours, services, pricing, location, insurance, etc.]
- Conversation flow design for [specific use cases: booking, inquiry, transfer, etc.]
- Agent personality and tone calibration matching [Client]'s brand

### 3.2 Appointment Scheduling Integration
- Integration with [CRM/Calendar system] for real-time availability checking
- Automated appointment booking for [specific appointment types]
- Confirmation and details collection (name, phone, service type, preferred time)
- [If applicable] Automated appointment reminder calls

### 3.3 Call Routing & Escalation
- Smart transfer logic for calls requiring human intervention
- Escalation triggers: [emergencies, complaints, complex inquiries, specific requests]
- Fallback handling when staff is unavailable
- After-hours vs. business-hours routing rules

### 3.4 Telephony Setup
- Dedicated phone number provisioning (or porting of existing number)
- SIP trunk configuration for reliable call delivery
- Call recording and transcript storage
- [If multi-location] Per-location number and routing setup

### 3.5 Testing & Quality Assurance
- Internal testing across [X] scenario types (happy path, edge cases, adversarial)
- Latency and response quality benchmarking
- Soft launch with monitored live calls ([X]-day pilot period)
- Issue identification and prompt refinement

### 3.6 Launch & Go-Live
- Full production deployment
- Staff training on dashboard access and call review
- Documentation of agent capabilities and limitations
- Go-live monitoring for first [X] business days

### 3.7 Ongoing Management (Monthly)
- Performance monitoring and reporting ([weekly/monthly] cadence)
- Prompt optimization based on call transcript analysis
- Knowledge base updates as [Client]'s services/hours/pricing change
- Monthly review call to discuss performance and adjustments
- Platform maintenance and uptime monitoring

---

## 4. Out of Scope

The following are explicitly NOT included in this engagement:

- Website development or modification
- CRM implementation or migration (integration with existing CRM only)
- Marketing, advertising, or lead generation services
- Hardware procurement or office phone system changes
- Outbound sales campaigns (unless specified in scope above)
- Multi-language support beyond English (unless specified above)
- Custom mobile app development
- [Add client-specific exclusions]

Any out-of-scope work requested during the engagement will be quoted separately.

---

## 5. Project Assumptions

### Client Will Provide:
- Access to CRM/calendar system with API or integration capability
- Current FAQ content (hours, services, pricing, policies)
- Brand guidelines or tone preferences
- Designated point of contact available for questions during build (response within 24 hours)
- Timely feedback during review periods (within 48 hours)
- Access to existing phone system for number porting (if applicable)

### Sub-Zero Automations Will Provide:
- All Voice AI platform licensing and infrastructure
- Prompt engineering and agent development
- Telephony setup and number provisioning
- Testing infrastructure and QA methodology
- Ongoing monitoring tools and dashboards
- Technical support during business hours (M-F 9am-6pm ET)

---

## 6. Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Discovery & Design** | Week 1 | Requirements document, conversation flow design, prompt draft |
| **Build & Integrate** | Week 2 | Agent built, CRM/calendar integrated, telephony configured |
| **Test & Refine** | Week 3 | QA complete, soft launch with monitored calls |
| **Go-Live & Monitor** | Week 4 | Full production, staff trained, monitoring active |
| **Optimization** | Ongoing | Monthly reviews, prompt refinement, knowledge updates |

**Total deployment timeline: [3-4] weeks from signed SOW.**

*Timeline assumes timely client feedback. Delays in client-side approvals or access provisioning may extend the timeline proportionally.*

---

## 7. Pricing

### Selected Package: [TIER NAME]

| Item | Amount |
|------|--------|
| **Setup Fee** (one-time) | $[amount] |
| **Monthly Retainer** | $[amount]/month |
| **Per-Minute Usage** (if applicable) | $[amount]/minute above [X] minutes |

**What's included in the monthly retainer:**
- [Feature list from selected tier — pull from PricingReference.md]
- Up to [X] calls/month
- [X] hours of prompt optimization per month
- Dashboard access with real-time call analytics
- Monthly performance review call

### Payment Terms
- Setup fee due upon SOW acceptance
- Monthly retainer billed on the [1st/15th] of each month
- Net 15 payment terms
- [If applicable] 14-day pilot period — setup fee refunded if performance criteria not met

---

## 8. Acceptance

This Statement of Work is accepted by both parties:

| | Client | Provider |
|---|--------|----------|
| **Company** | [Client Company Name] | Sub-Zero Automations |
| **Name** | _________________________ | _________________________ |
| **Title** | _________________________ | _________________________ |
| **Date** | _________________________ | _________________________ |
| **Signature** | _________________________ | _________________________ |

*This SOW is governed by the terms of the Service Provider Agreement between the parties. In the event of conflict, the Service Provider Agreement takes precedence.*
