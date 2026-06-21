---
name: stcath-outbound-lead-supply-dry-since-june-8
description: "Why St. Catharines outbound has no activity — no leads appended since 2026-06-08; not a code bug, upstream forwarding lapse suspected (HubSpot migration)"
metadata: 
  node_type: memory
  type: project
  originSessionId: aed91157-7a6e-4df3-978c-bed9f62d7501
---

# St. Catharines outbound starvation (diagnosed 2026-06-19)

Scott noticed the StCath ChatDash dashboard was empty. Two-layer cause; this file covers the outbound half (inbound-wiring half: see [[stcatharines-chatdash-wired]]).

**Finding:** StCath outbound (`agent_c02bfb40888bba2275ea3a9f3a`) last dialed **June 8** (Rachel, phone 9059311485, now `exhausted`). Leads MasterSheet (`1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`, tab "All Centres") has 27 StCath rows, **all exhausted/completed, none appended since ~June 8**.

**Not a bug on our side:**
- Centre Lookup (`1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`) StCath row is healthy: `enabled=TRUE`, `Testing=FALSE`, outbound_number=12895140137, agent bound, centre_email=shauna.chan@codeninjas.com, director_personal_email=cnstcatharines@gmail.com.
- Outbound Call Flow - Multicentre (`6sPwo7ngPyTWfmwM`, Gmail-triggered on `subject:Inquiry`) is active and processed other-centre inquiry emails on 6/16–6/17. So inbox + routing work; gap is StCath-specific.
- StCath **inbound** is busy (Louis booked 6/16) → centre is active; only the forwarded-web-lead outbound supply is dry.

**Suspected root (upstream, not fixable from our stack):** StCath CRM stopped forwarding "Inquiry" notification emails into our trigger inbox (credential `x1W7EpNhmEdx8cOR`). Timing (~June 8) lines up with the LineLeader→HubSpot migration ([[hubspot-migration]]). Signature: inbound (direct calls) alive, outbound (forwarded web leads) dark.

**Next move (centre-side):** ask Shauna whether StCath had web inquiries in last ~2 weeks + confirm LineLeader/HubSpot still forwards "New Inquiry" emails to our trigger address.

**Tooling note:** read these sheets via the temp-workflow pattern in `/root/sheet-read.py` (creates a throwaway n8n HTTP-Request workflow using Google Sheets cred `yjVHcEWrpyDmxkvv`, hits Sheets API, self-deletes).
