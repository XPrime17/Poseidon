---
capture_type: FAILURE_ANALYSIS
timestamp: 2026-02-14 10:10:20 PST
rating: 3
description: assistant-committed-sensitive-memory-files-to-public-github
session_id: 358d9866-0028-40ab-86a9-c5b03418040d
---

# Failure Analysis: assistant committed sensitive memory files to public github

**Date:** 2026-02-14
**Rating:** 3/10
**Summary:** Concerned about sensitive prompt storage on GitHub

---

## What Happened

Scott discovered that prompts are being stored in the GitHub repository after Poseidon committed and pushed changes. Scott was trying to maintain clean version control while excluding sensitive directories (MEMORY/SECURITY/ and MEMORY/LEARNING/FAILURES/). However, Poseidon failed to identify that prompts—which likely contain sensitive system instructions, API keys, or confidential configuration—should also be excluded from the public/shared repository. The root cause is insufficient vetting of what gets committed: Poseidon excluded some sensitive directories but missed another category of sensitive data. This reveals Scott expects Poseidon to proactively identify ALL sensitive information that shouldn't be version-controlled, not just obvious ones. Scott's questioning tone ('prompts are being stored in Github?') indicates mild frustration/concern rather than anger—he's caught a security oversight. Poseidon should have asked clarifying questions about what should be excluded or automatically recognized prompts as sensitive system configuration before committing.

---

## Conversation Summary

**ASSISTANT:** 🤖 PAI ALGORITHM (v0.2.24) ═════
   Task: Save client portal discussion note

**ASSISTANT:** 📋 **SUMMARY:**
- Saved discussion to `/root/.claude/MEMORY/WORK/client-recording-portal.md`
- Captured: Option C decision, architecture notes, technical details, existing infra
- Ready to pick back up whenever you are

🗣️ **PAI:** Noted, Scott. Full client dashboard with Supabase Auth — saved and ready when you want to build it.

**USER:** save, commit, push

**USER:** On branch master
Your branch is up to date with 'origin/master'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   MEMORY/LEARNING/SIGNALS/ratings.jsonl
	modified:   MEMORY/STATE/current-work.json
	modified:   MEMORY/STATE/tab-title.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	MEMORY/LEARNING/ALGORITHM/2026-02/2026-02-12-13272...

**USER:** On branch master
Your branch is up to date with 'origin/master'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   MEMORY/LEARNING/SIGNALS/ratings.jsonl
	modified:   MEMORY/STATE/current-work.json
	modified:   MEMORY/STATE/tab-title.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	MEMORY/LEARNING/ALGORITHM/2026-02/2026-02-12-13272...

**USER:** 7d88113 feat: Cekura testing infrastructure — Emma working, CNKB in progress
780fd9d feat: add centre feedback system for voice AI optimization
e402058 chore: update memory state and learnings from CNKB analysis session

**ASSISTANT:** I'll exclude the `MEMORY/SECURITY/` and `MEMORY/LEARNING/FAILURES/` directories (consistent with what we did last session), and commit everything else.

**USER:** ...026-02-12-132726_LEARNING_sentiment-rating-5.md | 44 +++++++++++++++++
 ...026-02-12-133059_LEARNING_sentiment-rating-5.md | 52 ++++++++++++++++++++
 ...026-02-13-182722_LEARNING_sentiment-rating-5.md | 53 ++++++++++++++++++++
 ...026-02-14-001557_LEARNING_sentiment-rating-5.md | 49 +++++++++++++++++++
 ...026-02-14-002703_LEARNING_sentiment-rating-5.md | 53 ++++++++++++++++++++
 ...026-02-14-171833_LEARNING_sentiment-rating-5.md | 51 +++++++++++++++++++
 ...026-02-14-175443_LEARNING_sentimen...

**USER:** [master 0b09495] chore: update memory, learnings, and client portal planning notes
 15 files changed, 530 insertions(+), 8 deletions(-)
 create mode 100644 MEMORY/LEARNING/ALGORITHM/2026-02/2026-02-12-132726_LEARNING_sentiment-rating-5.md
 create mode 100644 MEMORY/LEARNING/ALGORITHM/2026-02/2026-02-12-133059_LEARNING_sentiment-rating-5.md
 create mode 100644 MEMORY/LEARNING/ALGORITHM/2026-02/2026-02-13-182722_LEARNING_sentiment-rating-5.md
 create mode 100644 MEMORY/LEARNING/ALGORITHM/2026-02/2...

**ASSISTANT:** Done. Committed `0b09495` — 15 files, 530 insertions. Pushed to `origin/master`. Excluded `MEMORY/SECURITY/` and `MEMORY/LEARNING/FAILURES/` as before.

---

## Tool Calls (94 total)

- **TaskUpdate**: {"taskId":"10","status":"completed"}...
- **TaskUpdate**: {"taskId":"11","status":"completed"}...
- **TaskList**: {}...
- **Bash**: {"command":"mkdir -p /root/.claude/MEMORY/WORK && cat > /root/.claude/MEMORY/WORK/client-recording-portal.md << 'EOF'\n# Client Recording Portal — Option C (Full Dashboard)\n\n**Created:** 2026-02-14\...
- **Bash**: {"command":"cd /root/.claude && git status -u 2>/dev/null || echo \"Not a git repo\"","description":"Check git status in .claude directory"}...
- **Bash**: {"command":"git status -u 2>/dev/null || echo \"Not a git repo\"","description":"Check git status in lead-reactivation"}...
- **Bash**: {"command":"git log --oneline -3","description":"Check recent commit style"}...
- **Bash**: {"command":"git add \\\n  MEMORY/LEARNING/SIGNALS/ratings.jsonl \\\n  MEMORY/STATE/current-work.json \\\n  MEMORY/STATE/tab-title.json \\\n  MEMORY/STATE/git-cache_root_voice-chat.sh \\\n  MEMORY/LEAR...
- **Bash**: {"command":"git diff --cached --stat","description":"Review staged changes"}...
- **Bash**: {"command":"git commit -m \"$(cat <<'EOF'\nchore: update memory, learnings, and client portal planning notes\n\nSession work: CNKB call analysis, voice speed adjustments (1.14→1.0),\nprogram qualifier...

---

## Files in This Capture

| File | Description |
|------|-------------|
| `CONTEXT.md` | This analysis document |
| `transcript.jsonl` | Full raw conversation (498 entries) |
| `sentiment.json` | Sentiment analysis metadata |
| `tool-calls.json` | Extracted tool invocations (94 calls) |

---

## Learning System Notes

This failure has been captured for retroactive analysis. The learning system should:

1. Review the full transcript for root cause
2. Identify systemic issues that contributed
3. Determine if this failure type has occurred before
4. Propose improvements to prevent recurrence

**Action Required:** This capture needs manual review to extract learnings.
