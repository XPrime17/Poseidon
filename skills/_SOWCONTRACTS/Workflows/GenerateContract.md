# GenerateContract Workflow

**Generate a Service Provider Agreement for a voice AI engagement.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the GenerateContract workflow to create a Service Provider Agreement"}' \
  > /dev/null 2>&1 &
```

Running **GenerateContract** in **SOW & Contracts**...

---

## When to Use

- "generate contract for [client]"
- "write service agreement"
- "create MSA for [business]"
- "contract for [client] — [jurisdiction]"

---

## Prerequisite Knowledge

**Load before starting:**
- `ContractTemplate.md` — Full Service Provider Agreement template

**Optional:**
- `SOWTemplate.md` — If SOW hasn't been created yet (needed as Exhibit A)

---

## Workflow

### Step 1: Collect Contract Inputs

Use AskUserQuestion to gather:

**Required:**
- Client company name (legal entity name)
- Client contact name and title
- Governing jurisdiction (state/province/country)

**Recommended:**
- Compliance requirements (HIPAA, PCI-DSS, SOC 2, etc.)
- Whether client has standard vendor agreement terms to incorporate
- Any non-standard termination or liability clauses requested
- Whether engagement involves particularly sensitive data
- Preferred term length (default: 12 months)
- Whether a SOW already exists (reference number)

### Step 2: Customize Contract

Starting from `ContractTemplate.md`, customize:

**Section 1 (Services):**
- Reference the specific SOW (Exhibit A)

**Section 2 (Term):**
- Set Initial Term length (default 12 months)
- Adjust Pilot Period if client negotiated different terms
- Set renewal period and notice window

**Section 3 (Fees):**
- Match SOW pricing exactly
- Set payment terms (default Net 15)
- Include per-minute overage if applicable

**Section 6 (Data Handling):**
- Standard: shared-analytics model (Client owns data, Provider retains anonymized analytics)
- Add HIPAA BAA as Exhibit B if healthcare
- Add PCI-DSS provisions if payment data involved
- Adjust data retention period if client requires longer/shorter

**Section 12 (SLA):**
- Standard: 99.5% uptime target
- Adjust service credits if client negotiated different terms
- Set response times appropriate to client's urgency needs

**Section 13 (Dispute Resolution):**
- Set governing law to client's jurisdiction
- Set jurisdiction for litigation
- **US clients:** State law of client's state
- **Canadian clients:** Province of Ontario (or client's province)
- **Other:** Flag for local legal review

### Step 3: Add Compliance Exhibits (if applicable)

| Requirement | Action |
|-------------|--------|
| HIPAA | Add Business Associate Agreement as Exhibit B |
| PCI-DSS | Add PCI compliance provisions to Section 6 |
| SOC 2 | Reference Provider's SOC 2 compliance (if applicable) |
| GDPR | Add Data Processing Agreement as Exhibit B |
| TCPA | Add TCPA compliance language if outbound calls in scope |

### Step 4: Quality Check

Before delivering, verify:
- [ ] All party names are correct (legal entity names)
- [ ] Governing jurisdiction is set
- [ ] Fees match the SOW exactly
- [ ] Data handling reflects shared-analytics model
- [ ] NO revenue guarantees or promises anywhere in the document
- [ ] Pilot period terms match what was discussed
- [ ] SLA terms are deliverable
- [ ] Compliance exhibits are included if required
- [ ] All [brackets] replaced with actual values

### Step 5: Deliver

Output as formatted markdown with:
- Clear section headers and numbering
- Signature block with both parties
- Exhibit A reference (SOW)
- Any additional exhibits (BAA, DPA, etc.)

**Remind the user:**
- This is a template — recommend legal review before execution
- Agreement reference number format: SZA-SPA-[YYYY]-[NNN]
- Both SOW and Agreement should be executed together

---

## Jurisdiction Quick Reference

### US (most common)
- Governing law: State of [Client's state]
- TCPA compliance if outbound calling
- TSR compliance if telemarketing
- State-specific AI disclosure laws (check current requirements)

### Canada
- Governing law: Province of Ontario (default) or client's province
- PIPEDA compliance for personal data
- CASL for electronic messaging
- Quebec: French language provisions may be required

### Other
- **Flag for local legal review** — do not generate without disclaimer
- Research local data protection laws
- Verify AI voice agent regulations in jurisdiction
- Adjust currency and tax provisions

---

## Agent Delegation

**Kai Holbrook** (Agency Strategist) reviews contract positioning and terms.
**Devin Cross** (The Closer) ensures terms don't create deal friction.

---

## Related Workflows

- `GenerateSOW.md` — SOW that attaches as Exhibit A
- `GenerateDiscovery.md` — Discovery data that informed the scope
- `GeneratePackage.md` — Full pipeline including this workflow
- `_VOICEAIAGENCY/Workflows/OnboardClient.md` — After contract is signed
