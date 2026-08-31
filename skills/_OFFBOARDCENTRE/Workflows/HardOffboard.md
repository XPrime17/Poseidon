---
name: HardOffboard
description: Terminal offboarding. Soft + releases Twilio number, archives KB doc, archives ClickUp folder, archives Cekura scenarios. IRREVERSIBLE. Run via Tools/Offboard.ts --mode hard.
---

# Hard Offboard — Terminal

**When to use**: Centre is 100% done, no chance of reactivation, and you want costs to go to zero (Twilio number = ~$1.15/mo).

**⚠️ Irreversible**: Twilio number released, Cekura scenarios archived (Cekura may not support unarchive). Use soft mode unless certain.

## Pre-flight

Same inventory print as soft, PLUS:

1. **Double-confirm** — hard mode prompts twice. The second prompt enumerates the irreversible actions explicitly:
   - "About to RELEASE Twilio number +XXXXXX. This number returns to the carrier pool and CANNOT be retrieved."
   - "About to ARCHIVE KB doc <title>. Reversible via Drive UI."
   - "About to ARCHIVE Cekura scenarios (N total). Reversibility depends on Cekura platform support."
2. Skip both prompts only with `--yes --hard-i-know`. (Two flags required for hard mode auto-confirm.)

## Execution Order

Steps 1-5 are identical to soft offboard (drain leads, disable lookup, rename agent, unbind phone, generate exit report). Then:

6. **Release Retell phone number**:
   - DELETE `/delete-phone-number/{phone_number}` — this is the Twilio release
   - Confirm 200 response, log released number to audit
7. **Archive KB Google Doc**:
   - Read current title via GDocs Read credential `NZddHLft1gzuUrRL`
   - Rename via GDocs Write credential `hTsOcQ3CNsZ5e1xQ`: prefix `[ARCHIVED-YYYY-MM-DD] `
   - If n8n GDocs is unavailable: skill prints the doc URL + target title and asks Scott to do it manually in Drive UI
8. **Archive ClickUp folder** (if exists):
   - Find folder by name (location_name from lookup) under space `90114119602`
   - PUT `/api/v2/folder/{folder_id}` body `{"archived": true}`
   - Skip with `[no-op: folder not found]` if no ClickUp footprint
9. **Archive Cekura scenarios**:
   - List scenarios via `mcp__cekura__scenarios_list` filtering by agent_id
   - If count > 0: create folder via `mcp__cekura__scenarios_folder_create` named `[Archived] <agent_name>`
   - Move each scenario into that folder via `mcp__cekura__scenarios_folder_move`
   - Log scenario IDs to audit
10. **Audit log** — append final JSONL line with `mode=hard`, `actions=[full list]`, irreversible flag set true

## Verification

- `curl -s https://api.retellai.com/v2/list-phone-numbers -H "Authorization: Bearer $RETELL_API_KEY" | jq '.items[] | select(.phone_number=="<PHONE>")'` — should return null (number released)
- KB doc title in Drive starts with `[ARCHIVED-`
- ClickUp folder shows `archived=true` in API response
- Cekura scenarios moved to archive folder

## What is NOT auto-deleted

- The Retell agent itself (kept for transcript history — agents are free to keep around)
- The KB Google Doc (renamed only — original content preserved)
- The Leads MasterSheet rows (cancelled but historical record retained)
- The Centre Lookup Sheet row (set to `enabled=FALSE`, not deleted)

This is intentional. Hard offboard releases ongoing costs (phone number) and removes operational clutter (Cekura scenarios, ClickUp folder). Historical/auditable artifacts are preserved.

## Reactivate after Hard?

Not via this skill. Hard offboard means:
- New Twilio number must be purchased + bound
- KB doc title must be manually un-prefixed (or rebuilt)
- Cekura scenarios must be manually unarchived
- ClickUp folder unarchive

If the centre comes back: re-onboard fresh via existing provisioning. The exit report's `inventory.json` provides the historical config to mirror.
