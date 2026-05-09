---
name: ChatDash wired to EG-Inbound (2026-05-09)
description: First centre with ChatDash on inbound side; documents the Retell→ChatDash→n8n proxy chain pattern for inbound and how to verify it
type: project
originSessionId: 2c97f9cb-4cdb-4e97-bcba-8723ce37c09d
---
# ChatDash wired to EG-Inbound — 2026-05-09

EG-Inbound is the first centre with ChatDash observability on the inbound side. Outbound has had ChatDash for all centres since onboarding; inbound was a gap until now.

## Wiring chain

```
Retell agent (agent_17d623c8a8f95fc674288d0e00, CNKB-EG-Inbound)
   │ webhook_url
   ▼
ChatDash agent (69ffa52556cef3f561dbc62d, CNKB-EG-Inbound)
   │ forwarding URL (set in ChatDash UI under "Forwarding Webhook URLs")
   ▼
n8n inbound EOC (https://xprime17.app.n8n.cloud/webhook/inbound-end-of-call,
                 workflow Inbound End Of Call - EG, ID 3oV7SpPKWmr3xJlQ)
```

Retell's per-agent `webhook_url` field is single-slot. ChatDash proxies events forward (call_started, call_ended, call_analyzed) to n8n's inbound EOC webhook so n8n still gets the data.

## Important per-direction note
The forwarding URL inside ChatDash is **different** for inbound vs outbound:
- **Outbound:** forwards to `https://xprime17.app.n8n.cloud/webhook/ac45848d-559c-4b66-9058-5d76b8476531` (End Of Call - Retry System)
- **Inbound:** forwards to `https://xprime17.app.n8n.cloud/webhook/inbound-end-of-call` (Inbound End Of Call - EG)

Pasting the wrong URL during ChatDash setup routes inbound events through the outbound EOC workflow → wrong routing logic, wrong notifications, possible junk classification. Verify carefully when wiring future centres.

## Validation pattern (synthetic inbound test)
For testing the chain end-to-end without a real parent calling:
1. Use Retell `create_phone_call` API
2. `from_number`: a number that has the inbound agent linked AND has outbound capability (e.g., the CNKB-Cekura number `+12899030611` for EG)
3. `to_number`: tester's cell
4. `override_agent_id`: the inbound agent

Webhook firing logic is per-agent, not per-direction, so this exercises the same chain as a real inbound call.

⚠️ **Gotcha (2026-05-09):** Synthetic dispatch from `+12899030611` to `+19059672357` failed with `telephony_provider_permission_denied`. Real call from Scott's cell to the EG inbound number (`+12898038797`) worked. If synthetic dispatch keeps failing, fall back to a real inbound call from a tester's cell.

## Single-point-of-failure caveat
ChatDash now sits between Retell and n8n. If ChatDash goes down or the forwarding URL drifts (manual UI change, account suspension, etc.), n8n stops receiving events and all downstream booking/ClickUp/Skyvern logic dies silently. Worth adding a forwarding-URL validator to a future audit script — currently the onboard-centre.ts gate only checks the agent.webhook_url contains `chat-dash.com`, not whether ChatDash's forwarding setting is correct.

## Status of other inbound clones
- Leaside-Inbound: provisioned but Hiya/forwarding blocked (per `leaside-inbound.md`); no ChatDash yet
- St. Catharines-Inbound: not yet activated; no ChatDash yet

When activating future inbound centres, follow this same wiring pattern. The next centre's onboarding should consider whether to wire ChatDash on inbound from day one, especially if pitching the dashboard to the centre director (per `vinsi-competitive-analysis.md` — director-facing dashboard is a retention play).
