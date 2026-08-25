---
name: backfill-skip-inflight-call-analysis
description: "When backfilling tasks from Retell list-calls, skip very recent calls — call_analysis is generated async and transiently reports staff_followup_needed=true before finalizing"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 546ea15a-9b3d-4de1-8986-da9f2129038a
---

Retell `call_analysis.custom_analysis_data` is computed asynchronously after a call ends. For a few minutes the fields can be in a transient/default state — e.g. a 2-8s junk/no-answer call momentarily showed `staff_followup_needed=true` in `list-calls`, then finalized to `False` on a later `get-call`.

2026-06-09: this produced 2 spurious ClickUp backfill tasks (868jzefq8, 868jzefqa) for 23:02 UTC Pickering junk calls; caught + deleted by re-checking `get-call` after analysis finalized.

**Rule for any list-calls→task backfill/audit:** exclude calls newer than ~5-10 min (or filter `call_status=='ended'` AND re-verify the specific field via `get-call` before acting). Don't trust a freshly-ended call's analysis. Relates to [[daily-call-audit-droplet]].
