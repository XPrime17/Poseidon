---
name: Reactivate
description: Undo a soft offboard. Reads inventory.json from the exit report, restores Centre Lookup enabled flag, agent name, phone bindings. Drained leads stay cancelled.
---

# Reactivate — Undo Soft Offboard

**When to use**: A soft-offboarded centre wants back in. Hard offboards cannot be reactivated through this workflow — re-onboard from scratch.

## Pre-flight

1. Find the most recent exit report: `/root/offboard-archives/<centre_id>-*/inventory.json`
   - If multiple, use the latest by date
   - If none found: ERROR — cannot reactivate without inventory snapshot
2. Verify the offboard was soft (check audit log):
   - `grep '"centre_id":"<X>"' /root/offboard-archives/log.jsonl | tail -1`
   - If last entry has `mode=hard` → ABORT, instruct Scott to re-onboard fresh
3. Print proposed restoration plan
4. Confirm

## Execution Order

1. **Restore Centre Lookup Sheet**: set `enabled=TRUE`
2. **Restore agent name**:
   - GET current agent_name
   - Strip `[OFFBOARDED-YYYY-MM-DD] ` prefix → original_name from inventory
   - PATCH agent
3. **Restore phone bindings**:
   - From inventory.json, read original `outbound_agent_id` and `inbound_agent_id`
   - PATCH `/update-phone-number/{phone_number}` with original values
4. **Audit log**: append JSONL line `{"mode":"reactivate","reactivated_from":"<exit_report_path>",...}`

## What is NOT restored

- **Drained leads stay cancelled.** Re-onboarding starts with a fresh lead pipeline.
- **Reason**: drained leads were marked `cancelled_offboard` weeks/months ago — re-running them is stale and noisy. If centre wants to re-engage those specific leads, they re-submit via CORE.

## Verification

- `enabled=TRUE` in Centre Lookup
- Agent name matches `inventory.json`'s original
- Phone bindings match
- Place a test call via centre's `test_number` to confirm full pipeline works

## Failure Mode: Drift

If between offboard and reactivate someone manually changed:
- The agent prompt → reactivate doesn't touch prompts (preserves manual updates)
- The KB doc → no-op (KB doc was untouched in soft mode)
- The phone number → ERROR if phone number no longer exists in Retell

Reactivate restores the BINDINGS, not the content. Content drift is expected and welcome.
