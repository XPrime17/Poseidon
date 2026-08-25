---
capture_type: LEARNING
timestamp: 2026-08-18 05:17:42 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-08-18
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

**LEARN → saved & pushed** (`265fd24`). All ISC tasks (#4–6) complete.

## TLDR

**Your Zapier email solved the phone gap, and the parser branch for it is now live in the production outbound pipeline.** The "New Deal Created" format has everything: parent name, email, **phone**, program, child name in the deal title, and centre via the plus-address you forwarded to. I deployed a 4-node patch to Outbound Call Flow (`6sPwo7ngPyTWfmwM`), verified offline 15/15 against your exact forwarded sample, and the regression gate shows nothing new broken.

## What shipped (backup at `/root/n8n-backups/hubspot-lead-branch-2026-08-18/`)

1. **Gmail Trigger** — filter widened to `subject:(Inquiry OR "New Deal Created")`; all LineLeader patterns untouched, so both eras run side-by-side during cutover.
2. **Classify Lead** — new branch reads the `Programs:` line: junior→junior, camp→camp, everything else (CORE, Parent Night Out, blank)→create, since the agent books a tour regardless.
3. **Regex Extract** — the important one. The existing extractor takes the *first* email/phone in the body, and on your forwarded copy that's **your own signature** — it would have dialed *you* at (905) 967-2357 as the lead. The new branch extracts only from the labeled `Name:/Email:/Phone:` lines, normalizes the phone to 10 digits, and on a partial parse deliberately refuses to fall back to first-match.
4. **AI extractor** — same guard added to its system prompt (ignore anything above "A new deal has been created"; the `Deal:` line is the child, not the customer), since it runs on the raw trigger text.

Unit test proof: parsed `Tiffany, Krotowski, tkrotows@gmail.com, 2899261192` from the forwarded sample — not your signature contact info — and handles a future direct-from-Zapier version with `+1 (905)` formatted phones. Gate: the only FAIL is the pre-existing Barrhaven `clickup_user_ids` gap from the parallel onboarding workstream.

## ⚠️ Before your next test deal

**EG is `enabled=TRUE, Testing=FALSE`** — the branch is armed. The next "New Deal Created" email that lands on the plus-address flows as a real lead, and the pipeline will dial the parsed number (after-hours leads queue for the daytime window). So for the live end-to-end test, either **put your own cell as the contact phone on the test deal**, or **flip EG's Testing to TRUE first** (calls then route to your 905-967-2357 override). If the Krotowski deal fires again as-is, 289-926-1192 gets a real call.

Also worth watching on that test: the **deal-created → email-arrival lag**. Zapier polls on an interval unless the Zap uses an instant trigger — if it's 15 minutes, that's a speed-to-lead hit worth tuning.

Two rollout notes: your Zap runs on your HubSpot seat, so it only sees your centres' deals — other owners will need their own Zap (or we still send Grayson the G1.1 template ask, which fixes it fleet-wide with no per-owner setup). And if HQ ever does add phone to their notification *and* it gets forwarded, the same lead would arrive twice — I've flagged that as a dedupe guard to add at cutover time.

🗣️ **Poseidon:** Scott, the HubSpot branch is live and signature-poison-proof — create one more test deal with your own number (or flip EG to Testing) and we'll have the full Zapier-to-Retell dial proven end to end.

</details>
