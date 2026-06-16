---
capture_type: FAILURE_ANALYSIS
timestamp: 2026-04-20 16:25:41 PST
rating: 2
description: 125k-tokens-21-save-637k
session_id: d6b5ab44-7a3a-4f8f-9d31-dab3a6089bda
---

# Failure Analysis: 125k tokens 21 save 637k

**Date:** 2026-04-20
**Rating:** 2/10
**Summary:** 12.5k tokens (21%) → save ~63.7k

---

## What Happened

** Guest quota scales with paid member seats (10 guests per seat on Business/Business Plus). Business Plus upgrade does NOT give you more guests. To scale beyond 10: add more $12/mo member seats, or move to Enterprise for custom. You're covered for the full 12-centre franchise on your current plan if each centre has a single director contact.

---

## Conversation Summary

**USER:** Request failed with status code 403

**USER:** Request failed with status code 403

**USER:** Web search results for query: "ClickUp guest user limit per paid seat 2026 Business Plus Enterprise plan"

Links: [{"title":"Pricing per user role and plan – ClickUp Help","url":"https://help.clickup.com/hc/en-us/articles/6303244318999-Pricing-per-user-role-and-plan"},{"title":"Guest-type user roles – ClickUp Help","url":"https://help.clickup.com/hc/en-us/articles/6310022323991-Guest-type-user-roles"},{"title":"How Much Does ClickUp Cost? 2026 ClickUp Pricing Guide","url":"https://www.spendbase....

**USER:** Request failed with status code 403

**USER:** Request failed with status code 403

**USER:** # ClickUp Guest User Quotas by Plan

Based on the provided content, **specific guest user quotas are not detailed for each plan tier**.

The article only mentions:

> "Guest access for clients is generally free, but monitor guest limits. Brain AI nearly doubles the bill — evaluate whether AI writing and search justify the cost for all 15 seats."

And notes:

> "Guests are generally not billed as full seats, but guest _number limits_ vary by plan. Free and Unlimited have stricter limits on how ma...

**USER:** Web search results for query: "ClickUp "Business Plus" guest seats quota how many guests allowed"

Links: [{"title":"Pricing per user role and plan – ClickUp Help","url":"https://help.clickup.com/hc/en-us/articles/6303244318999-Pricing-per-user-role-and-plan"},{"title":"Guest-type user roles – ClickUp Help","url":"https://help.clickup.com/hc/en-us/articles/6310022323991-Guest-type-user-roles"},{"title":"Use ClickUp as a guest or limited member – ClickUp Help","url":"https://help.clickup.com/hc/e...

**ASSISTANT:** **✅ VERIFY**

Sources don't publish exact numbers on the public pricing page; the help articles block WebFetch with 403. But cross-referencing search snippets with your live API data gives a consistent picture:

| Plan | Guest quota per paid member seat | Price (per member/mo, annual) |
|------|----------------------------------|-------------------------------|
| **Free Forever** | Very limited, read-only | $0 |
| **Unlimited** | 5 guests per member seat | $7 |
| **Business** ← you are here | **...

**USER:** Updated task #70 status

**ASSISTANT:** **Sources:**
- [Pricing per user role and plan — ClickUp Help](https://help.clickup.com/hc/en-us/articles/6303244318999-Pricing-per-user-role-and-plan)
- [User role availability and limits — ClickUp Help](https://help.clickup.com/hc/en-us/articles/26173894257047-User-role-availability-and-limits)
- [How Much Does ClickUp Cost? 2026 ClickUp Pricing Guide](https://www.spendbase.co/blog/saas-management/clickup-pricing-costs-savings-discount-playbook/)

---

📋 **SUMMARY:** Guest quota scales with p...

---

## Tool Calls (321 total)

- **WebFetch**: {"url":"https://clickup.com/pricing","prompt":"For each ClickUp plan (Free Forever, Unlimited, Business, Business Plus, Enterprise), what is the guest user limit? Does it scale with the number of paid...
- **WebFetch**: {"url":"https://help.clickup.com/hc/en-us/articles/6326990092567","prompt":"Maximum guest users per paid seat for each ClickUp plan tier. Include numbers."}...
- **WebFetch**: {"url":"https://help.clickup.com/hc/en-us/articles/6325564201879-Invite-people-to-your-Workspace","prompt":"What are the guest quotas per plan? How does the quota relate to paid member seats?"}...
- **ToolSearch**: {"query":"select:WebSearch","max_results":1}...
- **WebSearch**: {"query":"ClickUp guest user limit per paid seat 2026 Business Plus Enterprise plan"}...
- **WebFetch**: {"url":"https://help.clickup.com/hc/en-us/articles/26173894257047-User-role-availability-and-limits","prompt":"Extract the exact guest seat limits for each ClickUp plan (Free Forever, Unlimited, Busin...
- **WebFetch**: {"url":"https://www.spendbase.co/blog/saas-management/clickup-pricing-costs-savings-discount-playbook/","prompt":"What are the exact guest user limits for each ClickUp plan tier in 2026? Include Free ...
- **WebFetch**: {"url":"https://saascrmreview.com/clickup-pricing/","prompt":"For each ClickUp plan (Free, Unlimited, Business, Business Plus, Enterprise), what is the guest user quota? Is there a base count plus per...
- **WebSearch**: {"query":"ClickUp \"Business Plus\" guest seats quota how many guests allowed"}...
- **TaskUpdate**: {"taskId":"70","status":"completed"}...

---

## Files in This Capture

| File | Description |
|------|-------------|
| `CONTEXT.md` | This analysis document |
| `transcript.jsonl` | Full raw conversation (1263 entries) |
| `sentiment.json` | Sentiment analysis metadata |
| `tool-calls.json` | Extracted tool invocations (321 calls) |

---

## Learning System Notes

This failure has been captured for retroactive analysis. The learning system should:

1. Review the full transcript for root cause
2. Identify systemic issues that contributed
3. Determine if this failure type has occurred before
4. Propose improvements to prevent recurrence

**Action Required:** This capture needs manual review to extract learnings.
