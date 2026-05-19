---
name: feedback-llm-severity-caps
description: "Some LLM finding kinds have hard severity ceilings that must never be exceeded — NAME_ECHO is always LOW, no matter what the LLM judges."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4bb62092-eb24-47e7-8dc5-e4936c81436f
---

The audit's LLM (Sonnet) rubric tends to inflate severity on style / etiquette issues — judging a 2-echo NAME_ECHO as HIGH when the right verdict is LOW. To prevent this from drifting back, the audit applies hard **severity caps** to specific Kinds:

| Kind         | Cap   | Why                                                             |
|--------------|-------|-----------------------------------------------------------------|
| NAME_ECHO    | LOW   | Style/etiquette issue (use "your kiddo" instead of repeating the name). One confirmation echo after collection is normal. Never warrants HIGH. |

**How to apply:**
- When adding new LLM kinds to audit.py, ask "could this ever be a HIGH-priority operational issue, or is it always cosmetic?" If cosmetic, add to `LLM_SEVERITY_CAP` in audit.py around line 658.
- If Scott pushes back on severity for a kind, default to capping rather than removing — the detection is still useful, just at lower priority.

Surfaced 2026-05-13 after the LLM flagged a 2-echo NAME_ECHO as HIGH on Kevin/Harper's call (call_d5f35d73).

Related: [[feedback-staff-deflection-outbound-only]], [[feedback-agents-book-tours-only]] — together these three rules now constrain the rubric to match operational reality.
