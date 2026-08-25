---
capture_type: LEARNING
timestamp: 2026-08-19 03:20:30 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-08-19
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

**LEARN — saved & pushed** (`99efa84`).

## TLDR

**Turn the current Zap off — and stop letting Copilot iterate on the form trigger.** It's now bound to a *third* wrong form, it published **without the filter** (that's your quota-killer back again, on a shared form), and it stripped **Phone from the email** — which defeats the entire purpose, since a lead without a phone can't be dialed and would just generate Sanitization-Failed alerts on my side.

## What actually happened, decoded

- The new form `194e0d67-…` ("#request_infoform") is still **not the form on your EG page** — that's why your two test fills never appeared in the trigger tests. I verified the page again today: it embeds only `523ad91c-…` and `7c92d726-…`.
- The "Gina Smyth / Maverick / parents-night-out" data Copilot showed you wasn't your test — it's an **old submission from that other form** (a real family's Parents-Night-Out signup, note — a phone-less event form). That's why Copilot concluded "the form doesn't capture phone or facility_slug." **Your form does** — phone is *required* and facility_slug is a hidden field; I pulled the live form definition. Copilot was sampling the wrong form's history and then "fixed" the Zap to match the wrong form's shape.

## The way forward: go back to what worked

**The deal trigger is the only design that has delivered a phone number end-to-end** — it produced your booked-tour test AND Nicole's real lead. Its single flaw was cost, and that's fixable with one fact only you can grab:

1. In HubSpot: **Settings → Data Management → Properties → switch object to "Deal" → search "Client Facing Location Name" → copy the "Internal name"** (it'll be some exact string like `client_facing_location_name__c` or similar — the earlier API rejection happened because Copilot *guessed* the name).
2. Rebuild: **New Deal trigger** with that property added to retrieved properties → **step-2 Filter (free): property contains "East Gwillimbury"** → **step-3 email exactly like the original** (Deal:/Programs:/Name:/Email:/Phone: lines, subject "New Deal Created" — the parser is already proven against it).

Foreign centres' deals then die at the free filter: zero tasks. EG leads cost ~1 task each. And deals fire for *every* inquiry path (website, manual, imported), which the form trigger never covered.

Two rules for the Copilot session, stated bluntly to it if needed: **never publish without the filter step**, and **never remove Phone from the email body**. If it can't retrieve the property after you paste the exact internal name, stop and bring me the error.

(The form-trigger approach isn't impossible — it just requires binding to GUID `523ad91c-1491-4006-9aed-d5d05c5bfce5`, which you'd identify via Marketing → Forms → open the form → GUID in the editor URL. But given three misfires, the deal trigger with a real property name is the shorter, proven road.)

🗣️ **Poseidon:** Scott, kill that Zap before it burns quota #2 — then grab the one internal property name from Deal settings, and we're back on the design that already booked you a tour.

</details>
