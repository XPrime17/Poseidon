---
capture_type: LEARNING
timestamp: 2026-05-08 17:37:59 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-05-08
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

## ✅ EXECUTE

**You're right — and the blast radius is wider than I made clear.**

### The bug isn't retry-specific

The dead branch lives in the End Of Call workflow's `Switch1`, downstream of Skyvern. Every booked call funnels through there regardless of how it originated:

- Initial outbound dials (Outbound Call Flow)
- Retry dials (Retry Scheduler) ← Sandra's path, but incidental
- Inbound calls hitting the shared EOC workflow

Sandra's call happened to be a retry because her lead came in at 1:40 AM, but a first-attempt outbound call that booked a tour and then hit a Skyvern disagreement would have been dropped exactly the same way.

### And it's worse — the same bug class lives in the EG-Inbound workflow too

EG-Inbound has its own End Of Call workflow (`3oV7SpPKWmr3xJlQ`) with its own Switch node called `Booking Result`. That one only has **two rules** defined: `completed` and `failed`. No rule and no fallback for `terminated` or `timed_out`. So Skyvern aborts on inbound EG calls also got silently dropped.

### Two more lost bookings I just found in the audit

While checking blast radius across the past 250 executions of each EOC workflow, I found:

| # | Centre | Lead | Phone | Tour date/time | Workflow | Skyvern reason |
|---|---|---|---|---|---|---|
| 1 | Pickering | **Sandra Truong** | (647) 274-3199 | **Wed May 6, 6 PM** | Main EOC (4p1V0…) | Only 5 PM open on May 6 |
| 2 | Pickering | **Viji Ruban** | (647) 989-7284 | **Thu May 7, 6 PM** ⚠️ *yesterday* | Main EOC (4p1V0…) | Only 5 PM open on May 7 |
| 3 | EG (inbound) | (call from May 1) | — | May 18, 11 AM | EG Inbound EOC (3oV7…) | Only 6 PM open on May 18 |

Pattern: same centre, same kind of disagreement (calendar shows X PM only when the AI promised Y PM), all silently dropped. **Viji's tour was scheduled for yesterday at 6 PM — she was likely a no-show from Sharmila's perspective.**

### What this means for ops

- **Sharmila has at least two lost bookings to recover, not one.** Add Viji to the call-back list.
- **EG-Inbound (Maddy/Caroline at East Gwillimbury) also needs the same fix shipped.** Their `Booking Result` switch is structurally the same dead-branch — `terminated`/`timed_out` outcomes drop silently.
- **Future hardening should be EOC-level, not retry-level.** The signal that needs forwarding is "Skyvern aborted post-booking" wherever that originates.

### Updated Sharmila summary additions

Two more recovery items to add to my earlier draft:

> **Second lost booking — Viji Ruban**: `(647) 989-7284` / `Ashwin2019@myyahoo.com` — son's tour was booked by the AI for **Thursday May 7 at 6 PM** (yesterday). Same auto-booker mismatch — calendar said only 5 PM was open. Likely a no-show. Please reach out to Viji to apologise and reschedule.
>
> **Why two from the same week:** the bug we fixed today silently dropped any AI-booking the auto-booker couldn't confirm. Two Pickering bookings hit it within a week. Going forward you'll get the manual-booking-needed email immediately when this happens.

### Should I ship Fix 1 to EG-Inbound's workflow too?

The same edit (add a `Send Manual Booking Needed` node, add `terminated`/`timed_out` rules + wiring) would close the EG-Inbound exposure. Worth doing now while context is loaded. Awaiting your sign-off.

## ✓ VERIFY

- ✅ Main EOC's Switch1 fix (Pickering/Leaside/all centres outbound + retry) shipped earlier today
- ✅ EG-Inbound's `Booking Result` Switch confirmed structurally identical bug — only 2 rules, no fallback, `terminated` drops silently
- ✅ Audit of past 250 execs in each workflow surfaced 3 lost bookings total — 2 Pickering (Sandra + Viji), 1 EG inbound
- ✅ Sandra and Viji are both Pickering customers Sharmila needs to reach today
- ✅ Bug class confirmed centre-agnostic, direction-agnostic, attempt-agnostic

## 🧠 LEARN

Saving the wider scope so I don't under-frame this next time.

</details>
