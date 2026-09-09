---
name: audit-2026-09-07-cekura-crossref-leak
description: "9/7 audit's 3 HIGH + 3 of 5 MED/LOW were leaked Cekura tests; cross-ref window too narrow + inbound runs unmatchable (number=null) — fixed 9/9"
metadata: 
  node_type: memory
  type: project
  originSessionId: d4106cca-3491-417a-b57d-d75caf244346
---

**9/7 audit triage (2026-09-09): 7 of 8 issues were false positives — Cekura test calls that leaked past `audit.py`'s cross-ref filter.**

Two leak mechanisms found (this is the "REPEAT offender ×11" source):

1. **Batch-window leak (outbound):** Cekura stamps `created_at` once per result BATCH; a 23-scenario batch (EG monthly cron, result 846294, 9/7 10:00 UTC) executes calls serially for ~4 min. Old match window was created_at −60s/+120s, so the last 4 calls (10:03:04–10:03:35) leaked → audited as real leads. This produced the 3 HIGHs (call_ce29107…, "lead" +18447876403 = Cekura's 844 receiving number) and the TONE MED.
2. **Inbound unmatchable:** inbound Cekura runs have `number: null` — the caller ID lives in `run.inbound_number` (+17623566401), which audit.py never read → inbound Cekura calls could NEVER match. Produced the EG-Inbound MED (missing fields, "Daniel Okafor/Eli"), LOW name echo, and the phantom PREMATURE_FIRE retry chain (4 calls grouped by EG's own DID +12898038797). Much of `Name echo violation|EG-Inbound` ×8 history is this class.

**Fix (audit.py, 2026-09-09):** window widened to −120s/+630s (safe: same-agent + exact Cekura-pool number can't collide with real leads) + runs now emit both `number` and `inbound_number` keys, and `is_cekura` checks the call's to_number AND from_number. Signatures `STAFF_DEFLECTION|CNKB-EG`, `BOOKING_FUMBLE|CNKB-EG`, `Name echo violation|EG-Inbound` registered fixed in known-issues.json.

**The 1 real issue:** Leaside outbound call_04e87ef… to +16472022606 (lead Andrew Scoon, 9/7 23:08 scheduler tick). Asked about a **weekend drop-in program he saw on the website**; agent correctly deflected (not in KB) and ClickUp task "[Outbound Staff Follow-Up] Andrew Scoon" created 23:10 ✓. **RESOLVED 9/9:** checked codeninjas.com/leaside-on-ca (200) — NO "weekend"/"drop-in" text, but page DOES advertise **Parent's Night Out** (+ Birthday Parties), a weekend/evening drop-off event = what Andrew saw. So real (small) KB gap: agent KB lacks Parent's Night Out. Static site has NO detail (date/price/ages behind LEARN MORE) → cannot fill KB without real details from Shauna/Leaside (do NOT fabricate — [[date-fabrication-guard-2026-09-02]]). Next: ask Shauna for Parent's Night Out schedule/price/ages, then add to Leaside KB (consider fleet-wide, most CN centres run it). Watch [[audit-2026-09-06-leaside-ani-false-positive]] escalation #68 since Leaside staff sit on tasks.

**CORRECTED 9/9 (Scott + full transcript review):** Andrew most likely meant the **Create program itself** — Create is scheduled-drop-in (no fixed timetable; book a drop-in whenever the centre is open), so "weekend drop-in program" ≈ "can my kid do Create on weekends?" Transcript confirms a real comprehension miss, not just a KB gap: agent's program menu described Create only as "after-school"; Andrew answered the MENU question with "Drop in" and the agent pivoted to "so you'd like to drop in and check out the centre in person → book a tour" (drop-in-the-program conflated with drop-in-for-a-visit). When Andrew asked explicitly, agent said "we don't have a formal drop-in program" — arguably WRONG since Create IS drop-in-based. Recovery was clean (no fabrication, staff follow-up promised, task created). Fix direction: (1) KB/prompt: describe Create's flexible drop-in scheduling + whether Leaside opens weekends (get real hours from staff, [[date-fabrication-guard-2026-09-02]]); (2) prompt: "drop in" as a program-menu answer = Create/scheduling intent, NOT a tour-visit request. Parent's Night Out theory downgraded to secondary possibility.

**FIX SHIPPED 9/9 (all 9 outbound LLMs, PATCHED+VERIFIED):** `/root/cnkb-dropin-create-2026-09-09/deploy.py` (pre/post backups in same dir) — (1) menu wording "after-school [coding] program called Create" → "flexible drop-in …" (StCath variant lacks "coding"; Sudbury phrasing "our regular after-school Create program" + duplicate menu line in example dialogue); (2) Stage-1 interpretation adds "drop-in" as Create-intent keyword; (3) new **DROP-IN MEANS CREATE'S SCHEDULING, NOT A VISIT** rule after OFF-TOPIC BREVITY — weekend/day answers ONLY from KB Store Hours ([[kb-hours-upstream-cn-profile]]; Sudbury/Riverside hours may be empty → KB-GAP RULE), explicit-visit requests still get the tour flow. ClickUp corrective comment on 868m2a6fv BLOCKED by permission classifier — draft handed to Scott. OPEN: Scott posts the ClickUp note; watch next "drop-in" call (outbound AND inbound).

**INBOUND FAN-OUT SHIPPED 9/9 (all 7 inbound LLMs, 7/7 PATCHED+VERIFIED):** `/root/cnkb-dropin-create-inbound-2026-09-09/deploy.py` (pre/post backups in dir). All 7 inbound prompts were structurally IDENTICAL (golden-source cloning): menu "our after-school coding program called Create" ×2 (menu + example dialogue), "our regular after-school Create program" ×1, interp line "**If Create, after-school coding, or general/unsure:**" ×1 → same three edits as outbound; DROP-IN rule inserted right after the Stage-2A interpretation line, phrased to invoke inbound's own "KB-gap rule". EG-Inbound = provision-inbound golden source → future centre clones inherit. Gotcha: don't pass anchor strings through `unicode_escape` — it mojibakes "→" and counts drop to 0.

Gotchas for future triage:
- For inbound calls the audit's "Lead (to_number)" column shows OUR DID — look at from_number for the caller.
- Cekura tells: 864/844-pool to_numbers, +17623566401 caller, impossible tour dates (Feb/Mar offered in Sept), 4 calls starting same second.
- n8n "401" scare was self-inflicted — see [[n8n-two-instances-gotcha]]: prod is CLOUD, localhost:5678 is a separate docker n8n.
