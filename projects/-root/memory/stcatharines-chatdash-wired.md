---
name: St. Catharines ChatDash forwarding wired
description: ChatDash agent ID for St. Catharines outbound and the n8n EOC URL it forwards to (verified 2026-05-10)
type: project
originSessionId: 3b916646-31d6-4d97-8ef2-e79c6279b12b
---
# St. Catharines ChatDash forwarding wired (2026-05-10)

CNKB-St. Catharines outbound (`agent_c02bfb40888bba2275ea3a9f3a`) routes its `webhook_url` through ChatDash and was missing outbound forwarding when first onboarded 2026-05-09. Stanley-9059672357 retried 8+ times because EOC never received `call_analyzed` events; Orphan Sweep kept resetting `calling` → `retry_pending`. Bleed stopped by surgically setting `status=completed, attempt_count=4` on the row.

**Why:** New CNKB agents created via clone inherit a unique ChatDash agent ID but do NOT inherit the forwarding rule on the ChatDash side. Without forwarding, post-call webhooks are accepted by ChatDash and dropped — Retell sees 200 OK, n8n never sees the event.

**How to apply:** Whenever onboarding a new CNKB centre that uses ChatDash, after creating the Retell agent, immediately add the forwarding rule in ChatDash:

| Field | Value |
|---|---|
| ChatDash agent ID for St. Catharines | `69ff9fa71ed668b4a511a754` |
| Forward-to (n8n EOC) | `https://xprime17.app.n8n.cloud/webhook/ac45848d-559c-4b66-9058-5d76b8476531` |
| Method | POST, JSON, full Retell payload pass-through |

Verified 2026-05-10 02:55Z via synthetic `call_started` ping → exec 18489 reached n8n EOC, filtered cleanly at "Filter out Call Started & Ended" (no side effects).

Other CNKB outbound agents likely have similar ChatDash agent IDs that were wired during their original onboarding. Audit the rest if a similar retry-loop ever recurs.

## Inbound now wired too (2026-06-19)
StCath **inbound** (`agent_fa924598caf3662856ac3cea3b`) was direct-to-n8n until 2026-06-19 — so the director-facing ChatDash dashboard showed "no data" (all real bookings, e.g. Louis 6/16, are inbound; outbound has been voicemail-only/idle since 6/8). Scott created a ChatDash inbound agent in the UI (ChatDash API blocked on plan); connecting it auto-repointed the Retell `webhook_url` to `api.chat-dash.com/v1/private/agents/6a34b517d33388e95eeefd6f/import/webhook`. Forwarding URL (ChatDash side) = inbound EOC `https://xprime17.app.n8n.cloud/webhook/inbound-end-of-call` (NOT the outbound URL — per-direction gotcha). Verified end-to-end: live 10-sec test call → n8n inbound-EOC execs 21605-21607 success (chain Retell→ChatDash→n8n intact). Rollback value if ever needed: set inbound webhook_url back to `…/webhook/inbound-end-of-call`.
