---
name: email-columns-roles
description: "Centre Lookup centre_email = runtime notification send-to (all AI emails); director_personal_email = ClickUp guest identity only, not a mail target"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

Two email columns in Centre Lookup, distinct roles (verified by scanning all 23 active workflows 2026-07-24):

**`centre_email` (col J)** = the `sendTo` for essentially EVERY staff-facing AI notification, inbound + outbound (all fall back to `scott.james@codeninjas.com` if blank):
- Inbound EOC `3oV7SpPKWmr3xJlQ`: Urgent Call, Message for Staff, Booking Needs Manual.
- Outbound EOC/Retry `4p1V0wESn3kZySt6`: Staff Follow-Up, Tentative Tour Alert, Manual Booking Needed, Wrong-Location Handoff, No Booking Requested, Outcome Unsuccessful, Lead Exhausted.
- Outbound Call Flow `6sPwo7ngPyTWfmwM`: Sanitization Failed, Off-Hours, Call Failed (also CCs Scott).
This is the ONLY address the director actually receives notifications at — currently the `@codeninjas.com` centre inbox for our centres.

**`director_personal_email` (col M)** = ClickUp guest identity ONLY. **Zero runtime consumers** — the only workflow hits are onboarding/E2E sheet-*writes*. Its purpose: the non-codeninjas email we invite as a ClickUp guest so the director can see/own tasks; that guest's user id is stored separately in `clickup_user_ids` (the actual task assignee). It is never used to send email.

**`Director` (col K)** = display-only, outbound-only. Consumed just to print the director's NAME into text: the Staff Follow-Up ClickUp task description (`**Director:** …`), outbound email templates (`Format Email Data`), and the outbound "Not Enabled" admin alert body. No routing/assignment/logic depends on it; inbound EOC never references it. A blank/wrong value only yields "Director: unknown" in copy.

**Gap to note:** notifications go only to the centre `@codeninjas.com` inbox, never the director's personal address — a director who doesn't watch that mailbox can miss AI alerts. Blank `director_personal_email` (e.g. Kanata, EG) doesn't break assignment — `clickup_user_ids` can reuse a known guest id (Shauna = 87436757). Related: [[inbound-eoc-notification-gaps-2026-07-24]], [[feedback-clickup-assignee-per-centre]], [[feedback-onboarding-email-two-asks]].
