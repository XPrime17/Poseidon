---
name: clickup-percentre-inbound-outbound-2026-06-09
description: ClickUp restructured 2026-06-09 — every centre has its own folder with separate Inbound + Outbound lists; Centre Lookup now has clickup_inbound_list_id (col P) + clickup_outbound_list_id (col Q)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 546ea15a-9b3d-4de1-8986-da9f2129038a
---

Restructured the Voice AI ClickUp space (`90114119602`) 2026-06-09 (Scott directive): each of the 6 live centres now has its **own folder** with a separate **Inbound** and **Outbound** list. Replaces the old layout (combined "Pickering + Leaside (Sharmila)" folder; single mixed lists). Supersedes the single-list parts of [[clickup-multicentre]] and [[clickup-leaside-pickering-sharmila]].

**List-id map (folder | inbound | outbound):**
- East Gwillimbury `90117795474` | inbound `901113422190` | outbound `901113931614` (+ Cekura Tests `901113648956`)
- St. Catharines `90117996306` | inbound `901113834370` | outbound `901113931615`
- Leaside `90118043314` | inbound `901113931616` | outbound `901113931617`
- Pickering `90118043315` | inbound `901113931618` | outbound `901113931619`
- Burlington `90118043316` | inbound `901113931620` | outbound `901113931621`
- Riverside `90118043317` | inbound `901113931622` | outbound `901113931624`
- Old combined folder `90117899982` renamed "[ARCHIVED — split…]" (empty list 901113632689 inside); safe to hard-delete later.

**Centre Lookup schema:** added `clickup_inbound_list_id` (col **P**) + `clickup_outbound_list_id` (col **Q**), populated for all 6. Old `clickup_list_id` (col N) left in place but now UNUSED (retire later). `clickup_user_ids` (col M) unchanged: EG `81534293,87407960`, StCath `87436757`, Leaside+Pickering `87425193`; **Burlington + Riverside EMPTY** → their tasks create UNASSIGNED until director guests are added.

**Workflows repointed (live, active, gate PASS):** inbound EOC `3oV7SpPKWmr3xJlQ` "Detect Test Call" now reads `centre.clickup_inbound_list_id`; outbound EOC `4p1V0wESn3kZySt6` "Format Staff Follow-Up Task" reads `centre.clickup_outbound_list_id`. Gate `hasClickUpConfig:!!listId` (assignees optional). Lookup nodes read full sheet (no range cap) so P/Q are returned. Backups: `/root/wf-backups-2026-06-09/`.

**Migrated tasks:** 8 from old shared list → new lists via recreate+delete (ClickUp home-list can't be reassigned via API, TASK_035; multiple-lists add works but home stays). New ids in Pickering Outbound (901113931619): 868jzej51/52/55/56/5c; Leaside Outbound (901113931617): 868jzej5f/5h; Leaside Inbound (901113931616): 868jzej5p (KB task).

✅ (1) DONE 2026-06-10: `onboard-centre.ts` now has `step8c_clickup` (creates per-centre folder + Inbound/Outbound lists in space 90114119602, idempotent, reads CLICKUP_PERSONAL_TOKEN from env) + new `--clickup-user-ids` flag; step9 payload writes clickup_inbound_list_id/clickup_outbound_list_id/clickup_user_ids; writer node ZyjnLwZ1CMOsqg2U columns.value+schema updated (dropped clickup_list_id, added the two). Typecheck clean, dry-run verified. (provision-inbound.ts has no clickup logic — nothing to change there.)
⏳ REMAINING: (2) add Burlington/Riverside director ClickUp guests + clickup_user_ids (tasks create unassigned till then); (3) retire old col N. See [[onboarding-gap-fix-2026-05-23]].
