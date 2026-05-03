---
name: Power Automate shared-mailbox forwarding pattern
description: How to debug "Id is malformed" 400 in centre Power Automate flows — root cause is Forward (V2) on shared mailbox; fix is Send (V2). Riverside live-debug 2026-05-03.
type: reference
originSessionId: aea232e4-82d0-4a4a-baf7-9f3482568a4e
---
# Power Automate → n8n Gmail trigger bridge

## Symptom signature (recognize this fast)

When a centre owner reports leads not reaching the voice agent and you find:
- Power Automate flow named **`CRM Lead Forwarding`** in their tenant
- Action **`Forward an email (V2)`** failing with **HTTP 400 / "Id is malformed"**
- Trigger is **`When a new email arrives in a shared mailbox (V2)`**
- Inputs show `message_id` = dynamic Message Id from trigger

→ This file. Don't re-derive.

## Root cause

`Forward an email (V2)` defaults to calling `https://graph.microsoft.com/v1.0/me/messages/{id}/forward`. `me` = the signed-in user's personal mailbox. The Message Id is real, but it lives in the **shared** mailbox the trigger watches → Graph rejects it as malformed.

`Send an email (V2)` doesn't need a Message Id, so the whole class of failure goes away.

## The fix — Send (V2), not Forward (V2)

Confirmed working with Riverside (Leo Caira, owner) on a live call 2026-05-03 in Shweta Relan's Power Automate tenant.

```
Trigger: When a new email arrives in a shared mailbox (V2)
  Original Mailbox Address: <shared mailbox SMTP, e.g. eastgwillimburyonca@codeninjas.com>
  Subject filter:           New CORE Program Inquiry
  From:                     noreply@lineleader.com

Action: Send an email (V2)            ← NOT Forward
  To:      scott.james1717+ct-{centre-code}@gmail.com
  Subject: <dynamic Subject from trigger>
  Body:    <dynamic Body from trigger>
```

The fallback workaround if someone insists on Forward — set `Original Mailbox Address` on the Forward action's advanced parameters — works but is fragile and gets re-broken every time the action is re-bound to a different connection. **Don't use it.** Just delete the Forward node and add Send.

## Why we still see Forward in the wild (drift root cause)

The current onboarding script `onboard-centre.ts:1061` correctly instructs Send (V2). But **older onboarding emails sent before that update** said Forward. Centres onboarded with the older email built Forward-based flows that worked at the time and only broke later (Graph behaviour change, or always failed silently for shared mailboxes — unverified).

Any centre running Forward (V2) is on borrowed time. Migrate them to Send when they next surface a problem.

## Live-call triage order (when a centre owner is on the line)

Don't debug the vendor tenant first. Order:

1. **Prove our pipeline works** — fire a synthetic lead email at `scott.james1717+ct-{centre}@gmail.com` (subject `New CORE Program Inquiry`) and watch the call land. Separates blame; gives the client a "yes it works" moment.
2. **Capture one real lead live** — append to Leads MasterSheet directly with `status=retry_pending, next_call_after=now()`. Lets the owner hear a call on a real lead immediately.
3. **Set up CRM-direct CC bypass** — have the owner add `scott.james1717+ct-{centre}@gmail.com` as a CC recipient on their CRM lead-notification email. Cuts Power Automate out entirely while we fix the Send/Forward swap async.
4. **Fix Power Automate async** — swap Forward → Send in the centre's tenant. Don't burn live-call time on a different person's Microsoft 365 admin UI.

## Related context (don't re-grep)

- n8n Gmail trigger inbox: `scott.james1717@gmail.com`
- Subject filter on the trigger: per MEMORY.md, "New CORE Inquiry" — but the actual Lineleader subject is "New CORE Program Inquiry". If the n8n filter ever stops matching, this is why. (Substring vs exact match unverified — check the trigger config in the Outbound Call Flow workflow.)
- Plus-addressing maps to `centre_id`: `+ct-riverside` → `ma-riverside` (or whatever Lookup Centre sheet says)
- Centre onboarding script: `/root/lead-reactivation/scripts/onboard-centre.ts` (current, says Send V2)
- Resend sandbox **cannot** send to `scott.james1717@gmail.com` — that's why we route via the centre's own mail system, not Resend
- We do NOT have a doc-vs-deployment drift check for Power Automate flows in client tenants. Worth productizing if HubSpot migration doesn't replace this path entirely by July 2026.
