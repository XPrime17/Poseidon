---
capture_type: LEARNING
timestamp: 2026-03-29 16:56:56 UTC
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

🤖 PAI ALGORITHM (v0.2.24) ═════════════
   Task: Clarify auto-tax checkbox location

📋 **SUMMARY:**
When you create a subscription in Chat-Dash (Stripe Billing → Create Subscription), there should be a checkbox that says **"Collect tax automatically"** at the bottom of the form, near the billing start date. This was the root cause of the earlier "processing error" — it enables Stripe Tax which requires the customer to have a billing address.

Since you already fixed the customer's address, it should work with tax enabled now. But if you hit trouble again, uncheck it to bypass the issue.

🗣️ PAI: Scott, it's on the Create Subscription page in Chat-Dash — a checkbox near the bottom that says "Collect tax automatically." Should work fine now since I already added EG's address to the customer. But if it gives you grief again, just uncheck it.

</details>
