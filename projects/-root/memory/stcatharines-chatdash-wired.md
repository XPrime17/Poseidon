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
