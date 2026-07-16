---
name: leaside-inbound-forward-target-2026-07-16
description: Leaside forward-target busy signal — 647-584-1523 is outbound-only in Retell; inbound DID is 647-496-3276
metadata: 
  node_type: memory
  type: project
  originSessionId: 7ce5a28a-f717-42c9-b584-6a1ea3064ade
---

2026-07-16, Sharmila reported: forwarding the Leaside landline to **647-584-1523** gets a **busy signal**.

Root cause: Leaside has TWO DIDs on the same Twilio trunk (`TK7676520f…`, "Retell AI Agent - Leaside", origination `sip:sip.retellai.com` enabled — inbound routing is FINE for both):
- **+16475841523** (sheet col G `outbound_number`, Retell nick "Leaside") — Retell has only `outbound_agents` (agent_1f8c2799630cd6524fa8176e6d), **no inbound agent → busy signal**.
- **+16474963276** (Retell nick "CNKB-Leaside-Inbound") — `inbound_agents`=agent_50a754cd5b9ba4ec988c764427 (voice Cimo, inbound EOC webhook). Fully wired.

Centre Lookup row `leaside-on-ca`: col F `inbound_number` is **EMPTY** (why the wrong number got handed out); director Sharmila (sharmila.sivasankaran@codeninjas.com), Testing=FALSE.

**RESOLVED 2026-07-16 — applied Option B (single-number model [[single-number-model-fleetwide]]):** PATCHed `+16475841523` in Retell → added `inbound_agents=[agent_50a754cd…]` while keeping its outbound agent (agent_1f8c…). Number now answers inbound+outbound; no Twilio change (trunk already routed inbound to Retell). Backfilled sheet `Sheet1!F8` (leaside-on-ca) `inbound_number=16475841523`. Sharmila keeps forwarding to the SAME 647-584-1523 she tried — busy signal gone. 16474963276 (CNKB-Leaside-Inbound) now redundant; can retire later.

Twilio access confirmed → [[twilio-access-location]]. OPEN: one live test call to confirm a forwarded call lands on the agent.
