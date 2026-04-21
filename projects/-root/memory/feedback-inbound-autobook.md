---
name: Inbound auto-booking is the goal
description: EG Inbound flow is designed to auto-book tours via Skyvern — do not treat manual booking as intentional
type: feedback
originSessionId: d6b5ab44-7a3a-4f8f-9d31-dab3a6089bda
---
EG Inbound voice AI flow is designed to **auto-book tours** via Skyvern when `appointment_booked=true`. If a tour isn't on the calendar after a booking call, that's a bug to fix — not "intentional, staff does it manually."

**Why:** Scott corrected me after I claimed the lack of Skyvern firing "may be intentional (staff still does the final booking manually)." He confirmed that real CRM bookings happened for David Chen and Helena Ivanov from the 2026-04-19 Cekura first pass, proving Skyvern is wired and working — Jennifer Park's was the outlier.

**How to apply:** When diagnosing booking issues, start from "this is supposed to auto-book" and hunt for the specific failure, not "maybe it's by design." The post-call pipeline (Retell → n8n `3oV7SpPKWmr3xJlQ` → Skyvern) is the happy path.
