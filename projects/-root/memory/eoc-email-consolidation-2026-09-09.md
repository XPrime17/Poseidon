---
name: eoc-email-consolidation-2026-09-09
description: Outbound EOC email consolidation — NB email gated off when Staff FU fires; ClickUp task now created BEFORE staff email so link lands in body
metadata: 
  node_type: memory
  type: project
  originSessionId: cfc31496-3c8e-463a-bc29-745acd1d89c9
---

Scott reported (2026-09-09) both "No Booking Requested" and "STAFF FOLLOW-UP NEEDED" emails arriving for the same call, and no ClickUp task links in them.

**Root causes** (outbound EOC `4p1V0wESn3kZySt6`):
1. `Fetch Lead Details` fans out to TWO parallel branches — outcome branch (→ NB email) and staff-FU branch. A no-booking call with `staff_followup_needed=true` sent both (proven: exec 34382, 9/7 23:10).
2. Staff-FU branch order was Email → Format Task → Create Task, and the email body NEVER had a task link (checked backups to June — it's not a regression from the [[eoc-rownumber-refactor]] session). The links Scott remembered are from the INBOUND EOC `3oV7SpPKWmr3xJlQ`, which creates the task first and embeds `$('Create ClickUp Task').json.url`.

**Shipped 2026-09-09** (backup `/root/n8n-backups/eoc-email-consolidation-2026-09-09/`):
- Staff branch reordered to Lookup Centre SF → Format → Has ClickUp Config? → Create Task → Email; email now embeds `$json.url` (ClickUp link) with fallback text, `onError: continueRegularOutput` on Create Task so ClickUp outage can't kill the email. Refs switched `.item` → `.first()` (email now runs after code nodes).
- Staff email is now a strict superset of NB: transcript appended.
- New IF `Staff FU Covers This?` (sticky-wrapped) in front of `No Booking Requested1`, fed by BOTH feeders (`Lookup Centre` from Set Tour False path + `Lookup Centre NB`); suppresses NB email when `staff_followup_needed=true`, fail-open (absent/false → NB sends as before).
- Wiring post-verified live, PipelineRegressionCheck PASS 0 warnings.

**VERIFIED LIVE 2026-09-09:** exec 35008 (Sabrina Farolan, Pickering, junior_program, no booking) — gate suppressed NB (branch 1/0), task 868m3b8gg created first, single email sent to Sharmila w/ rendered ClickUp link + transcript (gmail 1a086aa3f632e975). 8/8 post-deploy execs success; unanswered-call retry path unaffected. Minor: parent asked Junior session length — not in Pickering KB, agent deflected correctly. KB-gap email drafted to Sharmila 9/9 (draft r-6336120166206168534): session length, class times, Jr membership pricing.

**Junior no-tour-offer finding (Sabrina call):** NOT a plumbing failure — SLOTS_JUNIOR was injected (Pickering Jr calendar live), prompt's Junior branch ("book the Junior tour yourself when slots exist") live since 9/9 02:11 UTC, before the call. The parent explicitly asked "Can I speak with someone?" → prompt's staff-route list includes callback-requested leads, which overrode the tour invite. By-design edge — **FIXED per Scott 9/9 (OR framing, goal = save staff the callback):** callback-request override shipped to all 7 Junior-branch LLMs (EG/Leaside/Pickering/Barrhaven outbound + EG/Leaside/Pickering inbound): when Jr slots exist, agent offers tour ONCE as an alternative ("...or if you'd prefer, pop in for a quick tour instead"); tour booked = NO staff callback promised; decline = staff route unchanged; never push after a no. Inserted after anchor "(this books a JUNIOR tour)." — outbound flavor cites JUNIOR TOUR SLOTS, inbound cites `junior_result`. Backups `/root/cnkb-junior-callback-tour-2026-09-09/`. All 7 verified live. See [[junior-tour-support-2026-09-03]].

**Also per Scott 9/9: permission-ask removed** from the Junior age-gate bullet on the 4 outbound LLMs (EG/Leaside/Pickering/Barrhaven; inbound never had it) — agent no longer asks "Want me to tell you a bit about Junior?"; presents the value prop directly (KB-only), with the Create→Junior pivot line kept for Create/unknown-form leads. Backups `*.pre-permask.json` in same dir; callback-override patch verified intact after this edit. NOTE: the Create-Prep/intermediate bullet still has its own permission ask — Scott hasn't flagged it. OPEN: watch next Junior callback-request call; Cekura scenario for this path not yet authored. NB-only calls create no ClickUp task by design (only inbound + staff-FU paths create tasks) — so NB emails legitimately have no link.

**Gotcha:** _N8N skill registry stale — lists `pWDLwPlySBQ4WpCn` as prod EOC; the ACTIVE outbound EOC is `4p1V0wESn3kZySt6` (name still "[TEST] End Of Call - Retry System").
