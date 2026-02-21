---
capture_type: LEARNING
timestamp: 2026-02-20 01:17:25 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: This session we've been working on **centre-level call recording access** for Code Ninjas franchises. Here's where things stand:

**Date:** 2026-02-20
**Auto-captured:** Yes

---

## Summary

This session we've been working on **centre-level call recording access** for Code Ninjas franchises. Here's where things stand:

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
   Task: Summarize current session status

📋 SUMMARY:

This session we've been working on **centre-level call recording access** for Code Ninjas franchises. Here's where things stand:

**Done:**
- Created [issue #25](https://github.com/XPrime17/lead-reactivation/issues/25) — Centre-Level Call Recording Access feature request
- Generated architecture diagram (saved to `docs/diagrams/`)
- Researched Retell recording retention — no published purge schedule, recordings should be cached at webhook time
- Evaluated **ChatDash** as the dashboard solution — covers ~80% of needs, ~$59-119/mo after Retell partner discount
- Decided build vs buy: **buy ChatDash**, don't build custom
- Brainstormed per-centre call scoping — landed on separate Retell phone numbers per centre

**Key pivot discovered just now:**
- ChatDash enforces **one agent per client** (changed Sept 2025)
- Our original plan (one shared CNKB agent, filter by `to_number`) won't work in ChatDash
- **Revised architecture:** Clone the CNKB Retell agent per centre, each with its own phone number, each connected to its own ChatDash client
- Prompt sync across cloned agents handled via a simple Retell API script

**Not yet done:**
- Issue #25 comment still reflects the old architecture (shared agent + `to_number` filtering) — needs updating
- No implementation started yet

🗣️ **PAI:** We're mid-planning on the ChatDash integration, Scott. The big finding is we need one Retell agent per centre instead of one shared agent. Issue #25 needs its comment updated to reflect that. Want me to update it, or are you thinking about something else?

</details>
