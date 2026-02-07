# ProspectResearch Workflow

**Research 20-30 prospects in a target niche with pain points and outreach angles.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the ProspectResearch workflow to find voice AI prospects"}' \
  > /dev/null 2>&1 &
```

Running **ProspectResearch** in **Voice AI Agency**...

---

## When to Use

- "Find prospects for voice AI"
- "Research dental offices in [city]"
- "Lead gen for [niche] in [area]"
- "Find businesses that need a voice agent"

---

## Prerequisite Knowledge

**Load before starting:**
- `SellKnowledge.md` — Outreach scripts, qualifying questions
- `NichePlaybook.md` — Niche-specific pain points and outreach angles

---

## Workflow

### Step 1: Define Target Parameters

Collect via AskUserQuestion if not provided:
- **Niche:** (dental, HVAC, med spa, etc.)
- **Location:** City, metro area, or region
- **Volume:** How many prospects (default: 25)
- **Filters:** Revenue range, team size, existing tech

### Step 2: Research Prospects

Launch research agents in parallel:

```typescript
// Google Maps / Business directories
Task({
  subagent_type: "GeminiResearcher",
  description: "Find [niche] businesses in [location]",
  prompt: "Find 25 [niche] businesses in [location]. For each, provide: business name, phone number, website, address, Google rating, number of reviews. Focus on businesses with 3-4 star Google ratings (room for improvement) and multiple locations (higher value)."
})

// Industry-specific research
Task({
  subagent_type: "ClaudeResearcher",
  description: "Research [niche] industry pain points",
  prompt: "What are the top phone/communication pain points for [niche] businesses in 2026? What answering services or AI solutions are they currently using? What's the typical call volume?"
})
```

### Step 3: Qualify Each Prospect

For each prospect, score on:

| Factor | Weight | How to Check |
|--------|--------|-------------|
| Call goes to voicemail | 30% | Call the business, check |
| No online booking | 20% | Check website |
| High Google review volume | 15% | Lots of reviews = lots of calls |
| Multiple locations | 15% | Higher contract value |
| Active social media | 10% | Tech-aware, reachable |
| No existing AI/chat solution | 10% | Check website for chatbots |

### Step 4: Build Prospect Sheet

**Output format per prospect:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Business Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 [Address]
📞 [Phone] — [answered/voicemail when called]
🌐 [Website]
⭐ [Rating] ([Reviews] reviews)
👥 [Estimated size]

Pain Points:
  • [Specific pain point found]
  • [Another pain point]

Outreach Angle:
  "[Personalized opening line based on NichePlaybook.md]"

Score: [X/100]
Priority: [HIGH / MEDIUM / LOW]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5: Generate Outreach Sequence

For the top 10 prospects, draft personalized 3-touch email sequences using templates from SellKnowledge.md.

---

## Agent Delegation

**Devin Cross** is the primary named agent for prospect research. He approaches everything with a revenue-first mindset and knows how to identify the prospects most likely to close.

**Kai Holbrook** can assist with niche selection strategy.

---

## Related Workflows

- `NicheTarget.md` — Decide which niche to target first
- `PrepareDemo.md` — Prepare demo for a qualified prospect
- `GenerateProposal.md` — Create proposal for interested prospect
