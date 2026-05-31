---
name: St. Catharines ClickUp folder + list IDs
description: ClickUp config for St. Catharines voice AI deflections (program-neutral, catches both outbound deflections today and inbound once provisioned).
type: project
originSessionId: dfcce36f-cdf2-4142-82a5-a8d73d8d6185
---
Created 2026-05-23 in ClickUp Voice AI Space (`90114119602`).

- **Folder**: "St. Catharines" — id `90117996306`
- **List**: "St. Catharines Tasks" — id `901113834370`
- **Inbound email** (for forwarding tasks): `a.t.901113834370.u-114277538.c2dbf396-b256-4395-85d1-509df682192b@tasks.clickup.com`

**Why:** Outbound End-Of-Call workflow `4p1V0wESn3kZySt6` has Staff Follow-Up Needed? branch that creates ClickUp tasks IF `Has ClickUp Config?` is true (i.e., Centre Lookup row has populated `clickup_user_ids` + `clickup_list_id`). Today only EG has these populated. St. Cath now has the list — pending Shauna's user_id to populate Centre Lookup.

**How to apply:**
- Once Shauna replies with her ClickUp account, look up her user_id via `GET /team/{team_id}/user` (team_id is the workspace id `9011711565`).
- Update Centre Lookup row `st-catharines-on-ca`: set `clickup_user_ids` (comma-separated) + `clickup_list_id=901113834370`.
- Then outbound deflections at St. Cath will start creating tasks (in addition to the email that already fires).
- Same pattern applies for any other live centre that wants ClickUp tasks (Burlington next likely — same director).

**CONSTRAINT — discovered 2026-05-23:** ClickUp API guest invites require **Enterprise plan**. The workspace is on a lower tier, so all guest invites must be done through the **web UI** (Share button on a folder/list). API endpoints tested and failed: `POST /team/{id}/guest` returns `Team must be on enterprise plan`; `/folder/{id}/guest`, `/list/{id}/guest`, `/list/{id}/share` all return 404. Direction: have Scott invite directors via UI; THEN we read workspace members via `GET /team` and populate Centre Lookup with the discovered user_id.

**Shauna's correct email:** `cnstcatharines@gmail.com` (Scott confirmed; original "cnstatharines" was a typo).
