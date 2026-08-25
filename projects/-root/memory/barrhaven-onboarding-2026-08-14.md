---
name: barrhaven-onboarding-2026-08-14
description: "Barrhaven fully provisioned (testing=TRUE) via onboard-centre.ts — all resource IDs, clone-inherit gotchas fixed, remaining manual go-live items"
metadata: 
  node_type: memory
  type: project
  originSessionId: 65a93970-0aa7-4862-ab9e-5daa7a1897f6
---

**Barrhaven** (Ottawa suburb) onboarded 2026-08-14. Owner **Maurice "Moe" Loiselle** — also part-owner of Kanata with Shauna + Ian Chan. Email (from Scott 2026-08-24): **maurice.loiselle@codeninjas.com** — KB doc shared to it as editor same day (silent). Use it for the ChatDash client login email. Still need a PERSONAL (non-codeninjas) email via the two-asks reply for the ClickUp guest ([[email-columns-roles]]).

## Provisioned (single-number model, Testing=TRUE)
- Centre code `barrhaven-on-ca` | 34 Highbury Park Drive Unit 9C, Ottawa K2J 5C6 | landline 343-843-2033
- Twilio **+13432967200**, trunk barrhaven-cnkb.pstn.twilio.com
- Retell outbound `agent_78b3b359c341d2a084a893f161` / `llm_4dbe367d2b4ebdc6ce8061f1084c` (CNKB-Barrhaven)
- Retell inbound `agent_ed614e3ebcda137c3d07f796b0` / `llm_22ca8d0543668eeeb31b547b8d86` (CNKB-Barrhaven-Inbound), bound both directions, webhook → inbound-end-of-call ✓
- Cekura agent **21487**, scenarios 320218/320219, Tier-2 cron **590** (`45 6 1-7,15-21 * 3` ET)
- ClickUp folder 90118252436, Inbound `901114322298` / Outbound `901114322299` (unassigned — no guest yet)
- KB doc `1hJbXpqDv9oXGiCu9mMob7aBXFTSpiWfnU6aFUf8fwIw` (we own, in centres.json, crawled w/ hours+camps; NOT yet shared to Maurice)
- Centre Lookup **row 16**; E16 landline backfilled `13438432033` (digit format like EG); P16 KB URL fixed (script had left EG reference placeholder)
- TourForce Supabase: centres + centre_agents (outbound+inbound) rows inserted
- SyncPrompt CLONES += Barrhaven (both ~/.claude/skills and poseidon-repo — repo NOT committed)
- calendar_api.py CENTRES += barrhaven (service restarted); PHONE_TO_CENTRE registry updated via provision-inbound
- **Slot gate C1-C5 PASS** (31 real slots, distinct from EG) — via the Sonamation API path, see [[sonamation-scheduler-migration-2026-08-14]] (Barrhaven's calendar only exists on Sonamation; old-widget scraping can never work for it)

## Clone-inherit gotchas caught (recheck on future onboards)
1. **voicemail_option static text cloned EG's verbatim** (EG name + EG callback #) — rewrote for Barrhaven/343-843-2033. onboard-centre.ts does NOT localize it.
2. **Inbound get_tour_slots URL cloned EG's endpoint** — provision-inbound slot gate caught it; repointed to `/retell/get-slots/barrhaven`. Also needed calendar_api CENTRES entry.
3. begin_message_delay_ms=1500 DID inherit correctly (double-greeting fix in EG golden source).

## REMAINING MANUAL (before go-live) — same shape as Kanata
1. ChatDash: create agent CNKB-Barrhaven + client (login maurice.barrhaven), forwarding URL → outbound EOC webhook
2. Hiya branded caller ID for +13432967200 ("Code Ninjas Barrhaven")
3. **2026-08-25: CONSOLIDATED v2 email sent to Scott's inbox (Resend 95b370f2…) — forward THIS one; supersedes v1 (732991ed…/01c16117…), original ad702090…, addendum 853eef35…. v2 REMOVES the LineLeader forwarding section (obsolete — Zap-era lead ingestion, nothing centre-side; Scott caught the stale ask 2026-08-25).** Covers: two-asks (test # + personal email), LineLeader forwarding (Outlook + Power Automate), KB with live link, inbound receptionist + star codes + don't-enable-yet. KB doc shared as EDITOR to barrhavenonca@codeninjas.com (silent, via drive-share-file webhook) — add Maurice's personal email as editor when he replies. Template fixes shipped same day: client email Step 4 inbound section; checklist email Cekura-429→per-centre-cron + ChatDash inbound-agent step
4. Verify `barrhavenonca@codeninjas.com` real (it IS the KB/site contact email — likely fine)
5. ~~CRM lead forwarding~~ → **Scott adds `barrhaven-on-ca` to the Zapier facility_slug filter** (Request-Info Zap, his seat) — safe immediately: Barrhaven is HubSpot-native, never had LineLeader (no dual-ingestion risk). Lead flow is DEAD until this is done. onboard-centre.ts checklist template now carries this as task #1 for future onboards (2026-08-25)
6. Call forwarding (no-answer → +13432967200), then add to LIVE_INBOUND_CENTRE_IDS
7. After E2E test lead: flip Testing=FALSE (H16)

Related: [[kanata-burlington-onboarding-2026-06-12]], [[feedback-onboard-both-directions]], [[voicemail-hallucination-fix-2026-07-16]], [[inbound-slot-source-eg-contamination-2026-06-18]]
