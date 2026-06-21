---
name: outbound-seasonality
description: Outbound call volume is seasonally low in June (summer-camp lull) and recovers in August (back-to-school)
metadata: 
  node_type: memory
  type: project
  originSessionId: f1f935f2-cbfb-4678-b39f-90ef4fbd6aeb
---

Outbound lead/call volume runs **typically slow in June** as the school year ends and families shift into summer-camp season, then **picks back up in August** heading into back-to-school. This is expected seasonality, not a system fault.

**Why:** After-school Create/Junior tour demand (the outbound dialer's bread and butter) drops over summer; parents aren't shopping for term programs. Volume rebuilds as August registration season starts.

**How to apply:** When outbound agents look dark in June–July, do NOT auto-flag it as starvation/breakage. Distinguish seasonal lull (low *real* lead supply, fleet-wide, inbound still healthy) from a genuine pipeline bug (forwarding lapse, MasterSheet not appending, broken bindings). A true bug shows extra symptoms — e.g. inbound also broken, errors in workflow execs, or a sudden cliff mid-busy-season. Verify lead supply before raising alarms. Re-evaluate the baseline in August. See [[stcath-outbound-starvation-2026-06-19]] — that June reading was partly this seasonality (though confirm the HubSpot/LineLeader forwarding lapse separately).
