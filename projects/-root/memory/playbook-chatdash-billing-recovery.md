---
name: playbook-chatdash-billing-recovery
description: "Recovery flow when a Chat-Dash client subscription is past_due — resend client setup email, client logs into separate client dashboard, adds payment method, Stripe auto-collects arrears"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7a979655-73ca-424c-b39c-9f06a26cf14f
---

# Chat-Dash billing recovery — past_due subscription playbook

**When a Chat-Dash client subscription goes past_due (no payment method on file, or card declined), the fix is NOT to chase them for a payment link or recreate the subscription. The fix is to get them into their client dashboard.**

**Why:** Chat-Dash issues subscriptions on signup whether or not the client has a payment method. The dashboard collects the card; Stripe then auto-collects any outstanding/overdue invoices in the next billing cycle attempt. Clients often lose or never save the client-dashboard login because they confuse it with the agency dashboard (different surface, different creds).

**How to apply:**

1. **Don't assume "no email = no subscription."** Subscription likely exists in past_due state. Verify in Chat-Dash → Stripe Billing → Subscriptions tab before redoing setup.
2. **Resend the Chat-Dash client setup email** (the one that contains the client-dashboard login link). This is the recovery path — not a fresh Checkout link.
3. **Tell the client to add a payment method in the client dashboard.** Once added, Stripe auto-retries the overdue invoice within minutes.
4. **Verify on Stripe side** — confirm payment landed and subscription status flipped from `past_due` → `active`.

## Two-dashboard gotcha
- **Agency dashboard** — what Scott uses to manage clients/agents/billing
- **Client dashboard** — what the centre director uses to manage their own subscription + payment method
- These have separate logins. Centre directors usually save neither, then can't find the client one when the past_due email arrives. Resending the setup email is the only practical recovery.

## TourForce portal vs Chat-Dash (don't conflate)
- **Chat-Dash** is the active billing surface today (uses Stripe Connect on `acct_1T3SS88QdbWckC7C`, holds its own working Stripe token)
- **TourForce portal** is Scott's custom in-progress replacement (its own `.env` Stripe key is currently expired — unrelated to client billing today)
- A past_due Chat-Dash sub is NOT caused by the expired TourForce portal key

## Origin
Surfaced 2026-06-06 via Sharmilla / Leaside + Pickering. Subscriptions had been past_due since 2026-05-23 (~14 days) because no payment method was added. Resending setup email → dashboard login → adding card auto-collected the arrears in one move. See [[customer-leaside-pickering-first-paying]].
