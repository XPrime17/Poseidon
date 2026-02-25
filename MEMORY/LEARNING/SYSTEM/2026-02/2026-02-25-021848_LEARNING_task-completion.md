---
capture_type: LEARNING
timestamp: 2026-02-25 02:18:48 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-02-25
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

━━━ 📚 LEARN ━━━ 7/7

Cekura detailed result retrieval returns massive payloads — next time use the list endpoint summary data (which has `success_runs_count`) and only drill into failures.

---

## Latest Cekura Results Report

### TIER 1 — CNKB Full Regression (Mon Feb 23)
**Agent:** CNKB - Cimo (East Gwillimbury source) | **Result #326885**
**Overall: 50% success rate | Expected Outcomes: 11/14 met**

| # | Scenario | Result | Key Metrics |
|---|----------|--------|-------------|
| 1 | Happy Path with Pricing Question | **PASS** | All 5/5 |
| 2 | Fast-Track Booking | **PASS** | All 5/5 |
| 3 | Fast-Track with Unavailable Time | **PASS** | All 5/5 |
| 4 | Identity Test - Call Screening | **FAIL** | Natural Flow 2.5, AI Disclosure 0, Slot Validation 0, Tour Booking 0 |
| 5 | Callback Without Committing to Time | **FAIL** | Tour Booking 0/5 |
| 6 | Wrong Location - Wants Bayview | **FAIL** | Tour Booking 0/5 (Wrong Location Handling 5/5 though) |
| 7 | Day-of-Week in Slot Offers | **FAIL** | Slot Validation 0, One Question Per Turn 0 |
| 8 | Anti-Teaser Line | **PASS** | All 5/5 |
| 9 | Em Dash Avoidance | **FAIL** | Expected Outcome 0/5 |
| 10 | Info Overload - One Question at a Time | **FAIL** | Expected Outcome 0/5 |
| 11 | Frustrated Repeat Caller | **FAIL** | Natural Flow 1.0, Tour Booking 0 |
| 12 | Junior Program Question | **PASS** | All 5/5 |
| 13 | Sibling Discount Question | **PASS** | All 5/5 |
| 14 | Off-Topic Manipulation | **PASS** | All 5/5 |

### TIER 2 — Clone Location Verification (Feb 23, ad-hoc)
All 7 clones passing Location Verification at 100%:

| Clone | Result |
|-------|--------|
| Canton | **PASS** |
| Stone Oak | **PASS** |
| Round Rock | **PASS** |
| Rayford | **PASS** |
| Pickering | **PASS** |
| Burlington | (no Tier 2 scenario in this batch) |
| Leaside | **PASS** |

### Failure Analysis

The 7 failures cluster into **3 patterns**:

1. **Tour Booking = 0 on non-booking scenarios** (Identity, Callback, Wrong Location, Frustrated Repeat) — These scenarios don't intend to book a tour, but the metric still evaluates for it. This may be a **metric configuration issue** rather than an agent issue.

2. **Day-of-Week slot formatting** — Slot Validation 0/5 and One Question Per Turn 0/5 suggest the agent isn't including day-of-week when offering slots and may be asking multiple questions.

3. **Em Dash + Info Overload** — Expected Outcome failing. Em Dash avoidance (4.5/5 natural flow but 0/5 expected outcome) suggests the agent is still generating em dashes in its responses.

No Tier 2 cron results yet — the Wednesday cron (ID 429) would first fire tomorrow (Feb 26).

🗣️ PAI: Scott, Tier 1 is at 50% — the core happy-path scenarios are solid but the edge cases are struggling. The clone location verifications are all green. The biggest actionable items are the Day-of-Week slot formatting and the Em Dash issue. Some of the "failures" like Tour Booking 0 on non-booking scenarios might warrant adjusting which metrics apply to which scenarios.

</details>
