# Pricing Reference

Code Ninjas pricing, real COGS breakdown, margins, and ROI framing.

---

## Code Ninjas Pricing (Active)

### Plans

| | **Standard** | **Premium** |
|---|---|---|
| **Monthly** | **$199/month** | **$249/month** |
| Setup Fee | $0 | $0 |
| Voice AI Agent ("Cimo") | ✓ | ✓ |
| 24/7 call answering | ✓ | ✓ |
| Tour booking | ✓ | ✓ |
| Knowledge base | ✓ | ✓ |
| Call recording & transcripts | ✓ | ✓ |
| Dedicated phone number | ✓ | ✓ |
| Prompt updates & optimization | ✓ | ✓ |
| Automated QA (Cekura) | ✓ | ✓ |
| Support (M-F 9am-6pm ET) | ✓ | ✓ |
| **ChatDash Dashboard** | — | ✓ |
| **Reporting & analytics** | — | ✓ |
| **Centre Director login** | — | ✓ |

### Multi-Location Discount

| Centres | Discount | Premium | Standard |
|---------|----------|---------|----------|
| 1 centre | List price | $249/mo | $199/mo |
| Each additional | 15% off | $212/mo | $169/mo |

### Sales Framing

**The one-liner:** "One enrollment pays for the whole service. Everything after that is profit."

**The pitch:**
> "Cimo answers every call your centre gets — instantly, 24/7. Parents calling at 8pm after the kids are in bed? Cimo books the tour. Staff busy during a session? Cimo handles it. No voicemails, no missed opportunities.
>
> It's $249 a month. Your average membership is about $250. So if Cimo books one tour that converts to an enrollment — it's paid for itself that month. And at 92% retention, that one student pays you $3,000 over the next year. That's a 10x return on one month of Cimo."

**Annual frame:** "Under $3,000 a year. If Cimo helps you enroll one extra student per month, that's $30,000+ in membership revenue on a $3,000 investment."

**Objection handling:**
- "I can't afford $249" → "We have Standard at $199 — same agent, same coverage, you can upgrade anytime."
- "How do I know it works?" → "14-day pilot, full refund if it doesn't meet performance criteria."
- "How do I know Cimo generated that enrollment?" → "That's what the Premium dashboard shows — every call, booking, and conversion." (upsell to $249)
- "We barely get calls" → "You're also capturing after-hours — parents browsing at 8pm who currently get voicemail."

---

## COGS Breakdown (Actual Stack — Retell)

### Per-Minute Costs (2-minute average call)

| Component | Cost/min | Notes |
|-----------|----------|-------|
| Retell Voice Infrastructure | $0.055 | Platform base rate |
| TTS (Platform voices / Cartesia) | $0.015 | Retell bundled voices |
| LLM (GPT-4.1) | $0.025 | Current model on all agents |
| Telephony (Retell Twilio) | $0.015 | SIP trunking |
| Knowledge Base | $0.005 | Retell add-on |
| **Per-minute total** | **$0.115** | |
| **Per 2-min call** | **$0.23** | |

### Monthly COGS Per Centre

| Calls/Month | Variable COGS | Fixed Costs | Total COGS | At $249/mo | At $199/mo |
|-------------|--------------|-------------|------------|------------|------------|
| 50 | $11.50 | $32 | $43 | 83% margin | 78% margin |
| 100 | $23.00 | $32 | $55 | 78% margin | 72% margin |
| 200 | $46.00 | $32 | $78 | 69% margin | 61% margin |
| 300 | $69.00 | $32 | $101 | 59% margin | 49% margin |

**Fixed costs per centre:** Retell phone ($2/mo) + ChatDash (~$20/mo with partner discount) + Cekura allocation (~$10/mo) = ~$32/mo

**Fair use:** 300 calls/month included. Typical CN centre does 50-150 calls/month.

### Onboarding Labor Cost (Absorbed — $0 Setup Fee)

| Step | Time | Notes |
|------|------|-------|
| Clone agent + create LLM copy | 15 min | Scripted |
| Twilio sub-account + SIP trunk | 30 min | Semi-automated |
| ChatDash agent + client setup | 15 min | API calls |
| Cekura test scenarios | 15 min | Templated |
| KB population from centre info | 45 min | Manual |
| QA testing | 30 min | Semi-automated |
| **Total** | **~2.5 hours** | ~$375 labor cost, recouped by month 3 |

---

## Volume Projections

| Centres | Premium MRR | Standard MRR | Annual (Premium) |
|---------|-------------|-------------|-----------------|
| 5 | $1,245 | $995 | $14,940 |
| 10 | $2,490 | $1,990 | $29,880 |
| 20 | $4,980 | $3,980 | $59,760 |
| 50 | $12,450 | $9,950 | $149,400 |

**With 15% multi-location discount (all additional centres):**

| Scenario | MRR | Annual |
|----------|-----|--------|
| 1 owner × 5 centres (Premium) | $249 + 4×$212 = $1,097 | $13,164 |
| 3 owners × 3 centres each (Premium) | 3×($249 + 2×$212) = $2,019 | $24,228 |
| 10 single-centre owners (Premium) | 10×$249 = $2,490 | $29,880 |

---

## ROI Calculator (Code Ninjas Specific)

### Input Variables
```
avg_membership           # $200-300/month
student_retention        # 92%
avg_student_tenure       # ~12 months
student_ltv              # $2,400-$3,600
missed_calls_per_day     # Estimated 30% of inbound
tour_conversion_rate     # 40-60% of tours → enrollment
```

### The Math
```
monthly_cost             = $249 (Premium) or $199 (Standard)
annual_cost              = $2,988 or $2,388
one_enrollment_value     = $250/month × 12 months = $3,000
break_even               = 1 enrollment/month (Premium) or <1 enrollment/month (Standard)
at_4_enrollments/month   = $12,000/year new revenue vs $2,988 cost = 4:1 ROI
```

### Competitive Anchoring

| Alternative | Monthly Cost | Coverage |
|-------------|-------------|----------|
| Ruby Receptionists (human) | $705/mo for 200 min | Business hours only |
| Smith.ai (human) | $810/mo for 90 calls | Business hours |
| Smith.ai (AI) | $270-500/mo | 24/7 but generic |
| Goodcall (AI product) | $99-199/mo | 24/7 but template, no customization |
| **Cimo (Sub-Zero)** | **$199-249/mo** | **24/7, custom-trained, CN-specific** |

---

## Discount & Negotiation Rules

| Scenario | Offer | Floor |
|----------|-------|-------|
| Multi-location | 15% off each additional centre | 15% (no stacking) |
| Annual prepay | 2 months free (17% off) | 10% off |
| "Too expensive" | Offer Standard ($199) instead of discounting Premium | $169 (multi-location Standard) |
| Pilot/trial | 14 days, full refund if criteria not met | 7 days |

**Principle:** Never discount the price — offer the lower tier instead. Premium is $249, Standard is $199. Multi-location earns 15% off. That's it.
