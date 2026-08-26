---
capture_type: LEARNING
timestamp: 2026-08-26 05:07:21 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-08-26
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

**VERIFY → Both HIGH issues had one root cause: a wrong-column bug that's been telling real leads to call your cell. Fixed, gated, live.**

**What the audit caught:** Rule 5K flagged two attempt-2 voicemails (Jennifer Cram @ Burlington, Andrea @ EG) where the agent said "call us back at **905-967-2357**" — your personal cell, not the centre. This was a real finding, not a false positive.

**Root cause:** The Retry Scheduler's `Retell: Retry Call` node builds the attempt-2 voicemail static_text per call, and its callback-number expression read Centre Lookup **col I `test_number`** instead of **col E `centre_landline`**. Col I holds your cell for six centres and 905-220-0332 for St. Catharines — so every attempt-2 voicemail fleet-wide quoted a test line. It wasn't in any prompt, KB, or agent config, which is why it looked like a hallucination.

**This also rewrites the July 16 incident.** That session concluded gpt-4.1 hallucinated 905-220-0332 — but I found identical template voicemails (Alison Jul 11, Lexie Jul 13, both `retry_attempt: 2`) from *before* that fix shipped. The per-call `agent_override` in the dial request body was the source all along; that's the one layer the 7/16 investigation didn't check. Memory corrected accordingly.

**Blast radius:** 10 real leads since Jul 11 — Alison, Lexie, Kelsey, Brianna (StCath, got the 905-220 test line); Rachel, Andrea (EG), Amanda, Jennifer (Burlington), Deborah, TANYA (Leaside) — the last six got your cell. If any of them dials 905-967-2357, you'll know who it is. Recent ones still have attempts left in the cadence, so they'll hear the correct number going forward.

**Fix shipped:** callback now reads `centre_landline`, falling back to the outbound DID (what their caller ID shows anyway), digits-normalized to 10 — the col E leading "1" would otherwise have broken the formatter. Verified by re-reading the live workflow: `test_number` is gone. Regression gate: PASS for this change (the one FAIL is the pre-existing Barrhaven `clickup_user_ids` gap from the parallel onboarding workstream). Backup in `/root/n8n-backups/vm-callback-wrong-column-2026-08-26/`.

**Open items for you:**
- **Backfill col E `centre_landline` for Pickering, Leaside, Riverside, Sudbury** — until then their attempt-2 VMs quote the Retell DID (fine for Leaside which has inbound bound; the others would ring an agent-less line).
- Tomorrow's nightly audit will verify the fix on the next real attempt-2 voicemail — I'd expect zero 5K flags, or a benign one if a DID-fallback centre leaves a VM (DID isn't in the KB doc).

**LEARN:** Saved to memory (pushed, `44dd1cc`): the incident file, plus the general lesson — when a "hallucinated" value exactly matches a config cell, check every deterministic layer including per-call API overrides before blaming the model.

🗣️ PAI: Both HIGHs were one bug — retry voicemails quoted the test-number column, ten leads got your cell since July. Fixed live, gate passed.

</details>
