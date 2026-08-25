---
name: feedback-use-google-search
description: "Prefer Google search when looking up business info (phone numbers, addresses, hours) online"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

When researching real-world business details (phone numbers, addresses, hours, listings), **use Google search**, not just the built-in WebSearch tool.

**Why:** 2026-07-10 I reported Code Ninjas Kanata had "no public landline" after WebSearch/WebFetch came up empty (official page renders an empty `tel:`). Scott found it on Google in seconds: **(613) 963-4472**. My tool missed a number that was trivially Googleable.

**How to apply:**
- Query Google directly, e.g. WebFetch `https://www.google.com/search?q=<terms>` (or a Maps/Places query), rather than concluding "not found" from the default WebSearch alone.
- Don't declare a fact "doesn't exist" after one tool strikes out — try Google before reporting a null result.
- Business phone/address lookups especially: Google Business/Maps listings usually have the number even when the company's own site hides it behind JS.

Related: [[feedback-did-from-centre-lookup]].
