---
name: booking-verification-workflow
description: "Standalone Gmail-triggered Booking Verification n8n workflow — architecture, the blank-Retell false-alarm class, and the 2026-06-01 fix"
metadata: 
  node_type: memory
  type: project
  originSessionId: e4c79ee2-fe97-486a-b8a9-00361c91e640
---

`Booking Verification` is a **standalone ACTIVE n8n cloud workflow** (`dUEa8NI0z8vq2LSL`) — NOT part of any EOC export, so it was a blind spot. It is the source of the **"Booking Verification Failed!!"** emails.

**Flow:** Gmail trigger (filter `subject:Tour Notification New Task/Tour`, fires on CRM/ChildcareCRM tour-notification emails for ANY booking — AI or human/web/walk-in) → Information Extractor (LLM pulls firstName/lastName/phone/tourDate MM/DD/YYYY/tourTime/email) → Get row(s) in sheet (Leads MasterSheet `1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`, gid=0 "All Centres", lookup `lead_id = firstName-phoneDigits`) → Row Found1/Row Found → **Code in JavaScript** (compares sheet's `Date`/`Last`/`Time` = "Retell" vs email's = "CRM") → If1(all_conditions_pass) → Success / Failure.

**The false-alarm class (root cause, 2026-06-01):** When the voice AI never reached a lead (all voicemails → `Date` cell blank) but the lead **booked through another channel**, the CRM still emits a Tour Notification. The old code ran `normalizeDate('')` → null → emitted `"Could not parse date - Retell: , CRM: <date>"` as a FAILURE. This is actually a **win** (lead converted without the AI), not a failure. Debora Gomes / EG / 06/13/2026 10am was the trigger case (row 374).

**Fix shipped 2026-06-01** (`/root/deploy-booking-verif-fix.py`, also `booking-verification-FIXED.json`): Code now classifies `verdict` = external_booking / parse_error / mismatch / pass. New nodes `External Booking?` (IF) → `FYI: External Booking` (calm Gmail, no alarm) + `Halt Retries (External)` (sheet write). Genuine date/name/time mismatches still hit the `Failure` alarm. **Both the pass path AND external-booking path now set `status=completed`** to halt the Retry Scheduler (`rt0aEuDnFv3ZCl1y` Filter Eligible only acts on `status==='retry_pending'`) — fixes the secondary bug where already-booked parents kept getting dialed. Creds: Gmail `x1W7EpNhmEdx8cOR`, Sheets `yjVHcEWrpyDmxkvv`.

Sheet-write-from-this-box pattern: temp webhook workflow → httpRequest node with `nodeCredentialType: googleSheetsOAuth2Api` hitting `sheets.googleapis.com/v4/.../values:batchUpdate` (see [[centre-launch-two-surfaces]] MasterSheet layout). Range without a tab name defaults to gid=0.
