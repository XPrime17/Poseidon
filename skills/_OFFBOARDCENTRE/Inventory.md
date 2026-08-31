---
name: Inventory
description: Per-resource SOP listing every touchpoint that must be handled when offboarding a centre. Loaded by Offboard workflows.
---

# Centre Resource Inventory

Each centre has up to 9 active touchpoints in the voice AI pipeline. This file is the source of truth for what exists per centre and how to mutate each one.

## 1. Centre Lookup Sheet

- **What**: Routing table that gates which centres receive new leads
- **Sheet ID**: `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`
- **Tab**: default (Sheet1)
- **Columns**: A=centre_id, B=timezone, C=enabled, D=location_name, E=from_number, F=Testing, G=test_number, H=centre_email, I=Director, J=agent_id, K=knowledge_base
- **Mutation on offboard**: set `enabled=FALSE`
- **Mutation on reactivate**: set `enabled=TRUE`
- **How**: temp n8n webhook with Google Sheets `update` operation, matching on `centre_id`. Credential IDs read from `$N8N_SHEETS_READ_CRED_ID` / `$N8N_SHEETS_WRITE_CRED_ID` env vars.

## 2. Leads MasterSheet (open leads)

- **What**: Active lead queue. Open statuses: `retry_pending`, `calling`. Closed: `completed`, `cancelled_offboard`, etc.
- **Sheet ID**: `1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`
- **Tab**: `All Centres`
- **Match**: `centre_id` column A
- **Mutation on offboard**: for each row where `status IN ('retry_pending','calling')` AND `centre_id = X`: set `status='cancelled_offboard'`, `last_outcome='offboarded_<DATE>'`
- **Mutation on reactivate**: NO-OP. Cancelled leads stay cancelled — re-onboarding starts fresh.
- **How**: temp n8n webhook with `appendOrUpdate`, matching on `lead_id`. Schema rule: include ALL columns or set unused as `removed: true` (see MEMORY.md "Google Sheets Write Pattern").

## 3. Retell Agent

- **What**: The voice AI agent itself. Has prompt (on LLM), voice config, post-call analysis schema.
- **API**: `https://api.retellai.com/update-agent/{agent_id}` (PATCH)
- **Auth**: `Authorization: Bearer $RETELL_API_KEY`
- **Mutation on offboard**: PATCH `agent_name` → `[OFFBOARDED-YYYY-MM-DD] <original_name>`
- **Mutation on reactivate**: strip `[OFFBOARDED-YYYY-MM-DD] ` prefix
- **Reasoning**: Don't delete. Keeps audit trail, transcript history accessible, and supports reactivate.

## 4. Retell Phone Number

- **What**: Twilio number bound to a Retell agent for outbound (and optionally inbound)
- **API list**: `GET https://api.retellai.com/v2/list-phone-numbers` (results under `items`)
- **API patch**: `PATCH https://api.retellai.com/update-phone-number/{phone_number}` body `{"outbound_agent_id": null, "inbound_agent_id": null}`
- **API delete**: `DELETE https://api.retellai.com/delete-phone-number/{phone_number}` (releases Twilio number)
- **Mutation on soft**: PATCH to clear `outbound_agent_id` (and `inbound_agent_id` if set). Number stays purchased.
- **Mutation on hard**: DELETE the phone number entirely. Number returns to Twilio carrier pool. **Irreversible.**
- **Mutation on reactivate**: PATCH to re-bind original `outbound_agent_id` from inventory file.

## 5. Knowledge Base Google Doc

- **What**: The authoritative content source for the agent's prompt (KB injected dynamically at call time)
- **URL**: `https://docs.google.com/document/d/{doc_id}/edit` (in Centre Lookup Sheet column K)
- **Mutation on soft**: NO-OP. Doc stays accessible.
- **Mutation on hard**: rename doc title → `[ARCHIVED-YYYY-MM-DD] <original_title>`. Move to "Archived KBs" Drive folder if accessible.
- **How**: n8n GDocs Write credential `hTsOcQ3CNsZ5e1xQ` via temp workflow, OR manual fallback (print URL + new title, ask Scott to rename in Drive UI).
- **Side effect**: KB Crawler reads `enabled` from Centre Lookup Sheet → automatically skips disabled centres regardless of doc state.

## 6. ClickUp Folder/List

- **What**: Per-centre folder under Voice AI space. Contains "Inbound Tasks" list, "Outbound Tasks" list. Only created if centre had ClickUp integration (mostly inbound centres).
- **API**: ClickUp API token via `$CLICKUP_API_TOKEN` env var (1Password)
- **Workspace**: `9011711565`
- **Voice AI Space**: `90114119602`
- **Folder lookup**: `GET https://api.clickup.com/api/v2/space/90114119602/folder` → match by name (e.g. "EG", "Leaside")
- **Mutation on soft**: NO-OP
- **Mutation on hard**: PUT folder with `archived: true` via `PUT /api/v2/folder/{folder_id}` body `{"archived": true}`
- **Existence check**: NV centres (Canton, Rayford, Stone Oak, Round Rock) had no inbound — likely no ClickUp folders. Skill must skip gracefully if folder not found.

## 7. Cekura Test Scenarios

- **What**: Test cases bound to a Retell agent for QA. Live in Cekura test profiles.
- **Tool**: `mcp__cekura__scenarios_list` (filter by agent_id), `mcp__cekura__scenarios_partial_update`
- **Mutation on soft**: list and report only — no mutation.
- **Mutation on hard**: enumerate scenarios where `agent_id = X`, move to folder named "[Archived] <agent_name>" via `mcp__cekura__scenarios_folder_create` + `mcp__cekura__scenarios_folder_move`. Reversible if Cekura supports unarchive.
- **Existence check**: Many centres have zero scenarios — skill skips if list is empty.

## 8. n8n Workflow Side-Effects (NO direct mutation needed)

These workflows automatically respect the `enabled` flag in Centre Lookup Sheet — no per-centre code change needed:

- **Outbound Call Flow** (`6sPwo7ngPyTWfmwM`): Lookup Centre node returns no row when `enabled=FALSE` → email goes to dead-letter handler.
- **Retry Scheduler** (`rt0aEuDnFv3ZCl1y`): joins Leads MasterSheet against Centre Lookup, filters to `enabled=TRUE`. Drained leads (`status=cancelled_offboard`) won't be picked up anyway.
- **End Of Call** (`4p1V0wESn3kZySt6`): no centre filter, but cancelled leads aren't called.
- **Daily Call Audit** (`/root/daily-call-audit/audit.py` on n8n droplet): iterates Centre Lookup with `enabled=TRUE` filter — auto-skips offboarded centres.
- **KB Crawler** (`/root/kb-crawler/crawl.ts`): same — reads `enabled=TRUE`.

**This means:** soft offboard = flip the lookup flag, drain leads, and the rest of the system organically respects it. The Retell-side rename and unbind are belt-and-suspenders to prevent accidental manual triggering.

## 9. Exit Report (Generated Artifact)

- **Location**: `/root/offboard-archives/<centre_id>-YYYY-MM-DD/`
- **Files**:
  - `README.md` — summary of offboarding actions taken, with reactivate instructions
  - `inventory.json` — full pre-offboard state (for reactivate/audit)
  - `calls-<centre>.json` — Retell call dump (last 100 calls, `appointment_booked` flag intact)
  - `stats.json` — calls placed, conversion %, last call date
  - `director-email.md` — DRAFT only, NOT auto-sent (per Scott's preference)
- **Methodology**: mirror `/root/nv-pilot-archive/` pattern — real-lead filter (region area code + lead_id non-test), tours = Retell `appointment_booked=True` on latest call per phone.

## Audit Log

`/root/offboard-archives/log.jsonl` — one JSON line per offboard/reactivate action:

```json
{"ts":"2026-05-01T19:30:00-07:00","mode":"soft","centre_id":"ma-canton","actor":"poseidon","actions":["leads_drained:1","lookup_disabled","agent_renamed","phone_unbound"],"exit_report":"/root/offboard-archives/ma-canton-2026-05-01/"}
```
