---
name: inbound-eoc-percentre-routing-fix
description: Inbound End-Of-Call workflow now routes ClickUp tasks per-centre via Centre Lookup (was hardcoded to EG); email follow-up still pending
metadata: 
  node_type: memory
  type: project
  originSessionId: 2cf2e90d-95d5-4b4b-a510-788a169db5e1
---

The single inbound post-call workflow (`3oV7SpPKWmr3xJlQ`, webhook path `inbound-end-of-call`) was built for the EG pilot and **hardcoded EG everywhere** — so every non-EG inbound centre's tasks/emails landed on EG. St. Catharines (live inbound 2026-05-08) was the first non-EG inbound centre and exposed it: Steven Adams' StCath inbound call created a task on EG's ClickUp board assigned to EG staff (Alex Pipher / Jenn Christie).

**Fixed 2026-05-31** — renamed workflow to **`Inbound End Of Call - Multicentre`**. Added `Lookup Centre (Inbound)` Google Sheets node (cred `yjVHcEWrpyDmxkvv`) keyed on `from_number == call.to_number` (strip the `+`), wired `Filter → Lookup → Detect Test Call`. `Detect Test Call` now reads `clickup_list_id`/`clickup_user_ids`/`centre_email` from the row; `Create ClickUp Task` assignees are dynamic. Mirrors the outbound `Lookup Centre SF` pattern. Had to convert downstream `$('Inbound Webhook').item` / `$('Detect Test Call').item` refs to `.first()` because the inserted Sheets lookup breaks paired-item resolution.

- The 3 hardcoded EG values were: list `901113422190`, assignees `[81534293, 87407960]` (= Alex Pipher + Jenn Christie), email `eastgwillimburyonca@codeninjas.com`.
- **Backfilled EG's Centre Lookup row** (M2:N2 = `clickup_user_ids=81534293,87407960`, `clickup_list_id=901113422190`) so EG didn't regress to no-task once routing went sheet-driven. Verified via Sheets API read (gviz CSV is cached/stale — don't trust it for read-back).
- Only StCath + EG have inbound provisioned and configured today; Leaside-Inbound exists but isn't activated. Unconfigured inbound numbers → empty list_id → `list//task` 400 (no defensive gate added yet — hardening TODO).

**Email routing — FIXED 2026-06-01.** The two staff-notification nodes (`Email: Message for Staff`, `Email: Urgent Call`) were Resend HTTP calls sending `to: scott.james@codeninjas.com` with subject `[EG Inbound ...]`, relying on a Scott Gmail forward-rule to reach the EG centre — so StCath emails leaked to EG. **Root constraint discovered:** the Resend account (key `re_jZ1...`, from `onboarding@resend.dev`) has NO verified domain and is in TEST MODE — it 403s any recipient except `scott.james@codeninjas.com`. That's why the Scott+Gmail-forward workaround existed; changing Resend `to:` would have silently broken delivery. **Fix:** converted both nodes to n8n **Gmail** nodes (cred `x1W7EpNhmEdx8cOR`, same as outbound `Send Staff Follow-Up Email`) → `sendTo: _centre_email`, `bccAddresses: scott.james@codeninjas.com`, per-centre subject `[<location_name> Inbound Message/URGENT]` (drops the `[EG Inbound` string so Scott's old forward-rule no longer double-fires — that rule is now dormant/deletable). Also set **EG `centre_email` → `eastgwillimburyonca@codeninjas.com`** (was Scott's address) per Scott: EG staff emails = shared inbox + him via BCC. NOTE: `centre_email` is shared with outbound, so EG outbound notifications now also go to the shared inbox (Scott still BCC'd). Related: [[feedback-bcc-scott-on-centre-emails]], [[eoc-centre-email-not-plumbed]].

See also [[eg-inbound-pilot]], [[clickup-multicentre]], [[feedback-clickup-assignee-per-centre]].
