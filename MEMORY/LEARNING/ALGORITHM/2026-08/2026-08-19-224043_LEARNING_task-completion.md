---
capture_type: LEARNING
timestamp: 2026-08-19 22:40:43 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-08-19
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

🤖 PAI ALGORITHM ═════════════

**OBSERVE → THINK:** I agree with you — and I'd go further: the Zap isn't just lower-friction, it's *architecturally* the better product decision. Here's the full reasoning, including the one real risk and how to hedge it cheaply.

## Why the Zap wins on the merits

**The G1.1 fix never actually eliminated the forwarding problem.** Even if Grayson ships the phone/location tokens, those notifications land in each *centre's* inbox — routing them to the pipeline still requires every director to set up email forwarding. That's the exact step that stalled Burlington and Kanata outbound for **two months** despite repeated asks. The Zap replaces "explain Gmail forwarding rules to a busy franchisee" with "I add one slug to a filter" — onboarding a centre's lead flow becomes a 30-second act **you** perform, with zero centre-side dependencies. For TourForce as a business, controlling the pipe instead of borrowing the centre's inbox is the difference between a product and a favor.

**The economics are a rounding error.** At ~1 task per real lead (foreign centres filtered free), even a fleet doing hundreds of leads a month sits comfortably in Zapier's cheapest paid tier — call it $20–30/month against revenue-per-booked-tour. This week's quota burn was a design bug, not a cost property; the fixed design already proved it.

**And it generalizes.** "We plug into your CRM with one automation, zero staff setup" is the pitch that works for non-CN prospects too — it's the same CRM-agnostic posture the stack was designed around from the start.

## The one real risk, and the cheap hedge

The Zap's single point of failure is **your HubSpot seat's portal-wide visibility**. Everything rides on your user seeing all centres' form submissions. If HQ ever tightens permissions or partitions the portal per-franchise, the pipe closes overnight — and that's precisely the scenario where the G1.1 template fix becomes the fallback (centre-forwarded notifications, which our parser could adopt in an afternoon).

So my recommendation: **Zap as the strategy, Grayson email as insurance.** The ask is already drafted in your inbox and costs you one forward — don't frame it as our lead-路 pipeline's future, frame it as what it says: a speed-to-lead improvement for every franchisee. If it ships, we get goodwill with HQ plus a warm fallback; if it doesn't, we've lost nothing.

**One evolution worth pencil-marking (not doing now):** Zapier can skip email entirely and POST structured JSON straight to an n8n webhook — no Gmail polling (kills up to 60s latency), no text parsing, fewer failure modes. The email leg is proven and I wouldn't churn it while the fleet is stabilizing, but when things are quiet it's the natural v2.

**LEARN:** Recording the strategic decision:

</details>
