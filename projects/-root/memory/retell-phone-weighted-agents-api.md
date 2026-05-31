---
name: retell-phone-weighted-agents-api
description: "Retell Phone Number APIs use weighted *_agents arrays, not singular *_agent_id (deprecated 2026-03-31)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 05b70f05-910b-4408-ab3a-9b1258c01c3b
---

Retell deprecated the singular phone-number agent fields on 2026-03-31; backward-compat removed shortly after. Affects 5 endpoints: create/import/update/get/list-phone-number.

**Deprecated → replacement (all on the phone-number object):**
- `inbound_agent_id` / `inbound_agent_version` → `inbound_agents`
- `outbound_agent_id` / `outbound_agent_version` → `outbound_agents`
- `inbound_sms_agent_id` / `outbound_sms_agent_id` (+versions) → `inbound_sms_agents` / `outbound_sms_agents`

**Shape:** array of `{ agent_id, agent_version, weight }`. Single agent → `[{ agent_id, weight: 1 }]`. Unbind → empty array `[]` (replaces `*_agent_id: null`). Multi-agent weights sum to 1.

**NOT affected:** `inbound_webhook_url` (still valid), and call-level `override_agent_id` on `create-phone-call` (different API — n8n Outbound/Retry use that, no change needed).

**Migrated 2026-05-31** (`select:WebFetch` doc): `lead-reactivation/scripts/provision-inbound.ts` (Step 3 write + idempotency read), `lead-reactivation/scripts/onboard-centre.ts` (import-phone-number), `_OFFBOARDCENTRE/Tools/Offboard.ts` (list read + unbind/rebind writes). Reads keep `?? legacy_field` fallback. Related: [[provision-inbound]] [[leaside-inbound]].
