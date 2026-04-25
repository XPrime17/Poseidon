---
name: EG Inbound Workflow Fixes 2026-04-25
description: Five fixes to the EG Inbound End Of Call workflow (3oV7SpPKWmr3xJlQ) addressing Cekura test pollution, duplicates, junk calls, and Skyvern over-firing. Diagnoses staff complaint pattern.
type: project
originSessionId: 3e3105b9-2896-43a9-8f0e-8c6fd1bb8315
---
# EG Inbound Workflow Fixes — 2026-04-25

## Trigger
Staff (Kris/Cassandra) reported (a) "tasks for centres that aren't us" (Canton, etc.), (b) duplicate tasks, (c) unreliable LineLeader bookings, threatened to disable forwarding.

**Why:** Trust crisis — staff stopped working any tasks because they couldn't tell signal from noise. Pilot at risk.

**How to apply:** When staff complains about "wrong centre" tasks, check first whether the from_numbers are non-Canadian Cekura test personas before assuming routing/agent issues. The agent may be working perfectly while test calls pollute downstream lists.

## Diagnosis (the actual root causes)
1. **"Cross-centre contamination" was Cekura test pollution.** All 32 calls in the prior 14 days were correctly on the EG agent. The "Canton" mentions came from Cekura test scripts (Priya Menon persona) intentionally probing whether the agent would fabricate other-centre pricing. Agent correctly refused, but the call summary mentioning "Canton" landed in the live ClickUp list.
2. **Duplicates** = no idempotency on `Create ClickUp Task`. Retell webhook retries → duplicate tasks.
3. **LineLeader unreliability** = (a) Skyvern fired for test calls too, (b) booking-failure alerts went to Scott not staff, (c) `appointment_booked=true` set on soft-holds.
4. **`Detect Test Call` node existed but was incomplete:** computed `_test_label` but `Format ClickUp Task` never used it; routed `_clickup_list_id` correctly but Skyvern branch ignored test detection.

## What got built (workflow `3oV7SpPKWmr3xJlQ`, 18 → 23 nodes)

### Detect Test Call — patched
Added two new classification signals:
- **`CEKURA_PERSONAS` allowlist**: helena ivanov, priya menon, amara oconquo, amara okonkwo, jennifer park, brianna alvarez, rachel goldberg, david chen, alpha, beta, test caller, test user
- **`isJunk` flag**: `duration_ms < 15000 && task_summary === ''`

Output payload now includes: `_is_test`, `_is_junk`, `_drop`, `_clickup_list_id`, `_test_label`, `_call_id`, `_detect_reason`.

### New nodes (5)
| Node | Type | Purpose |
|---|---|---|
| `Drop Junk?` | IF | Stops flow if `_drop=true` (short empty calls) |
| `Search Existing Task` | HTTP GET | Lists tasks in target ClickUp list |
| `Check Duplicate` | Code | Sets `_duplicate=true` if any task body contains the call_id |
| `Duplicate?` | IF | Skips Create if `_duplicate=true` |
| `Skyvern Test Gate` | IF | Skips Appointment Booked branch if `_is_test=true` |

### Format ClickUp Task — patched
- Now actually prepends `_test_label` (was a dead variable before)
- Embeds `_call_id: <id>` at the bottom of the task description so Search Existing Task can find duplicates
- Reads `call` from `$('Inbound Webhook').item.json.body.call` (was `$input.first().json.body.call` which broke once HTTP/IF nodes were inserted upstream)

### Wiring change
```
Detect Test Call → Drop Junk?
  Drop Junk? false → Search Existing Task → Check Duplicate → Duplicate?
    Duplicate? false → Format ClickUp Task → Create ClickUp Task → ...
  Drop Junk? false (parallel) → Skyvern Test Gate
    Skyvern Test Gate true (live only) → Appointment Booked? → Skyvern → ...
```

## ClickUp lists
- **EG live:** `901113422190` — only real Canadian-area-code, non-persona, non-junk, non-duplicate calls land here
- **Test pollution sink:** `901113648956` — Cekura test runs route here automatically
- **Bulk cleanup done 2026-04-25:** 13 polluting tasks marked complete + relabeled with `[CEKURA TEST]` prefix

## Smoke tests (all passed)
1. Priya Menon (persona) → routed to test list `901113648956` with `[CEKURA TEST]` prefix
2. Same call_id fired twice → 2nd fire skipped Create (Duplicate? returned true, `_existing_count=10`)
3. 7-second empty call → dropped at Drop Junk?, no Format/Create

## Still pending (queued for tomorrow)
- Booking-failure alert to Sharmilla (CC her on Email: Booking Failed + create high-priority `booking_failed` ClickUp task)
- Tighten `appointment_booked` post-call schema on LLM `llm_6d77f36696f6fbfad97d03fa5ef8` so soft-holds report `false` and emit `tentative_tour=true`

## Cekura regression cadence (current state)
- **Tier 1 outbound CNKB Full** (agent 13260): monthly, 1st Mon 6 AM ET
- **Tier 2 outbound smoke** per centre (Canton, Stone Oak, Round Rock, Rayford, Burlington, Pickering, Leaside, Riverside): bi-weekly Wed 6 AM ET, 5-min staggered slots
- **EG Inbound (agent 16633): NO scheduled cron — all runs manual.** Worth adding bi-weekly Wed 6:40 AM ET smoke (Happy Path + KB-Boundary).
