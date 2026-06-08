---
name: inbound-eoc-eg-orphaned-lookup
description: "EG inbound made zero ClickUp tasks since ~May 28 — Centre Lookup has no row matching EG's inbound number"
metadata: 
  node_type: memory
  type: project
  originSessionId: b5d4a694-b7e7-4e5e-8c50-67402b3a926a
---

**Confirmed 2026-06-07 via n8n execution 20519 (Paragol call_9edd16a4, 2026-06-05).** The inbound EOC workflow `3oV7SpPKWmr3xJlQ` ("Inbound End Of Call - Multicentre") node **Lookup Centre (Inbound)** matches `lookupColumn=from_number` against the call's **to_number** (the dialed inbound Retell number). For EG that's `12898038797`, but EG's Centre Lookup row has `from_number=12494492726` (its **outbound** caller-ID). → no match → `_clickup_list_id/_clickup_user_ids/_centre_id/_centre_email/_location_name` all empty → execution dies at **Search Existing Task** ("Bad request", empty list id) → no ClickUp task AND likely broken staff email. Started when the 2026-05-31 multicentre refactor switched inbound from hardcoded-EG to lookup-by-number.

St. Catharines works only by coincidence: its `from_number=12895140137` IS its inbound number, and its row has `clickup_list_id`+`clickup_user_ids` filled.

**Why not just edit EG's row:** outbound (`6sPwo7ngPyTWfmwM`, `rt0aEuDnFv3ZCl1y`) looks up EG by `centre_id` and uses that row's `from_number` as the outbound caller-ID. Changing it breaks outbound dialing.

**Fix as SHIPPED (2026-06-07/08) — superseded the "separate inbound row" idea above.** Instead of a second row, split the number columns: added `inbound_number` + `outbound_number` to Centre Lookup; repointed inbound Lookup `lookupColumn` → `inbound_number`, and outbound/retry caller-ID exprs → `outbound_number`. Then the old `from_number` column was **deleted** entirely (orphaned once all 3 live nodes + the onboarding writer node `ZyjnLwZ1CMOsqg2U` and `onboard-centre.ts` stopped using it). Verified end-to-end (exec 20750 resolved `east-gwillimbury-on-ca`). Regression gate `PipelineRegressionCheck.py` PASS. See [[eg-single-number-consolidation]] — EG was further collapsed to ONE number (`12898038797` for both inbound_number and outbound_number), so the orphan can never recur for EG.

(Original proposal, NOT taken: a separate `east-gwillimbury-on-ca-inbound` row with from_number `12898038797`. The column-split was cleaner.)

EG inbound ClickUp list = `901113422190` (Voice AI > East Gwillimbury > Inbound Tasks); newest real task before fix was 2026-05-28. Paragol's $281 callback backfilled manually 2026-06-07 → https://app.clickup.com/t/868jycxdm. n8n cloud API key lives in `/root/.env` (env var `N8N_API_KEY`, len 207). Sheet is gviz-readable (read-only) but no local Sheets WRITE credential exists (KB crawler writes Docs via n8n webhooks). Related: [[inbound-eoc-percentre-routing-fix]], [[eoc-centre-email-not-plumbed]], [[feedback-clickup-assignee-per-centre]].
