---
name: ChatDash ≠ Cekura — strict distinction
description: ChatDash is the centre-facing analytics platform (the one TourForce mimics). Cekura is a separate testing/QA platform. They are NOT the same — `api.chat-dash.com` is ChatDash, not Cekura.
type: feedback
originSessionId: f1073f82-dcec-4c11-b3d1-1bc8f78e3502
---
# ChatDash vs Cekura — do not confuse these

I confused these on 2026-05-03 while debugging Riverside booking flow. Scott explicitly corrected. Capturing distinction so I don't repeat.

## ChatDash
- **Domain:** `api.chat-dash.com`
- **Role:** Centre-facing analytics platform that ingests Retell call events, runs analytics, and forwards events to n8n via its own `importWebhookSettings.forwardUrls` config
- **Architecture:** Retell `webhook_url` → ChatDash → ChatDash `forwardUrls` → n8n End Of Call workflow
- **TourForce portal mimics ChatDash UX** (Scott has been building TourForce as a CN-native replacement / sibling)
- **Critical config field:** `importWebhookSettings.forwardUrls` — without this set, ChatDash receives Retell events but doesn't relay → n8n EOC never fires → bookings stuck (no Skyvern, no email, no MasterSheet update)

## Cekura
- **Domain:** Separate (MCP tools `mcp__cekura__*`)
- **Role:** Testing / QA platform — scenarios, metrics, regression test runs against voice agents
- **Use:** Cekura tests CALL Retell agents directly with synthetic personas; results filtered out of EOC via `Skip Cekura Tests` IF node (lead_id contains `CEKURA_TEST`)

## Why:
The `chat-dash.com` domain misled me into thinking it was Cekura's API. It is NOT. Cekura is a different vendor entirely. Confusion caused me to write incorrect debugging text claiming Cekura was the relay.

## How to apply:
- When Scott asks about agent prompts, calls, transcripts, dashboards → **ChatDash** (or its TourForce mimic)
- When Scott asks about scenarios, regression tests, metrics → **Cekura**
- When debugging Retell → n8n EOC routing, the relay is ChatDash's `forwardUrls`, never Cekura's anything
- ChatDash agent IDs (e.g., `69f793c004c541be1b302a2b`) are different from Retell agent IDs (e.g., `agent_ee11bcfc9222c37df4de8bfe95`); both refer to "the same agent" via different namespaces
