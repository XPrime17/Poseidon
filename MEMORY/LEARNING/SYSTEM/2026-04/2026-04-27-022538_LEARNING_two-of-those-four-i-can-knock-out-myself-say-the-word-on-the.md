---
capture_type: LEARNING
timestamp: 2026-04-27 02:25:38 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Two of those four I can knock out myself — say the word on the migrations and I'll run them. The Stripe trio is all you, Scott.

**Date:** 2026-04-27
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

**THINK** — 2/7

Four remaining blockers, plus the "External access" and "Invite email links" items under "What's broken" are now partially resolved since the URL is live.

**PLAN** — 3/7

Here's what's left:

| # | Blocker | Who | What it unblocks |
|---|---------|-----|-----------------|
| 2 | **Migration 006** — run `006_subscriptions.sql` in Supabase SQL editor | **I can do this** if you give me the go-ahead (I have the service key) | Billing/subscriptions data model |
| 3 | **Migration 007** — run `007_admin_features.sql` in Supabase SQL editor | **I can do this** | Admin Users toggle, webhook_logs table |
| 4 | **Fresh Stripe secret key** — current `sk_live_...` is expired | **Scott only** — Stripe Dashboard → API Keys → copy new key | Billing checkout, portal buttons, Admin Subscriptions/Invoices tabs |
| 5 | **Create Stripe Price** — add recurring monthly price under product `prod_UD7H1SBAJRzl67` | **Scott only** — Stripe Dashboard | Checkout flow needs a `STRIPE_PRICE_ID` |
| 6 | **Create Stripe Webhook** — endpoint `https://app.tourforce.ca/api/webhooks/stripe` | **Scott only** — Stripe Dashboard (now that URL is live) | Webhook logs, subscription lifecycle events |

**Summary:** Migrations 006+007 I can run right now. The three Stripe items need you in the Stripe dashboard.

**VERIFY** — 6/7

N/A — status check only.

**LEARN** — 7/7

No new learnings.

🗣️ Poseidon: Two of those four I can knock out myself — say the word on the migrations and I'll run them. The Stripe trio is all you, Scott.

</details>
