---
name: feedback-did-from-centre-lookup
description: "Always pull DID/phone numbers from the Centre Lookup sheet, never placeholder or memory"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

When drafting anything that needs a centre's phone number (onboarding emails, forwarding steps, call-routing), pull the real value from the **Centre Lookup sheet** — do not use a placeholder or guess from memory.

**Why:** Scott corrected me 2026-07-09 after I left `[inbound DID]` as a placeholder in the Kanata/Burlington inbound onboarding emails. The sheet is the source of truth and is already wired into the live pipeline.

**How to apply:**
- Sheet ID `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`, tab `Sheet1` (gid=0).
- Read pattern: temp n8n workflow → HTTP GET `https://sheets.googleapis.com/v4/spreadsheets/{SHEET}/values/Sheet1!A1:AA40` with `googleSheetsOAuth2Api` cred id `yjVHcEWrpyDmxkvv` ("Google Sheets account 3"). Template: `/root/sheet-read.py`.
- ⚠️ **NEVER hardcode column letters — resolve by header NAME at write-time.** The layout gets reorganized. On 2026-07-10 Scott moved `centre_landline` from my appended col R to **col E** (right after `location_name`), shifting every later column +1. A stale write of Burlington's landline to old-R then clobbered `clickup_outbound_list_id` (restored to `901113931621`). Always: read row 1 → find `hdr.index("<name>")` → write that cell. Re-read headers immediately before any write.
- CURRENT layout (verified 2026-07-10): A `centre_id`, B `timezone`, C `enabled`, D `location_name`, **E `centre_landline`**, **F `inbound_number`**, G `outbound_number`, H `Testing`, I `test_number`, J `centre_email`, K `Director`, L `agent_id`, M `director_personal_email`, N `clickup_user_ids`, O `clickup_list_id`, P `knowledge_base`, Q `clickup_inbound_list_id`, R `clickup_outbound_list_id`.
- Verified 2026-07-09: Kanata inbound `+1 613-702-8134`; Burlington inbound `+1 289-907-1911`.
- `centre_landline` (col E) = the centre's own line that forwards INTO the Retell DID; reference/testing field (call the landline to exercise the full chain, not the DID). Seeded EG `19054781664` (905-478-1664), StCath `12899740871` (289-974-0871, per [[stcath-inbound-call-forwarding]]), Burlington `19053320707` (905-332-0707, from codeninjas.com/burlington-on-ca), Kanata `16139634472` (613-963-4472, found via Google 2026-07-10 — WebSearch had missed it, see [[feedback-use-google-search]]). All 4 live-inbound centres now populated. See [[single-number-model-fleetwide]].

Related: [[kanata-burlington-onboarding-2026-06-12]], [[feedback-onboarding-email-two-asks]].
