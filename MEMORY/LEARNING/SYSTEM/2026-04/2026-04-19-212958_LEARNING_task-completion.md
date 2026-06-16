---
capture_type: LEARNING
timestamp: 2026-04-19 21:29:58 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-04-19
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

**✅ VERIFY**

| Test | Input | Expected | Result |
|------|-------|----------|--------|
| 1 | `to_number=+12898038797` (EG Bell-forward) | 728-char KB with Store Hours | ✅ HTTP 200, 728 chars, "Store Hours": True, 2.3s |
| 2 | `to_number=+12899030611` (EG direct-dial) | Same 728-char KB | ✅ HTTP 200, 728 chars, "Store Hours": True, 0.5s |
| 3 | `to_number=+19999999999` (unknown) | Well-formed empty KB + marker | ✅ HTTP 200, empty KB, `_debug.kb_missing=true` in logs |
| 4 | n8n execution flags | `kb_missing=True` visible in Resolve Centre output | ✅ Searchable via `kb_missing=True` filter |
| 5 | Cekura regression (246776) | Queued run `2957646` | ⏳ In flight — 3min wakeup scheduled |

**📚 LEARN**

Three worth capturing:

1. **Fail-open beats fail-closed for inbound webhooks.** A throw in a Code node left Retell with a silent empty-200 response — agent still answered but with no KB. Switching to an IF-branch + marker (`kb_missing: true`) in the Resolve node gives us: (a) guaranteed well-formed Retell response, (b) searchable marker in n8n logs, (c) caller still gets a functional agent just without centre-specific KB. For voice AI, "works degraded" beats "fails loudly to the caller."

2. **Node-level errors in n8n don't propagate to Respond nodes.** Throwing in a Code node aborts the workflow at that node — the Respond node never fires, and n8n returns HTTP 200 with empty body by default. If you want structured error responses to the caller, you have to branch with an IF node and route to a Respond-with-error path.

3. **Same webhook path serves all centres.** Kept the existing URL (`/inbound-kb-injection-eg`) for URL stability even though the workflow is now multicentre. Webhook path is a misnomer but not worth breaking every wired phone to rename. If it bugs us later, add a new webhook with multicentre path and deprecate.

---

📋 **SUMMARY:** Multicentre generalization done. Workflow now routes any inbound phone to its centre's KB via a map in Resolve Centre, with fail-open behavior for unknown phones. Both EG phones regress clean (728-char KB, 0.5-2.3s), unknown number returns well-formed empty response with `kb_missing=true` marker. Cekura regression scenario 246776 running now (wakeup 3min). Memory updated with add-a-centre recipe + all 9 known Doc IDs.

🗣️ **Poseidon:** Multicentre's live, Scott. Adding Pickering or Leaside is now a 4-line change + one Retell config. Cekura regression's in flight — I'll confirm clean pass when it lands.

</details>
