# FeedbackTracker - Voice AI Agent Feedback Management System

## Overview

FeedbackTracker is a TypeScript CLI tool for managing centre feedback about voice AI agent performance. It stores feedback in a JSON database and provides analytics for identifying patterns, issues, and improvement opportunities.

## Data Storage

Feedback is stored in: `/root/.claude/skills/_VOICEAIAGENCY/Data/feedback.json`

## Commands

### --add
Add a new feedback entry.

**Required Options:**
- `--centre <id>` - Centre ID (e.g., `canton-ma-us`, `pickering-on-ca`)
- `--type <type>` - Feedback type: `specific_call` or `general`
- `--categories <cats>` - Comma-separated categories from valid list
- `--severity <level>` - Severity: `low`, `medium`, or `high`
- `--what-happened <text>` - Description of what happened
- `--rating <1-5>` - Agent rating from 1 to 5

**Optional Options:**
- `--caller-ref <ref>` - Caller name or date/time reference
- `--what-should-have-happened <text>` - Expected behavior description
- `--submitted-by <name>` - Name of centre manager submitting feedback

**Examples:**
```bash
# Add specific call feedback with high severity
bun run FeedbackTracker.ts --add \
  --centre canton-ma-us \
  --type specific_call \
  --categories wrong_info,caller_frustrated \
  --severity high \
  --what-happened "Agent told caller wrong business hours" \
  --rating 2 \
  --caller-ref "Sarah M. on 2/10 3pm" \
  --submitted-by "John Manager"

# Add general positive feedback
bun run FeedbackTracker.ts --add \
  --centre pickering-on-ca \
  --type general \
  --categories positive_feedback \
  --severity low \
  --what-happened "Agents handling bookings very professionally" \
  --rating 5 \
  --submitted-by "Emily Director"

# Add feedback with expected behavior
bun run FeedbackTracker.ts --add \
  --centre toronto-on-ca \
  --type specific_call \
  --categories didnt_know_answer,agent_weird \
  --severity medium \
  --what-happened "Agent couldn't answer basic service question and made odd joke" \
  --what-should-have-happened "Agent should know all services or gracefully transfer" \
  --rating 3 \
  --caller-ref "Feb 11 morning rush"
```

---

### --list
List feedback entries with optional filtering.

**Optional Options:**
- `--centre <id>` - Filter by specific centre
- `--unanalyzed` - Show only unanalyzed feedback
- `--limit <N>` - Limit results to N entries
- `-o json` - Output as JSON

**Examples:**
```bash
# List all feedback
bun run FeedbackTracker.ts --list

# List unanalyzed feedback for a specific centre
bun run FeedbackTracker.ts --list --centre canton-ma-us --unanalyzed

# List most recent 5 entries
bun run FeedbackTracker.ts --list --limit 5

# Get JSON output for processing
bun run FeedbackTracker.ts --list --unanalyzed -o json
```

---

### --trends
Show comprehensive trend analysis of feedback data.

**Includes:**
- Category frequency with visual bars
- Average rating by centre
- Severity distribution
- Top 5 issues
- Recent rating trend (last 10 entries)
- Analysis status (unanalyzed vs analyzed)

**Options:**
- `-o json` - Output as JSON

**Examples:**
```bash
# Show trend analysis
bun run FeedbackTracker.ts --trends

# Get trends as JSON for reports
bun run FeedbackTracker.ts --trends -o json
```

---

### --mark-analyzed
Mark a feedback entry as analyzed and optionally link to actions taken.

**Required Options:**
- `--id <uuid>` - Feedback entry ID

**Optional Options:**
- `--action-taken <text>` - Description of action taken
- `--linked-call-id <id>` - Retell call ID if matched to specific call

**Examples:**
```bash
# Mark as analyzed with action
bun run FeedbackTracker.ts --mark-analyzed \
  --id abc-123 \
  --action-taken "Updated knowledge base with correct business hours"

# Mark and link to call recording
bun run FeedbackTracker.ts --mark-analyzed \
  --id def-456 \
  --action-taken "Reviewed call, adjusted prompt to reduce awkward jokes" \
  --linked-call-id "retell_call_789"

# Simple mark without action
bun run FeedbackTracker.ts --mark-analyzed --id ghi-789
```

---

### --summary
Show summary statistics across all feedback.

**Includes:**
- Total feedback count
- Average rating
- Unanalyzed count
- Category breakdown (sorted by frequency)

**Options:**
- `-o json` - Output as JSON

**Examples:**
```bash
# Show summary stats
bun run FeedbackTracker.ts --summary

# Get summary as JSON
bun run FeedbackTracker.ts --summary -o json
```

---

## Valid Categories

All feedback must use one or more of these standard categories:

| Category | Description |
|----------|-------------|
| `wrong_info` | Agent provided incorrect information |
| `missed_booking` | Booking opportunity was missed or handled incorrectly |
| `caller_frustrated` | Caller became frustrated during interaction |
| `agent_weird` | Agent behavior was awkward or inappropriate |
| `scheduling_issue` | Problem with scheduling or appointment handling |
| `didnt_know_answer` | Agent didn't know answer to question |
| `call_ended_wrong` | Call ended improperly or abruptly |
| `positive_feedback` | Positive feedback about agent performance |
| `other` | Other issues not covered by categories above |

## Feedback Types

- **specific_call** - Feedback about a specific call interaction (use `--caller-ref` to identify)
- **general** - General feedback about agent performance over time

## Severity Levels

- **low** - Minor issue, positive feedback, or informational
- **medium** - Moderate issue affecting experience but not critical
- **high** - Serious issue requiring immediate attention

## Rating Scale

Agent ratings are on a 1-5 scale:
- **1** - Very poor performance, major issues
- **2** - Poor performance, significant issues
- **3** - Acceptable performance, some issues
- **4** - Good performance, minor issues
- **5** - Excellent performance, no issues

## Data Structure

Each feedback entry contains:
```typescript
{
  id: string;                    // Auto-generated UUID
  centre_id: string;             // Centre identifier
  feedback_type: string;         // "specific_call" or "general"
  caller_reference?: string;     // Caller identifier for specific calls
  categories: string[];          // Array of category strings
  severity: string;              // "low", "medium", or "high"
  what_happened: string;         // What occurred
  what_should_have_happened?: string;  // Expected behavior
  agent_rating: number;          // 1-5 rating
  submitted_at: string;          // ISO timestamp
  submitted_by?: string;         // Submitter name
  analyzed: boolean;             // Analysis status
  analyzed_at?: string;          // When analyzed
  linked_call_id?: string;       // Retell call ID
  action_taken?: string;         // Action description
}
```

## Workflow Example

### 1. Centre Manager Reports Issue
```bash
bun run FeedbackTracker.ts --add \
  --centre canton-ma-us \
  --type specific_call \
  --categories wrong_info,caller_frustrated \
  --severity high \
  --what-happened "Agent told caller we close at 6pm but we close at 8pm. Caller was angry." \
  --rating 2 \
  --caller-ref "Sarah M. on Feb 10 at 3pm" \
  --submitted-by "John Manager"
```

### 2. Review Unanalyzed Feedback
```bash
bun run FeedbackTracker.ts --list --unanalyzed
```

### 3. Investigate and Take Action
```bash
# Match to call recording, fix issue, document action
bun run FeedbackTracker.ts --mark-analyzed \
  --id abc-123 \
  --action-taken "Found call recording. Updated knowledge base hours. Tested agent - now correct." \
  --linked-call-id "retell_call_xyz789"
```

### 4. Monitor Trends
```bash
bun run FeedbackTracker.ts --trends
```

## Integration with Other Tools

### With CallTracker
Link feedback to specific calls:
```bash
# After finding call in CallTracker
bun run FeedbackTracker.ts --mark-analyzed \
  --id feedback-123 \
  --linked-call-id "retell_call_id_from_CallTracker"
```

### With ClientTracker
Cross-reference client health scores with feedback:
```bash
# Get feedback for a centre
bun run FeedbackTracker.ts --list --centre canton-ma-us -o json

# Update client health score if needed
bun run ClientTracker.ts update --name "Canton Dental" --health-score 75
```

## Tips

1. **Be Specific** - Include caller references and detailed descriptions
2. **Use Multiple Categories** - Combine categories to capture full context
3. **Track Actions** - Always document what you did to resolve issues
4. **Review Trends Weekly** - Run `--trends` to catch patterns early
5. **Link to Calls** - Use `--linked-call-id` to connect feedback to recordings
6. **Set Severity Correctly** - High severity = immediate action needed

## Output Formats

All commands support `-o json` for programmatic access:
```bash
# Get JSON for scripting
bun run FeedbackTracker.ts --list --unanalyzed -o json | jq '.[] | select(.severity=="high")'
```

## Version

Current version: 1.0.0
