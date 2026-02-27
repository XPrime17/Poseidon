#!/usr/bin/env bun
/**
 * SOWGenerator — Generate a Statement of Work from parameters
 *
 * Usage:
 *   bun run SOWGenerator.ts --client "Smile Dental" --niche dental --tier professional
 *   bun run SOWGenerator.ts --help
 */

import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    client: { type: "string", short: "c" },
    niche: { type: "string", short: "n" },
    tier: { type: "string", short: "t" },
    calls: { type: "string" },
    ticket: { type: "string" },
    hours: { type: "string" },
    crm: { type: "string" },
    compliance: { type: "string" },
    contact: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
  strict: true,
});

if (values.help) {
  console.log(`
SOWGenerator — Generate a Statement of Work for a Voice AI engagement

USAGE:
  bun run SOWGenerator.ts --client <name> --niche <niche> --tier <tier> [options]

REQUIRED:
  --client, -c    Client company name
  --niche, -n     Industry niche (dental, hvac, medspa, gym, legal, realestate)
  --tier, -t      Package tier (starter, professional, enterprise)

OPTIONAL:
  --calls         Expected monthly call volume (default: tier-based estimate)
  --ticket        Average ticket value in dollars (default: niche-based estimate)
  --hours         Business hours (default: "M-F 9am-5pm")
  --crm           CRM/calendar system (default: "TBD")
  --compliance    Compliance requirements (e.g., "HIPAA", "PCI-DSS")
  --contact       Client contact name and title
  --help, -h      Show this help

EXAMPLES:
  bun run SOWGenerator.ts --client "Smile Dental" --niche dental --tier professional --calls 500 --ticket 350
  bun run SOWGenerator.ts --client "Riverside HVAC" --niche hvac --tier starter --hours "M-S 7a-7p"
  bun run SOWGenerator.ts --client "Metro Legal" --niche legal --tier enterprise --compliance HIPAA
`);
  process.exit(0);
}

// Validate required args
if (!values.client || !values.niche || !values.tier) {
  console.error(
    "Error: --client, --niche, and --tier are required. Use --help for usage."
  );
  process.exit(1);
}

// Tier configuration
const tierConfig: Record<
  string,
  {
    name: string;
    setup: string;
    monthly: string;
    callLimit: string;
    timeline: string;
    features: string[];
  }
> = {
  starter: {
    name: "Starter",
    setup: "$500 - $1,000",
    monthly: "$297 - $497",
    callLimit: "200",
    timeline: "2 weeks",
    features: [
      "1 AI agent (inbound only)",
      "Up to 200 calls/month",
      "Basic FAQ + appointment booking",
      "Single calendar integration",
      "Weekly performance email",
      "Standard business hours coverage",
    ],
  },
  professional: {
    name: "Professional",
    setup: "$1,500 - $2,500",
    monthly: "$697 - $997",
    callLimit: "500",
    timeline: "3-4 weeks",
    features: [
      "1-2 AI agents (inbound + optional outbound reminders)",
      "Up to 500 calls/month",
      "Full FAQ + booking + transfer logic",
      "CRM integration",
      "Call recording + transcription",
      "Monthly review call",
      "24/7 coverage (after-hours handling)",
    ],
  },
  enterprise: {
    name: "Enterprise",
    setup: "$3,000 - $5,000",
    monthly: "$1,497 - $1,997",
    callLimit: "Unlimited",
    timeline: "4-6 weeks",
    features: [
      "Multi-agent system (3+ agents for different departments/locations)",
      "Unlimited calls",
      "Complex routing + IVR replacement",
      "Multi-location support",
      "Custom integrations (EHR, PMS, proprietary systems)",
      "Dedicated account manager",
      "SLA: 99.9% uptime, < 1s response time",
    ],
  },
};

// Niche defaults
const nicheDefaults: Record<
  string,
  { ticket: number; calls: number; label: string }
> = {
  dental: { ticket: 350, calls: 300, label: "Dental Practice" },
  hvac: { ticket: 250, calls: 200, label: "HVAC Service Company" },
  medspa: { ticket: 500, calls: 250, label: "Medical Spa" },
  gym: { ticket: 50, calls: 150, label: "Fitness Center" },
  legal: { ticket: 400, calls: 200, label: "Law Firm" },
  realestate: { ticket: 300, calls: 250, label: "Real Estate Agency" },
};

const tier = tierConfig[values.tier.toLowerCase()];
if (!tier) {
  console.error(
    `Error: Unknown tier "${values.tier}". Use: starter, professional, enterprise`
  );
  process.exit(1);
}

const niche = nicheDefaults[values.niche.toLowerCase()] || {
  ticket: 200,
  calls: 200,
  label: values.niche,
};

const callVolume = values.calls ? parseInt(values.calls) : niche.calls;
const ticketValue = values.ticket ? parseInt(values.ticket) : niche.ticket;
const businessHours = values.hours || "M-F 9am-5pm";
const crmSystem = values.crm || "TBD";
const compliance = values.compliance || "None specified";
const contact = values.contact || "[Contact Name / Title]";

const today = new Date();
const dateStr = today.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const year = today.getFullYear();
const refNum = `SZA-SOW-${year}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
const validThrough = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
const validStr = validThrough.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Calculate ROI
const missedPerDay = Math.round(callVolume / 22 * 0.3); // ~30% missed estimate
const recoveredMonthly = Math.round(
  missedPerDay * 22 * 0.4 * ticketValue
);
const monthlyRetainer = values.tier.toLowerCase() === "starter" ? 397 : values.tier.toLowerCase() === "enterprise" ? 1747 : 847;
const roiRatio = Math.round(recoveredMonthly / monthlyRetainer);

// Generate SOW
const sow = `═══════════════════════════════════════════════════════════════
  STATEMENT OF WORK

  Client:         ${values.client}
  Provider:       Sub-Zero Automations
  Date:           ${dateStr}
  SOW Reference:  ${refNum}
  Valid Through:  ${validStr}
═══════════════════════════════════════════════════════════════

## 1. Project Overview

${values.client} is a ${niche.label} that receives approximately ${callVolume} calls per month. Based on industry data, an estimated ${Math.round(callVolume * 0.3)} calls per month go unanswered — resulting in approximately ${missedPerDay * 22} missed opportunities per month and an estimated $${recoveredMonthly.toLocaleString()} in unrealized monthly revenue.

Sub-Zero Automations will design, build, and deploy a custom Voice AI agent that answers every call instantly, handles routine inquiries, books appointments directly into ${values.client}'s calendar system, and transfers complex calls to the appropriate team member. The solution operates 24/7, ensuring no call goes unanswered regardless of business hours.

## 2. Project Objectives

- Reduce unanswered calls from ~30% to near 0%
- Capture after-hours leads currently going to voicemail
- Automate appointment booking for standard service types
- Reduce front-desk phone burden to free staff for in-person service
- Provide real-time call analytics and performance visibility
- Achieve a minimum ${roiRatio}:1 ROI within the first 90 days

## 3. Scope of Work and Deliverables

### 3.1 Voice AI Agent Design & Development
- Custom prompt engineering tailored to ${values.client}'s brand voice, services, and workflows
- FAQ knowledge base covering business hours, services, pricing, location, and policies
- Conversation flow design for booking, inquiry, transfer, and escalation
- Agent personality and tone calibration matching ${values.client}'s brand

### 3.2 Appointment Scheduling Integration
- Integration with ${crmSystem} for real-time availability checking
- Automated appointment booking with confirmation details collection
- Name, phone, service type, and preferred time capture

### 3.3 Call Routing & Escalation
- Smart transfer logic for calls requiring human intervention
- Escalation triggers for emergencies, complaints, and complex inquiries
- After-hours vs. business-hours routing rules

### 3.4 Telephony Setup
- Dedicated phone number provisioning
- SIP trunk configuration for reliable call delivery
- Call recording and transcript storage

### 3.5 Testing & Quality Assurance
- Internal testing across 10+ scenario types
- Latency and response quality benchmarking
- Soft launch with monitored live calls (14-day pilot period)

### 3.6 Launch & Go-Live
- Full production deployment
- Staff training on dashboard access and call review
- Documentation of agent capabilities and limitations
- Go-live monitoring for first 5 business days

### 3.7 Ongoing Management (Monthly)
- Performance monitoring and reporting
- Prompt optimization based on call transcript analysis
- Knowledge base updates as services/hours/pricing change
- Monthly review call
- Platform maintenance and uptime monitoring

## 4. Out of Scope

- Website development or modification
- CRM implementation or migration
- Marketing, advertising, or lead generation services
- Hardware procurement or office phone system changes
- Outbound sales campaigns (unless specified above)
- Multi-language support beyond English
- Custom mobile app development

## 5. Project Assumptions

### ${values.client} Will Provide:
- Access to ${crmSystem} with API or integration capability
- Current FAQ content (hours, services, pricing, policies)
- Brand guidelines or tone preferences
- Designated point of contact (response within 24 hours)
- Timely feedback during review periods (within 48 hours)

### Sub-Zero Automations Will Provide:
- All Voice AI platform licensing and infrastructure
- Prompt engineering and agent development
- Telephony setup and number provisioning
- Testing infrastructure and QA methodology
- Ongoing monitoring tools and dashboards
- Technical support during business hours (M-F 9am-6pm ET)

## 6. Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Discovery & Design | Week 1 | Requirements document, conversation flow, prompt draft |
| Build & Integrate | Week 2 | Agent built, CRM integrated, telephony configured |
| Test & Refine | Week 3 | QA complete, soft launch with monitored calls |
| Go-Live & Monitor | Week 4 | Full production, staff trained, monitoring active |
| Optimization | Ongoing | Monthly reviews, prompt refinement, knowledge updates |

Total deployment timeline: ${tier.timeline} from signed SOW.

## 7. Pricing

### Selected Package: ${tier.name}

| Item | Amount |
|------|--------|
| Setup Fee (one-time) | ${tier.setup} |
| Monthly Retainer | ${tier.monthly}/month |

**Included in monthly retainer:**
${tier.features.map((f) => `- ${f}`).join("\n")}

### Payment Terms
- Setup fee due upon SOW acceptance
- Monthly retainer billed on the 1st of each month
- Net 15 payment terms
- 14-day pilot period — setup fee refunded if performance criteria not met

${compliance !== "None specified" ? `## 8. Compliance Requirements\n\n- ${compliance} compliance measures will be implemented as part of this engagement\n- Additional compliance documentation provided as separate exhibit\n` : ""}
## ${compliance !== "None specified" ? "9" : "8"}. Acceptance

| | Client | Provider |
|---|--------|----------|
| **Company** | ${values.client} | Sub-Zero Automations |
| **Name** | ${contact} | _________________________ |
| **Title** | _________________________ | _________________________ |
| **Date** | _________________________ | _________________________ |
| **Signature** | _________________________ | _________________________ |

*This SOW is governed by the terms of the Service Provider Agreement between the parties.*`;

console.log(sow);

process.exit(0);
