# GeneratePackage Workflow

**Generate a complete deal package: Discovery Questions + SOW + Service Provider Agreement.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the GeneratePackage workflow to create a full deal package"}' \
  > /dev/null 2>&1 &
```

Running **GeneratePackage** in **SOW & Contracts**...

---

## When to Use

- "full deal package for [client]"
- "create sow and contract for [business]"
- "close deal docs for [prospect]"
- "complete paperwork for [client]"

---

## Prerequisite Knowledge

**Load ALL:**
- `DiscoveryTemplate.md` — Discovery question framework
- `SOWTemplate.md` — SOW structure
- `ContractTemplate.md` — Service Provider Agreement template
- `_VOICEAIAGENCY/PricingReference.md` — Tier pricing and ROI

---

## Workflow

### Step 1: Determine Starting Point

Use AskUserQuestion:
- "What stage are we at with this client?"
  - **Pre-discovery:** Generate all three documents (Discovery → SOW → Contract)
  - **Post-discovery:** Skip discovery questions, generate SOW + Contract
  - **SOW exists:** Skip to Contract only (reference existing SOW)

### Step 2: Collect All Inputs Upfront

Gather everything needed for the full package in one pass:

**Client Info:**
- Company name (legal entity)
- Contact name and title
- Industry / niche
- Location / jurisdiction

**Deal Info:**
- Selected tier (Starter / Professional / Enterprise)
- Expected call volume
- Average ticket value
- Business hours
- CRM / calendar system
- Special requirements or compliance needs

**Contract Info:**
- Governing jurisdiction
- Preferred term length
- Any non-standard terms requested

### Step 3: Generate Documents in Sequence

Execute each sub-workflow, passing collected data:

**3a. Discovery Questions** (if pre-discovery)
→ Follow `GenerateDiscovery.md` workflow
→ Output as Document 1

**3b. Statement of Work**
→ Follow `GenerateSOW.md` workflow
→ Include ROI calculations from PricingCalculator
→ Assign reference number: SZA-SOW-[YYYY]-[NNN]
→ Output as Document 2

**3c. Service Provider Agreement**
→ Follow `GenerateContract.md` workflow
→ Reference the SOW as Exhibit A
→ Assign reference number: SZA-SPA-[YYYY]-[NNN]
→ Output as Document 3

### Step 4: Cross-Reference Check

Verify consistency across all documents:
- [ ] Client name matches exactly across all documents
- [ ] Pricing in SOW matches pricing in Contract Section 3
- [ ] Scope in SOW aligns with Services in Contract Section 1
- [ ] Timeline in SOW is realistic for the tier
- [ ] Data handling in Contract matches what SOW implies
- [ ] Compliance requirements are reflected in both SOW and Contract
- [ ] Reference numbers link correctly (Contract references SOW as Exhibit A)

### Step 5: Package Summary

Output a summary cover page:

```
═══════════════════════════════════════════════════════════════
  DEAL PACKAGE — [Client Company Name]

  Prepared by: Sub-Zero Automations
  Date: [Date]
  Package: [Tier Name] Voice AI Agent

  Documents Included:
  1. Discovery Questions (if applicable)
  2. Statement of Work (SZA-SOW-[YYYY]-[NNN])
  3. Service Provider Agreement (SZA-SPA-[YYYY]-[NNN])

  Investment Summary:
  Setup Fee:       $[amount] (one-time)
  Monthly Retainer: $[amount]/month
  Annual Value:    $[amount]
  Projected ROI:   [X]:1
═══════════════════════════════════════════════════════════════
```

### Step 6: Deliver

Output all documents in sequence with clear separators. Remind user:
- Recommend legal review before client delivery
- Documents are in markdown — ready for Google Docs / Notion / PDF export
- SOW is valid for 30 days
- Both SOW and Agreement should be executed together

---

## Agent Delegation

**Devin Cross** (The Closer) leads the package — frames everything in deal-closing terms.
**Riley Nakamura** reviews technical scope in the SOW.
**Kai Holbrook** reviews the full package for strategic positioning.

---

## Related Workflows

- `GenerateDiscovery.md` — Standalone discovery questions
- `GenerateSOW.md` — Standalone SOW
- `GenerateContract.md` — Standalone contract
- `_VOICEAIAGENCY/Workflows/GenerateProposal.md` — Proposal that precedes this package
- `_VOICEAIAGENCY/Workflows/OnboardClient.md` — After package is signed
