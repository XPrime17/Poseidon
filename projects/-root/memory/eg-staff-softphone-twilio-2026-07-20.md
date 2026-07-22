---
name: eg-staff-softphone-twilio-2026-07-20
description: "EG has a Twilio SIP Domain for HUMAN staff outbound calls (Phil/ACD), separate from the Retell AI trunk, presenting the EG number + Hiya branding."
metadata: 
  node_type: memory
  type: project
  originSessionId: d3cae33c-6b8e-4603-8b58-fae55e7c2211
---

Provisioned 2026-07-20 so ACD **Phil** can make outbound calls **as Code Ninjas East Gwillimbury** from home, reusing the EG number **+1 289-803-8797** and its existing **Hiya branding**.

**Key insight:** Hiya branding + STIR/SHAKEN attestation attach to the *number*, not the caller. A human presenting the owned EG number *through Twilio* gets full A-attestation → Hiya brand shows. (Spoofing the number on Voip.ms would NOT — low attestation, no brand.)

**Architecture (EG sub-account, friendly_name "Code Ninjas East Gwillimbury", SID `ACf4e7…` — full SID via `/Accounts.json` lookup):**
- **Programmable Voice SIP Domain** `cnkb-eg-staff.sip.twilio.com` (SID `SD14832bb983aa8ad317a92a3a38215507`), registration enabled — SEPARATE from the Retell Elastic SIP trunk `eg-inbound-905.pstn.twilio.com` (`TK86b3cce30896dc7b1e0129fa98175fab`) that still owns the number. AI path untouched.
- Credential list "EG Staff (Phil)" `CL5d8bde0d8cbdcca00d6f2c6fbe2853f7`, users `phil-eg` + `scott-eg` (Scott added 2026-07-21 to test + place his own EG calls), mapped for BOTH Registration + Calls auth. Add a staff member = one more credential on this list (inherits everything). SIP `From` (`scott-eg` vs `phil-eg`) distinguishes users in logs even though caller ID is shared.
- Dial-out **Twilio Function** service `eg-staff-dialout` (`ZS7b6974bd97bc94a4337118b1e04fa044`), URL `https://eg-staff-dialout-5299-prod.twil.io/dialout` — parses dialed number → E.164, `<Dial callerId="+12898038797" answerOnBridge>`. Source: `/root/eg-staff-dialout.js`.
- Phil's Bria SIP password + all SIDs saved LOCALLY at `/root/.eg-staff-provision.env` — NOT here (public repo, see [[feedback-no-credentials-in-memory]]).

**Twilio access:** master creds hardcoded in `onboard-centre.ts:22-24` (SID `AC8b69…`). Each centre = a sub-account (list via `/Accounts.json`); act on a sub via its own auth_token (fetch from `/Accounts/{sub}.json`). Master token exposure = open follow-up (rotate to a cred).

**Serverless gotcha:** Function *code* upload goes to `https://serverless-upload.twilio.com/v1/...Versions` (multipart), NOT `serverless.twilio.com` (returns 405). Build → poll `/Builds/{sid}/Status` → Deployment.

**Recording OFF** for now (calls only). Adding `<Record>` to the Function = the owner-QC-review upsell Scott floated for other centres — this EG setup is the reusable pattern/pilot for that product. See [[single-number-model-fleetwide]], [[feedback-did-from-centre-lookup]].

**WORKING Bria config (proven 2026-07-21, Scott's `scott-eg`):** Domain `cnkb-eg-staff.sip.twilio.com`, Username=Auth name `scott-eg`, **Transport UDP / port 5060 / SRTP OFF** (domain `secure=False` — TLS/5061/SRTP gave SIP 503 on register), "requires authorization username" ON = `scott-eg`. Live-verified: call CAedc9f3… → outbound-dial leg CA79979c… `from=+12898038797` completed. Both legs 7s.

**Debug lessons (register vs call are SEPARATE gates):**
- TLS/5061/SRTP → **503 on registration** because domain `secure=False`. Fix = UDP/5060/SRTP-off (or later flip domain `secure=true` + go back to TLS).
- After that, calls busied out with **no Call resource + no Debugger alert** = endpoint simply **not registered**. Check `GET /SIP/Domains/{SD}/Registrations.json` — 0 = not registered = every call fails busy regardless of config. Fix = **full Bria restart** to re-establish the registration binding, confirm "Registered/green" BEFORE dialing.
- Registration showed 0 again shortly after the call — watch for expiry/keep-alive flapping; may need to tune REGISTRATION TIME / keep-alive if Scott must restart before each call.

**SMS (explored 2026-07-22, no build — Scott "just exploring"):** EG number +12898038797 is **SMS+MMS capable** but Bria/SIP CANNOT text (SIP≠SMS; Twilio SIP Domains don't bridge to SMS). Texting needs a separate layer (buy a shared-inbox app, or build on Twilio Conversations). **Latent issue:** number has NO sms_url → inbound texts are DROPPED (2 already sat unhandled from +19292995393); worth wiring routing regardless. Outbound texting gated by CASL consent (same shape as the call-recording/QC gate). No messaging service exists yet.

**Hiya "Code Ninjas" branding confirmed on handset 2026-07-21** — full path proven (human call as EG number → brand displayed). OPEN: (1) watch registration persistence (0 regs seen post-call; tune keep-alive if restart needed per call); (2) Phil to do same Bria setup (creds `phil-eg` already exist).
