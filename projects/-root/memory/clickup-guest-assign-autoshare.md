---
name: clickup-guest-assign-autoshare
description: "ClickUp guest-share API is enterprise-gated, but assigning a guest to a task auto-shares it — col M works without a folder share"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0102d5a3-1122-4106-8599-442881c95519
---

`POST /folder/{id}/guest/{gid}` and `POST /list/{id}/guest/{gid}` both return 400 `TEAM_110 "Team must be on enterprise plan"` on our workspace. Existing guest list memberships (e.g. Shauna on StCath lists) were made via the UI.

**But task creation with a guest in `assignees` succeeds anyway** (verified 2026-06-12 on Burlington Inbound `901113931620` with Shauna `87436757`) and assignment shares that task with the guest. So writing a guest user_id into Centre Lookup col M is safe without any folder/list share — directors see their assigned tasks. A UI folder-share is still nicer (full board view); optional.

**How to apply:** for new centres run by an existing guest director, just write col L/M; only NEW directors need the UI guest invite (non-codeninjas email, per [[clickup-multicentre]]).
