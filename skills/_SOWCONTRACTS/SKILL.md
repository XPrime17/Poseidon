---
name: _SOWCONTRACTS
description: Generate Statements of Work, Service Provider Agreements, and discovery questions for Voice AI agency deals. USE WHEN sow, statement of work, contract, service agreement, generate contract, write sow, client agreement, discovery questions, deal paperwork, close deal documents, service provider agreement.
---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the WORKFLOWNAME workflow in the SOW Contracts skill to ACTION"}' \
  > /dev/null 2>&1 &
```

Running the **WorkflowName** workflow in **SOW & Contracts**...

# SOW & Contracts — Voice AI Agency Documents

Generate professional deal documents for Sub-Zero Automations voice AI engagements. Three-stage pipeline: Discovery Questions → SOW → Service Provider Agreement.

---

## Knowledge Base (load on-demand)

| File | Purpose |
|------|---------|
| `SOWTemplate.md` | SOW structure with voice AI deliverables, assumptions, pricing |
| `ContractTemplate.md` | Service Provider Agreement template with data handling, SLA, IP |
| `DiscoveryTemplate.md` | Discovery question framework by section and niche |

**Cross-skill references:**
- `_VOICEAIAGENCY/PricingReference.md` — Tier pricing, COGS, ROI calculator
- `_VOICEAIAGENCY/NichePlaybook.md` — Per-vertical strategies and metrics

---

## Workflow Routing

| Trigger | Workflow | File |
|---------|----------|------|
| "discovery questions", "prep discovery", "discovery call prep" | **GenerateDiscovery** — Create discovery questions for a prospect | `Workflows/GenerateDiscovery.md` |
| "generate sow", "write sow", "statement of work", "create sow" | **GenerateSOW** — Generate SOW from deal details | `Workflows/GenerateSOW.md` |
| "generate contract", "write contract", "service agreement", "msa" | **GenerateContract** — Generate Service Provider Agreement | `Workflows/GenerateContract.md` |
| "full package", "deal package", "sow and contract", "close deal docs" | **GeneratePackage** — Full pipeline: Discovery + SOW + Contract | `Workflows/GeneratePackage.md` |

---

## CLI Tools

| Tool | Path | Purpose |
|------|------|---------|
| **SOWGenerator** | `Tools/SOWGenerator.ts` | Generate SOW from flags (--client, --tier, --niche, etc.) |

```bash
bun run ~/.claude/skills/_SOWCONTRACTS/Tools/SOWGenerator.ts \
  --client "Smile Dental" --niche dental --tier professional \
  --calls 500 --ticket 350 --hours "M-F 8a-6p"
```

---

## Examples

**Example 1: Generate SOW after discovery call**
```
User: "Generate a SOW for Riverside HVAC — Professional tier, 300 calls/month"
→ Invokes GenerateSOW workflow
→ Loads SOWTemplate.md + PricingReference.md
→ Asks clarifying questions (integrations, timeline, special requirements)
→ Produces formatted SOW with scope, deliverables, timeline, pricing
```

**Example 2: Full deal package for a new client**
```
User: "Create the full deal package for Bright Smile Dental"
→ Invokes GeneratePackage workflow
→ Runs through Discovery → SOW → Contract pipeline
→ Outputs three documents ready for client delivery
```

**Example 3: Just the contract**
```
User: "Write a service agreement for Canton Code Ninjas"
→ Invokes GenerateContract workflow
→ Loads ContractTemplate.md
→ Asks compliance and jurisdiction questions
→ Produces Service Provider Agreement with voice AI data handling
```

---

## Integration

### Feeds Into
- **_VOICEAIAGENCY** `OnboardClient` workflow — After signed contract
- **Documents** skill — PDF generation if needed

### Uses
- **_VOICEAIAGENCY** `PricingReference.md` — Tier data and ROI math
- **_VOICEAIAGENCY** `PricingCalculator.ts` — Automated ROI calculations
- **AskUserQuestion** — Structured input collection at each stage

---

## Quality Checklist (enforce before finalizing any document)

- [ ] All client-specific details are accurate (no placeholders remaining)
- [ ] Value propositions are clearly articulated with quantified ROI
- [ ] Technical requirements are feasible for the selected tier
- [ ] Pricing aligns with scope and _VOICEAIAGENCY tier structure
- [ ] Legal terms match jurisdiction (US default, flag non-US)
- [ ] Data handling clause reflects shared-analytics model
- [ ] No revenue guarantees or promises in the contract
- [ ] Document follows exact template structure
