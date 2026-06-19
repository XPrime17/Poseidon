---
name: onsite-callback-rev-2026-06-19
description: StCath inbound now tells parking-lot/running-late callers to call back in a few minutes; real-time staff-alert agent filed as GitHub
metadata: 
  node_type: memory
  type: project
  originSessionId: c1d375be-3771-4b74-9000-53c4aa3a6fa1
---

Shauna asked (2026-06-19) how the inbound AI handles a parent waiting in the parking lot for pickup or running late for a session. Old behavior: misrouted to take-a-message + slow callback (useless in-the-moment).

**Interim fix SHIPPED to StCath inbound** (`agent_fa924598caf3662856ac3cea3b` / `llm_769e0ba68dc37cea573904c474fe`, deployed 2026-06-19T17:09Z): new "Handling Time-Sensitive On-Site Requests" section + Stage-1 precedence check + Example 9. Agent now tells these callers to **call the centre back in a few minutes** (front desk was briefly tied up; fresh call likely reaches a human), with an urgent-message fallback if they can't. `call_type=other, urgency=urgent`; no post-call enum change. Backups: `kb-crawler/llm-prompt-backups/2026-06-19-onsite-callback/`.

**Future enhancement filed: XPrime17/lead-reactivation#60** — dedicated single shared `CNKB-Staff-Alert` outbound agent (NOT a tweak to the lead clone) that the inbound EOC (`3oV7SpPKWmr3xJlQ`) triggers via Retell `create-phone-call` to ring/text the director in real time on hangup. Prereq: new Centre Lookup column for director cell. Channel (call/SMS/both) configurable per centre. Decided separate agent to protect the lead pipeline regression-gate + avoid the lead clone's ~6.6K-tok surcharge.

FANNED OUT 2026-06-19 to all 5 live inbound agents (StCath, EG, Kanata, Burlington, Leaside — Leaside used older "Classification - determine which path" anchor). Backups of all 4 originals in the backup dir.
OPEN: (1) get Shauna's cell + channel preference to build #60; (2) optional Cekura regression on inbound. See [[stcath-inbound-call-forwarding]], [[med1-existing-customer-recognition-2026-06-10]].
