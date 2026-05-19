---
name: callfailed-orphan-rows
description: "Outbound Call Flow appends the lead to Leads MasterSheet BEFORE the Retell call, so Retell rejections leave orphan rows. Planned fix = delete row on the Call Failed branch (do NOT move the append)."
metadata: 
  node_type: memory
  type: project
  originSessionId: b71eef49-9bc3-4b66-87da-b2564cd13727
---

Outbound Call Flow (`6sPwo7ngPyTWfmwM`) runs `Append row in sheet` *before* `Retell: Call Prospect`. When Retell rejects the number (e.g. non-E.164) the `Call Failed` branch fires — but the already-appended row is left orphaned at `status=calling`, `attempt_count=1`. These junk rows accumulate in the live Leads MasterSheet.

Compounding defect: the same `lead_id` can be appended twice (e.g. a repeated test submission). Keyed writes and Orphan Sweep `appendOrUpdate` on `lead_id` only hit the *first* match, so the later duplicate row is stuck on `calling` permanently.

**Why:** surfaced 2026-05-16 tracing a "Retell Call Failed — Sudbury" email — test lead `test-9999988878` (Sudbury, exec 18720, 2026-05-13) left two junk rows (214 `retry_pending`/cap-4 and 343 `calling`/stuck).

**How to apply — agreed fix:** on the `Call Failed` branch, delete the row that was just appended. Do NOT move the append to after the call — the pre-call append is the safety net Orphan Sweep relies on to recover leads when the End-Of-Call webhook fails. See [[lead-reactivation]] for the orphan-sweep design.

Tracked in GitHub issue XPrime17/lead-reactivation#53.
