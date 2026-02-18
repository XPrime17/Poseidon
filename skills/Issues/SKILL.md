---
name: Issues
description: GitHub issue triage and work selection. USE WHEN list issues, review issues, github issues, what should I work on, triage issues, open issues, issue list, work on next. Fetches open issues, categorizes them, and presents triage-ready selection.
context: fork
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/Issues/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior (e.g., default repo, label filters, category mappings). If the directory does not exist, proceed with skill defaults.

## Voice Notification (REQUIRED)

**Send this notification BEFORE doing anything else:**

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Fetching GitHub issues for triage"}' \
  > /dev/null 2>&1 &
```

---

# Issues Skill

**Purpose:** Fetch, categorize, and present GitHub issues for triage so the user can quickly decide what to work on next.

## Defaults

| Setting | Default | Override |
|---------|---------|----------|
| **Repo** | Auto-detect from `git remote -v`, fallback `XPrime17/lead-reactivation` | Customization or arg |
| **State** | `open` | Pass `--state closed` or `--state all` |
| **Limit** | 30 | Pass count as arg (e.g., `/issues 50`) |

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Triage** | "list issues", "review issues", "/issues", "what should I work on", "triage" | `Workflows/Triage.md` |

**Default:** Run the Triage workflow.

---

## Examples

**Example 1: Quick triage**
User: "/issues"
-> Invokes Triage workflow
-> Fetches open issues from detected repo
-> Categorizes into Bugs / Enhancements / Other
-> Presents top issues with AskUserQuestion for selection
-> On selection, loads full issue and suggests action plan

**Example 2: Specific repo**
User: "/issues danielmiessler/fabric"
-> Invokes Triage workflow with explicit repo
-> Same flow as above but targets specified repo

**Example 3: Session start**
User: "what should I work on"
-> Invokes Triage workflow
-> Same categorized listing and selection flow
