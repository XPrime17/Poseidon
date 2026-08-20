---
name: n8n-brace-escape-invalid-syntax-2026-08-20
description: "n8n expression parser breaks on literal-brace escapes like {{'{{'}} — \"invalid syntax (item 0)\"; never put literal {{ }} in node text fields"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 07c2f2da-2c13-43ca-8da2-a72b86302836
---

n8n's expression tokenizer matches the FIRST `}}` it sees, so a literal-brace escape like `{{'{{'}}facility_slug{{'}}'}}` parses as `{{'}}` (content = a lone quote) → `invalid syntax (item 0)` and the whole node throws at runtime — the error only fires when the branch actually executes, so it can lie dormant for days.

Incident 2026-08-20: `Duplicate Lead Dropped` Gmail alert in outbound `6sPwo7ngPyTWfmwM` (added during the HubSpot migration session) crashed exec 28370 on its first real duplicate. The drop itself was CORRECT — Jaclyn/Jackie Blanchard (St. Catharines, 9059330161) was a HubSpot-Zap + LineLeader dual-write echo of existing row `Jaclyn-9059330161` (retry_pending, cadence intact); only the alert email died. Fixed by rewording to "the facility_slug placeholder" — no literal braces. Backups: `/root/n8n-backups/dedupe-alert-syntax-fix-2026-08-20/`.

**Why:** There is no safe brace-escape inside n8n `=`-expression text fields.

**How to apply:** When node text must MENTION a template placeholder, write it in words ("the facility_slug placeholder") or use `String.fromCharCode(123)`. After authoring alert/error branches, force-execute them once — error paths are exactly the ones that never run in happy-path testing. Related: [[outbound-email-overhaul-2026-08-14]], [[eoc-rownumber-refactor-shipped-2026-08-19]].
