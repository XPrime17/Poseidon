---
capture_type: LEARNING
timestamp: 2026-02-26 03:30:00 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-02-26
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

All tasks complete. Summary of what was found and fixed:

| Issue | Fix |
|-------|-----|
| **Workflow was inactive** (`active=false`) | Reactivated |
| **Last execution (#9779) failed** — Anthropic API rate limit on concurrent connections | Added retry-on-fail (3 attempts, 5s between) to the AI Classify Email node |
| **Blank emails hitting the API** — no subject, no sender, no body | Added filter in Extract Email Content to skip emails with no real subject AND <10 chars of body |

**Workflow:** `PAI - Email to Jarvis Issue` (`WhT7U8wVOJ9HKDID`) on n8n cloud — now **active** with the Gmail trigger polling every minute.

━━━ 📚 LEARN ━━━ 7/7

- n8n cloud deactivates workflows after certain errors — need to monitor for this
- The Anthropic API key used in this workflow shares rate limits with Claude Code sessions, so rate limit errors are expected during heavy usage
- The `retryOnFail` / `maxTries` / `waitBetweenTries` fields are node-level properties in n8n, not inside `parameters`

🗣️ PAI: Fixed it, Scott. The workflow was dead because the last run hit an Anthropic rate limit on a blank email. I've added empty-email filtering and retry logic, and reactivated it. It's polling Gmail every minute again.

</details>
