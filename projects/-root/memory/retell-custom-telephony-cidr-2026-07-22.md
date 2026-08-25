---
name: retell-custom-telephony-cidr-2026-07-22
description: "Retell's Aug-2026 \"add 3.42.144.0/23 to your audio/RTP allowlist\" email is a no-op for CNKB — our Twilio trunks auth by credential list, not IP; Twilio brokers media."
metadata: 
  node_type: memory
  type: reference
  originSessionId: cbade75a-3e90-4c5d-9d6f-68ca38b2e53b
---

Retell emailed (2026-07-22) telling Custom-Telephony customers to add CIDR `3.42.144.0/23` to their audio/RTP allowlist before ~week-2 of August 2026 (additive; carve-out = "bought numbers direct from Retell → ignore").

**Verdict: NO ACTION NEEDED for CNKB.** That notice targets customers running their own SBC/firewall that filters incoming RTP by source IP. We have no such allowlist surface. Per `onboard-centre.ts:499-627`: each centre = Twilio sub-account + Elastic SIP Trunk → `sip:sip.retellai.com`, authenticated by **CredentialList** (SIP user/pass), **never an IpAccessControlList**. Twilio's SBCs broker all media/RTP — there is nothing customer-facing to add the CIDR to. EG staff softphone/Bria registers to Twilio (not Retell), so also unaffected.

**One caveat:** keep `3.42.144.0/23` on file in case Retell ever switches origination to IP-based trunk auth (they currently accept us by credential, so it wouldn't bite). Nothing due before August.

Optional follow-up offered to Scott: fire one live test call through a centre trunk in early August to confirm audio still flows post-rollout. See [[twilio-access-location]].
