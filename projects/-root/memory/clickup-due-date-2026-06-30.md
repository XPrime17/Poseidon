---
name: clickup-due-date-2026-06-30
description: +2-day due dates added to all ClickUp follow-up tasks (inbound+outbound) fleet-wide; plus the deleted-tasks-recovered incident
metadata: 
  node_type: memory
  type: project
  originSessionId: 961acda4-ccbb-424f-890d-dfaec9d06501
---

ClickUp follow-up tasks fleet-wide now get a **+2-day due date**. Shipped 2026-06-30 (Scott's ask, after he noticed Pickering Outbound looked "half no assignee, half no due date").

**Diagnosis:** assignment was already solved everywhere (per-centre `clickup_user_ids`); due dates were universally absent — no production task in the Voice AI space had one. The "half/half" optic was a Pickering-specific artifact of the 6/9 backfill batch.

**Going-forward fix (n8n cloud `xprime17.app.n8n.cloud`):** added `due_date: Date.now()+172800000, due_date_time:false` to the `jsonBody` of three creator nodes:
- Outbound EOC `4p1V0wESn3kZySt6` → `Create Staff Follow-Up Task`
- Inbound EOC `3oV7SpPKWmr3xJlQ` → `Create ClickUp Task` and `Create Cancel Task`
Backups: `/root/n8n-backups/clickup-due-date-2026-06-30/`.

**Backfill:** set due=now+2d on all currently-open tasks across the 14 live centre lists (future date, so nothing flips overdue). Most lists had few *open* tasks — directors close the rest.

**Workspace layout:** Voice AI space `90114119602`, one folder per centre, each with Inbound + Outbound lists. Pickering Outbound = `901113931619`. Sharmila Sivasankaran ClickUp user_id = **87425193** (Pickering + Leaside assignee per Scott).

**Token flag (not yet fixed):** the ClickUp API token is hard-coded in plaintext in those n8n HTTP nodes — move to an n8n credential. A proper `CLICKUP_PERSONAL_TOKEN` already exists in `/root/.claude/.env`.

See [[feedback-clickup-backfill-not-junk]] for the deletion incident. MED-3 task `868jzej5p` is now assigned (Sharmila) + dated — relates to [[open-followups-2026-06-10]].
