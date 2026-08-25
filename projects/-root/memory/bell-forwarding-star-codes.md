---
name: bell-forwarding-star-codes
description: Bell call-forwarding codes + the *92/*93 mix-up that stalled Burlington go-live
metadata: 
  node_type: memory
  type: project
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

**Bell forwarding codes:** `*92` = turn Call-Forward-No-Answer **ON** (then enter destination); `*93` = turn it **OFF** (takes NO number). All-calls fallback: `*72` ON / `*73` OFF.

**Why this matters:** 2026-07-19 Burlington director Shauna couldn't go live — she dialed **`*93` + the AI number and got a dead-call beep** (because `*93` is the OFF switch and accepts no number), so forwarding was never actually activated and her 4–5 ring test never reached the AI. The AI line was fine (number bound to live agent — see [[inbound-agents-unpublished-normal]]).

**Isolation test to give a director:** call the AI DID directly (Burlington `+1 289-907-1911`) — if the AI answers, the line is live and it's purely a forwarding-code issue; only then troubleshoot star codes.

**If `*92`/`*72` themselves give a fast-busy/beep:** the forwarding feature isn't enabled on that Bell line → have Bell enable Call-Forward-No-Answer (or set it in the Bell online portal). Hosted "Bell Total Connect" uses the portal, not star codes.

**Onboarding-email improvement:** in the forwarding section, bold "to turn ON" vs "to turn OFF" and add a one-line warning that `*93`/`*73` are the OFF codes and take no number. Rogers equivalent (Kanata): confirm no-answer code via MyRogers; `*72`/`*73` all-calls fallback. Related: [[feedback-did-from-centre-lookup]], [[stcath-inbound-call-forwarding]].
