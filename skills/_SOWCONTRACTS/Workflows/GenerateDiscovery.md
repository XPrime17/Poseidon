# GenerateDiscovery Workflow

**Create customized discovery questions for a voice AI prospect.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the GenerateDiscovery workflow to create discovery questions for a prospect"}' \
  > /dev/null 2>&1 &
```

Running **GenerateDiscovery** in **SOW & Contracts**...

---

## When to Use

- "discovery questions for [prospect]"
- "prep discovery call for [business]"
- "create intake questions"
- "what should I ask [prospect]?"

---

## Prerequisite Knowledge

**Load before starting:**
- `DiscoveryTemplate.md` — Full question framework with niche add-ons
- `_VOICEAIAGENCY/NichePlaybook.md` — Per-vertical strategies (if niche is known)

---

## Workflow

### Step 1: Collect Context

Use AskUserQuestion to gather:
- Client company name
- Industry / niche
- Primary use case (if known)
- What you already know about their situation
- Their likely technical sophistication level
- Specific pain points you suspect

### Step 2: Select Relevant Sections

From `DiscoveryTemplate.md`, include:
- **Always:** Sections I (Business & Operations), II (Goals), III (Tasks), V (Technical), VII (Success)
- **If brand-sensitive niche:** Section IV (Brand Voice)
- **If ongoing engagement expected:** Section VI (Reporting & Maintenance)
- **Add niche-specific add-on questions** matching their industry

### Step 3: Customize Questions

- Replace all placeholders with client-specific details
- Remove questions that don't apply to their niche
- Add questions based on suspected pain points
- Reorder by priority — lead with the most valuable questions
- Keep total questions under 30 (respect their time)

### Step 4: Format Document

Output as formatted markdown with:
- Professional header (company name, date, prepared by Sub-Zero Automations)
- Introduction paragraph explaining the purpose
- Numbered sections with Roman numerals
- Mix of open-ended and specific metric questions
- Checkbox items for capabilities section

### Step 5: Deliver

Output ready to:
- Copy into Google Docs or email
- Use as a live call guide (highlight top 10 must-ask questions)
- Share with prospect before the call (optional — some prefer cold discovery)

---

## Agent Delegation

**Devin Cross** (The Closer) reviews questions for sales positioning — ensuring questions lead naturally toward the close.

---

## Related Workflows

- `GenerateSOW.md` — After discovery, create the SOW
- `_VOICEAIAGENCY/Workflows/ProspectResearch.md` — Research before discovery
- `_VOICEAIAGENCY/Workflows/PrepareDemo.md` — Demo prep alongside discovery
