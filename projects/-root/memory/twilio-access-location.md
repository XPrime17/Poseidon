---
name: twilio-access-location
description: Where Twilio API credentials live and how centres are structured (sub-accounts + SIP trunks)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 7ce5a28a-f717-42c9-b584-6a1ea3064ade
---

Twilio IS accessible from the droplet — don't claim "no Twilio access" just because `TWILIO_*` env vars are empty.

Master account creds are hard-coded in `/root/lead-reactivation/scripts/onboard-centre.ts` (`TWILIO_SID`/`TWILIO_TOKEN`, ~lines 22-23; `TWILIO_BASE=https://api.twilio.com/2010-04-01`). Read them at runtime; never copy the literals into memory (see [[feedback-no-credentials-in-memory]]).

Structure: each centre is its own Twilio **sub-account** (list via master `GET /Accounts.json`; sub-account object includes its own `auth_token`). Each centre has an **Elastic SIP trunk** (`<slug>-cnkb.pstn.twilio.com`) whose **Origination URI = `sip:sip.retellai.com`** routes inbound PSTN → Retell. Numbers are attached to the trunk (no per-number VoiceUrl). Trunking API base `https://trunking.twilio.com/v1` uses the SUB-account creds.

Implication: a centre DID rings its Retell agent only if (a) the trunk origination URI is enabled AND (b) the number has an inbound agent bound in Retell. If Twilio routing is fine but a number is outbound-only in Retell, inbound callers get a **busy signal**. See [[leaside-inbound-forward-target-2026-07-16]].
