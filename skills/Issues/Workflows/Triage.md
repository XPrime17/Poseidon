---
name: Triage
description: Fetch, categorize, and present GitHub issues for work selection
---

# Triage Workflow

## Step 1: Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Fetching GitHub issues for triage"}' \
  > /dev/null 2>&1 &
```

## Step 2: Determine Repository

**Priority order:**
1. If user passed a repo argument (e.g., `/issues danielmiessler/fabric`), use that
2. If current directory has a git remote, extract owner/repo from `git remote -v`
3. Fall back to `XPrime17/lead-reactivation`

```bash
# Try git remote first
REPO=$(git remote get-url origin 2>/dev/null | sed -E 's#.*(github\.com[:/])([^/]+/[^/.]+)(\.git)?$#\2#')
# If empty, use default
REPO=${REPO:-XPrime17/lead-reactivation}
echo "Using repo: $REPO"
```

## Step 3: Fetch Issues

Fetch open issues with full metadata:

```bash
gh issue list --repo "$REPO" --state open --limit 30 \
  --json number,title,labels,createdAt,comments,assignees,body
```

## Step 4: Categorize and Present

Parse the JSON output and categorize each issue:

### Categories

| Category | Icon | Matching labels or title patterns |
|----------|------|-----------------------------------|
| **Bugs** | `[BUG]` | label: `bug`, title contains: "Bug:", "Fix:", "fix:", "regression", "broken", "fails", "error" |
| **Enhancements** | `[ENH]` | label: `enhancement`, `feature`, title contains: "feat:", "Feature", "Enhancement", "Add", "Improve" |
| **Other** | `[OTH]` | Everything else |

### Display Format

Present a categorized summary table:

```markdown
## GitHub Issues: {owner}/{repo}
**Open:** {count} | **Fetched:** {date}

### [BUG] Bugs ({count})
| # | Title | Age | Comments |
|---|-------|-----|----------|
| #699 | plansDirectory: tilde in path not resolved | 2h | 0 |
| ... | ... | ... | ... |

### [ENH] Enhancements ({count})
| # | Title | Age | Comments |
|---|-------|-----|----------|
| #694 | Installer should set PAI_DIR to match CLAUDE_CONFIG_DIR | 4h | 0 |
| ... | ... | ... | ... |

### [OTH] Other ({count})
| # | Title | Age | Comments |
|---|-------|-----|----------|
| ... | ... | ... | ... |
```

**Age formatting:** Show human-readable age (e.g., "2h", "1d", "3d", "1w").

**Sort within each category:** By comment count (most discussed first), then by recency.

## Step 5: Triage Selection

Use `AskUserQuestion` to present the top 4 most actionable issues as selectable options. Prioritize:
1. Bugs with community comments (signal: people care)
2. Recent bugs (likely relevant to current state)
3. Enhancements with comments
4. Everything else by recency

```
AskUserQuestion:
  question: "Which issue do you want to work on?"
  header: "Issue"
  options:
    - label: "#698 - Algorithm executes config changes without approval"
      description: "Bug - 1 comment, 2h old. Config modification gate needed."
    - label: "#697 - Version file mismatch"
      description: "Bug - 1 comment, 3h old. LATEST references non-existent version."
    - label: "#691 - Missing hook scripts"
      description: "Bug - 1 comment, 5h old. 7 hooks not wired in settings.json."
    - label: "#690 - Selective context loading"
      description: "Enhancement - 0 comments, 5h old. Reduce 83KB base context."
```

(The above is an example — generate dynamically from actual fetched data.)

## Step 6: Load Selected Issue

When the user selects an issue:

1. Fetch the full issue body and all comments:
   ```bash
   gh issue view {number} --repo "$REPO" --json title,body,comments,labels,assignees,createdAt
   ```

2. Present the full issue with:
   - Complete description/body
   - All comments (summarized if >5)
   - Suggested action plan based on issue type:
     - **Bug:** Reproduce -> Root cause -> Fix -> Test -> Close
     - **Enhancement:** Design -> Implement -> Test -> Close
     - **Other:** Assess -> Act -> Close

3. Ask if the user wants to proceed with the suggested plan or take a different approach.

---

## Notes

- The skill does NOT modify issues (no auto-assign, no label changes) — it's read-only triage
- The user decides what to work on; the skill just presents the information clearly
- If the repo has labels, use them for categorization; if not, fall back to title-based heuristics
- Always show the total count of open issues even if only displaying the first 30
