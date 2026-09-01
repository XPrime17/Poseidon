---
name: kanata-first-booking-elena-dateswitch-2026-08-30
description: "Kanata's first outbound tour booking (Elena/Ivan, Sept 12 10AM) verified end-to-end — but caller asked for Sept 5 10AM; agent silently switched dates; possible duplicate Sept 5 \"free demo\" impression"
metadata: 
  node_type: memory
  type: project
  originSessionId: 84d6f59c-d934-494e-8775-cec8606a97fc
---

**Kanata outbound's first real booking, 2026-08-30 23:07 UTC** (call_72e3ba0d9a2b3ea6540680e802c, lead Elena +1-613-291-8797, son Ivan age 9, Create program). Verified end-to-end: EOC exec 31157 → Skyvern run `wr_568860820660131500` **completed** (no failure; also closes [[skyvern-false-failure-fix-2026-06-27]]'s OPEN "confirm next real booking returns completed") → sheet row 533 → Completed email sent (Gmail 1a054f92c93d329d).

**FOLLOW-UP NEEDED (flagged to Scott 8/30):** the booked slot may not match the caller's intent:
1. Agent penciled **Sat Sept 5, 9 AM**; Elena asked "possible to switch to ten AM?" — Sept 5 has NO 10 AM slot, so the agent offered **Sat Sept 12, 10 AM** (a real injected slot — audit's HALLUCINATION flag is mislabeled) and she agreed. But she's an ESL speaker and may still expect **Sept 5**. Dates were spoken ISO-style ("Saturday 2026-09-12").
2. Day before (8/29 17:37 UTC), Elena called **Kanata-Inbound** asking the status of "a free demo booking for Ivan on Saturday, September 5th" — she had a pre-existing Sept 5 impression from some other channel (website/HubSpot?); inbound agent promised staff follow-up. Risk: family shows up Sept 5, or two bookings exist in LineLeader.
→ Staff should confirm the date with Elena and reconcile any Sept 5 demo record.

Also noted same window: Kanata lead +1-613-612-5967 complained about "receiving multiple calls" on attempt 2 (retry cadence working as designed, but an annoyed-lead signal).
