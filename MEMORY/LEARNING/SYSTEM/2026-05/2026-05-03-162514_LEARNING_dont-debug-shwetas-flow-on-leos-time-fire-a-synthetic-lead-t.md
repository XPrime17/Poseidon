---
capture_type: LEARNING
timestamp: 2026-05-03 16:25:14 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: **Don't debug Shweta's flow on Leo's time. Fire a synthetic lead through n8n right now, prove the pipeline works, capture one of Leo's real leads live, and have Leo CC the +plus address as a 24h bypass. Give me a phone number and I'll send the test email this second.**

**Date:** 2026-05-03
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

**The exact payload I'll send** (just give me a name + phone):

```
To:      scott.james1717+ct-riverside@gmail.com
From:    onboarding@resend.dev
Subject: New CORE Inquiry
Body:
  First Name: Leo
  Last Name: Test
  Phone: +1{LEOS_NUMBER}
  Email: leo+test@codeninjas.com
  Program: Junior
  Centre: Riverside
```

Tell Leo: he should get a call from the Riverside voice agent within ~30–90 seconds.

### **Then (next 5 min) — capture one real lead live**

Ask Leo: *"What's the most recent lead that came into your CRM today?"* — name, phone, email, program. I'll append it directly to Leads MasterSheet with `next_call_after = now()`, and Leo can listen to the agent call his own lead.

### **Bypass for the next 24h** (so Riverside isn't blocked on Shweta)

Tell Leo: in his CRM lead-notification settings, add `scott.james1717+ct-riverside@gmail.com` as a **CC recipient** on lead emails. That cuts Power Automate out of the path entirely — leads flow `CRM → Gmail → n8n → Retell` without touching Shweta's tenant. He can do this himself in his CRM admin.

### **What I'm NOT doing on this call**
- Fixing Shweta's Power Automate flow — wrong tenant, wrong person on the line
- Debugging why Forward V2 fails — solved it last turn (use Send), but it's async work for Shweta

🚀 **EXECUTE**
**Standing by for Leo's test phone number** — paste it and I fire the synthetic lead email immediately. Don't wait — Leo's time is the constraint here.

✅ **VERIFY** (per step)
1. Synthetic email → Leo's phone rings within 90s, voice agent says "Hi, this is calling from Code Ninjas Riverside…"
2. Real-lead injection → row appears in Leads MasterSheet with status `calling`, then call lands at the lead within minutes
3. CRM bypass → next genuine CRM lead arrives at Gmail trigger without Power Automate involvement

🧠 **LEARN**
Two lessons worth keeping:
1. **When a vendor-side flow breaks, prove your side works first** — separates blame and gives the client a "yes it works" moment instead of a "we're broken" moment.
2. **The +plus-address pattern means we have a CRM-direct bypass available any time Power Automate fails** — worth productizing as a documented fallback, not just emergency duct tape.

I'll add lesson #2 to memory if you confirm it's the right play after the call — don't want to enshrine an emergency move as best practice without your sign-off.

🗣️ Poseidon: **Don't debug Shweta's flow on Leo's time. Fire a synthetic lead through n8n right now, prove the pipeline works, capture one of Leo's real leads live, and have Leo CC the +plus address as a 24h bypass. Give me a phone number and I'll send the test email this second.**

</details>
