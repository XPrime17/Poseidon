---
capture_type: RESEARCH
timestamp: 2026-01-31 12:18:02 PST
executor: default
agent_completion: Algorithm design for cluster-based session recall with streaming JSONL handling
---

# RESEARCH: Algorithm design for cluster-based session recall with streaming JSONL handling

**Agent:** default
**Completed:** 2026:01:31:121802

---

## Agent Output

## Architectural Analysis

### Problem Statement

The current session recall approach uses naive keyword search and stops at the first match, causing:
1. **Multi-session blindness** - Related sessions started within minutes are missed
2. **Single-match failure** - First match may not be the most relevant session
3. **Incomplete narrative** - User-assistant conversation flow is fragmented
4. **Token overflow** - Large JSONL files (75K+ tokens) cannot be read directly

### Proposed Solution: Cluster-Based Session Recall Algorithm

---

## Data Structures

```typescript
// === INPUT STRUCTURES (from sessions-index.json) ===

interface SessionIndexEntry {
  sessionId: string;           // UUID
  fullPath: string;            // Absolute path to JSONL
  fileMtime: number;           // Unix timestamp (ms)
  firstPrompt: string;         // First user message (truncated)
  messageCount: number;        // Total messages
  created: string;             // ISO timestamp
  modified: string;            // ISO timestamp
  gitBranch: string;           // Git branch at creation
  projectPath: string;         // Working directory
  isSidechain: boolean;        // True if subagent session
}

interface SessionIndex {
  version: number;
  entries: SessionIndexEntry[];
}

// === JSONL MESSAGE TYPES ===

interface BaseMessage {
  type: 'user' | 'assistant' | 'progress' | 'queue-operation';
  timestamp: string;           // ISO timestamp
  sessionId: string;
  uuid: string;
  parentUuid: string | null;
}

interface UserMessage extends BaseMessage {
  type: 'user';
  message: {
    role: 'user';
    content: string | ContentBlock[];
  };
}

interface AssistantMessage extends BaseMessage {
  type: 'assistant';
  message: {
    role: 'assistant';
    content: ContentBlock[];   // Array of text/tool_use/tool_result
  };
}

interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;               // For type: 'text'
  content?: string;            // For tool_result
  name?: string;               // Tool name for tool_use
}

// === ALGORITHM OUTPUT STRUCTURES ===

interface SessionCluster {
  clusterId: string;
  sessions: SessionIndexEntry[];
  timeRange: {
    start: Date;
    end: Date;
  };
  primarySession: string;      // Session with most messages
  totalMessages: number;
}

interface ExtractedMessage {
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;             // Extracted text only
  sessionId: string;
  isToolResult: boolean;       // True if contains tool output
}

interface SessionTimeline {
  clusterId: string;
  messages: ExtractedMessage[];
  completionIndicators: CompletionIndicator[];
  summary: string;
}

interface CompletionIndicator {
  type: 'success' | 'failure' | 'incomplete' | 'error';
  evidence: string;            // The text that indicates this
  timestamp: Date;
}
```

---

## Algorithm: Step-by-Step Processing Logic

### Phase 1: Index Loading and Chronological Sort

```
FUNCTION loadAndSortSessions(projectPath: string)
  INPUT: Path to sessions-index.json
  OUTPUT: SessionIndexEntry[] sorted by created timestamp
  
  1. Read sessions-index.json (small file, safe to read fully)
  2. Parse JSON and extract entries array
  3. Sort entries by created timestamp ascending
  4. Return sorted array
```

### Phase 2: Session Clustering (10-minute window)

```
FUNCTION clusterSessions(sessions: SessionIndexEntry[], gapThreshold: number = 600000)
  INPUT: Sorted sessions, gap threshold in ms (default 10 min)
  OUTPUT: SessionCluster[]
  
  1. Initialize clusters = []
  2. Initialize currentCluster = { sessions: [sessions[0]] }
  
  3. FOR each session from index 1 to end:
     a. Calculate timeDelta = session.created - currentCluster.sessions.last.created
     b. IF timeDelta <= gapThreshold:
        - Add session to currentCluster.sessions
     c. ELSE:
        - Finalize currentCluster (calculate timeRange, primarySession, totalMessages)
        - Push currentCluster to clusters
        - Start new currentCluster with current session
  
  4. Finalize and push last cluster
  5. Return clusters
```

### Phase 3: Cluster Selection (Query Matching)

```
FUNCTION selectRelevantClusters(clusters: SessionCluster[], query: string)
  INPUT: All clusters, search query
  OUTPUT: SessionCluster[] matching query (may be multiple)
  
  1. FOR each cluster:
     a. Check if any session.firstPrompt contains query keywords
     b. Calculate relevance score based on:
        - Keyword matches in firstPrompt
        - Recency (more recent = higher score)
        - Message count (more messages = potentially more complete work)
  
  2. Sort by relevance score descending
  3. Return top N clusters (default: top 3 or all with score > threshold)
  
  NOTE: Unlike current approach, we return MULTIPLE candidate clusters
        to capture multi-session continuations
```

### Phase 4: Streaming JSONL Extraction (Handles Large Files)

This is the critical phase that handles token-limited file reading.

```
FUNCTION streamExtractMessages(sessionPath: string, tokenBudget: number = 20000)
  INPUT: Path to JSONL file, token budget
  OUTPUT: ExtractedMessage[]
  
  STRATEGY: Line-by-line streaming with priority extraction
  
  1. Get file line count: `wc -l {path}`
  2. IF lineCount * avgLineSize < tokenBudget:
     - Read entire file, parse all messages
     - GOTO step 6
  
  3. ELSE (large file handling):
     a. Read FIRST 50 lines (capture initial user request)
        - Parse and extract user messages
     b. Read LAST 100 lines (capture final outcome)
        - Parse and extract completion indicators
     c. Calculate middle section budget = tokenBudget - (first + last tokens)
  
  4. Middle section sampling (if budget allows):
     a. Use jq to extract only 'user' and 'assistant' type messages
     b. Skip 'progress' type messages (metadata, not content)
     c. Sample at intervals: every Nth line where N = lineCount / desiredSamples
  
  5. Merge extracted sections chronologically
  
  6. FOR each parsed line:
     a. IF type == 'user':
        - Extract message.content (string or first text block)
        - Create ExtractedMessage with role='user'
     b. IF type == 'assistant':
        - Iterate message.content array
        - Extract only type='text' blocks
        - Skip tool_use blocks (just show "[Tool: {name}]")
        - Summarize tool_result blocks (just show "[Result: OK/ERROR]")
        - Create ExtractedMessage with role='assistant'
  
  7. Return ExtractedMessage[] sorted by timestamp
```

### Phase 5: Content Extraction (Meaningful vs Metadata)

```
FUNCTION extractMeaningfulContent(contentBlocks: ContentBlock[])
  INPUT: Assistant message content array
  OUTPUT: string (human-readable content)
  
  1. Initialize output = []
  
  2. FOR each block in contentBlocks:
     a. IF block.type == 'text':
        - Append block.text to output
     b. IF block.type == 'tool_use':
        - Append "[Used tool: {block.name}]" (summarize, don't include full input)
     c. IF block.type == 'tool_result':
        - IF block.content.length < 500:
          - Append "[Result: {block.content}]"
        - ELSE:
          - Append "[Result: {first 200 chars}... (truncated)]"
  
  3. Return output.join('\n')
```

### Phase 6: Build Complete Narrative Timeline

```
FUNCTION buildTimeline(cluster: SessionCluster)
  INPUT: SessionCluster with all related sessions
  OUTPUT: SessionTimeline
  
  1. Initialize allMessages = []
  
  2. FOR each session in cluster.sessions:
     a. Extract messages using streamExtractMessages(session.fullPath)
     b. Tag each message with session.sessionId
     c. Append to allMessages
  
  3. Sort allMessages by timestamp ascending
  
  4. Detect conversation continuity patterns:
     a. Look for "CONTEXT:" prefixes (indicates continuation)
     b. Look for "Previous context" mentions
     c. Look for session references
  
  5. Identify completion indicators (scan last 20 messages):
     a. SUCCESS patterns: "completed", "done", "success", "deployed"
     b. FAILURE patterns: "failed", "error", "could not", "unable"
     c. INCOMPLETE patterns: no clear conclusion, session ends abruptly
  
  6. Generate summary:
     a. First user message (the original request)
     b. Key milestones (tools used, files created)
     c. Final outcome status
  
  7. Return SessionTimeline
```

### Phase 7: Verify Completion

```
FUNCTION assessCompletion(timeline: SessionTimeline)
  INPUT: Complete narrative timeline
  OUTPUT: { status: 'complete' | 'partial' | 'failed', evidence: string }
  
  1. Scan final 10 messages for explicit success/failure:
     - "PASSED", "COMPLETED", "DEPLOYED" -> complete
     - "FAILED", "ERROR", "COULD NOT" -> failed
     - No clear indicator -> partial
  
  2. Check for ISC task completion (PAI-specific):
     - Look for TaskUpdate calls with status='completed'
     - Count completed vs total tasks
  
  3. Check for error messages:
     - "authentication_failed"
     - "tool_use_error"
     - "timeout"
  
  4. Return assessment with evidence (the actual text that led to conclusion)
```

---

## Handling Large JSONL Files

The key challenge is JSONL files that exceed token limits (75K+ tokens observed).

### Strategy: Layered Sampling

```
Layer 1: Metadata Only (always fast)
  - First 5 lines: Session identity, initial request
  - Last 5 lines: Final state, completion status
  - Use jq for surgical extraction

Layer 2: Message Sampling (medium detail)
  - Extract every Nth message where N = totalLines / 50
  - Focus on 'user' and 'assistant' types only
  - Skip 'progress' type entirely

Layer 3: Full Extraction (when needed)
  - Only for small files or when detail is critical
  - Use Read tool with offset/limit for pagination
```

### Implementation Pattern

```typescript
async function smartReadJSONL(path: string, tokenLimit: number) {
  // Step 1: Get file size
  const lineCount = await bash(`wc -l ${path}`);
  
  // Step 2: Estimate if file is small enough
  if (lineCount < 50) {
    return fullRead(path);  // Small file, read it all
  }
  
  // Step 3: Extract strategically using jq
  const userMessages = await bash(`
    cat ${path} | jq -c 'select(.type == "user") | 
      {ts: .timestamp, content: .message.content[0:500]}'
  `);
  
  const assistantSummary = await bash(`
    cat ${path} | jq -c 'select(.type == "assistant") |
      {ts: .timestamp, text: [.message.content[] | select(.type == "text") | .text[0:300]]}' |
    tail -20  # Last 20 assistant messages for completion detection
  `);
  
  // Step 4: Read first and last portions with Read tool
  const firstChunk = await read(path, { limit: 20 });
  const lastChunk = await read(path, { offset: lineCount - 30, limit: 30 });
  
  return merge(userMessages, assistantSummary, firstChunk, lastChunk);
}
```

---

## Session Continuation Patterns

The algorithm detects these patterns to identify related sessions:

| Pattern | Detection Method |
|---------|-----------------|
| **Time proximity** | Sessions created within 10 minutes |
| **CONTEXT prefix** | firstPrompt starts with "CONTEXT:" |
| **Explicit continuation** | "Previous context", "Continue from" |
| **Same branch** | gitBranch matches |
| **Subagent sessions** | isSidechain=true with parent session nearby |
| **Same project path** | projectPath matches |

---

## Trade-offs and Decisions

| Decision | Rationale |
|----------|-----------|
| 10-minute clustering window | Balance between catching continuations and grouping unrelated work |
| Prioritize first/last messages | Most important context is initial request and final outcome |
| Skip 'progress' type | Metadata-heavy, low semantic value |
| Token budget approach | Prevents tool failure while maximizing information |
| Multiple cluster return | Avoids first-match failure mode |

---

## Implementation Plan

**Phase 1: Core Data Structures** (Day 1)
- Define TypeScript interfaces
- Create session-index parser
- Build chronological sorter

**Phase 2: Clustering Algorithm** (Day 1-2)
- Implement time-based clustering
- Add continuation pattern detection
- Build cluster scoring for relevance

**Phase 3: Streaming JSONL Reader** (Day 2-3)
- Create line-count estimation
- Implement jq-based extraction
- Build pagination for large files

**Phase 4: Content Extraction** (Day 3)
- Parse ContentBlock arrays
- Extract meaningful text
- Summarize tool interactions

**Phase 5: Timeline Builder** (Day 4)
- Merge multi-session messages
- Sort chronologically
- Detect completion indicators

**Phase 6: Integration** (Day 4-5)
- Create RecallSession.ts tool
- Add to tool registry
- Write tests with real session data

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| jq not installed | Fall back to line-by-line parsing with bash |
| Session index corruption | Validate JSON before parsing, fail gracefully |
| Token overflow on extraction | Hard limit with truncation, prioritize recent |
| False clustering | Configurable time window, require 2+ signals |
| Missing completion signals | Default to "incomplete" status, flag for review |

---

## Testing Strategy

1. **Unit tests**: Each function with mock data
2. **Integration tests**: Real sessions-index.json, real JSONL files
3. **Edge cases**: 
   - Single session (no cluster)
   - 100+ session cluster
   - 75K+ token JSONL file
   - Empty/corrupted files
4. **Accuracy tests**: Manual verification of extracted narratives

---

## Summary

This algorithm solves the session recall failure by:
1. **Clustering** temporally-related sessions instead of single-match
2. **Streaming** large files with strategic sampling instead of full reads
3. **Extracting** meaningful content while skipping metadata noise
4. **Building** complete narrative timelines across session boundaries
5. **Verifying** completion status with evidence-based assessment

The fundamental constraint is token limits. The algorithm respects this by layered sampling and priority extraction, ensuring we always get the critical information (initial request + final outcome) even from massive files.

---

**COMPLETED:** Algorithm design for cluster-based session recall with streaming JSONL handling
agentId: a640709 (for resuming to continue this agent's work if needed)

---

## Metadata

**Transcript:** `/root/.claude/projects/-root--claude/0afe4207-5b05-433c-916a-f328331243d3.jsonl`
**Captured:** 2026-01-31 12:18:02 PST

---

*This output was automatically captured by UOCS SubagentStop hook.*
