---
name: retell-dashboard-url-format
description: "Retell dashboard deep-link to a single call is /call-history?history={call_id} — NOT /calls/{call_id}."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4bb62092-eb24-47e7-8dc5-e4936c81436f
---

To open a specific Retell call in the dashboard, use:

```
https://dashboard.retellai.com/call-history?history={call_id}
```

The `history` query param is the single-call drill-in from the call-history list view.

**Wrong patterns that silently redirect to the agents landing page** (don't use):
- `https://dashboard.retellai.com/calls/{call_id}` ← my first guess, fails silently
- `https://dashboard.retellai.com/agents/{agent_id}/calls/{call_id}`

Confirmed by Scott 2026-05-13 (he pasted the URL from his dashboard while clicking a call). Now used by `/root/daily-call-audit/audit.py` `call_link()` helper. Apply the same pattern in any future audit/report/email that links to a Retell call.

Related: [[daily-call-audit-droplet]] (the audit that uses these links).
