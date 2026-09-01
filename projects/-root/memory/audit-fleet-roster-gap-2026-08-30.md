---
name: audit-fleet-roster-gap-2026-08-30
description: Daily audit was blind to 13/28 calls — Kanata/Barrhaven outbound + 4 inbound agents missing from AGENTS roster; fixed + inbound tool-slots fed to LLM judge
metadata: 
  node_type: memory
  type: project
  originSessionId: 84d6f59c-d934-494e-8775-cec8606a97fc
---

**Found 2026-08-30 while tracing "a booking just happened":** the booking came from **CNKB-Kanata outbound** (`agent_aac09671305b8903483ceee6df`) — an agent the nightly `audit.py` never fetched. Roster was 13 agents; the fleet is 19. Missing: Kanata + Barrhaven outbound, and StCatharines-Inbound (`agent_fa924598caf3662856ac3cea3b`), Burlington-Inbound (`agent_7950e8ff24a902abfd3d5b34cc`), Kanata-Inbound (`agent_c3d64fc094dccb0fa486bde5f9`), Leaside-Inbound (`agent_50a754cd5b9ba4ec988c764427`). That 48h window: audit saw 15 calls, reality was 28. **Kanata outbound is LIVE with real leads** (nobody flipped the audit when it went live).

**Fixed same night (commits `072de6c` + skill-doc update):** all 6 added to `AGENTS` + `INBOUND_CENTRES`; Cekura ids Kanata=18978, Barrhaven=21487 (4 inbound agents have NO Cekura coverage); `_DAILYCALLAUDIT/SKILL.md` table updated. `INBOUND_WORKFLOWS` entries for the 4 new inbound centres NOT added (ClickUp handoff-verify skips them gracefully) — add when list ids are confirmed.

**Second fix in same commit:** inbound agents fetch slots via `get_tour_slots` TOOL calls (no SLOTS dynamic var), so the LLM judge saw "no slots injected" and false-HIGHed correct slot readbacks (2 fake HALLUCINATIONs on Leaside-Inbound call_bc0fb5c…, 8/29). `fetch_transcript` now captures `transcript_with_tool_calls` tool results and merges "tour times" content into the judge's ground truth. Verified: re-run dropped those 2 flags. Same lesson-shape as [[audit-llm-slots-groundtruth-2026-08-18]], one layer over: **every slot source (dynamic var AND tool result) must reach the judge.**

**Lesson (process) — RESOLVED STRUCTURALLY 2026-08-31 (Scott approved):** the audit is now **fail-visible**: it fetches calls **org-wide** (v3 list-calls, no agent filter; filter schema `start_timestamp={type:"number",op:"ge",value:ms}` — the v2 `lower_threshold` shape 400s on v3) and any call from an agent not in `AGENTS` raises a nightly HIGH "Unregistered agent" issue instead of vanishing (commit `a9da475`). `AGENTS` is now only the id→name map. Also added `AUDIT_DRY_RUN=1` (artifacts, no email) — use it for testing instead of spamming Scott. Live-tested by de-registering Barrhaven → flag fired; restored → clean 29/29. Onboarding belt-and-braces: `onboard-centre.ts` internal checklist email now has Task 5 "Register agent(s) in the Daily Call Audit" (lead-reactivation `ace9230`).

**Known noise left as-is:** (1) SCHEDULER_LAG MEDIUMs fire on day+1 retry gaps that are BY DESIGN under [[retry-cadence-ab-2026-06-10]] (rule expects 90-min cadence) — recurring false positives, candidate for cadence-aware threshold. (2) Voicemail-misdetection heuristic flagged the BOOKED interactive Kanata call (short user turns + prior VM on same number) — false positive.
