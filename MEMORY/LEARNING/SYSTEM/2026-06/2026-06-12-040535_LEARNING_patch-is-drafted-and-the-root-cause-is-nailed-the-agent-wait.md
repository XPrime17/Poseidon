---
capture_type: LEARNING
timestamp: 2026-06-12 04:05:35 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Patch is drafted and the root cause is nailed — the agent waits too long to hand off, so a quiet caller just vanishes. Say the word and I'll verify the EOC workflow and ship it.

**Date:** 2026-06-12
**Auto-captured:** Yes

---

## Summary

Drafted a 2-edit EG-Inbound prompt patch (capture name + `staff_followup` on camp intent up front; cap spoken lists at 3 and offer email; don't drop an identified lead to silence). Pinpointed the real bug — staff routing waits for "no more questions," so an inactivity drop loses the lead. Not deployed; flagged the EOC-workflow check as a prerequisite.

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

🤖 PAI ALGORITHM (v0.2.23) ═════
   Task: Draft EG-Inbound camp handoff patch

I read the live EG-Inbound prompt (`llm_6d77f36696f6fbfad97d03fa5ef8`, modified 06-10). The root cause is precise: **Non-Create Q&A mode only routes to staff at step 6 — when the caller says "no more questions."** If the caller goes silent first (as Angelie's caller did), the call ends on `inactivity` via the generic "bad connection" close, capturing **no name and no staff task**. Plus nothing tells the agent to *not* read 10 weeks of camps aloud.

Here's the draft patch — **two targeted edits, not yet deployed**:

---

**EDIT 1 — Capture early + offer email for long lists.** In `## Non-Create Program Interest (Q&A MODE)`, insert as new step 1 (renumber rest):

> **1. Grab the name + flag staff up front (CRITICAL).** As soon as you identify a camp/enrollment intent, get the caller's name naturally ("Happy to help! Can I grab your name first?") and set `staff_followup_needed=true`, `staff_followup_reason='camp_enrollment'` with a one-line `staff_followup_summary`. Do this BEFORE the Q&A so the lead is captured even if the call drops.
>
> **Long-list rule:** Never read more than 3 camps/weeks aloud. If the caller asks for a "full list" or the whole summer schedule, give a 1-sentence highlight ("We run 10 themed weeks from late June through early September, ages 5 and up") then: "It's a lot to cover by phone, so I'll have our team send you the full week-by-week list. What's the best email?" Capture email, keep `staff_followup_needed=true`. Do NOT recite all weeks.

**EDIT 2 — Don't lose an active lead to silence.** In `## Handling Silence/Technical Issues`, append:

> - **If silence happens mid-lead** (you'd already identified a program/camp/tour intent): before the bad-connection close, if you have `staff_followup_needed=true` set, you're covered — end warmly. If you do NOT yet have their name, the close still ends the call, but ensure the intent + caller number are noted so the team can follow up.

---

⚠️ One follow-up I couldn't verify from here: confirm the **inbound EOC workflow** (`3oV7SpPKWmr3xJlQ`) creates a centre task for `call_type=new_lead` with no booking — if it only fires on `staff_followup_needed`, Edit 1 is what makes it land. I'd check that before deploying.

📋 SUMMARY: Drafted a 2-edit EG-Inbound prompt patch (capture name + `staff_followup` on camp intent up front; cap spoken lists at 3 and offer email; don't drop an identified lead to silence). Pinpointed the real bug — staff routing waits for "no more questions," so an inactivity drop loses the lead. Not deployed; flagged the EOC-workflow check as a prerequisite.

🗣️ Poseidon: Patch is drafted and the root cause is nailed — the agent waits too long to hand off, so a quiet caller just vanishes. Say the word and I'll verify the EOC workflow and ship it.

</details>
