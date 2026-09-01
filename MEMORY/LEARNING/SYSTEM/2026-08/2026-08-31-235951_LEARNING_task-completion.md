---
capture_type: LEARNING
timestamp: 2026-08-31 23:59:51 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-08-31
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

**VERIFY/LEARN — Base ×3 cutover is fully executed.** Here's the report:

## What I changed (all live now)

1. **Outbound is off** for all 3 centres — `enabled=FALSE` in Centre Lookup (rows 11–13). I verified first that `enabled` only gates outbound ingestion; her inbound service (the part she's paying for) is untouched.
2. **7 queued leads closed** — the retry scheduler doesn't check `enabled`, and 7 rows were mid-cadence with the **first redial set for tomorrow 6:30 PM ET**. All set to `cancelled_base_tier`, just in time. Six are real families — **this is Shauna's team's first personal-follow-up list** (paste-ready for your WhatsApp thread):

| Centre | Lead | Phone |
|---|---|---|
| Kanata | Tiffany Gervais | 613-878-3189 |
| Kanata | Katrina Brant | 613-612-5967 |
| Kanata | Jill Jeffery | 613-255-2457 |
| St. Catharines | Elena Renda | 905-321-4171 |
| St. Catharines | Colton Mein | 289-407-1344 |
| St. Catharines | Michelle Burgio | 905-329-8501 |

3. **Inbound booking disabled, request-capture installed** — exactly what you told Shauna: the 3 inbound agents no longer have the slot tool at all (can't read times even by accident), and the booking stages are rewritten to collect name, number, child's age, and a general timing preference, then promise a staff callback within one business day. Verified clean on all three; full pre-change backups in `/root/cnkb-base-tier-cutover-2026-08-31/` — restoring booking at her HubSpot rollover is a one-script revert.
4. **Cekura smoke tests paused** for Burlington + Kanata (their happy-path scenarios expect a booking and would have false-failed **this Wednesday**). St. Catharines had no per-centre cron.

## One action for you + two watch items

- **Remove the 3 slugs** (`st-catharines-on-ca`, `burlington-on-ca`, `kanata-on-ca`) **from the Zap filter** — leads are safely dropped either way, but each one now fires a "Not Enabled" alert email at you until the slugs come out.
- **Billing:** the Sharmila lesson — confirm Shauna's card lands same-day, and her per-centre-cards answer is still pending in your thread.
- Filed for later: her HubSpot rollover is the natural **booking re-enable + Pro upsell** moment, with the trial data (438 calls, 11 booked tours) saved for that conversation.

🗣️ **Poseidon:** Shauna's wish is production reality, Scott — outbound silenced with seven queued dials caught a day before firing, and her receptionists now take tour requests instead of booking them. Six warm families are waiting on her team's personal touch; the list is ready to paste.

</details>
