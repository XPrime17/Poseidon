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

## What got built (workflow `3oV7SpPKWmr3xJlQ`, 18 → 25 nodes)

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

## Fix #6 — Test Booking → CRM Cancel Task safety net (added later same day)

If a Cekura test slips past the test-detection gate AND sets `appointment_booked=true`, a high-priority ClickUp task is auto-created in the **live** EG list (`901113422190`) so staff can manually delete the bogus CRM entry. CRM-agnostic naming so it survives the LineLeader → HubSpot migration.

**New nodes (2):**
| Node | Type | Purpose |
|---|---|---|
| `Test Booking?` | IF | `_is_test=true AND appointment_booked=true` |
| `Create Cancel Task` | HTTP POST | Title `[CANCEL CRM TOUR] {name} — {date} {time}`, priority urgent, tags `cancel_required` + `cekura_test_leak`, assigned to Alex + Jenn |

**Wiring:** Skyvern Test Gate's previously-empty FALSE branch now routes to `Test Booking?`. So defense in depth: gate stops Skyvern from firing, AND if the agent itself reported a booking the cancel task fires anyway.

**Backfill 2026-04-25 (one-time cleanup):** 5 cancel tasks created for the 6 historical EG inbound test bookings found via 60-day audit (2 Helena calls deduped to one entry):
- `868jd7zmf` Helena Ivanov May 1 5 PM
- `868jd7zmg` David Chen May 1 5 PM
- `868jd7zmj` David Chen May 2 10 AM
- `868jd7zmk` Jennifer Park May 2 11 AM
- `868jd7zmm` Alpha (Scott's number) May 2 10 AM

Backfill tasks tagged `backfill_2026_04_25` to distinguish from organic future cancels. Body says "if not found in CRM, mark complete + comment 'not found'" so staff can close cleanly even if the booking never landed.

**Outbound CNKB clones (Tier 2 smokes) had 42 `appointment_booked=true` test calls in same 60d window — no LineLeader risk because outbound has no Skyvern wiring.** Only inbound + Skyvern-gated agents need cancel-task pathway.

## Smoke tests (all passed)
1. Priya Menon (persona) → routed to test list `901113648956` with `[CEKURA TEST]` prefix
2. Same call_id fired twice → 2nd fire skipped Create (Duplicate? returned true, `_existing_count=10`)
3. 7-second empty call → dropped at Drop Junk?, no Format/Create
4. Helena Ivanov persona + appointment_booked=true → Skyvern blocked, Cancel Task created in EG live list with urgent priority + correct CRM-cancellation body

## Still pending (queued for tomorrow)
- Booking-failure alert to Sharmilla (CC her on Email: Booking Failed + create high-priority `booking_failed` ClickUp task)
- Tighten `appointment_booked` post-call schema on LLM `llm_6d77f36696f6fbfad97d03fa5ef8` so soft-holds report `false` and emit `tentative_tour=true`
- Replicate full safety-net pattern (Detect Test → Drop Junk → Dedup → Skyvern Gate → Cancel Safety Net) into the Leaside inbound EOC workflow once Sharmilla activates forwarding

## Cekura regression cadence (current state)
- **Tier 1 outbound CNKB Full** (agent 13260): monthly, 1st Mon 6 AM ET
- **Tier 2 outbound smoke** per centre (Canton, Stone Oak, Round Rock, Rayford, Burlington, Pickering, Leaside, Riverside): bi-weekly Wed 6 AM ET, 5-min staggered slots
- **EG Inbound (agent 16633): NO scheduled cron — all runs manual.** Worth adding bi-weekly Wed 6:40 AM ET smoke (Happy Path + KB-Boundary).
