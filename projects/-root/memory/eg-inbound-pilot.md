---
name: EG Inbound Pilot
description: East Gwillimbury inbound voice AI pilot — full architecture, forwarding fix, slot caching, post-call workflow
type: project
originSessionId: 242ca7bf-6798-48ba-9c6d-f6afcc42ba90
---
## EG Inbound Pilot — LIVE as of 2026-04-16

### Architecture (proven end-to-end)

```
Caller → EG Centre Landline (Bell) → *92 no-answer forward
  → +1 289-803-8797 (Newmarket 289, Twilio subaccount ACf4e...)
  → Twilio trunk eg-inbound-905.pstn.twilio.com
  → Retell SIP origination → CNKB-EG-Inbound agent (Cimo)
```

### Key Numbers
- **Bell forwarding destination:** `+1 289-803-8797` (NEW — Newmarket, ON, rate center NEWMARKET)
  - Twilio subaccount: `op://Private/Twilio EG-Inbound/subaccount-sid`
  - Phone SID: `op://Private/Twilio EG-Inbound/phone-sid`
  - SIP trunk: `eg-inbound-905.pstn.twilio.com` (`op://Private/Twilio EG-Inbound/trunk-sid`)
  - SIP auth: `eg-inbound` / `op://Private/Twilio EG-Inbound/sip-password`
- **Old number (still active for direct dial + outbound):** `+1 289-903-0611`
  - On dedicated trunk `east-gwillimbury-cnkb.pstn.twilio.com` (migrated from shared xprime trunk 2026-04-16)
  - inbound_webhook_url: None (removed to eliminate pre-call gate)

### Slot Fetching (latency fix, 2026-04-16)
- **Old approach:** Pre-call webhook → n8n cloud → calendar-api live scrape = **22 seconds** (broke Bell forwarding)
- **New approach:** Background cache + Retell custom function `get_tour_slots`
  - calendar-api.service (`/root/calendar_api.py`) scrapes every 5 min, caches per centre
  - `GET /slots/east-gwillimbury` → returns cached SLOTS in <10ms
  - `POST /retell/get-slots` → Retell custom function endpoint (<10ms)
  - Agent answers immediately (no pre-call gate), fetches slots mid-conversation via tool call
  - LLM prompt updated: Stage 2D/2E use `get_tour_slots` function instead of `{{SLOTS}}`

### Post-Call Workflow (Inbound End Of Call - EG, n8n `3oV7SpPKWmr3xJlQ`)
- **ALL calls:** ClickUp task created in EG Inbound list (901113422190), assigned to Alex Pipher + Jenn Christie
- **Tour bookings (appointment_booked=true):** Skyvern auto-books → "Booking Confirmed" email
- **Non-tour messages (appointment_booked=false, urgency=normal):** `[EG Inbound Message]` email to scott.james@codeninjas.com
- **Urgent (urgency=urgent, e.g., complaints):** `[EG Inbound URGENT]` email to scott.james@codeninjas.com
- Gmail forward rule needed: subject `[EG Inbound` → forward to `eastgwillimburyonca@codeninjas.com`

### Bell Forwarding Lessons
- Bell business landline *92/*72 forwarding to `+12899030611` (old number) FAILED — Bell would not complete the forward
- Likely cause: carrier-level blocking (old VoIP trunk routing or number flagged)
- Fix: provisioned fresh `+12898038797` (Newmarket, same rate center) on clean subaccount + dedicated trunk — forward works
- Always try 10-digit dial (no leading 1) for Bell forwarding destinations
- Bell's no-answer forward (*92) triggers after exactly 4 rings, confirmed via Bell business docs

### Pending Items
- **Gmail auto-forward rule** — Scott to set up: subject `[EG Inbound` → forward to `eastgwillimburyonca@codeninjas.com`
- **Resend domain verification** — needed before sending directly to centre staff (currently sandbox-limited to scott.james@codeninjas.com only)
- **n8n pre-call webhook deactivation** — old `Inbound Pre-Call - EG` workflow (`eKIl2jUEvND3rbiF`) still active but no longer called. Can deactivate.
