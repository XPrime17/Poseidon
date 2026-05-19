---
name: feedback-announce-before-sending
description: "When running scripts that send real email (audits, reports, n8n test workflows), announce 'I'm about to send' first instead of suppressing the send via dry-run flags."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4bb62092-eb24-47e7-8dc5-e4936c81436f
---

When testing scripts that send real outbound communications (Resend, n8n workflows, Twilio, etc.), the preferred workflow is to **announce the impending send explicitly** to Scott before running it — not to add `--dry-run` toggles or `AUDIT_DRY_RUN=1` style flags.

**Why:** Scott prefers real-end-to-end verification (the email actually lands in the inbox) over synthetic dry runs that miss delivery-side bugs. Trade-off: occasional duplicate or unexpected email in his inbox is fine, as long as it was announced ahead of time so it doesn't surprise him. Confirmed 2026-05-13 after I test-ran `audit.py` without warning him and a third audit email landed in his inbox.

**How to apply:**
- Before running any script that calls Resend / n8n send nodes / Twilio / Gmail send: say in plain text "I'm about to test-send X to your inbox — heads up."
- Do NOT add `DRY_RUN` flags to existing send-capable scripts on Scott's behalf. He prefers the system to send for real.
- Exception: if a test would send to a centre director or external party (not Scott himself), DO route to a test recipient or add a guard — the announce-first rule only covers sends to Scott.

Related: [[bcc-scott-on-centre-emails]] — Scott always wants visibility on centre-bound sends, which is a different surface but same underlying preference (he wants to see what got sent, not be shielded from it).
