---
capture_type: LEARNING
timestamp: 2026-03-07 17:08:30 UTC
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

**Root cause:** The `onboard-centre.ts` script hardcoded `SIP_AUTH_USER = "xprime"` for ALL centres. When a sub-account creates a SIP credential with username `xprime`, it conflicts with the main account's `xprime` credential, causing Twilio to reject SIP auth with `telephony_provider_permission_denied`.

**Fix applied:**
1. Deleted conflicting `xprime` credential on Sudbury sub-account, created `sudbury` credential
2. Deleted and re-imported Retell phone with `auth_username: "sudbury"`
3. Fixed `onboard-centre.ts` to derive SIP username from `slugName` (centre name) instead of hardcoded `xprime`

**Prevention:** Future centres onboarded via the script will automatically get unique SIP credential usernames.

🗣️ **PAI:** Fixed, Scott. The Sudbury SIP credential was using `xprime` — same conflict we've hit before. Changed it to `sudbury`, re-imported the Retell phone, and fixed the onboarding script so this won't happen again. You should be able to test call now.

</details>
