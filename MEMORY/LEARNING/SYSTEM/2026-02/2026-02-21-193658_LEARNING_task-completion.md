---
capture_type: LEARNING
timestamp: 2026-02-21 19:36:58 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-02-21
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

All verified:
- **Agent `agent_f10e56ab67fddf22bd60def599`** now points to `llm_d25bbc493b20eb095ab92bceb116` (fresh copy of current prompt)
- **No "East Gwillimbury"** anywhere in the new LLM
- **`{{LOCATION_NAME}}`** used 6 times across prompt + begin_message
- **ChatDash webhook, voice, all other config** preserved
- **Memory updated** with corrected clone process to prevent recurrence

━━━ 📚 LEARN ━━━ 7/7

- **Retell versioning trap:** `response_engine.version: 0` means literal version 0 (the first-ever LLM snapshot), NOT "latest." Retell API blocks version changes on existing agents — you can't PATCH to a different version.
- **Workaround:** Create a NEW LLM copy so version 0 of the new LLM equals the current prompt. Then update the agent's `llm_id`.
- **Architecture shift:** The "all clones share one LLM" model breaks because Retell pins agents to a specific version. Each clone needs its own LLM copy. Prompt updates must now be pushed to all copies — this is a tradeoff for correctness.

🗣️ **PAI:** Fixed, Scott. The root cause was that the Canton clone was pinned to version 0 of the original LLM — the very first version, which had "East Gwillimbury" hardcoded before we introduced `{{LOCATION_NAME}}`. Retell won't let you change an agent's version after creation, so I created a fresh LLM copy with the current prompt and pointed Canton at it. Next call from Canton will say "Code Ninjas Canton" correctly. I also updated the clone process in memory — future clones need their own LLM copy, not a shared one.

**One important note:** this changes the architecture. Instead of all clones sharing one LLM (where prompt changes auto-propagate), each clone now has its own LLM. When you update the prompt, it needs to be pushed to all copies. We should build a tool for that when more centres go live.

</details>
