---
name: feedback-no-answer-forwarding-always
description: "All centre inbound forwarding must be no-answer (ring ~4x first), NEVER unconditional *72"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: daf9b54d-cf72-4951-aaf7-76c61340ca26
---

When setting up inbound call forwarding for ANY centre, **always use the no-answer / "wait for 4 rings" approach** — never unconditional forwarding (`*72` / Call Forwarding Variable).

**Why:** unconditional forwarding sends 100% of callers straight to the AI and the centre phone never rings, so staff can never answer their own line. The intended model (proven on [[eg-inbound-pilot]]) is: the centre rings first (~4 rings), and the AI only catches calls nobody answers. Staff get first crack; the AI is overflow/after-hours backup, not a gatekeeper. Scott set this as a standing rule 2026-06-04 after Janet's St. Catharines test showed `*72` skipping the centre entirely.

**How to apply:** Do NOT put `*72` in onboarding blurbs. If a centre was already set to `*72`, cancel it first with `*73`, then set no-answer forwarding. The exact code is carrier-specific — Bell = `*92` + 10-digit destination, fires after exactly 4 rings, cancel with `*93` (per EG). Rogers and others differ, so confirm the centre's carrier before sending the code. Test by calling the centre's main number from a cell: it must ring at the centre a few times *before* the AI answers. See [[stcath-inbound-call-forwarding]] and [[leaside-inbound]].

**CAVEAT — not every carrier offers no-answer forwarding.** Some residential/VoIP plans only have unconditional `*72` and NO CFNA star code (e.g. **NRBN residential** at St. Catharines — see [[stcath-inbound-call-forwarding]]). When a centre's plan lacks CFNA, the policy requires either upgrading to a business/hosted-PBX tier (NRBN Business = Cisco BroadSoft, supports CFNA `*92`/`*93` with portal-set ring count) or having the carrier configure no-answer forwarding server-side. Always check the carrier's feature guide before promising the 4-ring behavior.
