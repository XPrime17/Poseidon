---
name: feedback-onboarding-email-two-asks
description: Every director-facing onboarding email must request (1) a test phone number and (2) a non-codeninjas email for ClickUp — Scott 2026-06-12
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0102d5a3-1122-4106-8599-442881c95519
---

Any onboarding/setup email to a centre director — whether from the onboard-centre.ts template OR hand-drafted (like the 2026-06-12 Shauna email, which missed both) — must ask the director to reply with:

1. **A 10-digit test phone number** — test-mode calls ring it instead of real leads (Centre Lookup col H `test_number`; defaults to Scott's 9059672357 until replaced).
2. **A personal non-codeninjas.com email** — for their ClickUp guest account (col L `director_personal_email` → guest invite → user_id in col M). ClickUp rejects codeninjas.com guest invites ([[clickup-multicentre]]).

**Why:** without the ask, test calls keep ringing Scott and staff-follow-up tasks create unassigned ([[clickup-guest-assign-autoshare]]).

**How to apply:** template fixed in lead-reactivation commit (Step 1 = "Two Things to Reply With", 2026-06-12). For custom emails, include both asks unless the director already has them on file (e.g., Shauna: cnstcatharines@gmail.com / guest 87436757 already wired).
