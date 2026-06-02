---
name: cekura-tier1-false-positive-classes
description: "Tier-1 CNKB regression (agent 13260, cron 427) re-alarms monthly from 3 known test-harness false-positive classes, not agent bugs"
metadata: 
  node_type: memory
  type: project
  originSessionId: f97eda90-c2b6-49b4-a696-b1faff9ecc35
---

Tier-1 CNKB Full Regression on Cekura (agent 13260, cron job 427, runs 1st Monday 6am ET) reports a low pass rate every month from **test-harness defects, not agent regressions**. The 2026-06-01 run (result 595630) dropped to 42.86% (vs 57.14% May, result 507992) with ZERO real agent regressions. Three recurring false-positive classes:

Shared project-level (project 3782) metrics, each `trigger: always` across 22 agents: **118268 Tour Booking Success**, **118270 Slot Validation Accuracy**, **118271 AI Disclosure Handling**. Each is `binary_workflow_adherence` — **any of them scoring 0 fails the whole run**, even when the per-scenario continuous **Expected Outcome (118041)** scores 5. Don't edit these shared metrics (blast radius = all 22 CNKB clones + EG-inbound 16633); fix per-scenario by trimming the inappropriate metric from `scenario.metrics`.

1. **Slot Validation Accuracy (118270) can't see SLOTS** — SLOTS lives in test_profile.information but isn't passed to the *evaluator*, so the judge scores 0 ("impossible to verify"). Nondeterministic: same behaviour passed May, failed June. Expected Outcome already checks slot-correctness per-scenario, so 118270 is redundant noise on Tier-1.

2. **Tour Booking Success (118268) on no-booking scenarios** — scores 0 when the agent correctly does NOT book (Junior 213666, age-gate 4yo 248224, 5yo 248225, screening 139034). NOT booking is correct. Mirrors "agents book TOURS only" / Junior-deflection rules.

3. **AI Disclosure Handling (118271)** — flaky binary gate on EG-based Tier-1 (passed 139033=5, failed 139032=0 same suite); EG "Cimo" has no AI-disclosure mandate (only StCath does, [[stcath-custom-intro-2026-05-25]]).

4. **Stale age-7 scenario (248703)** — June evaluated against OLD policy ("7=Create"); agent now correctly routes 7yo→Junior per [[create-age-range]]. The scenario's STORED expected_outcome_prompt is already the NEW policy (tagged fix-2026-05-23), so it self-heals on the next scheduled run — no edit needed; the June fail was a stale snapshot.

**APPLIED 2026-06-02 (scenario-scoped, agent 13260 Tier-1 only):** removed 118268 from 213666/248224/248225/139034; removed 118270 from 139032/139033/248226/139034; removed 118271 from 139032/139033/139034. Projected pass rate ~16/21 (76%), ~17/21 once 248703 self-heals. Remaining genuine fails: 139031 + 213662 (no-KB-in-test-harness, pricing not delivered — [[kb-dynamic-injection]]), 213663 (em-dash style), 213664 (info-overload bundling).

Diagnosis pattern: when a run shows **Expected Outcome score=5 but evaluation_status=failure**, a critical secondary metric (Slot Validation / Tour Booking Success) is the driver — almost always one of the above. Genuinely real chronic items are minor: 213664 (info-overload bundling) and 213663 (em-dash usage). Pricing-not-delivered fails (139031, 213662) are the known no-KB-in-test-harness artifact — CNKB outbound KB is injected via n8n at call time ([[kb-dynamic-injection]]), absent in Cekura runs.
