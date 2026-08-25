---
capture_type: LEARNING
timestamp: 2026-07-19 17:46:36 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-07-19
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

🤖 **PAI ALGORITHM** ═════════════

**👁️ OBSERVE** — "What issues were discovered?" I verified the two suspect bookings against actual transcripts rather than trusting the summaries.

**🧠 THINK** — This is exactly what Cekura is *for* — and it caught a real one on **Leaside**. Confirmed from transcripts:

**✅ VERIFY / ISSUES DISCOVERED (last 7 days)**

**🔴 1. Leaside outbound — stale + raw-format tour slots (CONFIRMED, `call_488adefc…`)**
The agent *proactively* offered:
> "- **2026-03-08** at two pm / - **2026-03-08** at three pm / - **2026-03-15** at two pm"

Two defects in one:
- **Wrong dates** — March 2026, ~4 months in the *past* (today is 07-19). The slot source fed Leaside stale/past dates.
- **Raw ISO spoken aloud** — "2026-03-08 at two pm" instead of "Saturday, March eighth." That's the Format-Slots read-exactly rendering regressing.
- **Not fleet-wide:** Riverside on the *same day, same persona* rendered correctly → "Saturday, July eighteenth at ten am," future dates. So this is **Leaside-specific**, and it *would* hit a real lead. Directly reopens the open item in [[slot-weekday-hallucination-fix-2026-06-30]] ("confirm next real call renders right").

**🟠 2. Pickering outbound — booked a past date (`call_a48dee73…`)**
Here the *persona* asked for "Saturday March 7"; the agent replied "Yes, I have two times available… ten and eleven am" and booked it. Rendering was clean, but it **confirmed availability for a date 4 months in the past** — the slot/availability check isn't rejecting past dates. Lower confidence (persona-driven), but worth a look.

**🟡 3. StCath inbound — silent-hangup cluster.** ~8 of ~15 real calls ended in 0–7s ("very brief, disconnected after greeting" / "unintelligible"). Probably misdials/spam, but worth confirming the greeting isn't cutting callers off (latency).

**ℹ️ 4. Spam robocall** (Hyatt, `+13058452572`) hit 4 inbound lines 07-17 → correctly classified `spam`, no mishandling. No action.

**Non-issue to rule out:** the `{{LOCATION_NAME}}` you'd see spoken literally on outbound is the **Cekura harness not injecting dynamic vars** (known blind harness), *not* a production defect — in real n8n calls that var renders.

**⚡ PLAN — verification checklist**

- [ ] Check Leaside `get_tour_slots` source — why it returns March/past dates (calendar vs scrape)
- [ ] Confirm Leaside outbound is on the fixed **Format Slots** build (raw ISO leak = it isn't)
- [ ] Add a past-date guard so no agent confirms a slot before `today` (fixes Pickering too)
- [ ] Spot-check StCath inbound greeting latency on the 0–7s drops

**🧠 LEARN** — The Leaside finding is worth persisting once root-caused (slot source vs formatter). I'll write it after we confirm which, so the memory names the actual fix, not the symptom.

🗣️ **Poseidon:** The real find, Scott: **Leaside outbound offered March slots — past dates, spoken as raw "2026-03-08"** — while Riverside was clean on the identical test. Pickering also booked a past date. Both point at the slot source / Format-Slots build on those two centres. Want me to dig into Leaside's `get_tour_slots` and pin down whether it's the calendar data or the formatter?

</details>
