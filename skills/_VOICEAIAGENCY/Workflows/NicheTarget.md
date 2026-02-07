# NicheTarget Workflow

**Score and select the best niche to target for voice AI agency growth.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the NicheTarget workflow to analyze voice AI niches"}' \
  > /dev/null 2>&1 &
```

Running **NicheTarget** in **Voice AI Agency**...

---

## When to Use

- "Which niche should I target?"
- "Niche analysis for voice AI"
- "Compare dental vs HVAC for voice AI"
- "Best niche for my agency"

---

## Prerequisite Knowledge

**Load before starting:**
- `NichePlaybook.md` — Niche scoring matrix, ICP profiles, configurations
- `PricingReference.md` — ROI by niche, pricing viability

---

## Workflow

### Step 1: Identify Candidate Niches

Start with the niches in NichePlaybook.md. Add any user-specified niches.

### Step 2: Score Each Niche

Use the 6-factor scoring matrix from NichePlaybook.md:

| Factor | Weight | Description |
|--------|--------|-------------|
| Call Volume | High | More calls = more value |
| Ticket Value | High | Higher ticket = easier ROI |
| Phone Dependency | High | Business relies on phone for revenue |
| Tech Adoption | Medium | Willing to try AI/automation |
| Competition | Medium | Fewer agencies = easier entry |
| Retention | Medium | Longer client lifetime = more revenue |

### Step 3: Calculate ROI Potential

For each niche, run PricingCalculator with typical values:

```bash
# For each niche:
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PricingCalculator.ts \
  --niche [niche] --calls [typical_volume] --roi-only
```

### Step 4: Assess Market Accessibility

For each niche, evaluate:
- **Reachability:** How easy to find and contact decision makers
- **Decision speed:** How fast they decide (dental: fast, enterprise: slow)
- **Budget authority:** Does the contact control budget
- **Seasonal patterns:** When are they busiest / most receptive

### Step 5: Generate Recommendation

**Output format:**

```
═══════════════════════════════════════════
  NICHE TARGETING ANALYSIS
═══════════════════════════════════════════

RANKING:
  1. [Niche] — Score: [X]/30 — ROI: [Y]:1
     Why: [1-2 sentence rationale]

  2. [Niche] — Score: [X]/30 — ROI: [Y]:1
     Why: [1-2 sentence rationale]

  3. [Niche] — Score: [X]/30 — ROI: [Y]:1
     Why: [1-2 sentence rationale]

RECOMMENDATION:
  Start with [top niche] because [rationale].
  Expand to [second niche] after [milestone].

IMMEDIATE ACTIONS:
  1. [Specific first step for chosen niche]
  2. [Second step]
  3. [Third step]
```

---

## Agent Delegation

**Kai Holbrook** is the primary named agent for niche targeting. As Agency Strategist, he thinks about growth trajectories and market positioning.

---

## Related Workflows

- `ProspectResearch.md` — Research prospects in the chosen niche
- `PrepareDemo.md` — Prepare niche-specific demo
