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

## Moe's two-asks reply (2026-08-27, via Scott)
- Test number **613-668-4805** → written to Centre Lookup I16 (was Scott's cell). Personal email **me_loiselle@hotmail.com** → M16 + KB shared as editor (notification sent — needs Google-account association on his end).
- ClickUp guest DONE 2026-08-27: Scott invited manually (API is Enterprise-gated, TEAM_110); Moe user_id **87469369** → N16 written (clears the PipelineRegressionCheck clickup_user_ids FAIL).
- Carrier = **Freedom Mobile** (the "landline" 343-843-2033 is wireless). Go-live forwarding = GSM MMI codes: all-conditional `**004*13432967200#` (busy+no-answer+unreachable in one), disable `##004#`; no-answer-only `**61*13432967200#`. Include in go-live confirmation email; note possible per-min forwarding charges on Freedom.

## REMAINING MANUAL (before go-live) — same shape as Kanata
1. ~~ChatDash~~ ✅ DONE 2026-08-27 (Scott): BOTH agents wired — Retell-verified webhook_urls now api.chat-dash.com (outbound→ChatDash agent 6a8a0c59d7c9552b92034fd0, inbound→6a8a106a2effedaeaae6961e). ⚠️ inbound webhook now routes VIA ChatDash (was direct) — the pending test inbound call must confirm the summary email still arrives (proves ChatDash inbound forwarding URL → inbound-end-of-call is right)
2. ~~Hiya~~ ✅ DONE 2026-08-27 (Scott): +13432967200 registered as "Code Ninjas Barrhaven"
3. **2026-08-25: CONSOLIDATED v2 email sent to Scott's inbox (Resend 95b370f2…) — forward THIS one; supersedes v1 (732991ed…/01c16117…), original ad702090…, addendum 853eef35…. v2 REMOVES the LineLeader forwarding section (obsolete — Zap-era lead ingestion, nothing centre-side; Scott caught the stale ask 2026-08-25).** Covers: two-asks (test # + personal email), LineLeader forwarding (Outlook + Power Automate), KB with live link, inbound receptionist + star codes + don't-enable-yet. KB doc shared as EDITOR to barrhavenonca@codeninjas.com (silent, via drive-share-file webhook) — add Maurice's personal email as editor when he replies. Template fixes shipped same day: client email Step 4 inbound section; checklist email Cekura-429→per-centre-cron + ChatDash inbound-agent step
4. Verify `barrhavenonca@codeninjas.com` real (it IS the KB/site contact email — likely fine)
5. ~~CRM lead forwarding~~ → ✅ DONE 2026-08-27: Scott added `barrhaven-on-ca` to the Zap facility_slug filter — Barrhaven lead flow LIVE (Testing=TRUE → dials ring Moe's 6136684805)
6. **Test-instructions email sent to Scott 2026-08-27 (Resend 5f72e48a…, forward to Moe):** Test 1 = dial +13432967200 (validates ChatDash inbound re-route: summary email to centre inbox + ClickUp task = PASS signal); Test 2 = Request-Info fill on barrhaven page → dial rings 6136684805 (validates Zap + outbound ChatDash forwarding); book-and-cancel tour encouraged. THEN: call forwarding (Freedom `**004*13432967200#`) + add to LIVE_INBOUND_CENTRE_IDS
7. ~~flip Testing~~ ✅ **GO-LIVE 2026-09-05**: Moe ready per Scott. Outbound test PASSED E2E (Sep 2 19:08 ET, 248s, tour BOOKED — Moe must delete Fri Sep 11 5PM "Rosa" test booking from calendar). Testing=FALSE (H16), Rosa row 536 cancelled_test, **Luis Martinez + Scott Ship REPLAYED** (msgs 1a07288b/1a07288c → real dials). Go-live email w/ Freedom `**004*13432967200#` sent to Scott's inbox (Gmail 1a072892). ⚠️ OPEN GATES: (a) inbound agent has ZERO calls ever — ChatDash inbound webhook re-route STILL UNVERIFIED; go-live email asks Moe for one test call to +13432967200 before/at forwarding — verify summary email arrives, THEN add barrhaven-on-ca to LIVE_INBOUND_CENTRE_IDS; (b) post-booking re-dial on Rosa (Sep 3+4 dials AFTER Sep 2 booking) — EOC completed-write missed row 536 in Testing mode, investigate (echoes the lead_id-mismatch class)

## Dedupe test-mode bug — 2 real leads dropped (found 2026-09-02, FIXED)
- Dedupe Judge deduped on `phone_override` (the DIAL target) — under Testing=TRUE every lead's override = the centre test number, so lead #2+ matched lead #1's active row and was DROPPED. Surfaced only now because Barrhaven's test number is MOE's cell (6136684805), not Scott's allowlisted 9059672357 (which masked the bug for Burlington/Kanata's whole test period).
- **FIX SHIPPED 2026-09-02** (backup `/root/n8n-backups/dedupe-testmode-fix-2026-09-02/`): Judge now dedupes on the lead's REAL phone (`Sanitize & Validate` customer_info[3], index-paired) + new bypass when lead phone == centre test_number (test fills never block each other). Verified live in workflow 6sPwo7ngPyTWfmwM.
- **DROPPED REAL LEADS AWAITING REPLAY** (both 2026-09-01, Zap emails in +barrhaven inbox): Luis Martinez / Nicolas Inquiry / 8195928435 (msg 1a05f009d3bb27d8) and Scott Ship / AS Inquiry / 6132037071 (msg 1a05f2753fd32bd3). Replay = re-send body to scott.james1717+barrhaven-on-ca@gmail.com. **HELD: Testing=TRUE means replayed dials ring MOE, burning all 4 attempts on his cell — replay only after Testing=FALSE, or hand both to Moe's staff for manual callback now.** Scott decides.
- Rosa-6136684805 (row 536) = Moe's Test-2 fill (his cell), retry_pending attempts=2 — his outbound test still in progress, next dial 18:48 ET 9/2.

## Post-go-live sweep (2026-09-06)
- **Regex Extract multi-item collapse FOUND+FIXED**: node ran once-for-all-items w/ single-item return → 2 Zap leads in ONE Gmail-trigger tick = item 2 silently dropped (Luis Martinez, exec 33450 — Scott Ship survived as item 1). Rewritten per-item index-paired to Gmail Trigger (Dedupe-Judge pattern), backup `/root/n8n-backups/regex-extract-peritem-2026-09-06/`. Same #61 disease class, new organ. Luis RE-REPLAYED solo (msg 1a078dc7…).
- Moe did 2 MORE test fills (Rebecca/Rola, both his cell) → dialed him 2× Sep 5 19:13; rows 544/550 closed cancelled_test (were set to re-dial Sep 7/8).
- **First ORGANIC real leads dialing**: Jeremie-6138649953 (Sep 6 10:08, vm) + Lindsay-6132910681 (Sep 6 16:26, vm), both attempt-1 on cadence. Scott Ship attempt 2 ~Sep 6 18:38 ET.
- Inbound STILL zero calls — Moe's "I called" was the LANDLINE (Twilio logs show 0 calls to the DID ever). Asked via Scott: dial exactly +1 343-296-7200. ChatDash inbound leg + LIVE_INBOUND_CENTRE_IDS still gated on that call.

Related: [[kanata-burlington-onboarding-2026-06-12]], [[feedback-onboard-both-directions]], [[voicemail-hallucination-fix-2026-07-16]], [[inbound-slot-source-eg-contamination-2026-06-18]]
