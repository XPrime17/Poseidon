# GenerateSOW Workflow

**Generate a Statement of Work from deal details and discovery data.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the GenerateSOW workflow to create a Statement of Work"}' \
  > /dev/null 2>&1 &
```

Running **GenerateSOW** in **SOW & Contracts**...

---

## When to Use

- "generate sow for [client]"
- "write statement of work for [business]"
- "create sow — [tier] tier, [niche]"
- After a successful proposal or discovery call

---

## Prerequisite Knowledge

**Load before starting:**
- `SOWTemplate.md` — Full SOW structure with all sections
- `_VOICEAIAGENCY/PricingReference.md` — Tier pricing, COGS, ROI calculator

**Optional:**
- `_VOICEAIAGENCY/NichePlaybook.md` — If niche-specific deliverables needed
- `_VOICEAIAGENCY/TechStack.md` — If technical details needed for integrations

---

## Workflow

### Step 1: Collect SOW Inputs

Use AskUserQuestion if not already known:

**Required:**
- Client company name and contact
- Industry / niche
- Selected tier (Starter / Professional / Enterprise)
- Primary use case(s)
- Expected call volume (calls/month)
- Business hours and coverage needs

**Recommended:**
- CRM / calendar system for integration
- Specific appointment types to book
- Escalation / transfer requirements
- Compliance requirements (HIPAA, PCI-DSS, etc.)
- Discovery call notes or completed discovery questions

### Step 2: Calculate Pricing

Run PricingCalculator for ROI data:

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PricingCalculator.ts \
  --niche [niche] \
  --calls [monthly_volume] \
  --ticket [avg_ticket_value] \
  --missed [missed_calls_per_day]
```

Use output to populate:
- Project Overview (revenue impact numbers)
- Project Objectives (quantified targets)
- Pricing section (tier-appropriate fees)

### Step 3: Build SOW Document

Follow `SOWTemplate.md` structure exactly:

1. **Project Overview** — Client context, challenges, solution, expected impact
2. **Project Objectives** — 4-6 specific, measurable objectives
3. **Scope & Deliverables** — All 7 subsections, customized per tier:
   - Starter: Sections 3.1, 3.3 (basic), 3.4, 3.5, 3.6, 3.7
   - Professional: All sections
   - Enterprise: All sections + multi-location + custom integrations
4. **Out of Scope** — Explicit exclusions (prevent scope creep)
5. **Project Assumptions** — Client and Provider responsibilities
6. **Timeline** — Adjust based on tier complexity:
   - Starter: 2 weeks
   - Professional: 3-4 weeks
   - Enterprise: 4-6 weeks
7. **Pricing** — Tier-appropriate fees from PricingReference.md
8. **Acceptance** — Signature block

### Step 4: Customize for Client

- Replace ALL placeholders — no [brackets] should remain
- Add niche-specific deliverables (e.g., insurance intake for dental, dispatch for HVAC)
- Adjust timeline if client has complex integrations
- Add compliance sections if required (HIPAA addendum, etc.)
- Reference specific details from discovery call

### Step 5: Quality Check

Before delivering, verify:
- [ ] All client-specific details filled in (no placeholders)
- [ ] Scope matches selected tier
- [ ] Pricing aligns with PricingReference.md
- [ ] Timeline is realistic for scope
- [ ] Out of Scope is clear and comprehensive
- [ ] No revenue guarantees or promises
- [ ] Acceptance block has correct company names

### Step 6: Deliver

Output as formatted markdown. Remind user:
- SOW should be attached as Exhibit A to the Service Provider Agreement
- SOW reference number format: SZA-SOW-[YYYY]-[NNN]
- Valid for 30 days from date

---

## Intent-to-Flag Mapping (for SOWGenerator CLI tool)

| User Intent | Flag |
|-------------|------|
| Client name | `--client "Company Name"` |
| Industry | `--niche dental` |
| Package tier | `--tier professional` |
| Call volume | `--calls 500` |
| Ticket value | `--ticket 350` |
| Business hours | `--hours "M-F 8a-6p"` |
| CRM system | `--crm "ServiceTitan"` |
| Compliance | `--compliance "HIPAA"` |

---

## Agent Delegation

**Devin Cross** (The Closer) frames the Project Overview in revenue terms.
**Riley Nakamura** (Systems Builder) reviews technical scope for feasibility.

---

## Related Workflows

- `GenerateDiscovery.md` — Discovery questions that feed into this SOW
- `GenerateContract.md` — Service agreement that wraps this SOW
- `GeneratePackage.md` — Full pipeline including this workflow
- `_VOICEAIAGENCY/Workflows/GenerateProposal.md` — Proposal that precedes the SOW
- `_VOICEAIAGENCY/Workflows/OnboardClient.md` — After SOW is signed
