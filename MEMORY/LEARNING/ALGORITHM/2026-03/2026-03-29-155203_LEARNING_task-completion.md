---
capture_type: LEARNING
timestamp: 2026-03-29 15:52:03 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-03-29
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

**Here's what I fixed:**

| Issue | Before | After |
|-------|--------|-------|
| Customer name | "a b" | "Code Ninjas East Gwillimbury" |
| Customer address | null | 17215 Leslie St, Newmarket ON L3Y 0A3 |
| Invoice auto-tax status | `requires_location_inputs` (BLOCKED) | `complete` |

**Root cause:** Auto-tax was enabled but the customer had no address, so Stripe couldn't calculate tax and blocked all processing.

**Try now:** Go back to Chat-Dash's client portal and try adding a payment method. The tax blocker is cleared.

If Chat-Dash's portal still doesn't work, the backup is the **payment link** Stripe created:
`https://buy.stripe.com/aFabIV4AE0F99LI37v9AA00` — this is a live Stripe checkout page where the client can enter their card directly.

━━━ 📚 LEARN ━━━ 7/7

Stripe Tax with `automatic_tax: enabled` requires BOTH a tax registration AND a customer address. Creating invoices/subscriptions before the customer has an address will permanently block processing until the invoice is manually refreshed. For TourForce onboarding, always collect client billing address before creating subscriptions.

🗣️ PAI: Scott, found and fixed it. The auto-tax was blocking everything because the customer had no billing address — Stripe couldn't calculate tax. I updated the customer with EG's address and refreshed the invoice. Tax status is now "complete." Try the client portal again. If Chat-Dash still gives trouble, the live payment link works as a backup.

</details>
