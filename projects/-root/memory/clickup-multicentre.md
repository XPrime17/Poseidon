---
name: ClickUp Multicentre Task Routing
description: Per-centre ClickUp architecture for inbound voice AI — folder-per-centre, guest-per-director, non-codeninjas email required
type: project
originSessionId: d6b5ab44-7a3a-4f8f-9d31-dab3a6089bda
---
## ClickUp plan facts

- **Workspace:** Codeninjas (`9011711565`)
- **Plan:** Business (1 member seat + 10 guest slots per member)
- **Current usage:** 1/1 members, 3/10 guests (7 slots free)
- **Scaling lever:** add paid member seats ($12/mo each) → each adds 10 more guest slots. Business Plus upgrade does NOT add guest capacity (same 10-per-seat formula).
- **Gotcha:** inviting a guest beyond the quota silently adds a paid member seat and bills you; watch the count before inviting the 11th.

## Architecture (agreed 2026-04-20)

**One Folder per centre. One Guest per centre director.**

```
Codeninjas Workspace
└── Voice AI Space (90114119602)
    ├── EG Folder (90117795474)              → EG Inbound Tasks (901113422190)       [EG — Alex + Jenn]
    ├── Pickering + Leaside (Sharmila) (90117899982)
    │                                        → Inbound Tasks (901113632689)          [Sharmila — awaiting invite]
    └── [one folder per additional centre as they onboard]
```

**Default pattern:** one Folder per centre, one Guest per centre.

**Special case:** when a single director runs multiple centres (Sharmila = Pickering + Leaside), combine into one shared Folder to save the director a seat and consolidate their view. Task titles must be prefixed `[Pickering]` or `[Leaside]` so the director can tell calls apart at a glance. One guest invite covers the shared folder, one seat consumed regardless of centre count.

## CRITICAL constraint: guest emails must be NON-codeninjas.com

ClickUp's guest-type-user mechanism requires the invitee email to be on a **different domain** than the workspace's primary domain. A `@codeninjas.com` email **cannot** be a guest — it would automatically promote to a paid member seat.

**Implication:** every centre director needs to provide a personal or non-CN email address for their ClickUp invite. Gmail, Outlook, Yahoo, iCloud — anything not `@codeninjas.com`.

Workaround if a director insists on using their CN email: they become a full **member**, which costs a paid seat ($12/mo). Avoid unless necessary.

## n8n workflow change (pending implementation)

The current `Inbound End Of Call - EG` workflow (`3oV7SpPKWmr3xJlQ`) hardcodes `list_id: 901113422190` in its Create ClickUp Task node. Same rigidity we had for the KB URL pre-refactor. Fix pattern: extend the Resolve Centre map (same one used for KB injection in workflow `QFxDu1MBooL332PN`) to include `clickup_list_id` per centre:

```javascript
const PHONE_TO_CENTRE = {
  '+12898038797': {
    centre_id: 'east-gwillimbury-on-ca', centre_name: 'East Gwillimbury',
    documentURL: 'https://docs.google.com/document/d/1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek/edit',
    clickup_list_id: '901113422190'
  },
  // Pickering inbound phone → shared Sharmila list
  '+1PICKERING_INBOUND_NUMBER': {
    centre_id: 'pickering-on-ca', centre_name: 'Pickering',
    documentURL: 'https://docs.google.com/document/d/1j3AX1R61Tz4-R_zTrCyGL--XBq2GMS9afuqFjrprmDY/edit',
    clickup_list_id: '901113632689'
  },
  // Leaside inbound phone → same shared Sharmila list
  '+1LEASIDE_INBOUND_NUMBER': {
    centre_id: 'leaside-on-ca', centre_name: 'Leaside',
    documentURL: 'https://docs.google.com/document/d/1hDmMP6565YUXbXu9srTpADGBhZy8xt4woODiqfsoSDI/edit',
    clickup_list_id: '901113632689'  // SAME list_id as Pickering on purpose — shared Sharmila folder
  },
};
```

Two updates needed in n8n `Inbound End Of Call` workflow:
1. **Create ClickUp Task node** — set `list_id = {{ $json.clickup_list_id }}`
2. **Format ClickUp Task code node** — prefix task title with `[{{ $json.centre_name }}]` so Sharmila can distinguish Pickering vs Leaside tasks in her shared folder view. EG tasks can skip the prefix (single-centre folder) or include it for consistency.

## Provisioning checklist per centre

1. Create Folder in Voice AI Space (name = centre location) — via API ✅
2. Create "Inbound Tasks" List inside the Folder — via API ✅
3. Get non-CN email from centre director
4. **Invite director as guest via ClickUp UI** (manual step — see Guest invite gotcha below)
5. After invite: query `/team/9011711565/user` to find new guest_id
6. `POST /api/v2/folder/{folder_id}/guest/{guest_id}` with `permission_level=edit` to scope them to their folder
7. Capture list ID; add to n8n PHONE_TO_CENTRE map
8. Assign default assignees (the director at minimum)
9. Test: synthetic call → task appears in correct folder → director can see + edit

## Guest invite gotcha — Business plan is UI-only

`POST /api/v2/team/{team_id}/guest` returns `TEAM_110 — Team must be on enterprise plan`. Programmatic workspace-level guest invites are Enterprise-gated.

**Business-plan workflow:**
- Scott invites the guest via ClickUp web UI (People → Invite → enter non-CN email)
- Once the guest appears in the workspace user list, `POST /api/v2/folder/{id}/guest/{guest_id}` works to grant folder scope
- Don't try the /folder/.../guest POST with a raw email — returns 404

## Guest management

- **Turnover:** if a director leaves, remove their guest access, add replacement. No n8n or Retell change needed.
- **Audit cadence:** review guest list quarterly; remove stale invites.
- **Multi-centre directors** (like Sharmila): one guest invite, multiple folder-access grants, one seat consumed.

## Scaling thresholds

| Active centres | Guest seats needed | Action |
|----------------|---------------------|--------|
| 1–10 | ≤10 | Current plan fine |
| 11–20 | 11–20 | Add 1 member seat (+$144/yr) |
| 21–30 | 21–30 | Add 2 member seats (+$288/yr) |
| 30+ | varies | Consider Enterprise (custom pricing) |

CNKB franchise expansion ceiling is ~12 centres → current plan covers the entire fleet with one seat to spare.
