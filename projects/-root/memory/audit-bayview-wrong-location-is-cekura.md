---
name: audit-bayview-wrong-location-is-cekura
description: "An outbound \"Wrong Location — wants Bayview\" call is the Cekura 141951 test scenario, NOT a real mis-routed lead — check dynamic vars before flagging"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 546ea15a-9b3d-4de1-8986-da9f2129038a
---

The EG-outbound call `call_8f1b380abeab2c1e994abc94456` (to +18643020555, "I wanted the Code Ninjas on Bayview Avenue") looks like a real cross-centre mis-route — Bayview Ave IS our Leaside centre's real address (1386 Bayview Ave). But it is the **Cekura regression scenario 141951 "Wrong Location - Wants Bayview"**, not a production lead.

**Tell:** pull `retell_llm_dynamic_variables` from the call — `first_name=CEKURA_TEST`, `PHONE=+15555550100` (placeholder), stale SLOTS = synthetic test. The outbound EOC `Skip Cekura Tests` IF node suppresses the wrong_location email for these, so no leak.

**Rule:** before flagging any outbound call as a real lead/routing issue, check `retell_llm_dynamic_variables.first_name` for `CEKURA_TEST`. The daily audit (`audit.py`) already cross-references Cekura runs; the **weekly** audit pass does not — apply the same `first_name==CEKURA_TEST` filter there so test scenarios aren't reported as production issues. Fits the [[cekura-tier1-false-positive-classes]] / [[audit-rubric-patches-2026-05-26-31]] family.

**Latent (not active) gap worth remembering:** if a REAL lead ever wants an own-centre by name (e.g. Leaside/"Bayview"), the `wrong_location` handoff in the outbound EOC emails the *dialing* centre's centre_email, not the named centre — so the AI's "the Bayview team will reach out" promise wouldn't auto-route to Leaside. No real call has hit this; revisit only if one does.
