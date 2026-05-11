---
name: KB ownership stays on our side; share editor-access to centre
description: New onboarding flow inverts who owns the centre's KB Google Doc — we create + own + share editor access; centre never makes a copy
type: feedback
originSessionId: fcc00af7-f5c1-4f29-b013-0bc736a23de5
---
**Rule:** When onboarding a new centre, **WE create the KB Google Doc under our Google account, populate it with auto-crawler baseline + reference template scaffolding, and share editor access to the centre owner.** The centre **never** copies, owns, or "shares back" the doc.

**Why:** Two failure modes drove this:
1. **Leaside (2026-04 era)** — centre owned the doc; the nightly KB crawler write step failed with read-only permission errors because we'd been demoted to viewer.
2. **Riverside (memory: feedback-onboarding-kb-url-checklist.md)** — when ownership flipped during onboarding, "Get KB" errored and the inbound agent had no content to inject.

If ownership lives on the centre's side, our automation pipeline (KB crawler nightly sync + n8n inbound pre-call webhook → prompt injection) breaks the moment the centre tightens permissions.

**How to apply:**
- During onboarding, the **Knowledge Base** step in the client email should NOT instruct "make a copy of the reference template."
- Instead: tell them they'll receive a **Google Docs share notification** with editor access, customise the centre-specific section in place, no copying.
- The doc IDs are pre-registered in `/root/kb-crawler/centres.json` and the Centre Lookup sheet `knowledge_base` column — both pointing to the doc WE own.
- The auto-crawler populates the top of the doc nightly with website data; the centre fills in the human-curated section below.
- Updated Burlington (`1N5q0u...`) + St. Catharines (`1fn_s05...`) email send 2026-05-08; v1 of email sent the wrong instructions, v2 fixed it.

**Onboarding script implication (`/root/lead-reactivation/scripts/onboard-centre.ts`):** the email template at `buildOnboardingEmailHtml()` (line 964) still has the old "Make a copy" pattern in Step 3 — needs to be inverted to match this rule before the next centre is onboarded.
