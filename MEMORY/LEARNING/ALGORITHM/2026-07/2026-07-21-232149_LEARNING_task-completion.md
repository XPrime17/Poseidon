---
capture_type: LEARNING
timestamp: 2026-07-21 23:21:49 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-07-21
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

**🧠 THINK (resolved)** — Ruled out the usual red herrings: the caller ID number is voice-capable and owned (`voice=True`), and Canada/US dialing works fleet-wide (the AI dials Canadian leads daily), so it's **not** geo or caller ID. Combined with *registration succeeds but the INVITE creates no call record*, this is the classic Bria↔Twilio signature: **Bria authenticates the REGISTER fine, but answers the call's proxy-auth challenge with a blank/incorrect auth name** — because we left "requires authorization username" OFF. Twilio 407-loops the INVITE and rejects it at the edge (no call logged, hence the busy tone).

**📋 PLAN** — Give Bria an explicit authorization username so it authenticates the *call* leg, not just registration. I've also set a status callback on the domain so if anything still fails, the next attempt captures the exact SIP code.

**🔧 BUILD / ⚡ EXECUTE — change in Bria, then retry:**

In the same account/service settings:

| Field | Set to |
|---|---|
| **This voice service requires an authorization username for each voice account** | **ON** ✅ |
| **Authorization Name / Auth username** (field that now appears on the account) | `scott-eg` |

Leave the rest as-is (UDP / 5060 / SRTP off, Username `scott-eg`, password unchanged). Save → let it re-register → place the test call again (dial your mobile as `1` + area code + number, or `+1…`).

**✅ VERIFY** — On the retry, expect the call to connect showing **+1 289-803-8797** + Hiya brand. This time it'll also appear in Twilio → EG sub-account → **Monitor → Logs → Calls**. If it *still* busies out, tell me immediately — the status callback I just enabled means I can now read the exact SIP failure code and pinpoint it rather than infer.

**🧠 LEARN** — The pattern worth remembering: on Twilio SIP Domains, **registration auth and call (INVITE) auth are separate challenges**. A softphone can register yet fail every call if it doesn't send the auth username on the INVITE. I'll commit this to memory once your retry confirms it's the fix.

🗣️ **PAI:** Registration's working now — the calls are failing an auth challenge because Bria isn't sending an authorization username on the INVITE. Turn on "requires authorization username," set it to `scott-eg`, re-register, and retry. I've wired a status callback so if it still balks, I can read the exact SIP error instead of guessing.

</details>
