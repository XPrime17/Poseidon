---
capture_type: LEARNING
timestamp: 2026-02-06 06:34:00 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-02-06
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

🤖 Entering the PAI ALGORITHM… (v0.2.24 | github.com/danielmiessler/TheAlgorithm) ═════════════

🗒️ TASK: Surface GrokResearcher's final unique findings

The last research agent just completed — 54 tool uses, the deepest dive of all. Here's what's **new and actionable** that wasn't in previous drops:

━━━ 🔨 BUILD + ⚡ EXECUTE ━━━

### Critical Additions to Your Audit

**1. Paige's 4-Section Prompting Framework (this is specific to Amplify)**

Paige developed this based on her neuroscience/education background. Structure every voice agent prompt into:

| Section | Purpose |
|---------|---------|
| **Identity** | Persona — who the agent is |
| **Style** | Tone and approach |
| **Response Guidelines** | Formatting, length limits (2-3 sentences max) |
| **Task & Goals** | What the agent should accomplish |

**Voice-specific prompting rules the community teaches:**
- Use `<wait for user response>` tags to control conversation pacing
- Spell out numbers/dates as words: "January Twenty Four", "eleven pee em"
- Add natural hesitations: "uh," "um," ellipses for pauses
- **Never mention function/tool names** — agent should never say "I'm calling the bookAppointment function"
- **Never say "ending the call"** — use silent transfers instead
- Begin with direct answers, then add context

**2. 14 Mistakes to Avoid (community-derived — add to all 3 stages)**

| # | Mistake | Impact |
|---|---------|--------|
| 1 | Leaving Vapi's default turn detection enabled | **+1.5 seconds latency** — destroys conversational feel |
| 2 | Over-engineering first agent | Delays launch. Start with ONE workflow, ONE phone number |
| 3 | Switching niches too fast | Lose template reuse + case study compounding |
| 4 | Robotic-sounding voices | Use ElevenLabs Professional Voice Cloning for production |
| 5 | Over-explaining AI to prospects | Sell outcomes, not technology |
| 6 | Ignoring latency optimization | Even 300-500ms feels long. Target sub-500ms |
| 7 | Not testing end-to-end | Test complete flow, not just individual components |
| 8 | No fallback handling | Every prompt needs graceful error handling |
| 9 | Saying "ending the call" explicitly | Use silent transfers instead |
| 10 | Mentioning function names in speech | Agent should never reference its tools |
| 11 | Collecting unnecessary personal data | Legal liability — only collect what business needs |
| 12 | **Not disclosing AI upfront** | **Legal requirement**: "This is an AI assistant for [Business]" |
| 13 | Non-transparent pricing | Overage penalties and hidden per-minute costs destroy trust |
| 14 | Outbound calls without spam mitigation | Calls get flagged as spam if not properly configured |

**#1 and #12 are the highest-impact items** — one is a technical quick-win, the other is a legal requirement.

**3. Vapi Squads (advanced BUILD practice)**

For complex multi-department clients, the community teaches [VAPI Squads](https://www2.skool.com/amplify-voice-9801/vapi-squads-resources) — multiple voice agents working together with handoffs between departments. Enables better performance, lower latency, and enhanced UX for enterprise clients.

**4. ElevenLabs voice selection**

| Tier | Use Case |
|------|----------|
| Instant Voice Cloning | Quick setup, prototyping |
| Professional Voice Cloning | Production-quality, client-facing agents |

Community actively debates [ElevenLabs AI Agents vs Vapi](https://www.skool.com/amplify-voice-ai/any-experience-on-elevenlabs-ai-agents-vs-vapi) — worth reading for your stack decisions.

**5. Community engagement structure (for maximizing your membership)**

| Session | Frequency | Led By |
|---------|-----------|--------|
| Build Hours | **2x weekly** | Alejo |
| Sales Hours | Weekly | Paige |
| Expert Workshops | Weekly | Guest experts |
| Coffee Hour Q&A | Fridays | Alejo & Paige |
| Hackathons | Periodic | Community |

Skool sections: General, Resource Hub, **Wins**, Collabs, Troubleshooting, Updates, Community Wisdom

---

### Your Complete Updated BUILD Checklist Additions

```
[ ] Prompts follow Paige's 4-section structure (Identity/Style/Response Guidelines/Task)
[ ] Vapi default turn detection DISABLED (saves 1.5s latency)
[ ] Agent never mentions function/tool names in speech
[ ] Agent uses silent transfers, never says "ending the call"
[ ] AI disclosure at start of every call ("This is an AI assistant for [Business]")
[ ] Outbound calls configured with spam mitigation
[ ] Using ElevenLabs Professional Voice Cloning for production agents
[ ] End-to-end latency under 500ms (target 465ms)
[ ] Fallback handling for every unexpected input path
```

---

</details>
