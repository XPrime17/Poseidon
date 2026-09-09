---
name: cekura-tier1-junior-collision-2026-09-07
description: "9/7 CNKB tier1 regression \"failures\" = Junior launch colliding with pre-Junior test expectations + weekday-less SLOTS fixtures; 6 fixes shipped 9/9, 6 chronic fails remain untriaged"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5efafe24-c43d-472a-a331-5fea716cbe1f
---

# Cekura Tier 1 CNKB Regression 2026-09-07 — Triage

Result 846294 (agent 13260 CNKB-Cimo, monthly 1st-Monday cron): 14/23 pass (60.87%). EG Inbound tier1 (846331) passed 4/4. Suite chronically runs ~60% (Aug 63.6%, Jul 54.6%, Jun 42.9%) — "FAILURES DETECTED" alerts on this suite need a diff vs prior month, not absolute reading.

## The 3 NEW regressions vs August — all test-side, zero prod bugs

1. **213661 Day-of-Week in Slot Offers**: test profile 8403 SLOTS fixture was ISO-only (`2026-02-14: 10:00 AM`) while prod Format Slots emits `Saturday 2026-02-14: ...` since the [[slot-weekday-hallucination-fix-2026-06-30]]. The [[date-fabrication-guard-2026-09-02]] (fanned to outbound 9/2) now correctly stops the agent computing weekdays itself → agent said "don't have that detail" → scenario failed. August passed because the guard didn't exist yet. **Guard working as designed.**
2. **248225 Age Gate Junior Pivot (5yo)** — agent offered a Junior tour (the NEW shipped behaviour per [[junior-tour-support-2026-09-03]]); scenario demanded "team follow-up, no tour".
3. **248703 Age 7 Junior Path** — Expected Outcome scored 5/5 ✅; run failed ONLY on generic "Tour Booking Success" metric (118268) attached to a scenario designed to end without a booking.

## Fixes shipped 2026-09-09 (all verified via API echo)

- Profiles **8403, 8397, 8408**: SLOTS → weekday-prefixed prod format (dates unchanged — Fast-Track 139032 pins Feb 14 10am; 8397 is SHARED across many tier1 scenarios).
- **248225**: instructions + expected outcome now accept Junior-tour offer OR staff follow-up; caller declines tour (stays distinct from Junior booking scenarios 342241/342242).
- **248703**: detached metric 118268 → metrics [118041, 118273].
- **213666 Junior Program Question** (chronic fail, obsolete premise "Junior doesn't exist"): rewritten — Junior is real, KB-grounded description + Junior tour OK; fabricating beyond KB or Create-booking a 5yo = fail.

**Verification**: deliberately did NOT rerun (results_rerun_create refires all 23 live calls → credits + [CEKURA TEST] ClickUp/emails to centre inboxes + audit cross-ref noise). Next monthly cron = Mon Oct 5 verifies.

## Remaining chronic fails (pre-existing, untriaged)

139031 Happy Path Pricing, 139032 Fast-Track Booking, 139034 Identity Test (says "Code Ninjas" not "Cimo"), 213664 Info Overload, 213668 Off-Topic Manipulation — failed Aug AND Sep (Cekura clusters most as "inaccurate/omitted required info"). These are plausibly REAL prompt gaps worth a dedicated pass.

## Watch item

Run 3780107: agent once said "10:11 AM" for a 10:00 AM slot (slot-validation miss, possibly TTS garble "'2026-02-03 us on at 10:00 AM'"). One occurrence; watch next run.

## Chronic-fail triage + fixes (2026-09-09, same session)

Verdicts on the 5 chronic fails:
- **139031 Happy Path Pricing** — HARNESS: profiles injected no `knowledge_base` var → agent spoke the prompt's scripted no-price-in-KB deflection VERBATIM (prompt line "Pricing can vary by program..."). Agent working as designed. Also scenario expected $175 Create Lite; real KB = **$185** (fixed).
- **139034 Identity** — FALSE POSITIVE: Retell transcript shows "my name is Cimo" ×2; judge read Cekura's own ASR track which garbles Cimo→"Seema" (cf. "East Quillimbury"). Expected outcome now carries ASR-tolerance clause.
- **139032 Fast-Track** — REAL: caller named time at 0:10, agent still asked the banned Minecraft question at 0:40.
- **213664 Info Overload** — REAL: agent said "one at a time" then answered all 3 topics in one turn.
- **213668 Off-Topic** — PARTIAL: no opinions + booked tour, but multi-sentence engagement on AI-jobs/screen-time/language topics.

Shipped:
1. **All 14 tier1 CNKB test profiles** (8397-8410): weekday-prefixed SLOTS + realistic `knowledge_base` var (Create 8-14/Junior 5-7, Create Lite $185, Create Regular $249, tour hours). Empty-KB harness blindness (6/30 class) now closed for this suite.
2. **3 prompt rules → ALL 9 outbound LLMs** (backups `/root/cnkb-tier1-prompt-fixes-2026-09-09/*.pre.txt`, pre-read→patch→post-verify PASS ×9): (a) Minecraft-skip note at the Stage-3 question site, (b) MULTI-QUESTION one-topic-at-a-time rule, (c) OFF-TOPIC BREVITY guard. **Sudbury runs an older prompt generation** — needed custom anchors (no KB-GAP bullet; gaming line reads "gaming or stuff like Minecraft, Roblox"); it's also not live (col E blank).
3. 10:11 watch item CLOSED: judge misparsed "ten or eleven am" as 10:11. No fabrication.

## EG Junior pricing — SHIPPED 9/9
Scott confirmed **$185/mo**. Added `<doc id=10 category="Junior Pricing">` before `═══ END MANUAL ═══` in EG KB doc `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek`; read-back verified (2612→2760 chars). **LIVE IMMEDIATELY**: outbound wf `Get KB` node reads the Google Doc directly at dial time — no sync step exists or is needed for CNKB.

KB-write path gotchas (the _KB skill doc is STALE): working webhooks are on **CLOUD** n8n `xprime17.app.n8n.cloud/webhook/kb-gdocs-read|kb-gdocs-write` (crawler-proven nightly). The skill's localhost:5678 docker route is dead (gdocs-read inactive, different ID `1IpPWEUL8T6m2aBz`, gdocs-write never imported; container changes classifier-blocked). Supabase `centres.knowledge_base` (EG row = 346-char PLACEHOLDER w/ fake "5678 Yonge St" address) is the Emma/CNEG worker path only — CNKB never reads it; **check whether Emma is serving that stale KB**.

## OPEN
- Other centres share the JR-pricing KB gap once Junior goes wide — get per-centre JR prices.
- Oct 5 monthly cron verifies all tier1 changes.
