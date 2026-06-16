---
capture_type: LEARNING
timestamp: 2026-04-25 17:32:18 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-04-25
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

## 5. EXECUTE

Stopping here — I have enough evidence to diagnose. Time to present root causes and confirm scope before touching anything.

## 6. VERIFY

Cross-checked four data sources: 26 ClickUp tasks, 32 Retell calls, full n8n workflow JSON, recent executions. Findings reconcile cleanly.

---

### 🩺 Root Cause Analysis

**Staff has THREE complaints. They have THREE different causes — and "Canton" isn't what staff thinks it is.**

#### Problem 1: "Tasks for centres that aren't us" — actually CEKURA TEST CALLS leaking into the live list
- **All 32 calls in the last 14 days were correctly routed to the EG agent** (`agent_17d623c8a8f95fc674288d0e00`) on EG numbers (`+12898038797`, `+12899030611`). Zero cross-centre call routing.
- The "Canton" reference staff sees is in the *Priya Menon* task body: a **Cekura test persona** scripted to ask about pricing at the Canton location. The agent correctly answered "I only have EG info." But the call summary still mentions Canton, which reads to staff like a real Massachusetts caller.
- The same applies to Amara Oconquo (`+18646607381` — South Carolina), Helena Ivanov, Jennifer Park, Brianna Alvarez, David Chen, Rachel Goldberg — all from non‑Canadian area codes, all calling within seconds of each other in two big bursts (Apr 17 & Apr 23). **These are your scenario test runs.**
- The workflow *does* have a `Detect Test Call` node that routes non‑Canadian area codes to a separate test list (`901113648956`). It exists but is too late — most of the polluting tasks predate it, and the `[CEKURA TEST]` label is captured but **never actually prepended to the task name** (bug at `Format ClickUp Task` line: `const testLabel = ... || ''` — variable unused).

#### Problem 2: Duplicate tasks — no idempotency
- Two "Alpha" tour bookings created 50 minutes apart (`868hzaa1p` + `868hzadwq`), same Friday Apr 3 5pm slot.
- Two identical "Unknown Caller — hung up immediately" tasks 2 minutes apart (`868ja1e2d` + `868ja1ebr`).
- **Cause**: `Create ClickUp Task` does not check whether a task with that `call_id` already exists. Retell retries `call_analyzed` if the webhook 5xx's or times out → duplicate task. Format code captures `callId` but throws it away.

#### Problem 3: Unreliable LineLeader (Skyvern) bookings
Three issues stacked:
1. **Skyvern fires for test calls too.** The `Appointment Booked?` branch runs in parallel with `Format ClickUp Task` from `Detect Test Call` — but it doesn't read `_is_test`. So Cekura test bookings hit real LineLeader.
2. **No staff‑visible failure alert.** `Email: Booking Failed` exists but goes to Scott, not Sharmilla, so when a tour fails to land, the staff has no idea — they just see no LineLeader entry.
3. **Soft-holds count as "booked".** The post-call schema sets `appointment_booked=true` whenever the agent says "I'll hold that slot" even when it wasn't finalized. Some of these *can't* be booked in LineLeader because the slot isn't real or the email is missing.

#### Bonus: Junk calls become tasks
The `+17623566401` ("Tony's Auto") wrong-number caller and the 7-second hangups all create `[Other] Unknown Caller` tasks. There's no minimum-duration / minimum-transcript gate.

---

### 🛠 Proposed Fix Plan

| # | Fix | Where | Stops what staff sees |
|---|-----|-------|----------------------|
| **1** | **Bulk-close the 11 Cekura-test tasks already in the list** | ClickUp | Immediate signal recovery for staff |
| **2** | **Add caller_name allowlist** (Helena Ivanov, Priya Menon, Amara Oconquo, Jennifer Park, Brianna Alvarez, Rachel Goldberg, David Chen, "Alpha", "Beta") to Detect Test Call → hard-block from EG list | n8n workflow `Detect Test Call` | Future Cekura runs stop creating live tasks |
| **3** | **Idempotency check**: before `Create ClickUp Task`, search list for a task containing the `call_id` in description; if found, skip | n8n workflow, new node before Create | Kills duplicates |
| **4** | **Gate Skyvern by `_is_test`**: add IF node before `Appointment Booked?` so test calls never hit LineLeader | n8n workflow | LineLeader stops getting fake tour requests |
| **5** | **Junk-call filter**: drop calls with `duration_ms < 15000` AND empty `task_summary` | n8n, after Detect Test Call | No more "[Other] Unknown Caller — 7 sec hangup" noise |
| **6** | **Add booking-failure alert to Sharmilla** (CC her on `Email: Booking Failed` + create high-priority ClickUp task tagged `booking_failed`) | n8n `Email: Booking Failed` + new ClickUp create | Staff knows when a tour didn't land |
| **7** | **Tighten `appointment_booked` post-call schema** so soft-holds report `false` and emit a separate `tentative_tour=true` field handled by the EOC workflow as "needs human confirmation" | LLM `llm_6d77f36696f6fbfad97d03fa5ef8` | Fewer false "booked" tasks |

---

### ⚠️ Recommendation on the forwarding question

**Don't have Sharmilla kill forwarding.** The agent itself is fine — every call landed on the right agent. The failures are downstream in the n8n workflow and easily fixed. If she disables now, real EG inbound calls go to voicemail and the pilot dies.

Hotfixes #1–#5 are 60–90 minutes of work and address every concrete staff complaint. #6 and #7 can ship tomorrow.

## 7. LEARN

- **The Detect Test Call node is half-built**: routing logic is there, but the label is never used and the Skyvern branch ignores it entirely. Worth a memory entry.
- **Cekura test personas are uniquely identifiable** by name (Helena/Priya/Amara/Jennifer/Brianna/Rachel/David Chen) — caller_name allowlist is more reliable than area-code heuristics.
- **Staff perception ≠ technical reality**: "we're getting tasks for other centres" actually meant "summaries mention other cities because Cekura personas ask about them" — important to investigate before believing the framing.

</details>
