---
name: Retell disconnection_reason semantics
description: What each Retell disconnection_reason actually means — user_declined is NOT a conversational decline
type: feedback
originSessionId: edef68f2-e6fa-4699-815f-d8b6cca2ebbb
---
# Retell disconnection_reason — what they actually mean

Do NOT treat `user_declined` as "the lead declined the offer" or "lead hung up." It means the **call never connected** (phone rejected at telco layer: user pressed decline, DND, spam block). Duration is 0s, `call_status = not_connected`, transcript is empty.

**Why:** 2026-04-17, while investigating Phuong Vuong's Canton complaint, both "user_declined" calls had 0s duration and empty transcripts. Scott corrected the misread immediately. Treating user_declined as a conversational outcome leads to wrong conclusions about lead intent.

**How to apply:**
- `user_declined` → phone rejected the call (no conversation). Treat like `dial_no_answer` for UX purposes.
- `user_hangup` → lead hung up during/after conversation (real interaction happened).
- `agent_hangup` → agent ended the call (check `decline_reason` post-call field).
- `voicemail_reached` → hit voicemail.
- `dial_no_answer` → rang out, no pickup.
- The exhausted email's `formatOutcome()` map in End Of Call workflow labels `user_hangup` as "Lead hung up" — but `user_declined` doesn't have a mapping and shows raw. Consider: "Call rejected (no answer)" for user_declined.

**Implication for decision-making:** When reviewing whether a lead was "contacted," only count calls with `duration > 0` AND a real `disconnection_reason` (`user_hangup`, `agent_hangup`, `voicemail_reached`, `voicemail_left`). Zero-duration `user_declined` calls are indistinguishable from `dial_no_answer` for lead-intent purposes.
