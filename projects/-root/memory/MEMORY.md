# PAI Memory

## ▶ Active Transfer Doc
- [Open follow-ups 2026-06-10](open-followups-2026-06-10.md) — resume from `/root/handoff-2026-06-10-followups.md`; Burlington/Riverside ClickUp guests, MED-3 awaiting Sharmila (task 868jzej5p), retire col N, deeper MED-1.
- [Kanata + Burlington onboarding 2026-06-12](kanata-burlington-onboarding-2026-06-12.md) — Kanata fully provisioned (+16137028134, agent_aac096…, row 15, testing=TRUE); Burlington guest wired. Inbound provisioned for BOTH 2026-06-12 (Burlington agent_7950e8…, Kanata agent_c3d64f…, smoke PASS). OPEN: ChatDash+Hiya for Kanata, forward emails to Shauna, call forwarding, flip testing.

## ▶ ClickUp +2-Day Due Dates (2026-06-30)
- [+2d due dates fleet-wide + deleted-tasks recovered](clickup-due-date-2026-06-30.md) — added `due_date=now+2d` to 3 ClickUp creator nodes (outbound EOC `4p1V0wESn3kZySt6` Create Staff Follow-Up Task; inbound EOC `3oV7SpPKWmr3xJlQ` Create ClickUp Task + Create Cancel Task) + backfilled open tasks. Sharmila user_id 87425193. Token still hard-coded in n8n nodes (move to cred; `CLICKUP_PERSONAL_TOKEN` in `/root/.claude/.env`).
- [6/9 23:47 batch = real backfill, NOT junk](feedback-clickup-backfill-not-junk.md) — read a task body before deleting; "+1xxx" are real callback numbers. I deleted Pickering's 5 by mis-classifying them, rebuilt as `868k6h22*`.

## ▶ Slot-Weekday Hallucination Fix (2026-06-30)
- [Agents fabricated tour weekdays → fixed at source+prompt+audit, fleet-wide](slot-weekday-hallucination-fix-2026-06-30.md) — SLOTS/get_tour_slots fed ISO dates only but prompts said "speak the day of week" (from the 6/1 trim; Cekura empty-var harness was blind). Fixed Format Slots in both n8n outbound wfs + calendar_api.py inbound + 7 outbound & 5 inbound prompts (read-exactly guard) + audit.py HALLUCINATION→HIGH floor. Backups in `/root/n8n-backups/slots-weekday-fix-2026-06-30/` + `/root/cnkb-slots-weekday-prompt-2026-06-30/`. OPEN: confirm next real call renders right; add real-slots assertion to the gate.

## ▶ On-Site Callback Rev (2026-06-19)
- [Parking-lot/running-late → call back in a few min](onsite-callback-rev-2026-06-19.md) — StCath inbound patched (Shauna's ask): time-sensitive on-site callers told to call centre back shortly instead of slow callback. Real-time staff-alert outbound agent filed as GitHub lead-reactivation#60. OPEN: fan block to other 4 inbound agents; Shauna's cell for #60.

## ▶ CORE Classifier Drop (2026-06-24)
- [CORE leads dropped 6/12-6/23 + fixed](core-classifier-drop-2026-06-24.md) — `Classify Lead` regex `/New CORE Inquiry/` never matched real subject `New CORE Program Inquiry` → every CORE lead dropped (all centres) since 6/12; Nadine Gageiro was one. Fixed `/New CORE(\s+Program)?\s+Inquiry/i`, gate PASS. SUPERSEDES the StCath "forwarding lapse" theory below. 21 backfill armed (n8n `QdsKZXl5clf26jsd`, fires 6/25 18:00 ET); batch-lead detection = #61.
- [Backfill fired early 6/24 — only 1/21 dialed; #61 fix + throttle finding](core-backfill-batch-collapse-2026-06-24.md) — 6/24: manual trigger (exec 22020) injected 21/21 but Classify Lead collapsed 21→1; only Nadine Gageiro (EG) dialed, 20 dropped+consumed. Backfill DEACTIVATED. **6/25: applied #61 per-item fix (Classify Lead + Format Slots, gate PASS, pipeline `6sPwo7ngPyTWfmwM` backed up) BUT burst still infeasible — `Get Availability`=33.5s live `/extract-calendar` scrape (global lock) vs `executionTimeout=90s` → batches cancel (proven via canary execs 22115/22116). Recovery must be THROTTLED-SERIALIZED (inject→wait→next, ~20min). 6/26 ~13:17 ET: Scott fired it — **DIALED 20/20**, each to its own parent number (`/tmp/recover20.py`, execs 22171–22264, no dups/mismatches). #61 fix proven live: exec 22217 batched 2 items (Titilope DIAL + unrelated TX lead→Not Enabled), Classify items=2 not collapsed. New flag: a real CORE inbound lead for a US/TX centre (Spring-Rayford) is landing in scott.james1717 inbox → dropped Not Enabled (possible HQ mis-forward). RESOLVED.**

## ▶ Skyvern False-Failure Fix (2026-06-27)
- [Booked tours returned status:failed → fixed at source + n8n net](skyvern-false-failure-fix-2026-06-27.md) — Skyvern wf `wpid_472637885728525632` block_1 had empty `complete_criterion` + `max_steps:10` → couldn't detect CN confirmation page → re-clicked Submit to MAX_STEPS → `failed` despite booking (prod run wr_542096138606647516). Fixed v16: complete/terminate criteria + max_steps→25 (Skyvern API key now in `/root/.env`). n8n net (`deploy-skyvern-flow-fix-2026-06-27.py`): both EOC Wait 30→45min, "Failed" rule += `failure_reason notContains "maximum steps"` → MAX_STEPS falls to Manual-verify. Gate PASS. OPEN: confirm next real booking returns `completed`.

## ▶ Scrape-Timeout Requeue (2026-06-29)
- [6/26 canary FAIL was a synthetic scrape-collision → fixed w/ node-timeout + graceful requeue](scrape-timeout-requeue-2026-06-29.md) — exec 22120 hit outbound `executionTimeout:90` (3 synthetic scrapes stacked behind the 33.5s global scraper lock); appended but dial never fired. ZERO prod impact (only test leads collided). Fixed BOTH `Get Availability` nodes (`6sPwo7ngPyTWfmwM` + `rt0aEuDnFv3ZCl1y`): 35s catchable node-timeout → error branch REQUEUEs (`retry_pending`, next tick ≤90min, no attempt burned), cap 5 → `manual_review`+alert. Paired-item gotcha: outbound uses `$('Append row in sheet').first()`, scheduler uses per-item `$json.*`. Outbound LIVE-PROVEN (exec 22568); scheduler verified-by-construction (offered live test). Backups/scripts in `/root/n8n-backups/scrape-timeout-requeue-2026-06-29/`.

## ▶ E2E Lead-Flow Gate (2026-06-24)
- [Live deploy gate: synthetic lead → real call](e2e-leadflow-regression-harness-2026-06-24.md) — `E2ELeadFlowCheck.py` drives a `New CORE Program Inquiry` through the whole pipeline; asserts it reaches the dial (catches classifier-class breaks the static gate can't). Helper wf `joLG6ji6JEMW6aaW`, fixture row `regression-test` (Testing→Scott's cell). Weekly canary `e2e-leadflow-check.timer` Thu 19:00 ET (rings cell, emails on FAIL). Run after [[pipeline-regression-gate]].

## ▶ StCath Dashboard Empty (2026-06-19) — root cause CORRECTED → see core-classifier-drop-2026-06-24
- [Outbound lead-supply dry since June 8](stcath-outbound-starvation-2026-06-19.md) — StCath outbound idle: no leads appended to MasterSheet since ~6/8 (last=Rachel 9059311485, exhausted). NOT a bug — Centre Lookup row healthy/enabled, pipeline dials 5 other centres fine, inbound busy. Upstream forwarding lapse suspected (LineLeader→HubSpot migration). Next: confirm with Shauna. Inbound-wiring half: ChatDash now wired on StCath inbound (agent `6a34b517d33388e95eeefd6f`), verified Retell→ChatDash→n8n live (execs 21605-07).

## ▶ Inbound Slot-Source EG Contamination (2026-06-18)
- [Agents served EG's slots to other centres](inbound-slot-source-eg-contamination-2026-06-18.md) — StCath/Kanata/Burlington inbound `get_tour_slots` hit generic `/retell/get-slots` → `calendar_api.py` defaulted to east-gwillimbury → StCath offered closed-Friday slots (Louis 6/26). Fixed: all 5 live inbound centres added to `CENTRES` cache (Leaside slug `on-leaside`→`leaside-on-ca`), EG default removed (→safe "unavailable"), 4 inbound LLM tool URLs repointed to `/retell/get-slots/<centre>`. Backups saved. OPEN: re-contact Louis for a real StCath slot (Thu 6/25 5:30 PM).

## ▶ Booking Verification Dead-Branches (2026-06-18)
- [Dead-branches + Skyvern Wait timeout fixed](booking-verif-deadbranch-fix-2026-06-18.md) — Booking Verification `dUEa8NI0z8vq2LSL` Row Found[false]→orphaned `no row` email (killed Scott's verif emails; inbound never matched MasterSheet). REAL root cause of dropped bookings: both EOC `Wait on Skyvern` nodes timed out at 15min but Skyvern takes ~20min→`body=null`→switch matched nothing. Fixed: Wait 15→30min (inbound+outbound `4p1V0wESn3kZySt6`), `fallbackOutput=extra` on both switches. Regression PASS. StCath 06/26 likely DID book (LineLeader notif 21:59) — confirm in LineLeader (ClickUp 868k1wwnp). OPEN: Resend confirm/fail nodes still test-mode.

## ▶ Lead Program Expansion (2026-06-12)
- [Create+Junior+Camp outbound](lead-program-expansion-2026-06-12.md) — trigger widened to subject:Inquiry, Classify Lead node (CORE→create, JUNIOR→junior, "New Inquiry for"→camp), lead_program col Z + dynamic var on both call paths, program-aware Stage 1 on all 7 outbound LLMs. OPEN: existing centres must drop their "New CORE Program Inquiry" forwarding filter.

## ▶ Active Experiment
- [Retry cadence A/B 2026-06-10](retry-cadence-ab-2026-06-10.md) — global switch (all live centres) to ASAP attempt 1 + 6:30pm-ET on day+1/+2/+3. New "Every Day 6:30pm ET" cron in Retry Scheduler `rt0aEuDnFv3ZCl1y`; cadence in `Calculate Next Call` (`4p1V0wESn3kZySt6`). Backups + revert path in file.

## Droplet Ops
- [Droplet /usr/bin/claude missing](droplet-claude-symlink-fix.md) — half-finished `npm i -g @anthropic-ai/claude-code` leaves `/usr/bin/claude` deleted; old staging dir `.claude-code-<HASH>/bin/claude.exe` still runs. Symlink fix or full reinstall — both documented.
- [Deploy creds in /root/.env](deploy-env-sourcing.md) — N8N_API_KEY+ELEVENLABS live in /root/.env; Bash tool shell is non-login & non-persistent so it's absent unless you `set -a; . /root/.env; set +a` inline before deploy-*.py. Not "lost n8n access."
- [Scraper lock deadlock fix](scraper-lock-deadlock-fix-2026-06-16.md) — calendar-api hung holding global extraction_lock (no scrape timeout); shipped 90s wait_for + bounded acquire + timed browser.close + `scraper-watchdog.timer` (5min, restarts on stale>30min/unreachable). Cache age in /health is the canary.

## Security Rules (CRITICAL)
- [No live credentials in memory files](feedback-no-credentials-in-memory.md) — memory dir is on public GitHub; passwords/keys/SIP auth must be 1Password pointers, not literals (GitHub secret scanning blocked Leaside push 2026-04-25)

## Scheduling Policy
- [Schedule via systemd timers on the droplet](feedback-schedule-via-systemd-timer.md) — default scheduled tasks to `.timer`+`.service` on n8n-production (full env/connectors/files), NOT cloud `/schedule` (sandbox has no Retell/Gmail/n8n + no local files). Confirmed by Scott 2026-06-25; pattern = [[retry-cadence-ab-2026-06-10]] read-out.

## Communication Style
- [Re-deliver deliverables on re-ask](feedback-redeliver-on-reask.md) — when Scott asks "did you send X?" twice, paste it again clean; don't say "scroll up"
- [BCC Scott on all centre-bound emails](feedback-bcc-scott-on-centre-emails.md) — every n8n email node routing to centre director must include bccAddresses=scott.james@codeninjas.com (skip Scott-only). Baselined 2026-05-10 across 9 nodes in 2 workflows.
- [Announce before test-sending](feedback-announce-before-sending.md) — don't add dry-run flags to send-capable scripts; just say "I'm about to send X" before running. Scott prefers real sends with a heads-up over synthetic dry-runs.

## Business Seasonality
- [Outbound is seasonally slow in June](outbound-seasonality.md) — summer-camp lull; recovers in August (back-to-school). Don't auto-flag dark June/July outbound as starvation unless inbound's also broken or leads stopped appending. Tempers [[stcath-outbound-starvation-2026-06-19]].

## Voice Agent Rubric
- [Staff-deflection rule is OUTBOUND-only](feedback-staff-deflection-outbound-only.md) — "team will reach out" language is banned on outbound clones (Booking Autonomy rev), but EXPECTED on inbound agents (receptionist role). Don't apply outbound rubric to inbound audits.
- [Agents book TOURS only](feedback-agents-book-tours-only.md) — never flag BOOKING_FUMBLE on camp enrolment, party, class registration, or pricing asks. Voice agent scope = tour scheduling; everything else is staff territory.
- [Inbound add-child-to-existing-booking = correct deflection](inbound-add-child-existing-booking-2026-06-25.md) — `appointment_booked=false` (call_dec5bf53…, StCath Cimo) wasn't a miss; adding a kid to a family member's full July-2 6:30 session is staff territory. Slot tool returned correct centre calendar (no EG contamination). Confirmed by Scott.
- [LLM severity caps](feedback-llm-severity-caps.md) — NAME_ECHO always LOW (style issue, never HIGH). Audit clamps post-hoc via LLM_SEVERITY_CAP dict.

## Verification Skills (CREATED 2026-05-03)
- [_CLICKAUDIT skill](clickaudit-skill.md) — click-through claim verification for dashboards. Catches "UI claims X, drill-down shows Y" semantic-drift bugs that smoke tests miss. Use for any new TourForce dashboard surface. Found 3 real bugs on first run.

## Power Automate Bridge (centre tenants — CRM Lead Forwarding)
- ["Id is malformed" debug playbook](power-automate-shared-mailbox.md) — Forward (V2) on shared mailbox = 400 "Id is malformed". Fix: swap to Send (V2). Live-call triage order included. Older onboarding emails caused drift; current script (onboard-centre.ts:1061) is correct. Riverside/Leo 2026-05-03.

## Onboarding Policy (NEW 2026-06-12)
- [Onboarding email: two asks](feedback-onboarding-email-two-asks.md) — every director-facing onboarding email (template OR hand-drafted) must request a test phone number + a non-codeninjas email for ClickUp guest access.
- [Onboard BOTH directions](feedback-onboard-both-directions.md) — every centre gets inbound+outbound agents (returned-call gap); onboard-centre.ts step4b auto-clones inbound, gate fails without binding; run provision-inbound.ts post-KB for registry+smoke.

## KB Ownership (NEW PROCEDURE 2026-05-08)
- [KB ownership stays on our side](feedback-kb-ownership-flow.md) — WE create + own + share editor access to centre; centre never copies. onboard-centre.ts now requires `--kb-doc-id` flag and uses the new email pattern (fixed 2026-05-08).
- [n8n googleDocs credential has Drive scope](n8n-google-docs-credential-has-drive-scope.md) — credential ID `58qerrOCaSjZ51WF` works for Drive API permissions:create. Pattern verified by silently sharing St. Catharines KB to shauna.chan@codeninjas.com 2026-05-08. Earlier memory's `hTsOcQ3CNsZ5e1xQ` was a workflow ID, not credential.

## Skyvern Auto-Booker (Pickering trace, 2026-05-08)
- [Switch1 dead-branch fix](skyvern-deadbranch-fix.md) — EOC Switch1 had unwired terminated/timed_out outputs, dropping Sandra Truong's Pickering booking silently. Wired both to new "Send Manual Booking Needed" Gmail node. Fixed 2026-05-08.
- [Pickering outbound IS Skyvern-wired](pickering-skyvern-wired.md) — Skyvern runs on every centre's booked outbound calls, not just EG-Inbound. Earlier memory was wrong.
- [Skyvern vs scrape-API disagreement](skyvern-calendar-disagreement.md) — when Skyvern terminates with "slot not found" right after a fresh scrape said it was open, it's two-source disagreement, NOT staleness. Don't ship a refresh-slots fix; refresh is already wired.
- [Staff-followup promise drops silently](staff-followup-promise-dropped.md) — AI tells parents "a staff member will reach out" for Junior-program siblings; no workflow node honors it. Surfaced 2026-05-08 via Viji Ruban's 6yo dropped handoff.
- [Staff Follow-Up notification — generic 2026-05-31](staff-followup-pickering-pilot.md) — schema baselined across all 6 outbound CNKB agents; EOC branch fires Gmail always + ClickUp task gated on `clickup_outbound_list_id` (outbound EOC `4p1V0wESn3kZySt6`, "Has ClickUp Config?"). NOT StCath-only anymore — **Pickering is live** (list 901113931619 "Outbound", assignee 87425193 director; proven by call_1befa…/exec 22516 → task 868k6550n, 2026-06-29). Pilot framing obsolete.
- [Email Info Request rev 2026-05-31](email-info-request-rev-2026-05-31.md) — agents now honor "can you email me this?" via Staff Follow-Up branch with reason=email_info_request (was deflected to booking pre-rev). Shipped to all 6 outbound CNKB clones.
- [Audit rubric patches 2026-05-26→31](audit-rubric-patches-2026-05-26-31.md) — 4 false-positive classes squashed: junk-call filter, Create=8-14 sync, TOURS-only deflection scope, DECLINE_MISSED email-channel tolerance.
- [EOC centre_email not plumbed](eoc-centre-email-not-plumbed.md) — all 4 notification email nodes either hardcode Scott or reference undefined `centre_email`. Pre-req fix before cross-centre rollout: add Lookup Centre node + update all 4 sendTo expressions.
- [ClickUp assignees must be centre director, not Scott](feedback-clickup-assignee-per-centre.md) — for non-EG centres, task `assignees` should be the director's ClickUp guest user_id (keyed off non-codeninjas personal email). Add `director_personal_email`, `clickup_user_id`, `clickup_list_id` columns to Centre Lookup before cross-centre rollout.

## Synthetic Lead Testing (HARDENED 2026-05-03)
- [Gmail-to-self skips Delivered-To](feedback-gmail-self-send-no-delivered-to.md) — Extract Centre node now falls back delivered-to → to. Synthetic lead test pattern documented (temp webhook + Gmail Send via creds x1W7EpNhmEdx8cOR).
- [Onboard centre = write KB URL to BOTH stores](feedback-onboarding-kb-url-checklist.md) — kb-crawler/centres.json AND Centre Lookup `knowledge_base` column. Riverside hit this gap; Get KB errors with "Bad request" when column is empty.
- [Centre launch has two registration surfaces](centre-launch-two-surfaces.md) — lead-reactivation Centre Lookup (sheet) AND TourForce portal Postgres (centres + centre_agents + portal_users). Different centre_id namespaces (`ct-riverside` vs `riverside-ct-us`). Riverside flagged 2026-05-03.

## Retell Billing
- [LLM Token Surcharge = prompt-size scaling](retell-llm-token-surcharge.md) — 3,500-tok limit; surcharge scales billed duration by prompt_tokens/3500. Static CNKB prompt ~6.6K tok (1.9× limit) is the driver, NOT KB injection (~1.4K). Was 56% of the May receipt. Trim prompt, not KB; validate vs Cekura 13260 first.

## CN HubSpot Migration (ANNOUNCED 2026-04-23)
- [HubSpot migration](hubspot-migration.md) — HQ replacing LineLeader system-wide. Pilot end-of-May, full rollout June/July 2026. Invalidates CORE Gmail-trigger; ship HubSpot↔n8n bridge before pilot. Partner: SonaMation.
- [CRM-agnostic design rationale](crm-agnostic-design-rationale.md) — voice AI was built CRM-free on purpose (ActiveCampaign rumour at build time). Use for "should we wait for HubSpot?" objection-handling.

## Vinsi.ai Competitive Threat (2026-04-24)
- [Vinsi competitive analysis](vinsi-competitive-analysis.md) — generalist voice-AI SaaS funnel for Matt Reeser's 2K-person LatAm BPO. Insider-owner sales channel inside CN franchise. CN-native depth + 11 live centres is TourForce's moat.

## NV Pilot Wrap-Up (2026-05-01)
- [NV Pilot Archive](nv-pilot-archive.md) — full deliverables at `/root/nv-pilot-archive/` (deck, report, source calls). Reframed as catalyst for inbound + $199 Standard tier; 4-centre multi-discount $706/mo.
- [Testimonial capture playbook](playbook-testimonial-capture-at-exit.md) — async LinkedIn-rec ask with pre-drafted text at client exit; tracked in XPrime17/lead-reactivation#51, nudge fires 2026-05-15

## Context Isolation Rules (CRITICAL)
- **Retell** = voice AI platform (agents, LLMs, clones, calls, prompts). OPERATIONAL system.
- [Retell dashboard call URL format](retell-dashboard-url-format.md) — single-call deep link is `/call-history?history={call_id}`. `/calls/{id}` silently redirects to agents page.
- [Retell disconnection_reason semantics](retell-disconnection-reasons.md) — `user_declined` = phone rejected call (0s, no transcript), NOT a conversational decline
- [Voicemail greeting mis-read as user](feedback-voicemail-greeting-hallucinated-as-user.md) — when `in_voicemail=true`, answering-machine greeting is transcribed as live user speech; call_summary fabricates engagement + fake names (Ativ→"Latif"/"Steve"). Trust `in_voicemail`, ignore summary/extracted names on voicemail.
- [Retell call_type enum two-side gotcha](retell-enum-two-side-gotcha.md) — adding new call_type values requires BOTH prompt AND post_call_analysis_data description updates; skipping either silently coerces to "other"
- [TTS reads `\!` as "Hush"](tts-backslash-pronounced.md) — never escape punctuation in begin_message / prompt; Retell TTS pronounces backslashes literally (EG inbound, 2026-05-02)
- [Retell boosted_keywords lives on agent](retell-boosted-keywords.md) — `boosted_keywords` is on the agent object (HTTP PATCH /update-agent), NOT the LLM; not exposed in MCP. Default seed list for CN agents documented.
- [press_digit rollout 2026-05-13](retell-press-digit-rollout.md) — DTMF tool wired to 7 of 8 outbound CNKB LLMs; bypasses call-control "press 9 to get through" gates. Triggered by Pickering call_f2fbc5c0 lost lead.
- [Phone-number weighted *_agents API](retell-phone-weighted-agents-api.md) — Retell deprecated singular `*_agent_id` (2026-03-31) for `*_agents` arrays `[{agent_id,weight}]`; unbind=`[]`. Migrated provision-inbound/onboard-centre/Offboard 2026-05-31. `inbound_webhook_url` + call-level `override_agent_id` unaffected.
- [v2→v3 list-calls migration](retell-v3-list-calls-migration.md) — DIFFERENT deprecation than phone-fields; `/v2/list-calls`→`/v3/list-calls` (cutoff 2026-06-15). v3 returns `{items,pagination_key,has_more}` not a bare array; get-call stays v2. All 5 sites migrated 2026-06-01; audit.py + portal need redeploy.
- **Cekura** = testing/evaluation platform (scenarios, metrics, test runs). QA TOOL.
- When Scott asks about agents, calls, prompts, clones → Retell section. Do NOT load Cekura.
- When Scott asks about testing, scenarios, metrics → Cekura section.
- Only cross-reference when Scott explicitly asks to test a Retell agent via Cekura.

## _SYSTEMCHECK Skill (UPDATED 2026-04-12)
- [SystemCheck & Recovery Runbook](systemcheck-skill.md) — health checks + outage recovery playbook (updated after Apr 2026 incident)
- Daily automated check: scheduled agent `trig_01C22DnX7QHRaxXQbCi6xGiL` (9 AM EDT, emails on FAIL)
- n8n Heartbeat Monitor: workflow `tjV2GzfUksyS4t4m` (every 12h, emails if Outbound inactive >24h)
- Scraper: `calendar-api.service` on this machine (138.197.171.204:5001), uses threading.Lock for concurrency

## _KBCRAWLER Skill (CREATED 2026-04-24)
- [KB Crawler architecture](kbcrawler-skill.md) — nightly crawl of services.codeninjas.com API → Google Doc KBs for voice agents
- Script: `/root/kb-crawler/crawl.ts` | Timer: `kb-crawler.timer` (2 AM ET)
- n8n cloud: GDocs Read `NZddHLft1gzuUrRL`, GDocs Write `hTsOcQ3CNsZ5e1xQ`
- **Leaside doc needs editor share** — write fails (read-only). Riverside needs doc created.
- Self-hosted n8n API key: `op://Private/n8n self-hosted/api-key` (ROTATE — literal was committed to public repo)
- [Summer-camp flag (Jan-Jun)](kbcrawler-summer-camp-flag.md) — banners centres missing Jun/Jul/Aug camps in nightly email; silent Jul-Dec. Sudbury flagged in 2026-05-26 baseline.

## _DAILYCALLAUDIT Skill (MIGRATED 2026-04-29)
- [Daily Call Audit on droplet](daily-call-audit-droplet.md) — moved from Anthropic cloud → systemd timer on n8n-production droplet after silent Cloudflare-1010 failures. Script: `/root/daily-call-audit/audit.py`, timer: `daily-call-audit.timer` (01:00 UTC). Cloud routine `trig_01DTTBcgns1s4nGDD3EvhPkG` is RETIRED (enabled=false).
- **api.resend.com behind Cloudflare** — any HTTP POST MUST set `User-Agent: Mozilla/5.0` or it 403s with error 1010 (default `curl`/`python-urllib` UA blocked)
- [Already-enrolled calls are not bugs](feedback-already-enrolled.md) — don't flag "already signed up" outbound calls as audit issues, business outcome is correct
- ["No tour info" false positive — key casing](audit-tour-info-key-casing-2026-06-28.md) — audit.py:284 keyed snake_case `tour_date/tour_time/child_age` but Retell schema + n8n EOC use Title Case `Tour Date/Tour Time/Child's Age`; flagged EVERY booking fleet-wide. Booking was real (Skyvern fine). Fixed key names 2026-06-28.

## CNKB Prompt + Workflow Rev (2026-04-21/22)
- [EG-Inbound camp-handoff (2026-06-15)](eg-inbound-camp-handoff-2026-06-15.md) — inbound EOC `3oV7SpPKWmr3xJlQ` routes on appointment_booked NOT staff_followup_needed (camp lead was nameless, not dropped). Shipped: prompt patch (grab name early, cap spoken lists at 3, offer to email full schedule) + Option A triage fix (unbooked new_lead → "needs follow-up" + Action Required, all centres). Gate PASS.
- [MED-1 deeper: inbound existing-customer recognition (2026-06-10)](med1-existing-customer-recognition-2026-06-10.md) — Option B to 3 inbound clones: name safety-net + Existing-Customer Overlay prompts, `existing_customer` post-call boolean, EOC ClickUp task flags+priority. Full phone-lookup deferred to HubSpot. Gate PASS.
- [Pre-camp tour exception (2026-06-09)](cnkb-precamp-tour-rev-2026-06-09.md) — "come see the place before camp" now books as a normal Create tour (not deflected); one exception bullet after the Booking gate, shipped to all 9 live LLMs (source+SyncPrompt for 4 clones, StCath-out + 3 inbound patched in place). Backups in kb-crawler/llm-prompt-backups/2026-06-09-precamp-tour/.
- [Repeated-Objection Escape (2026-06-07)](cnkb-repeated-objection-escape.md) — agents now hand off to staff after 2 repeats of a disputed point instead of looping ~22×. Patched in-place to all 9 live clones; SyncPrompt registry also cleaned (dropped 4 offboarded, fixed Burlington LLM, StCath excluded). Validated via Cekura 281290 (WebRTC).
- [CNKB Prompt Rev 2026-04-21](prompt-v2026-04-21.md) — age-gate (Junior 5-7, Create 7-14; overlap at 7), name-optional booking ("the guest"), SLOTS-deferred dates, Booking Autonomy section, Stage 6 soft-hold. Pushed to all 11 CNKB LLMs (~18.9K chars each). **Age ranges corrected from earlier "5-6 Junior" note — true range is 5-7 per Scott 2026-05-13.**
- [Create program age range = 8-14 (global)](create-age-range.md) — Scott 2026-05-23 corrected the overlap: Create 8-14, Junior 5-7. All 7-year-olds now flow through Junior path. Pending prompt rev blocked on St. Catharines Junior-scope feedback.
- [CNKB Prompt Rev 2026-05-23](cnkb-prompt-rev-2026-05-23.md) — shipped 4 edits to 9 LLMs: MANUAL>AUTO precedence, JR→Junior pronunciation, Booking Autonomy ages 5-7, Stage 3 age gate now KB-driven (enables centre-defined Create Prep). Crawler also patched to substitute JR→Junior in autoContent.
- [St. Catharines ClickUp folder+list](clickup-stcath.md) — folder `90117996306`, list `901113834370`. Centre Lookup now populated: `clickup_user_ids=87436757`, `clickup_list_id=901113834370`.
- [Pipeline regression gate](pipeline-regression-gate.md) — run `~/.claude/skills/_N8N/Tools/PipelineRegressionCheck.py` after ANY lead-pipeline change (workflow/Centre Lookup/Retell bindings); PASS required to ship. Catches column-rename misses + orphaned inbound centres. Add live-inbound centre_ids to LIVE_INBOUND_CENTRE_IDS.
- [EG single-number consolidation](eg-single-number-consolidation.md) — EG collapsed to one number `12898038797` (inbound+outbound), StCath model; shipped+verified 2026-06-08. ⏳ OPEN: Hiya branding submitted for 289 on 2026-06-08 (1-2 day vetting) — verify ~06-10 via branded test call ("Code Ninjas East Gwillimbury"); branding was only on old 249. Resolves orphaned-lookup root cause; new centres default one-number via onboard-centre.ts.
- [EG inbound orphaned in Centre Lookup](inbound-eoc-eg-orphaned-lookup.md) — RESOLVED 2026-06-07/08 via column-split (inbound_number/outbound_number) + `from_number` col DELETED, not the "separate row" originally proposed. EG made 0 inbound ClickUp tasks ~May 28; root cause = inbound Lookup matched dropped `from_number` col vs dialed `to_number`. Confirmed exec 20519; Paragol $281 backfilled.
- [Inbound EOC per-centre routing fix](inbound-eoc-percentre-routing-fix.md) — inbound post-call workflow `3oV7SpPKWmr3xJlQ` (now "Inbound End Of Call - Multicentre") was hardcoded to EG; StCath inbound tasks landed on EG board. Fixed 2026-05-31 via Centre Lookup keyed on to_number. Email routing fixed 2026-06-01: converted Resend→Gmail nodes (Resend acct is test-mode, 403s non-Scott recipients), now sendTo=centre_email + BCC Scott; EG centre_email set to shared inbox.
- [Returned outbound calls hit inbound AI](returned-outbound-calls-hit-inbound-agent.md) — outbound caller-ID = inbound Retell number, so leads returning missed calls reach the AI directly, BYPASSING call forwarding. "AI got an inbound call" ≠ forwarding is live (StCath/Steven 2026-05-31).
- [Q&A Loop Rev 2026-05-23 #2](cnkb-qaloop-rev-2026-05-23.md) — non-Create programs now get multi-turn KB Q&A loop before staff deflection. 4 outbound edits + 2 inbound edits across 9 LLMs. KB-gap rule prevents hallucination. Tour booking stays Create-only.
- [Onboarding Gap Fix 2026-05-23](onboarding-gap-fix-2026-05-23.md) — `provision-inbound.ts` automates the 5 manual inbound-provisioning steps; `cnkb-list-agents.ts` discovers all CNKB agents (auto-excludes offboarded). Closes the fan-out blind spot that missed StCath-Inbound earlier today.
- [StCath custom AI intro 2026-05-25](stcath-custom-intro-2026-05-25.md) — First per-centre customization of the AI disclosure. Wording option C (Shauna's pick): "...since AI is part of what we teach, we figured we'd put it to good use. Real people are right behind me if I can't get you what you need." Shipped to StCath outbound Stage 1 + inbound begin_message only. Burlington pending Scott decision.
- [CNKB Prompt Rev 2026-05-09 — Fast-Track + Silence-Resume + EG-Inbound No-Pause](cnkb-prompt-rev-2026-05-09-fasttrack.md) — three "context-collapse" fixes shipped 2026-05-09: outbound (stop re-pitching after book intent + re-ask pending Q after silence-recovery) + inbound EG (wait for weekday/weekend before fetching slots).
- [CNKB Prompt Rev 2026-05-10 — Scheduling-Anchor](cnkb-prompt-rev-2026-05-10-scheduling-anchor.md) — Stage 4/2D scheduling-preference Q now leads with "For timing,..." anchor on all 10 CNKB clones. Fixes location-vs-timing ambiguity surfaced by Stanley/Roger St.Catharines test.
- [ChatDash wired to EG-Inbound](chatdash-eg-inbound-wired.md) — first centre with ChatDash on inbound. Documents Retell→ChatDash→n8n proxy chain, per-direction forwarding URL gotcha, synthetic-test pattern.
- [Buried "skip" instructions fail](feedback-prompt-buried-instructions-fail.md) — top-level commitments beat buried "skip X" sub-bullets when writing voice-agent prompts
- [Outbound Sanitization Fix 2026-04-21](sanitization-fix-2026-04-21.md) — removed Simple Memory1 (poisoned AI extractor via constant sessionKey), added Regex Extract as primary / AI as fallback in workflow `6sPwo7ngPyTWfmwM`.
- [End-Of-Call Tentative Tour fix 2026-04-22](eoc-tentative-tour-fix.md) — new IF + Gmail branch in workflow `4p1V0wESn3kZySt6`: when appointment_booked=false BUT tour_date+tour_time populated, emits "TENTATIVE TOUR — needs booking confirmation" to centre (was silently routing to "No Booking Requested")
- [Cekura regression inventory](cekura-regression-inventory.md) — 7 scenarios (248224-6 + 248701-4) on agent 13260 guarding the prompt rev. Baseline all-green.
- [n8n API gotchas](n8n-api-gotchas.md) — retry-blocked-on-reject-branch, PUT whitelist, Sheets v4.7 requires columns.schema, Simple Memory sessionKey footgun
- `appointment_booked` post-call schema sharpened on 12 agents (65 → 390 chars) — now correctly classifies soft-hold/tentative bookings
- Audit keying: ALWAYS group retry chains by `to_number`, never by transcript name (two different Ashleys produced false cap-breach report on 2026-04-20)

## St. Catharines (LIVE 2026-05-09)
- [Inbound call forwarding setup](stcath-inbound-call-forwarding.md) — ✅ RESOLVED 2026-06-16: live with CFNA no-answer forwarding (3 rings) on 289-974-0871 → `+12895140137`; line is NRBN Business Hosted Voice. Validated by first real inbound booking same day.
- [First real StCath booking 2026-06-16](stcath-first-real-booking-2026-06-16.md) — inbound call_03baab… (real parent, tour 2026-06-26) = first genuine + first inbound booking. The 7 May outbound "bookings" were all tests (numbers 9059672357 / 9052200332, both testing=TRUE).
- [ChatDash forwarding wired](stcatharines-chatdash-wired.md) — agent `agent_c02bfb40888bba2275ea3a9f3a` → ChatDash `69ff9fa71ed668b4a511a754` → n8n EOC. Missing forwarding caused 8x retry loop on Stanley test lead 2026-05-10; fixed same night.

## ClickUp Structure (RESTRUCTURED 2026-06-09)
- [Guest assign auto-shares](clickup-guest-assign-autoshare.md) — guest-share API is enterprise-gated (TEAM_110), but task `assignees` with a guest id works and shares the task; col M safe without folder share.
- [Per-centre folder + Inbound/Outbound lists](clickup-percentre-inbound-outbound-2026-06-09.md) — all 6 centres have own folder w/ separate Inbound+Outbound lists; Centre Lookup gained clickup_inbound_list_id (P)+clickup_outbound_list_id (Q); inbound/outbound EOC repointed (live, gate PASS). Full list-id map inside. Supersedes single-list layout below.

## Leaside / Pickering (Sharmila)
- [Leaside+Pickering share one ClickUp folder/list](clickup-leaside-pickering-sharmila.md) — folder "Pickering + Leaside (Sharmila)" 90117899982 → Inbound Tasks list 901113632689; Sharmila guest user_id 87425193. ✅ Centre Lookup clickup cols (M/N) now SET for both (rows 3+8) 2026-06-09 — staff-follow-up tasks will auto-create going forward.

## Sheet Write Access (CORRECTION 2026-06-09)
- [I CAN write Centre Lookup/MasterSheet via temp n8n workflow](centre-lookup-write-via-n8n.md) — temp Webhook→HTTP Sheets-API node with write cred yjVHcEWrpyDmxkvv (eg-backfill.py/sheet-read.py pattern). The old "Scott edits manually" claim is FALSE; don't repeat it.

## Leaside Inbound (PROVISIONED 2026-04-23)
- [Leaside Inbound](leaside-inbound.md) — agent + Twilio provisioned. Activation BLOCKED 2026-04-25: Sharmilla busy-signals on multiple Rogers star codes → Call Forwarding likely not on her plan. Action: call Rogers Business 1-888-764-3771 to enable "Call Forwarding (Variable)", then dial `*72` + `6474963276` (NOT `*92` — that was a Bell code). KB + ClickUp + post-call workflow still needed.

## EG Inbound Pilot (LIVE 2026-04-16)
- [Always no-answer (4-ring) forwarding](feedback-no-answer-forwarding-always.md) — POLICY: every centre's inbound forward must ring the centre ~4x first (no-answer mode), NEVER unconditional `*72`. Staff get first crack; AI is overflow. Bell `*92`/`*93`; confirm carrier per centre. Set 2026-06-04.
- [EG Inbound Pilot](eg-inbound-pilot.md) — full architecture, Bell forwarding fix, slot caching, post-call workflow
- [EG Inbound Workflow Fixes 2026-04-25](eg-inbound-workflow-fixes-2026-04-25.md) — 6 fixes to End Of Call workflow: caller_name allowlist, idempotency, junk filter, Skyvern test gate, cancel-task safety net for stray test bookings, ClickUp cleanup + 5 backfill cancel tasks. Workflow now 25 nodes.
- [EG Inbound Cekura Test Suite](eg-inbound-test-suite.md) — 10 scenarios live on Cekura (agent 16633), KB-boundary anti-hallucination test is #246771
- [Tier-2 = per-centre crons, MCP-only API](cekura-tier2-percentre-crons.md) — one cron per centre staggered 5 min (511=Kanata); cron_jobs 404s on REST, use Cekura MCP.
- [Cekura Tier-1 false-positive classes](cekura-tier1-false-positive-classes.md) — monthly Tier-1 (agent 13260, cron 427) re-alarms from 3 harness defects, NOT agent bugs: Slot-Validation-can't-see-SLOTS, Tour-Booking-Success-on-no-booking-scenarios, stale age-7 scenario. EO=5 + status=failure ⇒ false positive.
- [Inbound auto-booking is the goal](feedback-inbound-autobook.md) — Skyvern is wired; "no booking" = bug, not design choice
- [Voice AI issue tracker](voice-ai-issue-tracker.md) — all pipeline bugs go to `XPrime17/lead-reactivation` (despite the name)
- [Inbound KB injection via pre-call webhook](inbound-kb-injection.md) — LIVE for EG. Google Doc → n8n → Retell phone-number inbound_webhook_url → agent prompt. RAG disabled.
- [ClickUp multicentre architecture](clickup-multicentre.md) — folder-per-centre, guest-per-director. CRITICAL: guest email MUST be non-codeninjas.com.
- [Outbound Junior-program deflection bug](outbound-junior-deflection.md) — agent hands off Junior inquiries instead of booking. Regression from Apr 6. Likely affects all 10 clones. HIGH priority.

## Lead Pipeline Gotchas
- ["Wrong Location — wants Bayview" outbound is a Cekura test](audit-bayview-wrong-location-is-cekura.md) — call_8f1b380a looks like a real Leaside (1386 Bayview Ave) mis-route but is Cekura scenario 141951; tell = dynamic var first_name=CEKURA_TEST + PHONE +15555550100. Check dynamic vars before flagging outbound calls; weekly audit lacks the CEKURA_TEST filter the daily audit has.
- [Lookup Centre Transient Error](centre-enablement-gotcha.md) — Google Sheets flakes cause BOTH "Not Enabled" + "Centre not found" emails and silently drop the lead (2026-04-13, Cindy Correia / Canton)
- [KB Dynamic Injection (Outbound)](kb-dynamic-injection.md) — CNKB outbound agents have empty `knowledge_base_ids`; KB content is injected at call time via n8n Get KB (Google Docs) → `retell_llm_dynamic_variables`. Do NOT claim hallucination without checking the centre's Google Doc KB first.
- [Call Failed leaves orphan rows](callfailed-orphan-rows.md) — Outbound appends MasterSheet row before the Retell call; rejections leave orphans. Fix = delete row on Call Failed branch (don't move the append). Issue #53.
- [Booking Verification workflow](booking-verification-workflow.md) — standalone cloud-only n8n wf `dUEa8NI0z8vq2LSL` sends "Booking Verification Failed!!". Blank-Retell (AI never reached lead, they booked elsewhere) was a FALSE alarm; fixed 2026-06-01 to reclassify as a win + halt retries (status=completed). Not in any local EOC export.

## Architecture — Lead System (UPDATED 2026-04-10)
- **Cloudflare Worker is ABANDONED.** All retry logic lives in n8n + Google Sheets.
- **Active n8n workflows** on `xprime17.app.n8n.cloud`:
  - `Outbound Call Flow - Multicentre` (6sPwo7ngPyTWfmwM) — initial calls (attempt 1)
  - `Retry Scheduler - Multicentre` (rt0aEuDnFv3ZCl1y) — polls every 90min (changed from 15min on 2026-03-28), makes retry calls (attempts 2-4)
  - `[TEST] End Of Call - Retry System` (4p1V0wESn3kZySt6) — post-call routing, retry scheduling
  - `Orphan Sweep - Multicentre` (H7sxzNFsME4wkeJp) — every 2hrs, catches leads stuck at `calling` >2hrs, routes to exhausted (≥4 attempts) or retry_pending (<4)
- **State store:** Google Sheets (Leads MasterSheet ID: `1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`), NOT Supabase
- **Centre Lookup Sheet ID:** `1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`
- **Do NOT check Worker health or Supabase for retry state**
- **Voicemail Strategy (2026-03-09):**
  - All 11 agents have `voicemail_option: { action: { type: "hangup" } }` (agent-level default)
  - Attempt 1: hangup on voicemail (explicit `agent_override` in Outbound Call Flow)
  - Attempt 2: leaves `static_text` voicemail via `agent_override` in Retry Scheduler
  - Attempts 3-4: hangup on voicemail (default)
  - Retell API: `voicemail_option` presence enables detection (no separate `enable_voicemail_detection` needed)
  - End Of Call: `voicemail_reached` → `voicemail_left` (attempt 2) or `voicemail_hangup` (other)
- **Decline Reason Feature (2026-03-12, UPDATED 2026-04-04):**
  - All 11 agents have `decline_reason` post-call analysis field: `"busy"` | `"not_interested"` | `""`
  - Prompt updated on all 10 CNKB LLMs: "Can't Talk" → retry, "Not Interested" → no retry
  - End Of Call Switch: `agent_hangup` → `Decline Reason Check` IF node → busy=retry, else=completed
  - **(2026-04-04 fix)** Added "Decline Check (Successful)" IF node on `call_successful=true` branch. Previously, Retell `call_successful=true` bypassed ALL decline_reason checks — leads who politely said "not today" (e.g., Fredson Fredson) got marked completed instead of retried. Now: `call_successful=true` → check decline_reason → busy=retry, else=completed.
  - **Root cause:** Retell's `call_successful` measures conversation quality, NOT business outcome. A polite decline gets `call_successful=true`. Never use it as sole routing decision.
- **Gmail Trigger Gotcha:** After n8n cloud workspace downtime, Gmail triggers get stuck. Fix: deactivate/reactivate the workflow.
- **Testing Column (2026-03-12):** Added `testing` column to Leads MasterSheet (column B). TRUE for test centres (Round Rock, Leaside, Riverside, Sudbury), FALSE for live.
- **Column Population Fix (2026-03-12):** Outbound Append node now writes `testing`, `status=calling`, `attempt_count=1`, `last_call_at`. EndOfCall Retry/Completed nodes now write `attempt_count`. Set Tour True/False nodes had `CRM Confirm` silently exposed (risked blanking) — marked `removed: true`.
- **Leads MasterSheet Column Layout (2026-03-12):** A:centre_id, B:testing, C:lead_id, D:First, E:Last, F:Phone, G:Email, H:Tour, I:Date, J:Time, K:CRM Confirm, L:status, M:attempt_count, N:next_call_after, O:last_outcome, P:last_call_at, Q:(empty), R-Y:attempt_1-4 at/outcome, Z:testing(old duplicate)
- **Schema Update Rule:** When adding ANY column to Leads MasterSheet, update schema in ALL 9 write nodes: Outbound(2: Append row, Update Lead - Off Hours), EndOfCall(4: Set Tour True/False, Update Lead Retry/Completed), Retry(2: Update Lead Pre-Call, Reset Lead on Error), OrphanSweep(1: Fix Orphaned Leads)
- **Off Hours Fix (2026-03-18):** Outbound Call Flow appends lead BEFORE After Hours? check. Added "Update Lead - Off Hours" node after Off Hours email — sets status=retry_pending + next_call_after. Retry Scheduler picks it up during business hours.
- **Off Hours next_call_after Fix (2026-03-31):** Expression was `.plus({ days: 1 }).set({ hour: 9 })` — always added a day. Early-morning leads (before 9 AM) got pushed to next day instead of same-day 9 AM. Fixed: conditional `.plus({ days: hour >= 9 ? 1 : 0 })`. Triggered by Sudbury test lead at 4 AM.
- **Orphan Sweep Root Cause (2026-03-18):** End Of Call webhook runs successfully (writes last_outcome) but Google Sheets appendOrUpdate intermittently fails to persist status column. Orphan Sweep catches these.
- **Retry Scheduler Attempt Cap (2026-03-19):** Added `attempt_count >= 4` guard to Filter Eligible code. Previously had NO attempt cap — leads could retry indefinitely if End Of Call failed to update status. This caused Scott-9059672357 to reach 9 attempts under EG.
- **EG Agent ID Fix (2026-03-19):** East Gwillimbury row in Centre Lookup Sheet had empty agent_id. Retry Scheduler fallback `|| 'agent_0c6c32b61cb506fefb6ac247f4'` was being used. Now agent_id is explicitly set.
- **Retry Bugs Fixed (2026-03-12):** (1) `String()` cast on `test_number` in Retry Scheduler voicemail expression, (2) Format Slots rewritten to use `$input.all()` loop instead of `$input.item`
- **Fallback Routing Fix (2026-03-28):** Switch fallback (output 3: `user_hangup`, errors, etc.) was sending email but NOT updating Google Sheets — leads stuck as `calling`. Fix: connected `Outcome unsuccessfull` → `Lookup Centre for Retry` to feed into existing retry pipeline. Status=`retry_pending` (not `completed`) because fallback includes accidental hangups/errors.
- **Replay Technique (2026-03-28):** To re-process stuck leads, replay original `call_analyzed` payload to End Of Call webhook (`POST /webhook/ac45848d-559c-4b66-9058-5d76b8476531`). n8n cloud doesn't register webhook URLs for API-created workflows.
- **Outbound Lookup Centre Retry (2026-04-04):** Added `retryOnFail: true, maxTries: 3, waitBetweenTries: 1000` to Lookup Centre node. Prevents transient Google Sheets "Service unavailable" errors from dropping leads (Francisca Agoha incident).
- **Cekura Test Filter (2026-04-04):** Added "Skip Cekura Tests" IF node in End Of Call workflow between `Set lead_id` and `Fetch Lead Details`. Filters out leads with `CEKURA_TEST` in lead_id — prevents false "Semaphore Not Found" emails from Cekura test calls.
- **Gmail Trigger Inbox (2026-04-04):** Outbound Call Flow Gmail trigger watches `scott.james1717@gmail.com` with plus-addressing for centre routing (e.g., `+ma-canton@`). Subject filter: `New CORE Inquiry`.
- **Resend Sandbox Limitation:** Resend API can only send TO `scott.james@codeninjas.com` in sandbox mode. Cannot send to `scott.james1717@gmail.com`. Use temp n8n webhook for sheet writes instead.
- See `lead-reactivation.md` for full architecture details

## Onboarding Gates (HARDENED 2026-05-10)
- [Probe ChatDash forwarding before declaring onboard done](feedback-onboarding-chatdash-probe.md) — ChatDash returns 200 even when forwarding is unwired. Only honest signal is a new n8n EOC execution from a synthetic call_started POST. Caught 2026-05-10 after Stanley test lead retried 8x.

## Skill Creation Pattern
- Private skills: `_ALLCAPS` naming. SKILL.md needs YAML frontmatter with `name` + `description`
- Tools: TypeScript/Bun with `parseArgs`, `--help`, `.help.md` companions
- Custom traits: `~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/Traits.yaml`
- Named agents: `~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/NamedAgents.md`

## MCP Server Pattern
- MCP SDK v1.11+: Zod schemas (`.shape`) for tool params, not plain objects
- `McpServer` constructor: just `name` + `version`, no `capabilities`
- Retell prompts live on the LLM object — resolve via `agent.response_engine.llm_id`
- MCP config at `~/.claude/MCPs/` with `{name}-MCP.json` naming

## Google Sheets Write Pattern (via n8n)
- Google Sheets API NOT enabled — can't use API key
- **Read-only**: CSV export via `https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv` (NOTE: requires auth from server — fallback: use n8n execution API with `?includeData=true`)
- **Write**: Temp webhook workflow on n8n cloud → activate → trigger → delete
- **Write credential**: `yjVHcEWrpyDmxkvv` | **Read credential**: `ybuxqM8F2NkyCA7e`
- **Schema rule**: `appendOrUpdate` requires ALL sheet columns (unused = `removed: true`)
- **DANGER**: Schema entries with `removed: false` but NO value in the `value` mapping may write empty strings, **blanking existing data**. Every `removed: false` entry MUST have a corresponding value.
- **CRITICAL**: `appendOrUpdate` does NOT create new column headers. To add columns, use HTTP Request node with Google Sheets API (`PUT .../values/'Sheet'!Q1:X1`) and the OAuth credential.
- **n8n API**: `active` is read-only on PUT. Use `/activate` and `/deactivate` endpoints.
- **n8n API PUT**: strip `availableInMCP`, `timeSavedMode` from settings or PUT will 400

## Email Delivery
- ALWAYS use Resend HTTP API — never sendmail/SMTP
- API key: `op://Private/Resend/api-key` (ROTATE — literal was committed to public repo)
- Sender: `onboarding@resend.dev` | Scott's email: `scott.james@codeninjas.com`

## n8n Cloud Subscription
- **Plan:** Pro (€60/month, 10,000 executions) — DOWNGRADE TO STARTER APPROVED (2026-03-28). Projected ~1,341/month after optimizations.
- **Optimizations (2026-03-28):** Retry Scheduler 15min→90min (saves ~1,612/mo), Inbound Pre-Call schedule trigger disabled → webhook-only (saves ~295/mo)
- **Execution hog (resolved):** `PAI - Telegram Bot` (cfe5UmEvegyLhp8F) had 1-min schedule trigger = 1,440/day. DEACTIVATED.
- **Migration plan:** 6 non-essential workflows to move to self-hosted (Error Logger, Centre Feedback, My workflow 5, PAI Email→ClickUp, PAI Email→Jarvis, PAI Homebase Export). 6 essential stay on cloud.
- **Essential cloud workflows:** Outbound Call Flow, Retry Scheduler, End Of Call, Orphan Sweep, Listen360, Booking Verification, Centre Directory, Inbound End Of Call - EG, Session Tracker Sync
- **Self-hosted status:** UP at `138.197.171.204:5678`, needs new API key from Settings → API

## Scott's Preferences
- Architecture diagrams ALWAYS use Art skill → PNG (never ASCII/markdown)
- ALWAYS provide full absolute path to generated images
- n8n has TWO instances: self-hosted Docker (`138.197.171.204:5678`) and cloud (`xprime17.app.n8n.cloud`)
- **n8n self-hosted API key is EXPIRED** — Scott to generate new one from UI

## n8n API
- **Cloud API key**: `op://Private/n8n cloud/api-key` (ROTATE — JWT literal was committed to public repo)
- **Cloud URL**: `https://xprime17.app.n8n.cloud/api/v1/`
- **n8n API PUT cleanup**: strip `updatedAt`, `createdAt`, `id`, `description`, `isArchived`, `meta`, `pinData`, `versionId`, `activeVersionId`, `versionCounter`, `triggerCount`, `shared`, `activeVersion`, `active`, `tags` from GET response before PUT

## ClickUp Integration (2026-03-20)
- **Workspace:** Codeninjas | ID: `9011711565`
- **API Token:** `op://Private/ClickUp/api-token` (ROTATE — literal was committed to public repo)
- **MCP:** Added to project config (HTTP), needs session restart + OAuth
- **Voice AI Space:** ID `90114119602`
- **EG Folder:** ID `90117795474`
- **EG Inbound Tasks List:** ID `901113422190`
- **Task format:** `[Call Type] Name - Summary` in name, structured markdown in description, tags for call_type
- **No Custom Fields** — using tags + description to avoid 60-use limit and API creation limitation

## Inbound Voice AI (UPDATED 2026-03-22)
- **Architecture:** Call forwarding from centre landline → Retell Twilio number → inbound agent answers → post-call → n8n → ClickUp task
- **EG Inbound Agent:** `agent_17d623c8a8f95fc674288d0e00` (CNKB-EG-Inbound)
- **EG Inbound LLM:** `llm_6d77f36696f6fbfad97d03fa5ef8` (gpt-4.1)
- **Phone:** `+12899030611` — inbound: EG inbound agent, outbound: original EG agent (unchanged)
- **SIP Origination:** Added `sip:sip.retellai.com` to xprime trunk (`OU078ecfd1664cf4d66106517ce5720e45`)
- **Inbound telephony confirmed working** — test call succeeded (2026-03-22)
- **Post-call analysis:** 12 fields under `call_analysis.custom_analysis_data` (NOT directly under `call_analysis`)
- **Post-call pipeline:** Retell webhook → n8n `Inbound End Of Call - EG` (3oV7SpPKWmr3xJlQ) → ClickUp task in EG Inbound list
- **n8n webhook URL:** `https://xprime17.app.n8n.cloud/webhook/inbound-end-of-call`
- **ClickUp tags created:** new_lead, schedule_change, billing_question, general_inquiry, complaint, other
- **KB attached:** `knowledge_base_5144c616b2046679` (12 EG website pages, auto-refresh enabled)
- **Location hardcoded:** "East Gwillimbury" in both prompt and begin_message (not template var)
- **`{{SLOTS}}`:** Served live via `Inbound Pre-Call - EG` webhook (scrapes calendar on-demand, no schedule cache). Schedule trigger disabled 2026-03-28.
- **Prompt source file:** `/root/inbound-prompt-eg.md`
- **Prompt fix (2026-03-22):** Added explicit gates — 2E fast-track skips 2C discovery/pitch, 2C guard prevents entry if tour already booked
- **Agent status:** NOT published yet (is_published: false). Works for testing.
- **Urgent calls:** n8n sends email via Resend to scott.james@codeninjas.com
- **Pilot plan:** EG test → Leaside (Sharmilla) → Pickering
- **Client comms:** Google Form → GitHub Issues + weekly email digest for Sharmilla (NOT BUILT YET)
- **Call forwarding cost:** $0 for local on Canadian business landlines (Bell/Rogers/Telus)
- **Retell API gotcha:** GET agent = `/get-agent/{id}`, update agent = PATCH `/update-agent/{id}`, GET LLM = `/get-retell-llm/{id}`, update LLM = PATCH `/update-retell-llm/{id}`. The `/v2/` prefix does NOT work for these.

---

## Retell Platform (OPERATIONAL)
- **API key:** `op://Private/Retell/api-key` (ROTATE — literal was committed to public repo)
- Prompts live on the LLM object — resolve via `agent.response_engine.llm_id`

### Retell Agents
| Name | Agent ID | Phone | LLM ID | Status |
|------|----------|-------|--------|--------|
| Emma | `agent_552e57364711f0eec51afa512a` | `+12494492726` | (original) | WORKING |
| CNKB (East Gwillimbury) | `agent_0c6c32b61cb506fefb6ac247f4` | `+12899030611` | `llm_44111168b1a2a469f50891b26e34` (v39) | WORKING |
| CNKB-Canton | `agent_f10e56ab67fddf22bd60def599` | `+17744062037` | `llm_d25bbc493b20eb095ab92bceb116` | WORKING |
| CNKB-StoneOak | `agent_cd531f218c39d6125098cf7abc` | — | `llm_c26de057ffe1ff9a71366e95c447` | WORKING |
| CNKB-RoundRock | `agent_d06452d16a225cfbf207890350` | — | `llm_7b795d82b19f42562ef0abaf857f` | WORKING |
| CNKB-Rayford | `agent_9c1c8996e054e87f6b76aa8a0a` | — | `llm_118c93e692e7255083a56043c3e9` | WORKING |
| CNKB-Burlington | `agent_075f92a824314e958918af3d9c` | `+12899071911` | `llm_35ce5dd8697541ec0e97f0dcfde0` | WORKING |
| CNKB-Pickering | `agent_9d24e87943bc3b8105261bf308` | — | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` | WORKING |
| CNKB-Leaside | `agent_1f8c2799630cd6524fa8176e6d` | `+16475841523` | `llm_4cfa990bea7bfcbf67060e8c8f72` | WORKING |
| CNKB-Riverside | `agent_ee11bcfc9222c37df4de8bfe95` | `+12036484197` | `llm_512d93c0c71e0ef00e318b3e9fc0` | WORKING |
| CNKB-Sudbury | `agent_ccad25c0d5aab5eac8ce8c2354` | `+19786627576` | `llm_247d6d98f7073c6d31d54f26f53d` | WORKING |
| CNKB-StCatharines | `agent_c02bfb40888bba2275ea3a9f3a` | `+12895140137` | `llm_5b4dbab1bf6dcc5007c61c2726ff` | WORKING |

### Retell Prompt Hash
- **Last update (2026-04-21)**: Fleet rev. See [prompt-v2026-04-21.md](prompt-v2026-04-21.md). Age-gate + name-optional + SLOTS-deferred dates + Booking Autonomy + Stage 6 soft-hold. All 11 CNKB LLMs at ~18.9K chars. Also sharpened `appointment_booked` post-call description on 12 agents (65 → 390 chars).
- Previous (2026-03-13): Removed child name reuse — agent collects name for CRM but uses "your kiddo" instead of repeating it. Prevents ASR transcription errors compounding.
- Previous (2026-03-12): Added "Handling Leads Who Can't Talk" + "Handling Leads Who Are Not Interested" sections
- Source prompt: ~15,800 chars (East Gwillimbury LLM)
- **Voice AI principle:** Collect but don't echo free-text fields that pass through ASR (names especially)
- All 12 CNKB LLMs updated (incl Burlington + StCatharines). Emma NOT updated (different prompt structure).
- Previous (2026-03-07): Pricing Anti-Hallucination — removed hardcoded $175/$249, replaced with KB-defer

### Clone Process
- Each clone gets OWN LLM copy. Prompt changes must be applied to ALL LLM copies individually.
- Location names hardcoded in clone LLMs (not dynamic vars). Source uses `{{LOCATION_NAME}}`.

### Twilio Infrastructure
- **Sub-account pattern:** Each centre gets sub-account + SIP trunk + phone number
- **Sub-accounts:** Brampton SW, Burlington, Canton, Leaside, Pickering, Rayford, Round Rock, Stone Oak, St. Catharines, Sudbury
- **SIP credential RULE:** MUST use unique usernames per centre (e.g., `sudbury`, `leaside`), NOT `xprime`
- **Debug `telephony_provider_permission_denied`:** Check Retell `auth_username` matches Twilio cred username, verify uniqueness
- `onboard-centre.ts` automates full chain: sub-account → buy number → SIP creds → trunk → Retell import
- **Riverside** still on shared xprime trunk (pre-automation)

### Onboarding Script
- Step 0: Auto-discovery from codeninjas.com (sitemap → slug → services API)
- **(2026-03-06 fix)** Sub-account creation URL was nested incorrectly
- **(2026-03-07 fix)** SIP credential username was hardcoded to `xprime` — now uses per-centre `slugName`
- **(2026-03-13 fix)** slugName now strips periods (`.`) — "St. Catharines" → `st-catharines` (was breaking SIP trunk domains)
- **(2026-03-13 fix)** Canadian centre slugs (`{name}-{province}-{country}`) now handled by refactored `lookupCentreSlug()` — auto-discovery works for both US and CA
- **(2026-03-13 bug)** Google Sheet webhook + email steps failing with `ok is not defined` — needs investigation

---

## Cekura Testing Platform (QA TOOL)
- See `cekura-testing.md` for full details (config, scenarios, metrics, crons, known issues)
- **Subscription:** Developer plan, 751 credits remaining (as of 2026-03-25). Expires 2026-04-22.
- **Clone Cekura IDs:** Canton=13779, StoneOak=13780, RoundRock=13781, Rayford=13782, Burlington=14706, Pickering=13784, Leaside=13788, Riverside=14125, Sudbury=14388, StCatharines=14707

---

## _KB Skill Setup — LEFT OFF (2026-02-10)
- BLOCKER: scott.james1717@gmail.com needs to be added as test user in Google Cloud Console
- See previous memory for full details

## Voice AI Agency — TourForce (DECIDED 2026-03-02)
- **Name:** TourForce | **Domain:** tourforce.ca (REGISTERED on Cloudflare, 2026-03-28)
- **tourforce.ai:** Available but not purchased ($80/yr, 2yr minimum)
- **Formation status:** PENDING — awaiting accountant + lawyer feedback
- See `tourforce-branding.md`, `subzero-formation.md`

## Spanish Voice AI Research (2026-02-17)
- Do NOT use multi mode on working English agents — degrades performance
- Recommendation: Dedicated Spanish agent. GitHub issue: XPrime17/lead-reactivation#19
- See `spanish-voice-ai.md`

## TourForce Portal (STARTED 2026-03-22)
- Custom ChatDash replacement — saves $300/month + eliminates platform restrictions
- **Location:** `/root/tourforce-portal/`
- **Stack:** Bun + Hono + Supabase Auth + Stripe + Retell API + Tailwind
- **Port:** 4000 | **Status:** Phase 1 code complete, needs manual Supabase + Stripe setup
- **Decision (2026-03-28):** Using ChatDash for now. Build custom portal in background when time allows.
- **Decision reinforced (2026-03-29):** ChatDash billing blocked by platform restriction. Custom portal eliminates Stripe Connect intermediary. Direct Stripe integration = no gatekeeper.
- **Priority improvement:** Client onboarding UX — magic link auth + billing address collection upfront
- **Chat-Dash learnings (2026-03-29):** 7 competitive advantages documented in `tourforce-portal.md`
- See `tourforce-portal.md` for full details, Chat-Dash learnings, and remaining manual steps

## ChatDash Client Portal (ACTIVE 2026-03-28, BILLING LIVE as of 2026-06-06)
- **Portal domain:** `portal.tourforce.ca` (Cloudflare DNS → ChatDash)
- **Email whitelabeling:** Configured with SendGrid DNS records on tourforce.ca
- **Client login URL:** `portal.tourforce.ca/client/login`
- **Client onboarding:** Manual — agency creates loginId + password, shares with client (no auto-invite)
- **Billing status:** ✅ LIVE — first successful charge collected 2026-06-06 (Sharmilla / Leaside + Pickering). Earlier 2026-03-29 "cannot make live charges" block resolved at some point before this date.
- **Plan:** Using for agent management AND billing while building custom TourForce Portal as eventual replacement
- **Stripe connected:** `acct_1T3SS88QdbWckC7C` via Stripe Connect OAuth
- [Past_due recovery playbook](playbook-chatdash-billing-recovery.md) — resend client setup email → client logs into client dashboard → adds payment method → Stripe auto-collects arrears. The client-dashboard login is a separate surface from the agency dashboard; clients often lose it.

## Feedback
- [Retry over completed](feedback_retry_over_completed.md) — For ambiguous call disconnections, default to retry not completed

## Topic Files Index
| File | Contents |
|------|----------|
| `lead-reactivation.md` | Full architecture, retry cadence, ChatDash, pending steps |
| `cekura-testing.md` | Cekura config, scenarios, metrics, crons, email digest |
| `tourforce-branding.md` | Agency branding bible |
| `tourforce-portal.md` | Client portal — ChatDash replacement (auth, calls, billing) |
| `subzero-formation.md` | Corporate formation details |
| `spanish-voice-ai.md` | Spanish voice AI research |
| `claude-code-remote.md` | Claude Code remote setup notes |
| `session-tracker.md` | Session tracking system — hooks, Sheet, n8n workflow |
| `agency-naming.md` | Old naming brainstorm (superseded by TourForce) |
| `stripe-billing.md` | Stripe API keys, account ID, products, Chat-Dash integration |
| `tourforce-pricing.md` | 2-tier CAD-only (Base $99 / Pro $299), founding rate $199 Pro for first 5 centres, Vinsi intel — v9 2026-05-23 |
| `customer-leaside-pickering-first-paying.md` | First paying customer — Sharmilla, Leaside + Pickering, $368.15 MRR, signed 2026-05-23 |
| `feedback-ship-simple-when-decisions-oscillate.md` | When a decision keeps reversing, the gap is data not analysis — ship simplest defensible version |
