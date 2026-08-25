---
name: feedback-voicemail-greeting-hallucinated-as-user
description: On voicemail calls Retell mis-attributes the answering-machine greeting as live user speech; never trust call_summary/extracted names when in_voicemail=true
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f6731dab-ca98-4c2b-b81c-35f02e91227a
---

When `call_analysis.in_voicemail == true` (or `disconnection_reason == voicemail_reached`), the answering-machine **greeting** gets transcribed with `role: user` and the LLM analysis treats it as the lead speaking live. Confirmed on Ativ Ajmera / Leaside call_80a873fbb61c03201cd803ca3d2 (2026-06-16): transcript "User: Hi. This is Latif. Sorry for missing your call." was the outgoing voicemail greeting, but `call_summary` claimed "the user, Latif, left a message apologizing" and `custom_analysis_data.First Name` extracted "Latif" — while the real lead is Ativ Ajmera. Earlier calls on the same number yielded "Steve" the same way.

**Why:** This fabricates engagement signals and false names from voicemail greetings. It nearly made me re-arm a stone-cold 4x-voicemail lead as "warm," and the extracted name could overwrite real lead records (sheet was NOT polluted here only because EOC skipped the write on appointment_booked=false).

**How to apply:** `in_voicemail` is the reliable field — trust it. When it's true, IGNORE call_summary, user_sentiment, and any extracted names/engagement. Audits and the daily call audit should suppress/flag these, not score them. EOC name-extraction must gate on `in_voicemail==false`. A voicemail-reached call = "not reached," full stop. Relates to [[retell-disconnection-reasons]] and [[feedback-already-enrolled]].
