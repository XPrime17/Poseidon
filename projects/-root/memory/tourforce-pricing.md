---
name: tourforce-pricing-model
description: "Pricing strategy for TourForce voice AI agency — 2-tier CAD-only (Base $99 / Pro $299), founding-member rate $199 Pro for first 5 centres (Sharmilla/Leaside+Pickering locked in 2026-05-23 as first paying customer, $368.15 MRR), tour booking is the divider, minute cap + overage still open, US pricing deferred"
metadata: 
  node_type: memory
  type: project
  originSessionId: 43587625-6707-4d02-a454-a9473895db58
---

TourForce pricing is a 2-tier model (Base $99 CAD / Pro $299 CAD), $0 setup and cancel-anytime. **CAD-only** — US price list deferred until first US customer. **Tour booking is the divider** — Base = answering + outreach, Pro = full funnel + visibility.

**Why:** Evolved through 7 iterations, oscillating between 2 and 3 tiers four times. Key insight (2026-04-16): inbound captures active buying intent and replaces a $1,200-1,600/mo receptionist. Collapsed back to 2 tiers (2026-05-22) after the 3-tier middle ("Pro" at $199) kept failing to justify its existence — there's no natural middle, only one clean fault line: **tour booking**. Decision rationale: a tier that's hard to differentiate is a signal it shouldn't exist; ship the simplest defensible model and let real customers reveal whether a 3rd tier is needed. No live pricing data yet (Leaside inbound not active, NV outbound weak), so the structure can't be finalized from theory — the market arbitrates. See [[feedback-ship-simple-when-decisions-oscillate]].

**How to apply:** When Scott says "pricing", "tiers", "feature matrix", "sales deck pricing" — this is the active model. Resume from open questions below.

## Decided — "2-Tier, Booking as Divider" (structure 2026-05-22, currency 2026-05-23)

- **Structure:** 2-tier (Base / Pro)
- **Base $99 CAD/mo — "AI Answering & Outreach":** Outbound lead reactivation (calls + 4-attempt retry + voicemail), 24/7 inbound receptionist, message-taking, KB Q&A, daily email summaries. **No tour booking.**
- **Pro $299 CAD/mo — "Full Voice AI":** Everything in Base **+ tour booking, owner dashboard (recordings, transcripts, analytics), CRM write-back, custom agent configuration.**
- **Currency:** CAD only. Stripe entity (2738714 Ontario Inc.) is CAD-native, so this is the operational default. US price list deferred until first US customer arrives — designing it now is speculative work the first US prospect would invalidate anyway.

### Founding-Member Rate (locked 2026-05-23)
- **$199 CAD/mo Pro** for the **first 5 paying centres** (Base tier unaffected).
- Time-bounded: founding rate retires when the 5th centre signs. Centres 6+ pay list ($299).
- Founding rate **stacks with the 15% multi-centre discount** (Pickering precedent set).
- Sharmilla (Leaside + Pickering) is centres 1 and 2. 3 founding slots remaining.
- Rationale: founding discount is *expected* in early SaaS; it signals "you got in early," not "we mispriced." Preserves $299 list anchor for the open market.

### Customer Data Point — CORRECTED 2026-08-22 from WhatsApp primary source
- Prior record ("Sharmilla counter-offered $149/$249, not adopted") was WRONG in attribution. The 2026-05-23 WhatsApp transcript (provided by Scott 2026-08-22) shows **Scott himself proposed Base $149 / Pro $249** and told Sharmilla: *"first 5 centres at 199 and then move 249."* Sharmilla's own suggestion was $149/$199; Scott rejected that as too close together.
- **Customer-facing commitment:** Sharmilla's understanding is post-founding Pro list = **$249**, not $299. The $99/$299 list in this file was never communicated to her. Resolve the anchor before quoting list price to any prospect (Shauna transition, 2026-08-22).
- **Value-prop line that closed the deal:** "$249 is a common charge for Create regular, so the agent pays for itself after just 1 conversion" — Sharmilla repeated it back approvingly. Reuse this framing.
- Also from transcript: Pro includes everything but features can be disabled per centre (Pickering inbound example) — flexibility was part of the close.
- **Setup fee:** $0
- **Contracts:** Cancel anytime, month-to-month
- **Multi-location:** 15% off each additional centre
- **Annual prepay:** 2 months free (17% savings)
- **Minute cap:** OPEN — need real inbound production data before setting (see Open Questions)
- **Overage rate:** OPEN — Vinsi charges $0.30/min, Retell costs $0.135/min, range is $0.20-0.30

**Tradeoff accepted:** dropping the 3rd tier removes the $299-anchor that made a $199 middle look reasonable (decoy effect) and forgoes some willingness-to-pay capture. Bought in exchange for a dead-simple yes/no sales conversation. Revisit if a cluster of prospects asks "is there something between $99 and $299?"

## Feature Matrix (FINAL except cap/overage)

| Feature | Base ($99 CAD) | Pro ($299 CAD) |
|---------|:---:|:---:|
| **OUTBOUND** | | |
| AI calls new leads | ✓ | ✓ |
| 4-attempt retry system | ✓ | ✓ |
| Voicemail (attempt 2) | ✓ | ✓ |
| **INBOUND** | | |
| 24/7 AI receptionist | ✓ | ✓ |
| Message-taking | ✓ | ✓ |
| Knowledge base Q&A | ✓ | ✓ |
| Tour booking | — | ✓ |
| **VISIBILITY** | | |
| Daily email summaries | ✓ | ✓ |
| Transcripts | — | ✓ |
| Call recordings | — | ✓ |
| Owner dashboard | — | ✓ |
| **INTEGRATIONS** | | |
| CRM write-back | — | ✓ |
| **CUSTOMIZATION** | | |
| Custom agent configuration | — | ✓ |

**Note on CRM write-back:** depends on HubSpot integration being built (HQ migration pilot end-of-May). Honor as a Pro feature but flag it as "coming" until the bridge is live.
**Removed (2026-05-22):** SERVICE section (monthly optimization, email/priority support) — dropped from the matrix.

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

All COGS are USD; CAD revenue converted at ~1.37 USD/CAD for comparison.

| Usage | COGS (USD) | Base $99 CAD ≈ $72 USD margin | Pro $299 CAD ≈ $218 USD margin |
|---|---|---|---|
| 200 min (outbound only) | ~$37 | $35 USD (49%) | $181 USD (83%) |
| 400 min (both, quiet) | ~$64 | $8 USD (11%) | $154 USD (71%) |
| 600 min (both, busy) | ~$91 | **−$19 USD (LOSS)** | $127 USD (58%) |

**Key insight (REVISED 2026-05-23):** CAD-pricing compresses Base margin significantly vs prior USD pricing. Base goes negative at 600 min. **Minute cap decision is now urgent for Base specifically** — protecting Base margin requires either a tight cap (e.g., 300 min) or a healthy overage rate. Pro remains healthy at all usage levels.

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
- **v5 (2026-04-27):** Base $99 / Pro $199 / Pro+ $299 three-tier capability ladder
- **v6 (2026-05-20):** tier names locked. Base / Pro / **Ultra** three-tier. Pro+ retired (categorical upgrade signal, sidesteps Vinsi vocabulary).
- **v7 (2026-05-22):** Collapsed to 2-tier. Base $99 (Answering & Outreach) / Pro $299 (Full Voice AI). Tour booking is the divider. Ultra dropped. KB Q&A moved to Base (universal). SERVICE section removed. Transcripts/recordings/dashboard/CRM write-back/custom config consolidated into Pro. Provisional lock pending real customer signups. 4th oscillation between 2 and 3 tiers; see [[feedback-ship-simple-when-decisions-oscillate]].
- **v8 (2026-05-23):** Switched to CAD-only pricing. Base $99 CAD / Pro $299 CAD. Triggered by Sharmilla pushback; optics-driven. US deferred. Base margin compresses (49% → 11% → negative at 600 min). First real-customer-driven pricing change.
- **v9 (2026-05-23):** CURRENT — **Founding-member rate added: $199 CAD Pro for first 5 centres. First paying customer locked: Sharmilla (Leaside + Pickering), $368.15 MRR.** Sharmilla counter-offered $149/$249 list — recorded as data point, NOT adopted (one voice ≠ pattern; preserves $299 anchor for open market). The "provisional pending real signups" condition from v7 is now MET — v9 is no longer a theoretical lock. Closes Open Q #5 (founding rate). See [[customer-leaside-pickering-first-paying]].

## Open Questions (Resume Here)

1. **Minute cap** — Need real inbound production data from EG before setting. Options discussed: 300 min (aggressive, $0.30 overage), 500 min (middle), 600 min (generous). Single cap across all tiers (tiers gate features, not volume).
2. **Overage rate** — Range: $0.20-0.30/min. Retell cost is $0.135/min. Vinsi charges $0.30. Need to balance margin protection vs customer bill predictability.
3. **Get EG inbound live** — Critical blocker for cap/overage decisions. Run 1 month of production inbound to get real usage data.
4. ~~**Tier naming** — Base/Pro/Pro+ is placeholder~~ **RESOLVED 2026-05-20:** Base / Pro / Ultra
5. ~~**Founding member rate** — Locked-in discount for first clients?~~ **RESOLVED 2026-05-23:** $199 CAD Pro for first 5 centres, stacks with 15% multi-centre discount. Sharmilla took slots 1+2.
6. **Sales deck rebrand** — TourForce branding + 2-tier pricing + receptionist-replacement narrative
7. **Daily email summary build** — Base tier visibility depends on this (n8n End Of Call → enriched email)
8. **CRM write-back delivery** — listed as a Pro feature but depends on HubSpot integration (HQ pilot end-of-May). "Coming" until bridge is live.
9. **Re-evaluate 2 vs 3 tiers** — provisional lock. Trigger to add a 3rd tier: prospects repeatedly asking for something between $99 and $299, OR a cluster wanting visibility without booking.
