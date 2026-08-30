---
name: skyvern-false-failure-fix-2026-06-27
description: "Skyvern booked tours but returned status:failed (MAX_STEPS, no confirmation detected); fixed at source (v16) + n8n safety net"
metadata: 
  node_type: memory
  type: project
  originSessionId: caed0409-59eb-41a4-87a7-56f7442d8497
---

**Symptom (Scott):** tours actually book but the Skyvern webhook returns failure → n8n mails "Booking Failed."

**Root cause (prod run wr_542096138606647516 / inbound exec 21655, 2026-06-19):** Skyvern workflow `wpid_472637885728525632` ("Book Appointment") block_1 had `max_steps_per_run:10` + `complete_verification:true` but EMPTY `complete_criterion`. The CN booking page shows no confirmation screen Skyvern recognizes, so after clicking Submit the verifier never declared "complete" → agent re-clicked Submit until `MAX_STEPS_EXCEEDED` → `status:"failed"` (categories MAX_STEPS_EXCEEDED 1.0 / WRONG_PAGE_STATE 0.8) even though the booking went through. Success was intermittent (1 of 6 June runs `completed`). Also `max_steps:10` is too few for a normal booking (~12-15 steps), and runs take up to 32.5 min (wr_541007379686003256) which exceeded the 30-min n8n Wait.

**✅ RESOLVED (v17, 2026-06-30):** Scott confirmed the stuck-on-review submit DID book the tour in CRM (false-failure confirmed). Real fix = treat the SUBMIT click itself as success (the CN confirmation page never reliably renders, so page-state criteria can't work). v17 block_1: `include_action_history_in_verification=true` + `complete_criterion`="form filled AND SUBMIT clicked at least once = COMPLETE (check action history, do NOT require confirmation page)" + `max_steps_per_run` 25→12 + appended "CRITICAL COMPLETION RULE" to navigation_goal (click SUBMIT once→stop→complete, never re-click). Verified: test run `wr_545864995455702074` returned **completed in 7.7min** (was 40.6min failing), no MAX_STEPS, no confirmation-page dependence. Also eliminates duplicate-submit risk (completes on first click). Backup `/root/skyvern_wf_backup_20260629_presubmitfix.json`; payload `/root/skyvern_submitfix_payload.json`. Two dummy EG test tours to cancel in CRM: Testbot Dummy 2026-07-11 11:00AM + 2026-07-09 5:00PM.

**First real completed-path booking CONFIRMED 2026-08-23:** Amanda Kendall (Burlington) — EOC exec 28739 → Skyvern `wr_566263119076836392` returned completed → Switch matched → Send Completed Email sent (msg 1a030e989841af38). Tour Fri Aug 29 11:30 AM, Gabriel (12, Create). The v17 fix works live end-to-end; this item is CLOSED.

**Fix — Skyvern source (v16, published, SUPERSEDED by v17 above):** POST `/v1/agents/{wpid}` with `json_definition` (drop the auto `output` param or 422). block_1 now: `max_steps_per_run 10→25`, lenient `complete_criterion` (submitted = form gone/disabled/spinner/confirmation = COMPLETE), `terminate_criterion` (slot unavailable / validation error / page didn't load = terminate, NOT on missing confirmation). Backup `/root/skyvern_wf_backup_20260627.json`; versions via GET `/api/v1/workflows/{wpid}/versions`.

**Fix — n8n safety net (`deploy-skyvern-flow-fix-2026-06-27.py`):** both EOC (`3oV7SpPKWmr3xJlQ` inbound, `4p1V0wESn3kZySt6` outbound): Wait 30→45 min; "Failed" switch rule tightened to `status==failed AND failure_reason notContains "maximum steps"` so MAX_STEPS false-failures fall through fallback→Manual-verify (BCC Scott), genuine pre-submit failures still alert. Backups `/root/backup-*-eoc-20260627-preskyvernfix.json`. PipelineRegressionCheck PASS.

**Skyvern API:** base `https://api.skyvern.com`, auth header `x-api-key`, key in `/root/.env` as `SKYVERN_API_KEY` (3-part HS256 JWT; n8n credential `chQjvPAPfW4FFGYW`). GET workflow `/api/v1/workflows/{wpid}`; update `POST /v1/agents/{wpid}`; runs `/api/v1/runs?workflow_id=`; run detail `/api/v1/workflows/runs/{wr}`. NB: the pasted key arrived doubled (5 segments) — clean = parts[0].[1].[4]. Key is NOT in any committed file ([[feedback-no-credentials-in-memory]]).

**⚠️ v16 DID NOT FIX IT (test 2026-06-27):** real EG positive test run `wr_544835751510055238` (dummy data, 2026-07-11 11:00AM) FAILED identically — `MAX_STEPS_EXCEEDED`+`WRONG_PAGE_STATE`, 40.6min, clicked SUBMIT 14×. Screenshot shows page **stuck on the review/summary screen** (SUBMIT + GO BACK buttons), data all filled, **no page change at all** after submit — so my complete/terminate criteria can never match (they require the page to change). Raising max_steps 10→25 just made the loop LONGER (40min vs 16). DECISIVE unknown: does the stuck-SUBMIT actually create the tour in LineLeader? If YES → CN-website confirmation-page bug, Skyvern can't detect success from the page → rely on n8n manual-verify net + CRM/confirmation email as truth (and beware up to 14 DUPLICATE bookings). If NO → genuine submit failure (maybe fake phone `(905) 000-0000` / disposable email tripping silent validation) → retest with realistic dummy data. Awaiting Scott's CRM check (Testbot Dummy / Dummy Junior). NOTE: the one historical `completed` (Pickering wr_544654167004867696, 06-26) proves the page DOES sometimes navigate → intermittent at the website level.

Supersedes the Skyvern half of [[booking-verif-deadbranch-fix-2026-06-18]]. Related: [[skyvern-deadbranch-fix]], [[pickering-skyvern-wired]], [[skyvern-calendar-disagreement]].

**RESOLVED 2026-08-30:** real booking `wr_568860820660131500` (Kanata/Elena) returned `completed` cleanly — OPEN item closed; see [[kanata-first-booking-elena-dateswitch-2026-08-30]].
