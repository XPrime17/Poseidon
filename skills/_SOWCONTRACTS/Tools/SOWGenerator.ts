#!/usr/bin/env bun
/**
 * SOWGenerator — Generate a Code Ninjas Speed-to-Lead Statement of Work
 *
 * Usage:
 *   bun run SOWGenerator.ts --centre "East Gwillimbury" --city "East Gwillimbury, ON"
 *   bun run SOWGenerator.ts --centre "Canton" --city "Canton, MI" --calls 350 --phone "+17744062037"
 *   bun run SOWGenerator.ts --help
 */

import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    centre: { type: "string", short: "c" },
    city: { type: "string" },
    calls: { type: "string" },
    ticket: { type: "string" },
    phone: { type: "string" },
    contact: { type: "string" },
    setup: { type: "string" },
    monthly: { type: "string" },
    discount: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
  strict: true,
});

if (values.help) {
  console.log(`
SOWGenerator — Generate a Code Ninjas Speed-to-Lead SOW

USAGE:
  bun run SOWGenerator.ts --centre <name> --city <location> [options]

REQUIRED:
  --centre, -c    Centre name (e.g., "East Gwillimbury", "Canton")
  --city          City and province/state (e.g., "East Gwillimbury, ON", "Canton, MI")

OPTIONAL:
  --calls         Expected monthly call volume (default: 300)
  --ticket        Average enrollment value in dollars (default: 2400)
  --phone         Dedicated phone number (default: "To be provisioned")
  --contact       Centre Director name and title
  --setup         Setup fee amount (default: "[TBD]")
  --monthly       Monthly retainer amount (default: "[TBD]")
  --discount      Multi-location discount percentage (default: none shown)
  --help, -h      Show this help

EXAMPLES:
  bun run SOWGenerator.ts --centre "East Gwillimbury" --city "East Gwillimbury, ON"
  bun run SOWGenerator.ts --centre "Canton" --city "Canton, MI" --calls 350 --contact "Jane Smith, Centre Director"
  bun run SOWGenerator.ts --centre "Stone Oak" --city "San Antonio, TX" --setup 1500 --monthly 697
`);
  process.exit(0);
}

if (!values.centre || !values.city) {
  console.error(
    "Error: --centre and --city are required. Use --help for usage."
  );
  process.exit(1);
}

const centreName = values.centre;
const city = values.city;
const callVolume = values.calls ? parseInt(values.calls) : 300;
const ticketValue = values.ticket ? parseInt(values.ticket) : 2400;
const phone = values.phone || "To be provisioned";
const contact = values.contact || "[Centre Director Name / Title]";
const setupFee = values.setup ? `$${parseInt(values.setup).toLocaleString()}` : "$[TBD]";
const monthlyFee = values.monthly ? `$${parseInt(values.monthly).toLocaleString()}` : "$[TBD]";

const today = new Date();
const dateStr = today.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const year = today.getFullYear();
const refNum = `SZA-SOW-${year}-${String(
  Math.floor(Math.random() * 999) + 1
).padStart(3, "0")}`;
const validThrough = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
const validStr = validThrough.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ROI calculation
const missedMonthly = Math.round(callVolume * 0.3);
const conversionRate = 0.4;
const missedOpportunities = Math.round(missedMonthly * conversionRate);
const recoveredMonthly = missedOpportunities * ticketValue;

// Discount section
const discountSection = values.discount
  ? `
### Multi-Location Discount

| Centres | Discount |
|---------|----------|
| 1 centre | Standard pricing |
| 2-4 centres | ${values.discount}% off monthly retainer per centre |
| 5-9 centres | ${Math.round(parseInt(values.discount) * 1.5)}% off monthly retainer per centre |
| 10+ centres | Custom pricing — contact for quote |
`
  : "";

const sow = `═══════════════════════════════════════════════════════════════
  STATEMENT OF WORK

  Client:         Code Ninjas ${centreName}
  Provider:       Sub-Zero Automations
  Date:           ${dateStr}
  SOW Reference:  ${refNum}
  Valid Through:  ${validStr}
═══════════════════════════════════════════════════════════════

## 1. Project Overview

Code Ninjas ${centreName} is a children's coding education franchise in ${city}. The centre receives approximately ${callVolume} inbound calls per month from parents inquiring about programs, pricing, and tours.

Based on industry data for education franchises, an estimated ${missedMonthly} calls per month go unanswered — particularly during peak instruction hours when staff are occupied with students. At a ${Math.round(conversionRate * 100)}% conversion rate, this represents approximately ${missedOpportunities} missed tour bookings per month. With an average annual enrollment value of $${ticketValue.toLocaleString()}, this translates to an estimated $${recoveredMonthly.toLocaleString()} in unrealized annual enrollment revenue.

Sub-Zero Automations will deploy a dedicated Voice AI agent ("Cimo") for ${centreName} that answers every call instantly, handles parent inquiries using the centre's knowledge base, books tours directly into the scheduling system, and transfers calls to staff when needed. The agent operates 24/7, capturing after-hours leads that currently go to voicemail.

## 2. Project Objectives

- Eliminate unanswered calls — every inbound call answered within 1 second
- Capture after-hours and weekend leads from parents browsing outside business hours
- Automate tour booking with real-time slot availability
- Free front-desk staff to focus on in-centre student experience
- Provide call analytics and performance dashboards to the Centre Director
- Deliver measurable ROI within the first 90 days

## 3. Scope of Work and Deliverables

### 3.1 Voice AI Agent — "Cimo"

A dedicated AI voice agent cloned from the proven Code Ninjas source agent and customized for ${centreName}:

- Agent identity: "Cimo" — a warm, energetic persona designed for parent conversations
- Custom prompt engineering with ${centreName}-specific details (location, hours, programs, pricing)
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

- Dedicated phone number: ${phone}
- Twilio sub-account created for Code Ninjas ${centreName}
- SIP trunk configured with secure credentials
- Call recording and full transcript storage for every call
- Inbound call routing to the AI agent with fallback to staff transfer

### 3.5 Analytics Dashboard

- Dedicated analytics dashboard for ${centreName}
- Centre Director login with access to:
  - Call recordings and transcripts
  - Call volume and duration analytics
  - Tour booking conversion tracking
  - Real-time call activity

### 3.6 Automated Quality Assurance

- Centre registered in the automated testing platform
- Two test scenarios deployed:
  - **Location Verification** — confirms agent correctly identifies as Code Ninjas ${centreName}
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

- **Automated monitoring:** Recurring QA test runs with email digest reports
- **Prompt maintenance:** Updates to the voice agent when programs, pricing, hours, or policies change
- **Knowledge base updates:** Centre-specific content kept current as the business evolves
- **Agent improvements:** When improvements are made to the core agent, updates are automatically propagated to ${centreName}'s agent
- **Dashboard access:** Continued analytics dashboard access for the Centre Director
- **Performance reviews:** Regular review of call analytics, booking rates, and agent performance
- **Technical support:** Support during business hours (M-F 9am-6pm ET) for any agent issues

## 4. Out of Scope

- Website development or modification
- CRM implementation or migration
- Marketing, advertising, or lead generation campaigns
- Outbound cold-calling campaigns
- Multi-language support beyond English (available as a separate add-on)
- Custom mobile app development
- Hardware or office phone system changes

Any out-of-scope work requested during the engagement will be quoted separately.

## 5. Project Assumptions

### Code Ninjas ${centreName} Will Provide:
- Current centre information (programs, pricing, hours, policies, address)
- Brand tone preferences or approval of the standard "Cimo" persona
- Designated point of contact (response within 24 hours during setup)
- Feedback during the pilot period (within 48 hours)
- Notification within 24 hours of any changes to business information

### Sub-Zero Automations Will Provide:
- All voice AI platform licensing and infrastructure
- Agent development, prompt engineering, and knowledge base creation
- Telephony setup and phone number provisioning
- Automated testing infrastructure and QA methodology
- Dashboard setup and access management
- Technical support during business hours (M-F 9am-6pm ET)

## 6. Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Setup & Configure** | Day 1-2 | Agent clone created, telephony configured, knowledge base populated |
| **Integration & Dashboard** | Day 2-3 | Dashboard created, automated testing configured, booking integration verified |
| **Test & Validate** | Day 3-5 | QA scenarios passed, pilot calls monitored, prompt refined |
| **Go-Live** | Day 5+ | Full production, Centre Director trained on dashboard |
| **Ongoing** | Monthly | Automated QA, prompt updates, performance reviews |

**Total deployment: 3-5 business days from signed SOW.**

*Timeline assumes timely provision of centre information. Delays in client-side responses may extend the timeline proportionally.*

## 7. Pricing

### Per-Centre Investment

| Item | Amount |
|------|--------|
| **Setup Fee** (one-time) | ${setupFee} |
| **Monthly Retainer** | ${monthlyFee}/month |

**What's included in the monthly retainer:**
- Dedicated Voice AI agent ("Cimo") for Code Ninjas ${centreName}
- Dedicated phone number with 24/7 call handling
- Call recording and transcript storage
- Analytics dashboard access for Centre Director
- Automated QA testing and performance monitoring
- Knowledge base maintenance
- Prompt updates and optimization
- Performance review reports
- Technical support (M-F 9am-6pm ET)
${discountSection}
### Payment Terms
- Setup fee due upon SOW acceptance
- Monthly retainer billed on the 1st of each month
- Net 15 payment terms
- 14-day pilot period — setup fee refunded if performance criteria not met

## 8. Acceptance

This Statement of Work is accepted by both parties:

| | Client | Provider |
|---|--------|----------|
| **Company** | Code Ninjas ${centreName} | Sub-Zero Automations |
| **Name** | ${contact} | _________________________ |
| **Title** | _________________________ | _________________________ |
| **Date** | _________________________ | _________________________ |
| **Signature** | _________________________ | _________________________ |

*This SOW is governed by the terms of the Service Provider Agreement between the parties. In the event of conflict, the Service Provider Agreement takes precedence.*`;

console.log(sow);
process.exit(0);