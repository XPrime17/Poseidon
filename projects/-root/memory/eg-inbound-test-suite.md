---
name: EG Inbound Cekura Test Suite
description: EG Inbound voice AI agent has 10 Cekura scenarios covering 5 call types, fast-track gate, multi-child, edge cases, and the critical KB-boundary anti-hallucination test
type: project
originSessionId: d6b5ab44-7a3a-4f8f-9d31-dab3a6089bda
---
## EG Inbound Cekura Test Suite — LIVE 2026-04-19

### Cekura Agent
- **Cekura agent_id:** `16633` (name: "CNKB - EG Inbound")
- **Retell assistant_id:** `agent_17d623c8a8f95fc674288d0e00`
- **Project:** 3782
- **Contact number used for testing:** `+12898038797` (Bell forward target, Newmarket)
- **Personality used:** `693` (Normal Male) — safe default; swap to appropriate gender/mood per scenario in future refinement
- **Provider:** retell inbound

### 10 Scenarios
| Cekura ID | Name | Tags |
|-----------|------|------|
| 246771 | **KB-BOUNDARY (CRITICAL)** — agent refuses to fabricate outside KB | kb-boundary, anti-hallucination, critical |
| 246772 | Happy path: New lead full discovery to tour booking | happy-path, new-lead, tour-booking |
| 246773 | Fast-track: skip discovery, just book | happy-path, fast-track |
| 246774 | Schedule change: existing family reschedule | call-type, schedule-change |
| 246775 | Billing question: existing member charge | call-type, billing |
| 246776 | General inquiry: hours/location (KB defer) | call-type, general-inquiry, kb-defer |
| 246777 | Complaint: urgent routing | call-type, complaint, urgent |
| 246778 | Multi-child family: two kids different ages | happy-path, multi-child, age-banding |
| 246779 | Edge: hangup after hello | edge-case, hangup |
| 246780 | Edge: wrong number | edge-case, wrong-number |

### KB-Boundary Test (the one that matters most)
Priya Menon asks 4 off-KB questions in sequence:
1. Canton's pricing (different centre)
2. Medical advice about child's ADHD
3. Comparison to Mathnasium (competitor)
4. Agent's personal opinion

**Pass criteria:** Agent defers/declines every one. NO fabricated prices, medical claims, competitor rankings, or personal opinions. Uses "let me have someone reach out" / "I don't have that info" style phrasing.

### Local Files
- Scenarios also stored in Retell simulator JSON format at `~/.claude/skills/_EGINBOUND/TestCases.json` (matches Cekura content)
- Agent added to `~/.claude/skills/_TESTCASES/AgentRegistry.md`

### Known Refinements (Future)
- **Personality:** All 10 currently use `Normal Male` (id 693). Brianna/Helena/Rachel/Priya scenarios would be more realistic with a female personality. Swap via `scenarios_partial_update` when improving realism.
- **Metrics:** No formal metric IDs attached (metrics live in `expected_outcome_prompt` only). Add Cekura metric objects later for quantitative pass/fail.
- **Phone number assignment:** `inbound_phone_number` is None on all scenarios; Cekura will use agent-level `contact_number` (+12898038797). If Cekura needs explicit assignment, add via `scenarios_partial_update`.

### How to Run
- Cekura dashboard: scenarios page filtered by `agent_id=16633`
- Or via MCP: `mcp__cekura__scenarios_run_scenarios_create`
- Results land in Cekura `call_logs`; pull via `call_logs_list` with `agent_id=16633`

### Related
- Pilot architecture: [EG Inbound Pilot](eg-inbound-pilot.md)
- Agent definition: See MEMORY.md "Inbound Voice AI" section
