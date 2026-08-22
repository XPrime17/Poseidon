---
name: chatdash-agent-assignment-gaps
description: Chat-Dash agent assignments incomplete — Leaside/Burlington/Kanata inbound agents exist in Retell but were never wired into Chat-Dash; matters because Chat-Dash is the client-facing billing/visibility surface for the paid transition
metadata: 
  node_type: memory
  type: project
  originSessionId: 635b9053-51af-4458-be62-3c9280a7e1ed
---

# Chat-Dash agent assignment gaps (found 2026-08-22, Shauna paid-transition prep)

Retell fleet vs Chat-Dash assignments, verified live 2026-08-22:

| Centre | Retell | Chat-Dash | Status |
|---|---|---|---|
| St. Catharines | 2 | 2 | complete (inbound wired Retell→ChatDash→n8n 2026-06-19) |
| East Gwillimbury | 2 | 2 | complete ([[chatdash-eg-inbound-wired]]) |
| Leaside | 2 | 1 | **inbound `agent_50a754cd…` not in Chat-Dash** |
| Burlington | 2 | 1 | **inbound `agent_7950e8…` not in Chat-Dash** |
| Kanata | 2 | 1 | **inbound `agent_c3d64f…` not in Chat-Dash** (was an OPEN item in [[kanata-burlington-onboarding-2026-06-12]]) |
| Pickering | 1 | 1 | correct BY DESIGN — outbound only; Sharmila kept her other receptionist program (2026-05-23 WhatsApp) |
| Barrhaven | 2 | ? | ChatDash still open in [[barrhaven-onboarding-2026-08-14]] |

**Why:** inbound calls on the gap centres work fine — their webhooks go direct to n8n, bypassing Chat-Dash. Functional, but the client dashboard (billing surface for paying customers) shows only half the service.

**How to apply:** Before/at Shauna + Sharmila paid go-live, assign the missing inbound agents in Chat-Dash. CAUTION: the StCath fix re-routed the webhook through Chat-Dash — check if assignment-without-rerouting is possible; if webhook must move, follow the StCath pattern and verify with a live test call per centre. Related: [[tourforce-pricing-model]], [[customer-leaside-pickering-first-paying]].
