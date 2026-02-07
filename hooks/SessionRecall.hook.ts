#!/usr/bin/env bun
/**
 * SessionRecall.hook.ts - Recall Last 3 Sessions at Startup (SessionStart)
 *
 * PURPOSE:
 * Provides continuity between sessions by loading summaries of the last 3
 * sessions and injecting them as context. Includes completion status so the
 * main agent can offer to continue unfinished work.
 *
 * TRIGGER: SessionStart
 *
 * INPUT:
 * - stdin: Hook input JSON (session_id, transcript_path)
 * - Files: projects/-root--claude/sessions-index.json, session JSONL transcripts
 *
 * OUTPUT:
 * - stdout: <system-reminder> with session summaries + continuation instructions
 * - stderr: Status/debug messages
 * - exit(0): Always
 *
 * SIDE EFFECTS:
 * - None (read-only)
 *
 * INTER-HOOK RELATIONSHIPS:
 * - DEPENDS ON: None (reads session index directly)
 * - COORDINATES WITH: LoadContext (both run at SessionStart)
 * - MUST RUN AFTER: LoadContext (PAI context should load first)
 *
 * DESIGN NOTES:
 * - No AI inference in the hook — raw data extraction only for speed
 * - The main agent (which IS an AI) synthesizes the raw data into summaries
 * - Uses completion pattern matching from RecallSession.ts
 *
 * ERROR HANDLING:
 * - Missing sessions index: Silent exit (new install, no history)
 * - Missing JSONL files: Skip that session
 * - Parse errors: Skip malformed entries
 *
 * PERFORMANCE:
 * - Non-blocking: File reads only, no subprocesses
 * - Typical execution: <200ms
 * - Skipped for subagents: Yes
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { getPaiDir } from './lib/paths';

// ============================================================================
// Configuration
// ============================================================================

const CLAUDE_DIR = join(process.env.HOME!, '.claude');
const PROJECTS_DIR = join(CLAUDE_DIR, 'projects', '-root--claude');
const SESSIONS_INDEX = join(PROJECTS_DIR, 'sessions-index.json');

const MAX_SESSIONS = 3;
const MAX_DIRECT_READ = 512 * 1024; // 512KB threshold for direct read
const MAX_CONTENT_LENGTH = 300; // Truncate message content

// Completion detection patterns (from RecallSession.ts)
const COMPLETION_PATTERNS = {
  complete: [
    /completed?\s+(successfully|all\s+tasks?)/i,
    /all\s+(\d+\s+)?tasks?\s+(are\s+)?complete/i,
    /finished/i,
    /done[\s!.]/i,
    /successfully\s+(created|built|implemented|deployed)/i,
    /COMPLETED:/i,
    /status:\s*completed?/i,
  ],
  failed: [
    /failed/i,
    /error:/i,
    /could\s*n[o']t/i,
    /unable\s+to/i,
    /exception/i,
    /aborted/i,
  ],
  partial: [
    /in\s*progress/i,
    /working\s+on/i,
    /continuing/i,
    /partial/i,
    /still\s+need/i,
  ],
};

// ============================================================================
// Types
// ============================================================================

interface SessionIndexEntry {
  sessionId: string;
  fullPath: string;
  fileMtime: number;
  firstPrompt: string;
  messageCount: number;
  created: string;
  modified: string;
  gitBranch: string;
  projectPath: string;
  isSidechain: boolean;
}

interface SessionIndex {
  version: number;
  entries: SessionIndexEntry[];
}

interface SessionSummary {
  sessionId: string;
  firstPrompt: string;
  created: string;
  modified: string;
  messageCount: number;
  completionStatus: 'complete' | 'partial' | 'failed' | 'unknown';
  completionEvidence: string;
  lastAssistantMessage: string;
  durationMinutes: number;
}

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
}

// ============================================================================
// Session Index
// ============================================================================

function loadSessionsIndex(): SessionIndex | null {
  if (!existsSync(SESSIONS_INDEX)) {
    return null;
  }

  try {
    const content = readFileSync(SESSIONS_INDEX, 'utf-8');
    return JSON.parse(content) as SessionIndex;
  } catch {
    return null;
  }
}

const MIN_MESSAGE_COUNT = 3; // Skip trivial sessions (system/empty)

function getRecentSessions(
  index: SessionIndex,
  currentSessionId: string,
  count: number
): SessionIndexEntry[] {
  return [...index.entries]
    .filter(e =>
      !e.isSidechain &&
      e.sessionId !== currentSessionId &&
      e.messageCount >= MIN_MESSAGE_COUNT
    )
    .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
    .slice(0, count);
}

// ============================================================================
// Message Extraction
// ============================================================================

function extractTextContent(content: unknown): string {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    const textParts = content
      .filter((c: any) => c.type === 'text' && c.text)
      .map((c: any) => c.text);
    return textParts.join('\n');
  }

  return '';
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function isSystemMessage(content: string): boolean {
  return (
    content.startsWith('<local-command') ||
    content.startsWith('<command-name>') ||
    content.includes('hook_progress') ||
    content.startsWith('<system-reminder>')
  );
}

interface ExtractedMessages {
  firstUserMessage: string;
  lastAssistantMessage: string;
  completionStatus: 'complete' | 'partial' | 'failed' | 'unknown';
  completionEvidence: string;
}

function extractSessionMessages(sessionPath: string): ExtractedMessages {
  const result: ExtractedMessages = {
    firstUserMessage: '',
    lastAssistantMessage: '',
    completionStatus: 'unknown',
    completionEvidence: 'No clear completion indicator found',
  };

  try {
    const stats = statSync(sessionPath);

    let content: string;
    if (stats.size <= MAX_DIRECT_READ) {
      content = readFileSync(sessionPath, 'utf-8');
    } else {
      // For large files, read first 50KB and last 50KB
      const fd = require('fs').openSync(sessionPath, 'r');
      const headBuf = Buffer.alloc(50 * 1024);
      const tailBuf = Buffer.alloc(50 * 1024);

      require('fs').readSync(fd, headBuf, 0, headBuf.length, 0);
      const tailStart = Math.max(0, stats.size - tailBuf.length);
      require('fs').readSync(fd, tailBuf, 0, tailBuf.length, tailStart);
      require('fs').closeSync(fd);

      content = headBuf.toString('utf-8') + '\n' + tailBuf.toString('utf-8');
    }

    const lines = content.split('\n').filter(line => line.trim());

    // Find first user message
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'user' && !entry.isMeta) {
          const text = extractTextContent(entry.message?.content);
          if (text && text.length >= 5 && !isSystemMessage(text)) {
            result.firstUserMessage = truncate(text.trim(), MAX_CONTENT_LENGTH);
            break;
          }
        }
      } catch {
        // Skip malformed lines
      }
    }

    // Find last assistant message (scan from end)
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.type === 'assistant') {
          const text = extractTextContent(entry.message?.content);
          if (text && text.length >= 10 && !isSystemMessage(text)) {
            result.lastAssistantMessage = truncate(text.trim(), MAX_CONTENT_LENGTH);
            break;
          }
        }
      } catch {
        // Skip malformed lines
      }
    }

    // Detect completion status from last 10 messages
    const recentLines = lines.slice(-20);
    const recentMessages: string[] = [];

    for (const line of recentLines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'assistant' || entry.type === 'user') {
          const text = extractTextContent(entry.message?.content);
          if (text) recentMessages.push(text);
        }
      } catch {
        // Skip
      }
    }

    // Check recent messages for completion patterns (most recent first)
    for (const msg of recentMessages.reverse()) {
      let found = false;

      for (const pattern of COMPLETION_PATTERNS.complete) {
        const match = msg.match(pattern);
        if (match) {
          result.completionStatus = 'complete';
          result.completionEvidence = extractEvidence(msg, match);
          found = true;
          break;
        }
      }
      if (found) break;

      for (const pattern of COMPLETION_PATTERNS.failed) {
        const match = msg.match(pattern);
        if (match) {
          result.completionStatus = 'failed';
          result.completionEvidence = extractEvidence(msg, match);
          found = true;
          break;
        }
      }
      if (found) break;

      for (const pattern of COMPLETION_PATTERNS.partial) {
        const match = msg.match(pattern);
        if (match) {
          result.completionStatus = 'partial';
          result.completionEvidence = extractEvidence(msg, match);
          found = true;
          break;
        }
      }
      if (found) break;
    }
  } catch (error) {
    console.error(`[SessionRecall] Error extracting messages: ${error}`);
  }

  return result;
}

function extractEvidence(content: string, match: RegExpMatchArray): string {
  const matchIndex = match.index || 0;
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(content.length, matchIndex + match[0].length + 40);

  let evidence = content.slice(start, end).trim();
  if (start > 0) evidence = '...' + evidence;
  if (end < content.length) evidence = evidence + '...';

  return evidence.replace(/\n/g, ' ').substring(0, 200);
}

// ============================================================================
// Summary Building
// ============================================================================

function cleanFirstPrompt(indexPrompt: string, extractedPrompt: string): string {
  // Filter out dirty index prompts that contain system content
  const dirtyPatterns = [
    /^(CONTEXT|<system-reminder|<local-command|<command-name|No prompt)/i,
    /^(🤖|PAI ALGORITHM|ALGORITHM REQUIRED)/,
    /^(Completing task|Entering|hook_progress)/i,
  ];

  const isIndexDirty = !indexPrompt ||
    indexPrompt.length < 3 ||
    dirtyPatterns.some(p => p.test(indexPrompt.trim()));

  const prompt = isIndexDirty ? extractedPrompt : indexPrompt;
  if (!prompt) return '(no prompt captured)';

  // Clean up and truncate
  return truncate(prompt.replace(/\n/g, ' ').trim(), MAX_CONTENT_LENGTH);
}

function buildSessionSummary(entry: SessionIndexEntry): SessionSummary | null {
  if (!existsSync(entry.fullPath)) {
    return null;
  }

  const messages = extractSessionMessages(entry.fullPath);

  const created = new Date(entry.created);
  const modified = new Date(entry.modified);
  const durationMinutes = Math.round((modified.getTime() - created.getTime()) / 60000);

  return {
    sessionId: entry.sessionId,
    firstPrompt: cleanFirstPrompt(entry.firstPrompt, messages.firstUserMessage),
    created: entry.created,
    modified: entry.modified,
    messageCount: entry.messageCount,
    completionStatus: messages.completionStatus,
    completionEvidence: messages.completionEvidence,
    lastAssistantMessage: messages.lastAssistantMessage,
    durationMinutes,
  };
}

// ============================================================================
// Output
// ============================================================================

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function statusIcon(status: string): string {
  switch (status) {
    case 'complete': return 'DONE';
    case 'partial': return 'IN-PROGRESS';
    case 'failed': return 'FAILED';
    default: return 'UNKNOWN';
  }
}

function buildOutput(summaries: SessionSummary[]): string {
  const hasUnfinished = summaries.some(
    s => s.completionStatus === 'partial' || s.completionStatus === 'unknown' || s.completionStatus === 'failed'
  );

  let output = `<system-reminder>
SESSION RECALL — Last ${summaries.length} Sessions (Auto-loaded at Session Start)

`;

  for (let i = 0; i < summaries.length; i++) {
    const s = summaries[i];
    output += `SESSION ${i + 1}: [${statusIcon(s.completionStatus)}] ${formatRelativeTime(s.modified)}
  Topic: ${s.firstPrompt}
  Duration: ${s.durationMinutes}m | Messages: ${s.messageCount}
  Status: ${s.completionStatus}${s.completionEvidence !== 'No clear completion indicator found' ? ` — "${s.completionEvidence}"` : ''}
  Last response: ${s.lastAssistantMessage || '(none captured)'}

`;
  }

  if (hasUnfinished) {
    output += `UNFINISHED WORK DETECTED — Some sessions may have incomplete tasks.

`;
  }

  output += `INSTRUCTION: Present a brief, conversational summary of these ${summaries.length} recent sessions to the user. Then use AskUserQuestion to ask if they want to continue any unfinished work, start something new, or just chat. List the session topics as selectable options.
</system-reminder>`;

  return output;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    // Detect subagent — skip silently
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent =
      claudeProjectDir.includes('/.claude/Agents/') ||
      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      process.exit(0);
    }

    // Read stdin (hook contract)
    let currentSessionId = '';
    try {
      const input = await Bun.stdin.text();
      if (input && input.trim()) {
        const data: HookInput = JSON.parse(input);
        currentSessionId = data.session_id || '';
      }
    } catch {
      // No stdin or parse error — continue without filtering current session
    }

    // Load sessions index
    const index = loadSessionsIndex();
    if (!index || index.entries.length === 0) {
      console.error('[SessionRecall] No sessions index found or empty — skipping');
      process.exit(0);
    }

    // Get recent sessions (excluding current)
    const recentEntries = getRecentSessions(index, currentSessionId, MAX_SESSIONS);

    if (recentEntries.length === 0) {
      console.error('[SessionRecall] No previous sessions found — skipping');
      process.exit(0);
    }

    console.error(`[SessionRecall] Processing ${recentEntries.length} recent sessions...`);

    // Build summaries
    const summaries: SessionSummary[] = [];
    for (const entry of recentEntries) {
      const summary = buildSessionSummary(entry);
      if (summary) {
        summaries.push(summary);
        console.error(`[SessionRecall]   ${summary.completionStatus}: ${truncate(summary.firstPrompt, 60)}`);
      }
    }

    if (summaries.length === 0) {
      console.error('[SessionRecall] No session data extractable — skipping');
      process.exit(0);
    }

    // Output the system-reminder
    console.log(buildOutput(summaries));
    console.error(`[SessionRecall] Injected ${summaries.length} session summaries`);

    process.exit(0);
  } catch (error) {
    console.error(`[SessionRecall] Error: ${error}`);
    process.exit(0); // Always exit 0
  }
}

main();
