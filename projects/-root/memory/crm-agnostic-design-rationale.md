---
name: Voice AI was built CRM-agnostic on purpose
description: TourForce was deliberately designed without any LineLeader integration — Scott anticipated a CRM swap (ActiveCampaign rumour at build time) and made the system CRM-agnostic so it would survive whichever CRM HQ picked.
type: project
originSessionId: f7fbf7f0-f803-41f5-9e61-1667d1ad9cd8
---
When Scott built the voice AI system, the rumour at HQ was that Code Ninjas would replace LineLeader with **ActiveCampaign**. Rather than couple to LineLeader and risk a rebuild, he intentionally designed the system to be CRM-agnostic.

**Result:** The agent never integrated with LineLeader. Lead intake = CORE "New CORE Inquiry" Gmail trigger. State = Google Sheets. Bookings = services.codeninjas.com calendar via Skyvern. Tracking = ClickUp + email digest. None of those are LineLeader endpoints.

**Why:** A bet on CRM-portability that paid off. HQ ended up picking HubSpot (not ActiveCampaign), but the system survives the swap regardless. See `hubspot-migration.md` for the actual rollout timeline.

**How to apply:**
- When centre owners ask "should we wait for HubSpot before onboarding?" — the answer is no, and the framing is: *the system was built CRM-agnostic on purpose, so HubSpot transition is friction-free for you, and HubSpot's real API will actually unlock new features that LineLeader can't support today.*
- Owner-facing truth: cutover is invisible from their seat. The backend swap (Gmail-trigger → HubSpot-webhook) is Scott's job, captured in `hubspot-migration.md`.
- Don't confuse "CRM-agnostic at the agent layer" with "no work to do at cutover" — the lead-ingestion edge does need a HubSpot bridge. Just don't surface that as the owner's problem.
- Reusable objection-handling for any "wait for [HQ change]" question: ask whether the change is upstream or downstream of the voice AI's actual integration points (CORE intake + CN calendar). CRM = sibling lane. CORE = parent dependency.

**Originating exchange (2026-05-01):** Shauna Chan (Burlington + St. Catherines co-owner) sent a WhatsApp voice note asking whether to wait for HubSpot to onboard. Reply explained the decoupling, the deliberate ActiveCampaign-era design choice, and framed HubSpot as a future capability unlock.
