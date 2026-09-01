---
name: resend-key-exposure
description: Resend send-only API key exposed in PUBLIC Poseidon repo history since ~Feb 2026 (commit 7d88113; tip-redacted be76173 but history retains it) — needs Scott dashboard rotation + multi-surface key swap
metadata: 
  node_type: memory
  type: project
  originSessionId: 635b9053-51af-4458-be62-3c9280a7e1ed
---

# Resend API key exposure (found 2026-09-01)

**What:** The Resend key (`re_jZ1…`, now REDACTED in new commits) has been retrievable from PUBLIC repo `XPrime17/Poseidon` history since ~Feb 2026 — added in `7d88113`, "redacted" at tip in `be76173`, but history rewrite never happened. Found when GitHub push protection blocked the 2026-09-01 memory push (auto-captured LEARNING artifacts logged raw shell commands containing the key; those new files were cleaned pre-push).

**Severity: LIMITED** — the key is Resend-restricted to "only send emails" (verified via 401 on /api-keys). Risk = spam/phishing sent from Scott's Resend account. No data access.

## Rotation checklist
1. **Scott (dashboard, ~2 min):** Resend dashboard → API Keys → create new sending key → DELETE the old one. Check Emails log for unfamiliar sends while there.
2. **Poseidon then swaps the key at every usage surface:**
   - n8n inbound EOC `3oV7SpPKWmr3xJlQ` — Resend HTTP nodes (booking Confirmed/Failed emails) carry the key inline (LIVE)
   - `/root/tourforce-ops/alert.env` (first-outbound-watch high-priority alerts)
   - `/root/lead-reactivation/scripts/onboard-centre.ts` (hardcoded const — switch to `process.env.RESEND_API_KEY` + put key in `/root/.env`; repo is PRIVATE but stop hardcoding)
   - `/root/shauna-email.py` + stale local workflow JSON exports (inbound-eoc-*.json etc. — dev copies, scrub or delete)
3. Verify with one test send (Poseidon → Scott inbox) post-swap.
4. History rewrite NOT needed once old key is revoked.

**Lesson (extends [[feedback-no-credentials-in-memory]]):** LEARNING/session-capture artifacts log raw tool calls — any key typed into a Bash command lands in the public memory repo. Prefer `$RESEND_API_KEY` from env in commands over pasting literals, even for "quick" curls.
