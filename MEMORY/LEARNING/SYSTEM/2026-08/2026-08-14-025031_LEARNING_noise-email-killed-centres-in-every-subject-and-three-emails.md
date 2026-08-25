---
capture_type: LEARNING
timestamp: 2026-08-14 02:50:31 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Noise email killed, centres in every subject, and three emails that never sent are finally alive — just need Maurice's ClickUp ID to clear the gate.

**Date:** 2026-08-14
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

🤖 PAI ALGORITHM ═════════════

**OBSERVE → THINK:** Option (a) executed, plus Shauna's centre-in-subject request — and the inspection surfaced something bigger: three outbound notification emails had **never been sending at all**.

**PLAN → BUILD → EXECUTE:** Backed up the workflow, deployed via `/root/deploy-outbound-email-subjects-2026-08-14.py`, verified with 19 automated post-deploy checks, ran the regression gate, persisted memory (`577f5c2` → Poseidon repo).

**VERIFY:** All 19 deploy checks PASS; workflow live. Review visually here: https://xprime17.app.n8n.cloud/workflow/4p1V0wESn3kZySt6

## What shipped (outbound EOC `4p1V0wESn3kZySt6`)

1. **"Outcome unsuccessfull" email is dead.** Node disabled (not deleted, so the chain still passes data and it's one click to revive). No more per-attempt noise to Sharmila/Shauna.

2. **Yes to Shauna — centre is now in the subject lines.** The inbound emails already had it (`[St. Catharines Inbound URGENT] ...`); the outbound ones didn't. Now: `No Booking Requested — Pickering (First Last)`, `TENTATIVE TOUR — ... — Burlington`, `TOUR REQUESTED - MANUAL BOOKING NEEDED — Kanata (...)`, `STAFF FOLLOW-UP NEEDED — ... — Leaside`. Lead Exhausted and Wrong Location already named the centre.

3. **Found and fixed a silent-drop cluster.** "Tentative Tour Alert", "No Booking Requested" (one of its two paths), and "Manual Booking Needed" emails have sent **zero times in 90 days** — their send-to referenced `centre_email` on items that never carried it (the MasterSheet only has `centre_id`, and those branches had no centre lookup). I inserted three lookup nodes mirroring the proven `Lookup Centre SF` pattern, with fall-back-to-you if a centre row is ever missing. This was the last real remnant of the old "EOC emails not plumbed" bug — directors will start receiving these for the first time.

4. **BCC to you added on all 6 centre-bound email nodes** — the baseline was missing on every one of them.

## One blocker for you

The regression gate FAILs on something pre-existing and unrelated to this deploy: **Barrhaven** (`barrhaven-on-ca`, Maurice, Testing=TRUE) is provisioned with inbound number and ClickUp lists but has an empty `clickup_user_ids` — its inbound ClickUp tasks would be created unassigned. I need **Maurice's ClickUp user ID** to close it. There's also a WARN: Retell number 647-496-3276 has an inbound agent bound but no Centre Lookup row.

ISC: #1–4 completed; #5 in-progress, blocked only on the Barrhaven ClickUp ID above. Also still open from earlier: Shauna's CC address list for the comma-separated `centre_email` rollout, and I'd like the first real send of each revived email to be eyeballed when it lands.

**LEARN:** Saved to memory — including the correction that my morning "not-plumbed = resolved" note was premature until this deploy.

🗣️ Poseidon: Noise email killed, centres in every subject, and three emails that never sent are finally alive — just need Maurice's ClickUp ID to clear the gate.

</details>
