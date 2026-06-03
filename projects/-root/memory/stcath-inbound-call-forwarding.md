---
name: stcath-inbound-call-forwarding
description: "How to activate the St. Catharines inbound AI — forward the centre's main line to the Retell number via *72; carrier still unknown"
metadata: 
  node_type: memory
  type: project
  originSessionId: daf9b54d-cf72-4951-aaf7-76c61340ca26
---

# St. Catharines inbound call forwarding (2026-06-03)

To go live on the inbound AI receptionist, the centre's **main business line** must be forwarded to the St. Catharines Retell inbound number **`+1 289-514-0137`** (`+12895140137`, the same number outbound calls originate from — see [[returned-outbound-calls-hit-inbound-agent]]).

**Activation (standard North-American Call Forwarding Variable):** from the centre's main phone, dial `*72` + `2895140137`, wait for confirmation tone, hang up. **Deactivate:** `*73`.

**Verification:** call the centre's main number from a cell — AI should answer in a couple of rings. The cell-test against the *main centre number* is the real proof; a returned missed-call reaching the AI is NOT proof (those bypass forwarding — [[returned-outbound-calls-hit-inbound-agent]]).

**Why:** the inbound agent (`agent_c02bfb40888bba2275ea3a9f3a`, llm `llm_5b4dbab1bf6dcc5007c61c2726ff`) only receives calls once the centre's published line forwards to the Retell DID.

**How to apply:** Shauna's director **Janet** is setting this up (2026-06-03, via WhatsApp). Sent her the `*72` blurb. **Carrier is UNKNOWN** — if `*72` returns a busy signal/error, the plan lacks "Call Forwarding (Variable)" and the carrier must enable it first (this was the [[leaside-inbound]] Rogers wall). If St. Catharines runs a hosted PBX/VoIP portal, forwarding is set there, not via star-codes. **TODO: record the carrier once Janet reports back** so the next centre's blurb is exact.
