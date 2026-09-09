---
name: audit-2026-09-06-leaside-ani-false-positive
description: "9/6 audit HIGH = false positive (agent read back caller's own ANI); 5K ANI/dictated-number whitelist + inbound retry-chain exclusion SHIPPED 9/9"
metadata: 
  node_type: memory
  type: project
  originSessionId: da4bad5c-d9e2-42bd-a51f-cde743b38d90
---

**2026-09-06 audit triage (done 2026-09-09):** the single HIGH (`call_81c70e346c9e11e1d2b0fceeeb6`, Leaside-Inbound) was a FALSE POSITIVE — agent said "+1 647 202 2606" which is the caller's own ANI (Catherine Murphy, from_number +16472022606), read back to confirm her callback number. Correct agent behaviour; rule 5K had no ANI whitelist.

**Fixes shipped 2026-09-09** (backup `backups/audit.py.bak-20260909-003521-pre-ani-whitelist`):
1. Rule 5K now whitelists per call: from_number ANI, to_number DID, and any number the CALLER spoke (dictated-callback read-backs). Controls verified: genuinely out-of-KB numbers still fire.
2. Retry-chain analysis (Step 3) now skips inbound calls (`direction=="inbound"` or centre in INBOUND_CENTRES) — inbound all share to_number=centre DID, so every busy inbound centre produced one bogus PREMATURE_FIRE row (Leaside ×5 on the 9/6 report).
Dry run clean: calls=11 real=8 issues=0, no crash.

**Real-world residue:** Catherine Murphy called Leaside 4× in 40 min (9/6 14:25–15:05 UTC) trying to reach a human, never got one. ClickUp tasks 868m21na1 + 868m21qkk were created correctly but both still "to do" as of 9/9 — overdue per [[clickup-due-date-2026-06-30]]. Staff-side gap → tell Sharmila/Scott, not a pipeline bug. **Feature filed per Scott 9/9: lead-reactivation#68** (tiered escalation: repeat-caller detect at EOC → high-priority email/ClickUp Urgent → staff SMS via #60's Staff-Alert channel → daily stale-task sweep; cross-ref comment left on #60).

Related: [[audit-2026-09-02-triage-barrhaven-first-booking]], [[vm-callback-test-number-2026-08-26]] (the config-first lesson that shaped 5K's evidence text).
