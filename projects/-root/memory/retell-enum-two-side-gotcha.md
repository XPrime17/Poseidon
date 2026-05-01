---
name: Retell call_type enum requires two-side update
description: Adding new call_type values to a Retell agent requires syncing BOTH the prompt AND the post-call schema description; skipping either side silently coerces to fallback
type: feedback
originSessionId: 2b7a02f0-c6a4-4734-932b-cf8da25e5e20
---
When adding a new `call_type` value to a Retell inbound agent (e.g., `spam`, `wrong_number`), you MUST update **both** sides:

1. **Prompt side** (LLM `general_prompt`) — tells the model when to emit the new classification during conversation flow.
2. **Post-call schema side** (`agent.post_call_analysis_data`) — the `call_type` field's `description` text is what guides the post-call classifier. The Retell API treats it as `type: "string"` with no formal enum, so the description is the actual constraint.

**Why:** Skipping the post-call schema update silently coerces the new value back to a fallback (usually `"other"`). The transcript looks correct, the agent ends the call correctly, but downstream routing (n8n drop branch, ClickUp tagging, dashboards) treats it as a generic call.

**How to apply:**
- Use `PATCH /update-agent/{id}` with full updated `post_call_analysis_data` array (it's a complete-replace operation, not patch-merge).
- The `call_type` description should explicitly enumerate every accepted value with a short example/criteria for each. Keep the format: `"Classify ... ONE of these exact values: foo (when X), bar (when Y), spam (when Z), other (catchall)."`
- After deploying, smoke-test by running one Cekura scenario per new value AND verifying via `list_calls` that `call_analysis.custom_analysis_data.call_type` returns the new value (not `other`).

**Real incident (2026-05-01, EG inbound spam suppress):**
- Added Spam Recognition section to prompt + new Path G classification → agent correctly refused spam in transcripts.
- Forgot to update post-call schema → call_analysis returned `call_type: "other"` → n8n's `Detect Test Call` (which drops on `call_type === 'spam'`) didn't fire → ClickUp task created anyway.
- Fixed by PATCHing `post_call_analysis_data` with explicit 8-value enum description. Re-run produced `call_type: "spam"` and clean suppress.
