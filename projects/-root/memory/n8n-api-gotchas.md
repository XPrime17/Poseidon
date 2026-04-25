---
name: n8n Cloud API gotchas
description: Sharp edges in the n8n cloud public API — retry semantics, PUT whitelist, Google Sheets v4.7 schema requirement, Simple Memory sessionKey footgun, credential types, and workflow-modification patterns learned across Mar-Apr 2026.
type: reference
originSessionId: fb1283ef-1d84-48b4-865b-263821fdbd91
---
# n8n Cloud API gotchas

Cloud URL: `https://xprime17.app.n8n.cloud/api/v1`
API key stored in MEMORY.md. Read-only Bearer in header `X-N8N-API-KEY`.

## Execution retry is misleading
`POST /executions/:id/retry` returns `"The execution succeeded, so it cannot be retried"` for any workflow that ran to **completion**, even if it routed down a business-semantic failure branch (e.g., the Sanitization Failed Gmail node in Outbound Call Flow). n8n's definition of "success" is "workflow completed without throwing."

**Workaround:** Can't replay. Either manually trigger an equivalent outcome (e.g., append directly to Sheets via a temp workflow), or temporarily modify the workflow to accept a webhook injection.

`POST /workflows/:id/execute` is NOT exposed in public API v1 — returns 405 Method Not Allowed.

## PUT workflow whitelist (strict)
`PUT /workflows/:id` accepts ONLY these top-level keys:
```
name, nodes, connections, settings, staticData
```
Any other field → HTTP 400 `"request/body must NOT have additional properties"`. Strip everything else from the GET response before PUT:
```
updatedAt, createdAt, id, description, isArchived, meta, pinData,
versionId, activeVersionId, versionCounter, triggerCount, shared,
active, tags, autosaved, authors, activeVersion
```
Also strip from `settings`: `availableInMCP`, `timeSavedMode`.

The `active` field is read-only on PUT — use `POST /workflows/:id/activate` or `/deactivate` endpoints instead.

## Google Sheets node v4.7 requires full columns.schema
Even for simple `append` ops. Omitting `columns.schema` → error `"Could not get parameter: columns.schema"`.

**Fast path for temp workflows:** copy the full `parameters` block from a production Google Sheets node, override only `columns.value`, keep `operation`, `documentId`, `sheetName`, and `columns.schema` verbatim.

The production Outbound Call Flow's "Append row in sheet" node is the canonical reference for Leads MasterSheet writes.

**Credential type matters:** Leads MasterSheet write node uses `googleSheetsOAuth2Api` (id `yjVHcEWrpyDmxkvv`, "Google Sheets account 3"), NOT `googleApi`. Getting this wrong → the node runs but errors opaquely.

## Simple Memory node — sessionKey footgun
The `@n8n/n8n-nodes-langchain.memoryBufferWindow` node with a **constant** `sessionKey` (e.g., `"my_test_session"`) pollutes state across every run. Any prior conversational exchange leaks into subsequent unrelated extractions — the Anthropic-Chat-Model-based extractor will start producing meta-responses like *"I need the text input to extract customer information from"* instead of cleanly extracting fields.

**Rule of thumb:** extraction agents should not have memory at all. Memory is for chatbots. For one-shot structured extraction, remove the Simple Memory node entirely (surgical — delete the node + its `ai_memory` connection to the agent). A regex-first layer ahead of the AI is even better defense.

## Workflow-modification pattern (surgical edits)
1. GET the workflow → parse JSON
2. Mutate nodes array and/or connections object
3. Whitelist top-level keys to `{name, nodes, connections, settings, staticData}`
4. PUT back

When adding a node, give it an `id`, `name`, `type`, `typeVersion`, `position`, and `parameters`. Wire it into `connections` object (the key is the SOURCE node name, the value is `{"main": [[{"node": "<target>", "type": "main", "index": 0}]]}`).

When removing a node: remove from `nodes` array AND delete its key from `connections`.

## Temp workflow pattern (one-shot write)
When you need to write to a production resource without modifying an existing workflow:
1. `POST /workflows` with `{name, nodes, connections, settings: {"executionOrder": "v1"}, staticData: null}` — n8n accepts webhook-triggered workflows
2. `POST /workflows/:id/activate`
3. Sleep 2-3s (webhook registration is async)
4. Hit the webhook URL
5. `POST /workflows/:id/deactivate`
6. `DELETE /workflows/:id`

Temp workflows don't appear in history once deleted. Clean pattern for one-off data writes.

## PUT requires non-null `description` (added 2026-04-25)
The PUT endpoint validates `description` as a string — passing `null` (which GET sometimes returns) yields HTTP 400 `"request/body/description must be string"`. Coerce to `""` before PUT:
```js
if (wf.description == null) wf.description = '';
```
This is in addition to the standard whitelist scrub. Easy to miss because `description` is whitelisted as allowed but the schema enforces non-null.

## `$input.first()` breaks when nodes are inserted upstream (added 2026-04-25)
A Code node that reads `$input.first().json.body.call` works fine when wired directly after the webhook, but throws `Cannot read properties of undefined (reading 'call')` once HTTP or other transformation nodes are inserted between the webhook and the Code node — `$input` then refers to the immediate predecessor's output, not the original payload.

**Fix:** reach back to the original webhook by name:
```js
const call = $('Inbound Webhook').item.json.body.call;
```
Use `$('<Node Name>').item.json` whenever a Code node needs data from a specific upstream node rather than the immediate predecessor. Common when adding gates/dedup logic mid-flow.

## Inspection pattern — finding which branch fired
Since n8n marks executions `status: success` even for "failure branch" paths, to tell if a specific alert/email node actually fired:
```
GET /executions/:id?includeData=true
→ .data.resultData.runData | has("<Node Name>")
```
Returns true only if that exact node was in the execution path. Essential for diagnosing "did the Sanitization Failed email fire?" type questions.
