# Analyze Workflow — CNKB

**Pull transcripts, analyze against best practices, review prompt, recommend changes, push with approval.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyzing the C N K B voice agent"}' \
  > /dev/null 2>&1 &
```

Running **Analyze** in the **CNKB** agent skill...

---

## Agent IDs (baked in — no lookup needed)

- **Agent ID:** `agent_0c6c32b61cb506fefb6ac247f4`
- **LLM ID:** `llm_44111168b1a2a469f50891b26e34`

---

## Workflow Steps

### Step 0: Check Previous Learnings

**Read `Learnings.md` before doing anything else.**

1. Check the **Known Patterns** table — these are issues to specifically look for in transcripts
2. Check the **Verification Queue** — these are previous fixes awaiting confirmation
   - For each pending fix, note the date applied and what to look for
   - After Step 2 (transcript analysis), report whether each pending fix has resolved or recurred
3. Check the **Analysis Log** — note when the last analysis was run and what was found

Present a brief status:
```
PREVIOUS LEARNINGS:
  Known patterns to check: [N]
  Pending verifications: [N]
  Last analysis: [date]
```

### Step 0b: Check Centre Feedback

**Pull unanalyzed feedback from the centre using FeedbackTracker.**

```bash
bun ~/.claude/skills/_VOICEAIAGENCY/Tools/FeedbackTracker.ts --list --centre canton-ma-us --unanalyzed
```

For each unanalyzed feedback entry:
1. Note the **categories** and **what happened** — these are centre-reported issues to specifically look for in transcripts
2. If it's a **specific call** feedback, try to match the `caller_reference` to a Retell call in Step 1
3. Centre feedback takes **priority** over automated analysis — if a centre reports an issue, it's real regardless of what the transcript analyzer says

Present a brief status:
```
CENTRE FEEDBACK:
  Unanalyzed entries: [N]
  Categories reported: [list]
  Average rating: [X/5]
```

If no unanalyzed feedback exists, note "No new centre feedback" and continue.

### Step 1: Pull Recent Calls

Use the Retell MCP `list_calls` tool:
- **agent_id:** `agent_0c6c32b61cb506fefb6ac247f4`
- **limit:** 10
- **sort_order:** descending

Present a summary table:

| Call ID | Date | Duration | Status | Has Transcript |
|---------|------|----------|--------|----------------|

### Step 2: Analyze Transcripts

Use the Retell MCP `analyze_transcripts` tool:
- **agent_id:** `agent_0c6c32b61cb506fefb6ac247f4`
- **num_calls:** 10

Present findings grouped by severity:

**Critical Issues:**
- [list each with evidence and call_id]

**Warnings:**
- [list each with evidence]

**Info:**
- [list each]

If no calls or transcripts exist, report that and skip to Step 3.

### Step 3: Pull Current Prompt

Use the Retell MCP `get_agent_prompt` tool:
- **agent_id:** `agent_0c6c32b61cb506fefb6ac247f4`

Present:
- Current model
- Prompt length
- Begin message
- Tool count
- Key structural elements (does it have the 4-section format?)

### Step 4: Generate Recommendations

Based on the transcript analysis (Step 2), prompt review (Step 3), **and centre feedback (Step 0b)**, generate specific, actionable recommendations:

**Centre feedback gets special treatment:**
- If a centre reported an issue AND transcripts confirm it → **Critical priority** recommendation
- If a centre reported an issue but transcripts don't show it → still include as recommendation with note "reported by centre, not confirmed in recent transcripts — may be intermittent"
- If transcripts show an issue the centre also flagged → stronger evidence, mention both sources

For each recommendation:
1. **What to change** — specific prompt text to add, modify, or remove
2. **Why** — which transcript issue it addresses (with call_id evidence)
3. **Expected impact** — what improvement to expect

Format as a numbered list. Be specific — show exact prompt text changes, not vague suggestions.

### Step 5: Approval Gate (MANDATORY)

**NEVER skip this step. NEVER push changes without explicit approval.**

Use `AskUserQuestion` to present the recommendations and ask:

- "Approve all" — push all recommended changes
- "Approve some" — let the user select which recommendations to apply
- "Reject" — no changes pushed, analysis complete

**If the user rejects, stop here. Do not push any changes.**

### Step 6: Push Approved Changes

Only if the user approved changes in Step 5:

Use the Retell MCP `update_agent_prompt` tool:
- **agent_id:** `agent_0c6c32b61cb506fefb6ac247f4`
- **general_prompt:** the updated prompt incorporating approved changes
- **begin_message:** updated only if a recommendation was approved for it

After pushing, confirm:
- Show the updated prompt preview
- Show the new prompt length
- Show the last_modified timestamp

### Step 7: Record Learnings

**Always update `Learnings.md` after every analysis run, whether or not changes were pushed.**

Use the Edit tool to update these sections:

1. **Known Patterns** — Add any new recurring issues discovered. Update status of existing patterns (e.g., "Fixed — monitoring" → "Verified fixed" or "Recurred — needs deeper fix")

2. **Analysis Log** — Prepend a new entry (newest first) with:
   - Date
   - Calls analyzed (count, date range)
   - Findings summary (critical/warning/info counts)
   - Issue details
   - Fixes applied (or "no changes")
   - Key insight (one sentence — what did we learn?)

3. **Verification Queue** — Update status of pending fixes:
   - If new calls show the fix worked → mark "VERIFIED" with date and evidence
   - If issue recurred → mark "RECURRED" with details
   - Add any newly applied fixes as "PENDING"

**This step is NOT optional. Even a clean analysis ("0 issues found") gets logged — that's valuable data.**

### Step 7b: Mark Feedback as Analyzed

**If there were unanalyzed feedback entries from Step 0b, mark them as analyzed now.**

For each feedback entry that was reviewed during this analysis:

```bash
bun ~/.claude/skills/_VOICEAIAGENCY/Tools/FeedbackTracker.ts --mark-analyzed \
  --id [FEEDBACK_ID] \
  --action-taken "[what was done about this feedback]" \
  --linked-call-id "[Retell call_id if matched]"
```

This closes the feedback loop — centres can see their feedback was received and acted on.

---

## Output Format

```
═══════════════════════════════════════════
  AGENT ANALYSIS: CNKB
  Code Ninjas with Knowledge Base
  Date: [today]
═══════════════════════════════════════════

CENTRE FEEDBACK: [N unanalyzed entries, avg rating X/5]
  [category summary if any]

RECENT CALLS: [X calls analyzed, Y with transcripts]
  [summary table]

TRANSCRIPT ANALYSIS:
  Critical: [N issues]
  Warnings: [N issues]
  Info: [N issues]
  [details]

CURRENT PROMPT:
  Model: [model]
  Length: [chars]
  Begin message: [preview]
  Structure: [4-section check]

RECOMMENDATIONS:
  1. [change] — [why] — [impact]
  2. [change] — [why] — [impact]

[APPROVAL GATE — AskUserQuestion]

RESULT: [approved/rejected] — [what was pushed, if anything]

LEARNINGS UPDATED: [what was added to Learnings.md]
═══════════════════════════════════════════
```

---

## Related

- `AgentConfig.md` — Full agent configuration reference
- `Learnings.md` — Running log of findings, fixes, and verification status
- `Prompt.md` — Version-controlled snapshot of the live Retell prompt
- `~/.claude/skills/_VOICEAIAGENCY/BuildKnowledge.md` — 14 mistakes, best practices
- `~/.claude/skills/_VOICEAIAGENCY/Tools/AgentAudit.ts` — 14-point checklist CLI
- `~/.claude/skills/_VOICEAIAGENCY/Tools/FeedbackTracker.ts` — Centre feedback management CLI
- `~/.claude/skills/_VOICEAIAGENCY/Setup/FeedbackSystem.md` — Google Form + Supabase setup guide
