---
name: n8n googleDocsOAuth2Api credential carries Drive scope
description: The "Google Docs account" credential (ID 58qerrOCaSjZ51WF) on n8n cloud has Drive sharing permissions — Drive API permissions:create works
type: reference
originSessionId: fcc00af7-f5c1-4f29-b013-0bc736a23de5
---
**Confirmed 2026-05-08:** The n8n cloud `googleDocsOAuth2Api` credential **"Google Docs account"** (credential ID `58qerrOCaSjZ51WF`) **has Drive scope**, not just Docs. It can create file permissions — i.e., share a Google Doc with another user programmatically.

## How to use

In an n8n HTTP Request node:
- **Authentication:** `predefinedCredentialType` → `googleDocsOAuth2Api`
- **Credential:** `58qerrOCaSjZ51WF` ("Google Docs account")
- **Method:** POST
- **URL:** `https://www.googleapis.com/drive/v3/files/{fileId}/permissions`
- **Query params:** `sendNotificationEmail=true|false`, `supportsAllDrives=true`
- **Body (JSON):** `{"role":"writer","type":"user","emailAddress":"<grantee>"}`

Returns 200 with `{kind: "drive#permission", id, type, role}`.

## Verified test (St. Catharines KB share)

- File: `1fn_s059ds_uP--mH4izXPNKdwFjW8TOL9SWopsPEpis`
- Grantee: `shauna.chan@codeninjas.com`
- Result: HTTP 200, permission `06439118782000130221` created with role=writer
- Listed permissions afterward confirmed Shauna present alongside owner (`scott.james1717@gmail.com`) and existing editor (`scott.james@codeninjas.com`)

## Memory correction

Earlier memory entries (`kbcrawler-skill.md`) referred to `hTsOcQ3CNsZ5e1xQ` as the "GDocs Write credential" — **that ID is actually a workflow ID** (the "KB Crawler - GDocs Write" sub-workflow). The actual credential ID inside that workflow's nodes is `58qerrOCaSjZ51WF`. Fix forward when next touching kbcrawler memory.

## Implication for onboard-centre.ts (LANDED 2026-05-08)

A permanent n8n webhook now wraps the Drive API permissions call:
- **Workflow:** `Drive - Share File` (ID `hi9Y8BFC8cHaTyM6`)
- **Webhook URL:** `https://xprime17.app.n8n.cloud/webhook/drive-share-file`
- **POST body:** `{ "fileId": "...", "email": "...", "role": "writer", "sendNotification": false }`
- **Returns:** `{ statusCode: 200, body: { kind, id, type, role } }` (or non-200 with Drive error)

`onboard-centre.ts` now calls it from `step9b_shareKBWithOwner()` between Step 9 (sheet write) and Step 10 (onboarding email). Skips with warn if `--owner-email` not provided; non-blocking on Drive errors.

`N8N_DRIVE_SHARE_WEBHOOK` constant is at the top of `onboard-centre.ts`. Reusable for any other internal tool that needs to share a Google Doc.
