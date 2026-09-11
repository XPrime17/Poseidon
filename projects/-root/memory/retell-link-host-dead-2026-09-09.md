---
name: retell-link-host-dead-2026-09-09
description: "Retell retired app.retellai.com host → every EOC \"Call recording\" link was dead; swapped to no-login CloudFront recording_url"
metadata: 
  node_type: memory
  type: project
  originSessionId: 183f5676-621d-4646-9489-a4ca8a32fddb
---

Scott reported a broken Retell link in ClickUp task 868m21n6f (Shannon Lambert / East Gwillimbury outbound staff follow-up): `https://app.retellai.com/calls/call_d17bab16284d36e417d20505ca5`.

**Root cause (NOT a truncated call_id):** the call_id was valid — Retell's API returns it fine (agent_0c6c32b61cb506fefb6ac247f4, recording exists). Retell **retired the `app.retellai.com` host**: `curl app.retellai.com` → `000` (DNS/conn fail). Live dashboard host is now `dashboard.retellai.com` (`/calls/<id>` → redirects to auth.retellai.com login = valid route). So EVERY outbound-EOC "Call recording" link built since the host change was dead. Systemic.

**Blast radius:** outbound EOC `4p1V0wESn3kZySt6` only — 3 nodes: `Send Staff Follow-Up Email` (gmail), `Send Manual Booking Needed` (gmail), `Format Staff Follow-Up Task` (code). Inbound EOC `3oV7SpPKWmr3xJlQ` = 0. audit.py = 0.

**Fix (Scott chose no-login direct recording over dashboard-login link):** swapped all 3 to the webhook payload's CloudFront wav: `{{ $('End Of Call-Webhook1').first().json.body.call.recording_url || 'Recording not yet available' }}` (code node: `call.recording_url`). Plays with NO Retell login — right for centre staff. Bonus: `Send Manual Booking Needed` was doubly broken (put a Skyvern `workflow_run_id` on a Retell `/calls/` URL) — now also points at the real recording. `_call_id:` footer kept in the ClickUp task for lookups.

Deployed via n8n API PUT (payload = name/nodes/connections/settings only; residual refs live in n8n's `activeVersion` snapshot, not runtime). VERIFIED: 0 node-level app.retellai.com refs, recording_url in all 3 nodes, active=True. Recording plays HTTP 200 (3.3MB wav, no auth). Pre-fix backup: `/root/n8n-backups/retell-link-host-fix-2026-09-09/4p1V0wESn3kZySt6.pre.json`.

Also patched the reported task 868m21n6f in place. **BACKFILL DONE 2026-09-10:** swept all 29 open `[Outbound Staff Follow-Up]`/callback tasks workspace-wide (team 9011711565) → 27 patched (call_id from `_call_id:` footer or the dead URL → Retell get-call → recording_url; regex-replaced markdown-link + bare-URL forms), 2 skipped-clean (Shannon already fixed; Kayla already had a cloudfront link), 0 errors, 0 missing recordings. Sweep logic scoped OPEN tasks only (closed = done). Sweep script pattern in this session; results `/tmp/sweep_results.json`. Manual-Booking is email-only (no task) so nothing to backfill there. Past *emails* already delivered still carry dead links — unfixable (sent), self-heals going forward.

Related: [[eoc-email-consolidation-2026-09-09]] (same 3 EOC nodes, just touched 9/9), [[n8n-two-instances-gotcha]] (PROD = xprime17.app.n8n.cloud).
