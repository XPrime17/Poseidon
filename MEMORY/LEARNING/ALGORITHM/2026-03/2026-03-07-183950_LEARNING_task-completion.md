---
capture_type: LEARNING
timestamp: 2026-03-07 18:39:50 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-03-07
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

Here's the full latency breakdown, Scott.

---

## Latency Analysis — Recent Calls

### Summary Stats

| Call | Agent | Duration | Avg Latency | Max Latency | Turns > 3s | Turns > 5s |
|------|-------|----------|-------------|-------------|------------|------------|
| Sudbury (18:10 UTC) | Sudbury | 4m 26s | **~4.3s** | **6.8s** | 15/18 | 4/18 |
| Sudbury (17:48 UTC) | Sudbury | 1m 05s | **~5.2s** | **6.7s** | 4/4 | 2/4 |
| Sudbury (17:25 UTC) | Sudbury | 1m 57s | **~4.2s** | **7.1s** | 5/7 | 1/7 |
| Canton (00:33 UTC) | Canton | 18m 09s | **3.1s** | **5.5s** | 22/51 | 4/51 |

### Worst Moments (> 5s)

| Call | Delay | What User Said | What Agent Said |
|------|-------|----------------|-----------------|
| Sudbury 17:25 | **7.1s** | "Where are you located?" | Address from KB |
| Sudbury 18:10 | **6.8s** | "Sammy" (after age question) | "Oh, perfect age! And what's their name?" |
| Sudbury 17:48 | **6.7s** | "What are your prices?" | Pricing deferral response |
| Sudbury 18:10 | **6.2s** | Requested different times | Generated new time options |
| Canton | **5.5s** | Declined all times | "I can have a team member call you" |
| Sudbury 18:10 | **5.2s** | "Yeah" (initial greeting) | Intro spiel |
| Sudbury 18:10 | **5.0s** | Caught agent as AI | Goodbye |

### Root Cause

**The bottleneck is LLM inference (GPT-4.1).** The call cost breakdown confirms `gpt_4_1` is the LLM product. Every single response requires a full LLM round-trip before TTS can even start.

- **Baseline latency: 2-3s** — even for simple responses ("Great! What's their name?")
- **Complex/KB responses: 5-7s** — address lookups, schedule generation, pricing
- **TTS (ElevenLabs) is not the issue** — it's fast once text is generated
- **Context growth matters** — later in long calls, latency trends slightly higher as context grows

### What Can Be Done

1. **Retell's `responsiveness` setting** — if not already tuned, increasing it trades off some accuracy for faster first-token
2. **Shorter prompt** — the 27K char prompt means more tokens processed per turn
3. **Consider GPT-4o-mini** for simpler turns — Retell may support model routing
4. **Pre-canned responses** for common questions (hours, address) could skip LLM entirely via Retell's state machine

The 3-5s average isn't terrible for voice AI (industry standard is 2-4s), but those 6-7s spikes are noticeable pauses that hurt the conversational feel.

🗣️ **Poseidon:** Average response time is 3-5 seconds across recent Sudbury and Canton calls, with worst spikes hitting 7 seconds — mainly on KB lookups and schedule generation. The bottleneck is GPT-4.1 inference time, not TTS or network. The prompt is 27K chars which adds to it.

</details>
