---
name: Onboard a new CNKB centre — probe ChatDash forwarding before declaring done
description: After cloning a CNKB outbound agent, send a synthetic call_started POST to its ChatDash webhook URL and confirm a new n8n EOC execution appears within 10s. ChatDash returns 200 even when forwarding is unwired — the only honest signal is an n8n execution.
type: feedback
originSessionId: 3b916646-31d6-4d97-8ef2-e79c6279b12b
---
# Onboard a new CNKB centre — probe ChatDash forwarding before declaring done

After cloning a CNKB outbound agent during `onboard-centre.ts`, send a synthetic `call_started` POST to the agent's `webhook_url` and confirm a new End Of Call execution appears in n8n within ~10s.

**Why:** ChatDash returns HTTP 200 for any payload regardless of whether forwarding is configured for the target ChatDash agent ID. Every layer (Retell, ChatDash, n8n) reports success when forwarding is unwired — there is no error log to grep, no failed webhook to alert on. The only honest signal is "did n8n actually receive the event." St. Catharines onboarded 2026-05-09 with missing forwarding; bug surfaced as 8 retry calls to Scott's test number over 26h before being caught manually 2026-05-10.

**How to apply:**

1. Right after `onboard-centre.ts` creates the Retell agent, capture the `webhook_url` (will look like `https://api.chat-dash.com/v1/private/agents/{chatdash_id}/import/webhook`).
2. Snapshot the latest n8n End Of Call execution ID via `GET /api/v1/executions?workflowId=4p1V0wESn3kZySt6&limit=1`.
3. POST a synthetic event to the ChatDash webhook URL:
   ```json
   {"event":"call_started","call":{"call_id":"onboard-probe-<ts>","agent_id":"<new_agent_id>","call_status":"started","direction":"outbound"}}
   ```
4. Wait 8s, list EOC executions again. If no new exec appeared with the matching `call_id`, **ChatDash forwarding is missing** — fail the onboard and surface the ChatDash agent ID + n8n EOC URL (`https://xprime17.app.n8n.cloud/webhook/ac45848d-559c-4b66-9058-5d76b8476531`) for the operator to wire in ChatDash.
5. The synthetic event hits "Filter out Call Started & Ended" and stops, so no emails / ClickUp tasks / sheet writes fire.
