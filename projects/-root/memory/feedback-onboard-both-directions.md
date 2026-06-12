---
name: feedback-onboard-both-directions
description: POLICY — every centre onboarding provisions BOTH inbound and outbound agents (Scott 2026-06-12)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0102d5a3-1122-4106-8599-442881c95519
---

When onboarding a new centre, set up **both inbound and outbound** Retell agents — never outbound-only.

**Why:** the outbound caller-ID is the Retell number and leads DO return missed calls ([[returned-outbound-calls-hit-inbound-agent]]); with no inbound agent bound those callbacks ring dead. Pickering/Riverside still carry this gap (pre-policy).

**How to apply:** `onboard-centre.ts` step4b now clones the EG-Inbound LLM/agent and binds the number automatically (commit on 2026-06-12); step14 gate FAILS without an inbound binding. After the KB doc exists, run `provision-inbound.ts --centre <id>` to register PHONE_TO_CENTRE + smoke-test (idempotent). Non-EG inbound clones get `webhook_url` = n8n `inbound-end-of-call` directly — never EG's ChatDash URL. Inbound goes "live" (forwarding + `LIVE_INBOUND_CENTRE_IDS`) only when the centre sets up no-answer forwarding per [[feedback-no-answer-forwarding-always]].
