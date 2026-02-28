# Statement of Work — Code Ninjas Speed-to-Lead

SOW for Code Ninjas franchise centres. Describes the actual deployed system:
Retell voice agent, Twilio telephony, ChatDash dashboards, Cekura automated QA.

---

## Document Structure

```
═══════════════════════════════════════════════════════════════
  STATEMENT OF WORK

  Client:         Code Ninjas [Centre Name]
  Provider:       Sub-Zero Automations
  Date:           [Date]
  SOW Reference:  SZA-SOW-[YYYY]-[NNN]
  Valid Through:  [Date + 30 days]
═══════════════════════════════════════════════════════════════
```

---

## 1. Project Overview

Code Ninjas [Centre Name] is a children's coding education franchise in [City, Province/State]. The centre receives approximately [X] inbound calls per month from parents inquiring about programs, pricing, and tours.

Based on industry data for education franchises, an estimated 30% of inbound calls go unanswered — particularly during peak instruction hours when staff are occupied with students. At a [X]% conversion rate, this represents approximately [X] missed tour bookings per month and an estimated $[X] in unrealized enrollment revenue.

Sub-Zero Automations will deploy a dedicated Voice AI agent ("Cimo") for [Centre Name] that answers every call instantly, handles parent inquiries using the centre's knowledge base, books tours directly into the scheduling system, and transfers calls to staff when needed. The agent operates 24/7, capturing after-hours leads that currently go to voicemail.

---

## 2. Project Objectives

- Eliminate unanswered calls — every inbound call answered within 1 second
- Capture after-hours and weekend leads from parents browsing outside business hours
- Automate tour booking with real-time slot availability
- Free front-desk staff to focus on in-centre student experience
- Provide call analytics and performance dashboards to the Centre Director
- Deliver measurable ROI within the first 90 days

---

## 3. Scope of Work and Deliverables

### 3.1 Voice AI Agent — "Cimo"

A dedicated AI voice agent cloned from the proven Code Ninjas source agent and customized for [Centre Name]:

- Agent identity: "Cimo" — a warm, energetic persona designed for parent conversations
- Custom prompt engineering with [Centre Name]-specific details (location, hours, programs, pricing)
- Knowledge base populated from centre-specific content (programs offered, age ranges, policies, FAQs)
- Conversation capabilities:
  - Answer parent questions about programs (JR, CREATE, RANK)
  - Explain pricing, schedules, and age requirements
  - Book tours with real-time slot validation
  - Handle objections and address common parent concerns
  - Transfer to staff for complex or sensitive inquiries
  - Gracefully handle wrong-number and non-parent callers

### 3.2 Tour Booking Integration

- Real-time slot availability via scheduling API
- Automated tour booking with parent details collection (name, phone, child's age, preferred time)
- Booking confirmation delivered to parent during the call
- Centre staff notified of new bookings

### 3.3 Knowledge Base

- Centre-specific knowledge base document created and maintained
- Content covers: programs, pricing, hours, location, policies, FAQs, staff info
- Knowledge base synced to the voice agent for accurate, up-to-date responses
- Centre Director can request updates as information changes

### 3.4 Telephony Infrastructure

- Dedicated phone number provisioned for [Centre Name]
- Twilio sub-account created for isolated call management
- SIP trunk configured with secure credentials
- Call recording and full transcript storage for every call
- Inbound call routing to the AI agent with fallback to staff transfer

### 3.5 Analytics Dashboard (ChatDash)

- Dedicated ChatDash agent created for [Centre Name]
- Centre Director login with access to:
  - Call recordings and transcripts
  - Call volume and duration analytics
  - Tour booking conversion tracking
  - Real-time call activity

### 3.6 Automated Quality Assurance (Cekura)

- Centre registered in the Cekura testing platform
- Two automated test scenarios deployed:
  - **Location Verification** — confirms agent correctly identifies as [Centre Name]
  - **Happy Path Smoke Test** — validates tour booking flow end-to-end
- Automated test runs on a recurring schedule
- Performance metrics tracked:
  - Tour Booking Success
  - Slot Validation Accuracy
  - AI Disclosure Handling
  - Natural Conversation Flow
  - Location Name Accuracy

### 3.7 Testing & Go-Live

- Internal QA across 10+ scenario types before go-live
- 14-day pilot period with monitored live calls
- Go-live monitoring for the first 5 business days
- Issue resolution and prompt refinement as needed

### 3.8 Ongoing Management

**Included in the monthly retainer:**

- **Automated monitoring:** Recurring QA test runs via Cekura with email digest reports
- **Prompt maintenance:** Updates to the voice agent when programs, pricing, hours, or policies change
- **Knowledge base updates:** Centre-specific content kept current as the business evolves
- **Prompt sync:** When improvements are made to the core agent, updates are propagated to [Centre Name]'s agent
- **Dashboard access:** Continued ChatDash access for the Centre Director
- **Performance reviews:** Regular review of call analytics, booking rates, and agent performance
- **Technical support:** Support during business hours (M-F 9am-6pm ET) for any agent issues

---

## 4. Out of Scope

- Website development or modification
- CRM implementation or migration
- Marketing, advertising, or lead generation campaigns
- Outbound cold-calling campaigns
- Multi-language support beyond English (available as a separate add-on)
- Custom mobile app development
- Hardware or office phone system changes

Any out-of-scope work requested during the engagement will be quoted separately.

---

## 5. Project Assumptions

### Code Ninjas [Centre Name] Will Provide:
- Current centre information (programs, pricing, hours, policies, address)
- Brand tone preferences or approval of the standard "Cimo" persona
- Designated point of contact (response within 24 hours during setup)
- Feedback during the pilot period (within 48 hours)
- Notification within 24 hours of any changes to business information

### Sub-Zero Automations Will Provide:
- All voice AI platform licensing and infrastructure (Retell, Twilio, ChatDash, Cekura)
- Agent development, prompt engineering, and knowledge base creation
- Telephony setup and phone number provisioning
- Automated testing infrastructure and QA methodology
- Dashboard setup and access management
- Technical support during business hours (M-F 9am-6pm ET)

---

## 6. Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Setup & Configure** | Day 1-2 | Agent clone created, telephony configured, knowledge base populated |
| **Integration & Dashboard** | Day 2-3 | ChatDash agent created, Cekura testing configured, booking integration verified |
| **Test & Validate** | Day 3-5 | QA scenarios passed, pilot calls monitored, prompt refined |
| **Go-Live** | Day 5+ | Full production, Centre Director trained on dashboard |
| **Ongoing** | Monthly | Automated QA, prompt updates, performance reviews |

**Total deployment: 3-5 business days from signed SOW.**

*Timeline assumes timely provision of centre information. Delays in client-side responses may extend the timeline proportionally.*

---

## 7. Pricing

> **One enrollment pays for the whole service.** At an average membership of $250/month, a single additional enrollment from Cimo covers the monthly cost. Over 12 months at 92% student retention, that one student generates $3,000 in membership revenue — a 10:1 annual return.

### Plans

| | **Standard** | **Premium** |
|---|---|---|
| **Monthly** | **$199/month** | **$249/month** |
| Setup Fee | $0 | $0 |
| Voice AI Agent ("Cimo") | ✓ | ✓ |
| 24/7 call answering | ✓ | ✓ |
| Tour booking with real-time availability | ✓ | ✓ |
| Centre-specific knowledge base | ✓ | ✓ |
| Call recording & transcripts | ✓ | ✓ |
| Dedicated phone number | ✓ | ✓ |
| Prompt updates & optimization | ✓ | ✓ |
| Automated QA testing (Cekura) | ✓ | ✓ |
| Technical support (M-F 9am-6pm ET) | ✓ | ✓ |
| **ChatDash Analytics Dashboard** | — | ✓ |
| **Call volume & conversion reporting** | — | ✓ |
| **Centre Director login** | — | ✓ |

### Multi-Location Discount

| Centres | Discount | Premium Price | Standard Price |
|---------|----------|--------------|----------------|
| 1 centre | List price | $249/month | $199/month |
| Each additional centre | 15% off | $212/month | $169/month |

### Payment Terms
- No setup fee
- Monthly retainer billed on the 1st of each month
- Net 15 payment terms
- 14-day pilot period — full refund if performance criteria not met

---

## 8. Acceptance

This Statement of Work is accepted by both parties:

| | Client | Provider |
|---|--------|----------|
| **Company** | Code Ninjas [Centre Name] | Sub-Zero Automations |
| **Name** | _________________________ | _________________________ |
| **Title** | _________________________ | _________________________ |
| **Date** | _________________________ | _________________________ |
| **Signature** | _________________________ | _________________________ |

*This SOW is governed by the terms of the Service Provider Agreement between the parties. In the event of conflict, the Service Provider Agreement takes precedence.*
