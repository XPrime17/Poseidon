---
name: St. Catharines custom AI intro (per-centre customization)
description: First per-centre AI-disclosure customization. Shauna asked for warmer framing tied to Code Ninjas's mission. Wording option (A) shipped to outbound Stage 1 + inbound begin_message.
type: project
originSessionId: dfcce36f-cdf2-4142-82a5-a8d73d8d6185
---
Shipped 2026-05-25.

**Trigger:** Shauna (St. Catharines director) raised on 2026-05-23 that the standard "I'm an AI agent on a recorded line" disclosure felt like "just another company using bots" — wanted to soften and tie to CN's actual AI-teaching mission.

**Wording shipped (option C — final, after Shauna's review):**
> "I'm an AI agent on a recorded line — since AI is part of what we teach, we figured we'd put it to good use. Real people are right behind me if I can't get you what you need."

(Option A was shipped first; Shauna preferred C on review, swapped same day.)

**Where it went:**
- Outbound LLM `llm_5b4dbab1bf6dcc5007c61c2726ff` — Stage 1 disclosure sentence, with "So," bridge before "I saw you filled out..."
- Inbound LLM `llm_769e0ba68dc37cea573904c474fe` — full begin_message rewrite

**Scope:** St. Catharines ONLY. Other 8 LLMs unchanged. Burlington (also Shauna) not included — pending Scott's separate decision.

**Script:** `/root/stcath-custom-intro-2026-05-25.ts`. Reusable anchor pattern; --dry-run flag.

**Why this is the right architecture for now:** One-off per-LLM edit, not yet templated via Centre Lookup. Validates the wording in real calls before fanning out the framework. Follow-up task #30 captures the templating work for after we see live data.

**Branding insight (worth capturing):** Code Ninjas has a unique authority to lean INTO the AI angle warmly rather than apologetically. Every other industry's voice AI sounds like a confession; for CN it can sound like a demonstration. Per-centre intros let directors customize the framing to their own voice — but the standard line should probably evolve in this direction fleet-wide eventually.

**Followups:**
- #30: Template `ai_intro_addition` as Centre Lookup column → onboarding script substitutes `{{AI_INTRO_ADDITION}}` placeholder
- Burlington (also Shauna): pending Scott decision on whether to mirror
- Watch for parent-side reaction in next week's call transcripts (does the warmer intro change tone of replies?)
