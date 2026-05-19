---
name: TourForce Pricing Model
description: Pricing strategy for TourForce voice AI agency — 3-tier model (Base/Pro/Pro+) with $100 increments, minute cap TBD, competitive intel vs Vinsi.AI
type: project
---

TourForce pricing is a 3-tier model (Base / Pro / Pro+) priced in USD with $0 setup and cancel-anytime. Tiers gate **capabilities** (booking, dashboard), not volume.

**Why:** Evolved through 5 iterations. Key insight (2026-04-16): inbound captures active buying intent and replaces a $1,200-1,600/mo receptionist — it deserves premium positioning. Final structure (2026-04-27): both services in every tier, $100 increments, tour booking at Pro, dashboard at Pro+.

**How to apply:** When Scott says "pricing", "tiers", "feature matrix", "sales deck pricing" — this is the active model. Resume from open questions below.

## Decided (2026-04-27) — "3-Tier Capability Ladder"

- **Structure:** 3-tier (Base / Pro / Pro+), $100 increments
- **Base $99/mo:** Inbound + outbound, AI calls and answers, daily email summaries
- **Pro $199/mo:** + Tour booking, KB Q&A
- **Pro+ $299/mo:** + Dashboard (recordings, transcripts, analytics), monthly optimization, priority support
- **Currency:** All USD (Stripe auto-converts CAD)
- **Setup fee:** $0
- **Contracts:** Cancel anytime, month-to-month
- **Multi-location:** 15% off each additional centre
- **Annual prepay:** 2 months free (17% savings)
- **Minute cap:** OPEN — need real inbound production data before setting (see Open Questions)
- **Overage rate:** OPEN — Vinsi charges $0.30/min, Retell costs $0.135/min, range is $0.20-0.30

## Feature Matrix (FINAL except cap/overage)

| Feature | Base ($99) | Pro ($199) | Pro+ ($299) |
|---------|:---:|:---:|:---:|
| **OUTBOUND** | | | |
| AI calls new leads | ✓ | ✓ | ✓ |
| 4-attempt retry system | ✓ | ✓ | ✓ |
| Voicemail (attempt 2) | ✓ | ✓ | ✓ |
| **INBOUND** | | | |
| 24/7 AI receptionist | ✓ | ✓ | ✓ |
| Message-taking | ✓ | ✓ | ✓ |
| Knowledge base Q&A | — | ✓ | ✓ |
| Tour booking | — | ✓ | ✓ |
| **VISIBILITY** | | | |
| Daily email summaries | ✓ | ✓ | ✓ |
| Call recordings | — | — | ✓ |
| Transcripts | — | — | ✓ |
| Owner dashboard | — | — | ✓ |
| **SERVICE** | | | |
| Monthly optimization | — | — | ✓ |
| Email support | ✓ | ✓ | — |
| Priority support | — | — | ✓ |

**Removed:** CRM integration (not available until HubSpot integration built)
**Merged:** Dashboard & analytics combined into single "Owner dashboard" line

## Retell Cost Data (actual, 2026-04-27)

### Per-minute cost (CNKB stack: GPT-4.1 + Retell voices + Twilio)
| Component | $/min |
|---|---|
| Retell infrastructure | $0.055 |
| TTS (Retell voices) | $0.015 |
| LLM (GPT-4.1) | $0.045 |
| Telephony (Twilio) | $0.015 |
| KB add-on | $0.005 |
| **TOTAL** | **$0.135/min** |

### Fixed monthly per centre
- KB subscription: $8.00
- Phone number: $2.00
- **Total fixed: $10.00/mo**

### Usage data (outbound — REAL, from Retell call logs March 2026)
- EG: ~67 calls/mo, ~83 min/mo
- Canton: ~87 calls/mo, ~106 min/mo
- Avg: ~77 calls/mo, ~95 min/mo
- Avg call duration: ~1.2-1.5 min

### Usage data (inbound — ESTIMATED, NO PRODUCTION DATA)
- ⚠️ Volume: 110-220 calls/mo — **GUESS, not measured**
- ⚠️ Duration: ~2.5 min avg — **GUESS, not measured**
- ⚠️ Total: 275-550 min/mo — **GUESS × GUESS**
- EG inbound agent exists but was not published to production
- **MUST get real inbound data before finalizing minute cap**

## Margin Analysis (at various usage levels, excluding cap/overage)

| Usage | COGS | Base margin | Pro margin | Pro+ margin |
|---|---|---|---|---|
| 200 min (outbound only) | ~$37 | $62 (63%) | $162 (81%) | $262 (88%) |
| 400 min (both, quiet) | ~$64 | $35 (35%) | $135 (68%) | $235 (79%) |
| 600 min (both, busy) | ~$91 | $8 (8%) | $108 (54%) | $208 (70%) |

**Key insight:** Base ($99) is margin-thin if inbound drives 400+ min. Cap/overage design is critical to protect Base margin. Pro and Pro+ are healthy at all usage levels.

## Competitive Intelligence — Vinsi.AI (pulled 2026-04-27)

| Tier | Price | Minutes | Effective $/min | Overage |
|---|---|---|---|---|
| Voice | $299/mo | 500 | $0.60 | $0.30/min |
| Professional | $499/mo | 2,000 | $0.25 | $0.30/min |
| Premium | $999/mo | 5,000 | $0.20 | $0.30/min |
| Elite | $1,999/mo | 10,000 | $0.20 | $0.30/min |
| Enterprise | Custom | Custom | — | — |

- Extra users: $49/user/mo
- Setup: hours bundled into plan (2-12 hrs by tier)
- Features: 24/7 answering, booking, custom scripts, smart routing, CRM (Salesforce/HubSpot/Zoho), Calendly/Google Calendar integration, real-time analytics
- TourForce undercuts Vinsi at every tier by 47-80% (before overages)
- Source: https://vinsi.ai/pricing

## Version History

- **v1 (2026-03):** $199/$249 two-tier — underpriced
- **v2 (2026-03-29):** Starter $99 / Pro $249 / Premium $499 three-tier
- **v3 (2026-04-16):** Essentials $99 / Pro $199 two-tier — Pro margin too thin (44%)
- **v4 (2026-04-16):** "Flip the Anchor" — Essentials $99 / Pro $299 two-tier, inbound as premium
- **v5 (2026-04-27):** CURRENT — Base $99 / Pro $199 / Pro+ $299 three-tier capability ladder

## Open Questions (Resume Here)

1. **Minute cap** — Need real inbound production data from EG before setting. Options discussed: 300 min (aggressive, $0.30 overage), 500 min (middle), 600 min (generous). Single cap across all tiers (tiers gate features, not volume).
2. **Overage rate** — Range: $0.20-0.30/min. Retell cost is $0.135/min. Vinsi charges $0.30. Need to balance margin protection vs customer bill predictability.
3. **Get EG inbound live** — Critical blocker for cap/overage decisions. Run 1 month of production inbound to get real usage data.
4. **Tier naming** — Base/Pro/Pro+ is placeholder
5. **Founding member rate** — Locked-in discount for first clients?
6. **Sales deck rebrand** — TourForce branding + new 3-tier pricing + receptionist-replacement narrative
7. **Daily email summary build** — Base tier visibility depends on this (n8n End Of Call → enriched email)
