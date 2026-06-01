---
name: returned-outbound-calls-hit-inbound-agent
description: Returned outbound calls reach the inbound AI directly (shared Retell number) — independent of centre call-forwarding status
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2cf2e90d-95d5-4b4b-a510-788a169db5e1
---

A centre's outbound reactivation calls are placed **from the same Retell number the inbound agent answers on** (e.g., St. Catharines = `+12895140137`, both outbound caller-ID and inbound). So when a lead returns a missed outbound call, they dial that number back and reach the **inbound AI directly — bypassing call forwarding**.

**Implication:** the inbound agent receives live "callback" traffic the moment outbound is running, even if the centre has NOT activated main-line call forwarding. Forwarding only routes *new* callers who dial the centre's published business number; those never touch the AI until forwarding is on.

Surfaced 2026-05-31: Steven Adams reached StCath inbound AI (creating [[inbound-eoc-percentre-routing-fix]]'s trigger task) before Shauna activated StCath forwarding. Don't treat "AI got an inbound call" as proof that forwarding is live. Related: [[eg-inbound-pilot]], [[leaside-inbound]] (forwarding activation is a separate, often-blocked step).
