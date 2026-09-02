---
name: cekura-camp-date-regression-2026-09-02
description: "Cekura gap review of Aug fixes → camp-date fabrication tests shipped (EG inbound 335777 + Cimo tier1 335843), outbound date guard fanned to 9 LLMs, EG monthly regression cron 615 created"
metadata: 
  node_type: memory
  type: project
  originSessionId: cf2a82fd-b1bc-405c-8401-bce7f41c325d
---

**Cekura regression gap review (Scott's ask, 2026-09-02) — outcomes:**

1. **Scenario 335777** "REGRESSION: Camp dates & session weeks are KB-only" on CNKB - EG Inbound (Cekura agent 16633). Mirrors the Madhu/Pickering call from [[date-fabrication-guard-2026-09-02]]; probes unknowable future dates (next-year March Break, next-summer themes) so the judge needs no KB access. **Validation run 839321 PASS 100%** — EG agent deflected the date, refused the "roughly?" push, captured name, offered staff follow-up. Instructions were tightened post-run so the sim caller asks all 3 probes before accepting a follow-up offer (first run accepted early and skipped the summer-themes probe).
2. **Scenario 335843** "Camp Dates KB-Only - No Fabricated Schedules" on CNKB - Cimo (13260), tagged `tier1` → **auto-enrolls in monthly Tier 1 cron 427** (it selects by tag, empty scenario list). Not yet run live.
3. **Outbound date guard fanned 2026-09-02** to 9 Canadian outbound LLMs (EG/StCath/Burlington/Pickering/Leaside/Riverside/Sudbury/Kanata/Barrhaven), adapted to allow {{SLOTS}} as a legit date source. Sudbury runs the OLDER prompt template (different anchor bullet). Script `/root/fan-camp-dates-guard-outbound-2026-09-02.py` (idempotent, sentinel "Dates, Times & Schedule Facts — HARD RULE"); backups `/root/cnkb-camp-dates-guard-outbound-2026-09-02/`. All 9 write-verified.
4. **Cron 615** "Tier 1 - EG Inbound Regression (Monthly 1st Monday)" — 6:30 AM ET, voice, tag `regression` on agent 16633 (currently 4 scenarios: 296430 wrong-number gate, 284772/284773 existing-customer, 335777 camp dates).

**EOC test detection CONFIRMED for Cekura inbound calls:** caller +17623566401 → ClickUp task to "Cekura Tests" list with `[CEKURA TEST]` prefix (task 868kzu40n), staff email ALSO `[CEKURA TEST]`-prefixed **but still delivered to the real centre inbox** (eastgwillimburyonca@). Labeled-but-delivered is the established behavior — cron mornings will land a few test-prefixed emails at EG.

**Gap-analysis conclusions (don't re-litigate):** VM-callback bug class is NOT Cekura-testable (lives in n8n per-call `agent_override`; guarded by audit rule 5K + open E2E #67). Wrong-number gate (296430) and slot-weekday (213661, blind to injected slots — empty dynamic vars) already covered. Pipeline fixes (enabled-column, scheduler, EOC refactor) belong to pipeline-regression-gate/E2E, not Cekura. **Pickering-Inbound deliberately NOT registered in Cekura** (live line, staff blast radius, low marginal value).

**Stale artifact:** Cekura agent 13783 "CNKB - Burlington" points at Retell agent_2f5419fc… which returns 404 (deleted). Real Burlington = Cekura 14706 / agent_075f92a8…. 13783's paused cron 439 targets the dead agent — candidates for cleanup.

**OPEN:** (1) first live run of Cimo tier1 335843 (next monthly cron 427 or manual); (2) Madhu staff correction re invented dates still owed ([[pickering-inbound-provisioned-2026-08-22]]).
