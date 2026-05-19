---
name: Gmail-to-self sends skip Delivered-To
description: Synthetic-lead testing via Gmail Send to the same account fails the Outbound Call Flow's Extract Centre node — Google only adds Delivered-To on external SMTP delivery, not same-account API sends. Patched 2026-05-03.
type: feedback
originSessionId: f1073f82-dcec-4c11-b3d1-1bc8f78e3502
---
# Gmail-to-self sends skip Delivered-To header

When testing the Outbound Call Flow with a synthetic lead, sending Gmail-from-`scott.james1717@gmail.com`-to-`scott.james1717+ct-X@gmail.com` (same account, via n8n Gmail Send node + OAuth `x1W7EpNhmEdx8cOR`) **does not** add a `Delivered-To` header. Real Lineleader emails always have it because they transit external SMTP and Google adds the header on inbound delivery.

**Why:** The header was a single point of failure. Extract Centre node previously did:
```js
$json.headers['delivered-to'].match(/\+([^@\s]+)@/)?.[1]?.replace(/\s+/g, '') || 'unknown'
```
Real traffic always populated it, so the bug was invisible until I tried Gmail-to-self for synthetic testing.

**How to apply:** Patched 2026-05-03 to fall back through `to` header:
```js
($json.headers['delivered-to'] || $json.headers['to'] || '').match(/\+([^@\s]+)@/)?.[1]?.replace(/\s+/g, '') || 'unknown'
```
- Real Lineleader emails: still hit Delivered-To first (no behaviour change)
- Synthetic / edge-case emails: fall through to `to`
- For **future synthetic-lead tests**, Gmail-to-self via n8n now works — temp workflow pattern: Webhook → Gmail Send → fire → execution shows up in Outbound Call Flow within ~60s.
- The temp workflow pattern: see Centre Directory - Write Row (`ZyjnLwZ1CMOsqg2U`) for the active-webhook template; do POST `/workflows`, POST `/activate`, hit `/webhook/{path}`, then `/deactivate` + DELETE.

**Resend cannot be used** for `scott.james1717@gmail.com` deliveries — sandbox blocks anything other than `scott.james@codeninjas.com` (validation_error 403).

**Riverside test-mode validated 2026-05-03 17:51 UTC** with `call_39bfec715bb6ed41fe1233ef3fe` from Riverside Twilio number to Scott's cell.
