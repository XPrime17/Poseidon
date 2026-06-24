---
name: core-classifier-drop-2026-06-24
description: CORE leads silently dropped 6/12-6/23 by a Classify Lead regex bug; fixed + 21 backfilled
metadata: 
  node_type: memory
  type: project
  originSessionId: f505e22f-7522-4661-a481-d18444c78266
---

## CORE classifier regression — root-caused & fixed 2026-06-24

**Symptom:** Scott's EG lead Nadine Gageiro was in LineLeader CRM but never hit the Leads MasterSheet (and never got called). True for EVERY CORE lead, all centres, 2026-06-12 → 2026-06-23.

**Root cause:** In `Outbound Call Flow - Multicentre` (n8n `6sPwo7ngPyTWfmwM`), the `Classify Lead` Code node matched CORE with `/New\s+CORE\s+Inquiry/i` — but LineLeader actually sends subject **`New CORE Program Inquiry`** (the word "Program" sits between CORE and Inquiry). Never matched → `is_lead=false` → **Non-Lead Dropped** before Lookup Centre / Append. JUNIOR (`New JUNIOR Program Inquiry`) had its own correct pattern, so Junior kept flowing — masking the break. Introduced 2026-06-12 with the lead-program expansion (trigger widened to `subject:Inquiry` + classifier added). Clean cutover: CORE passed through 06-12 04:20, every CORE dropped from 06-12 21:44 on.

**This SUPERSEDES [[stcath-outbound-starvation-2026-06-19]]** — StCath wasn't starved by an upstream LineLeader→HubSpot forwarding lapse; its CORE leads were eaten by this classifier alongside Pickering/Leaside/EG. Tempered-by-seasonality note [[outbound-seasonality]] also doesn't apply here.

**Fix (deployed 2026-06-24):** regex → `/New\s+CORE(\s+Program)?\s+Inquiry/i` (strict superset; still matches camp-style "New CORE Inquiry for <centre>"). PUT via n8n API. Backup: `/root/lead-reactivation/backups/outbound-callflow-2026-06-24-PREFIX.json`. `PipelineRegressionCheck.py` = PASS (1 pre-existing Leaside-inbound WARN). See [[pipeline-regression-gate]].

**Backfill:** 34 dropped leads found in execution payloads. Excluded the **10-lead Leaside 6/13 event batch** (arrived 15:48–16:16 ET — batch/event roster, per Scott), 1 dup (Chetan), 2 junk phones (Gina 888-…, Oladayo malformed) → **21 to recover**. Scheduled one-shot n8n workflow **`QdsKZXl5clf26jsd`** ("Backfill CORE Leads — one-shot 2026-06-25 18:00 ET"): Schedule Trigger cron `0 18 25 6 *` (tz America/Toronto, date-guarded to 2026-06-25 only) → Code builds 21 LineLeader-format inquiry emails → Gmail send (cred `x1W7EpNhmEdx8cOR`) to `scott.james1717+<centre-slug>@gmail.com` → flows through the fixed Outbound pipeline. 18:00 ET is inside the 9–20 call window so all dial immediately. **Abort = deactivate/delete `QdsKZXl5clf26jsd`.** Delete it after it fires.

**Follow-up:** batch/event-lead detection filed as GitHub `XPrime17/lead-reactivation#61`.

**Backfill mechanics learned:** outbound flow's only entry is the Gmail Trigger (intake inbox = the `x1W7EpNhmEdx8cOR` Gmail acct; centres forward to `+<slug>` plus-addresses; Extract Centre falls back delivered-to→to for gmail-to-self). To replay a lead, send a `subject:…Inquiry` email to `scott.james1717+<slug>@gmail.com` — respects all guardrails (After Hours? 9–20 local → call-now vs retry_pending@9am).
