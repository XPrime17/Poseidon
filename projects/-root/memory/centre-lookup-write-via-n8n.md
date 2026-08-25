---
name: centre-lookup-write-via-n8n
description: "I CAN write to the Centre Lookup (and MasterSheet) — spin up a temp n8n workflow that hits the Sheets API with write cred yjVHcEWrpyDmxkvv; the \"Scott edits manually\" note is false"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 546ea15a-9b3d-4de1-8986-da9f2129038a
---

**Correction (Scott, 2026-06-09):** earlier handoffs/memory said "no local Sheets write creds — Scott edits the Centre Lookup manually." That is WRONG. I have a proven write path and have used it before.

**Pattern** (see `/root/eg-backfill.py`, `/root/sheet-read.py`): via the n8n public API (`N8N_API_KEY` in /root/.env) create a TEMP workflow = Webhook → HTTP Request node calling the Google Sheets REST API, authed with `predefinedCredentialType` / `nodeCredentialType: googleSheetsOAuth2Api` and credential **`yjVHcEWrpyDmxkvv`** ("Google Sheets account 3" = write). Activate → trigger the webhook → deactivate → delete. Read uses the same with a GET.
- Write a range: `PUT .../values/{range}?valueInputOption=RAW` with body `{range,majorDimension:"ROWS",values:[[...]]}`.
- Write multiple ranges: `POST .../values:batchUpdate` with body `{valueInputOption:"RAW", data:[{range,values},...]}`.
- Tab name for Centre Lookup = `Sheet1`. Centre Lookup id `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`; MasterSheet id `1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A` (tab "All Centres"). Same cred works for both (read cred ybuxqM8F2NkyCA7e also exists).
- Direct HTTP CSV/gviz export of these sheets returns a Google login page (not public) — that's why the n8n cred path is needed, NOT manual editing.

Used 2026-06-09 to set clickup_user_ids/clickup_list_id (cols M/N) for Pickering (row 3) + Leaside (row 8). Always re-read live to verify + run [[pipeline-regression-gate]] after. Relates to [[clickup-leaside-pickering-sharmila]].
