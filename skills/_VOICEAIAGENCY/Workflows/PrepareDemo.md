# PrepareDemo Workflow

**Prepare a 60-second live demo customized for a specific prospect.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the PrepareDemo workflow to prepare a voice AI demo"}' \
  > /dev/null 2>&1 &
```

Running **PrepareDemo** in **Voice AI Agency**...

---

## When to Use

- "Prepare a demo for [prospect]"
- "Demo script for [business]"
- "Get ready for [prospect] meeting"
- "Build a demo agent for [prospect]"

---

## Prerequisite Knowledge

**Load before starting:**
- `SellKnowledge.md` — Demo prep guide, 60-second script, objection handling
- `NichePlaybook.md` — Niche-specific agent configurations
- `PricingReference.md` — For pricing discussion prep

---

## Workflow

### Step 1: Research the Prospect

Before building the demo:
1. Visit their website — note services, hours, staff names
2. Check their Google listing — reviews, photos, Q&A
3. Call their current number — note what happens (voicemail? hold? human?)
4. Check social media — recent posts, promotions, events
5. Note their CRM/booking system (if visible on website)

### Step 2: Build Custom Demo Agent

Using PromptBuilder, create a demo-ready agent for THEIR business:

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PromptBuilder.ts \
  --niche [niche] \
  --business "[Their Business Name]" \
  --agent-name "[Appropriate Name]"
```

**Customize with their actual data:**
- Their business name in the greeting
- Their actual services and hours
- Their real FAQ answers (from website/Google)
- Appropriate voice for their brand

### Step 3: Prepare the 60-Second Demo Script

Follow the script from SellKnowledge.md:

```
"I built something for [Business Name]. Let me show you.

[Dials the demo number]

Agent: 'Thanks for calling [Business Name]! This is [Name], how can I help?'

You: 'Hi, I'd like to schedule a [their core service] for next [day].'

Agent: [Books the appointment naturally]

That's what every caller would hear instead of voicemail.
It books directly into your calendar. Want me to turn it on?"
```

### Step 4: Prepare Backup Materials

Create supporting materials:
1. **ROI one-pager** — using PricingCalculator:
   ```bash
   bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PricingCalculator.ts \
     --niche [niche] --calls [estimated volume]
   ```
2. **Before/after comparison** — missed calls vs. AI-answered
3. **Similar client case study** — metrics from comparable business
4. **Call recording** — save best demo call as backup
5. **Pricing options** — 2-3 tier options ready

### Step 5: Objection Prep

Review SellKnowledge.md objection handling for the top 5 objections this prospect is likely to raise based on their niche and size.

### Step 6: Demo Checklist

Before the meeting:
- [ ] Demo agent is live and working
- [ ] Demo phone number is active
- [ ] Agent greets with THEIR business name
- [ ] Booking flow works end-to-end
- [ ] Backup recording ready
- [ ] ROI one-pager printed/ready to screen share
- [ ] Pricing options prepared
- [ ] Calendar open for follow-up scheduling

---

## Agent Delegation

**Devin Cross** is the primary named agent for demo prep. He understands how to frame the demo for maximum close rate.

**Paige Mercer** can assist with the demo agent prompt to ensure quality.

---

## Related Workflows

- `ProspectResearch.md` — Research before demo prep
- `GenerateProposal.md` — Create proposal after successful demo
- `BuildAgent.md` — Build the actual production agent after close
