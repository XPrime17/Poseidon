---
name: cekura-biweekly-regression-personas
description: "The recurring \"Jamie/Lucas\", \"Leo\", \"Sam\" outbound calls are Cekura test personas, not real leads"
metadata: 
  node_type: memory
  type: reference
  originSessionId: db1a3853-2f45-40ef-b5ba-1b3901d106ea
---

The recurring outbound calls that dominate CNKB agent logs are **Cekura simulation runs**, NOT real leads and NOT n8n seeded test rows.

**How to recognize them (all confirmed on call_21c8ce03… Riverside, 2026-07-15):**
- Scripted persona on the user side — deterministic lines: "This is Jamie… my son Lucas, nine, loves Minecraft… weekend mornings… Saturday at ten AM works perfectly." Also personas "Leo age 10" (no-slot → staff followup) and "Sam wants Riverside/Kanata" (wrong-location).
- **Fixed destination numbers reused across every centre**: `+13682101298` (Jamie/Lucas), `+18647326888` (Leo / wrong-location). These are Cekura persona numbers the agent dials.
- `metadata: null` and `retell_llm_dynamic_variables: null` → proves it's NOT the production n8n lead-dial (which injects lead name/program/location dynamic vars).
- **Biweekly Wednesday ~10:35 UTC cadence** (…06-17, 07-01, 07-15…), same personas each run.

Distinct from the [[e2e-leadflow-regression-harness-2026-06-24]] n8n canary (fixture row `regression-test` → Scott's cell, weekly Thu). The daily audit already filters Cekura tests.

**Apply:** when summarizing call volume, label these as Cekura regression traffic and exclude from "real lead" counts — real organic outbound is much sparser (summer lull, see [[outbound-seasonality]]).
