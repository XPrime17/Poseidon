---
name: Pickering outbound is also Skyvern-wired
description: Skyvern auto-book runs on Pickering outbound calls too, contradicting the earlier "EG-Inbound only" assumption
type: project
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# Pickering outbound IS Skyvern-wired

Earlier memory (`inbound-kb-injection.md`) implied Skyvern was only attached to the EG-Inbound flow. That's wrong — confirmed 2026-05-08 by tracing Sandra Truong's call through End Of Call exec 17819. The Skyvern + Wait on Skyvern Webhook1 nodes run on EVERY booked outbound call, regardless of centre.

**Why:** EOC workflow `4p1V0wESn3kZySt6` is shared across all centres (multicentre). Skyvern's target URL is the centre's `https://www.codeninjas.com/{centre_id}/schedule-tour` page (ChildcareCRM full-calendar). So Skyvern attempts auto-book for any centre whose schedule-tour page is publicly reachable.

**How to apply:** when reasoning about "where bookings land", remember Skyvern is the link between AI-confirmed bookings and the centre's CRM calendar for ALL centres, not just EG. Failure modes (slot race, calendar mismatch) apply pipeline-wide. When Sharmila or any centre reports "AI said booked but I never saw it", check Skyvern node output in the EOC exec FIRST.
