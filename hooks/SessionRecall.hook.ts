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
 * - Files: projects/{all}/sessions-index.json (optional), session JSONL transcripts
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

import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { getPaiDir } from './lib/paths';

// ============================================================================
// Configuration
// ============================================================================

const CLAUDE_DIR = join(process.env.HOME!, '.claude');
const PROJECTS_BASE = join(CLAUDE_DIR, 'projects');

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
// Session Discovery (file-based, across all project dirs)
// ============================================================================

const MIN_FILE_SIZE = 10_000; // Skip tiny JSONL files (<10KB = subagent/trivial sessions)

/**
 * Load all sessions-index.json files across project dirs for metadata enrichment.
 * Returns a map of sessionId → SessionIndexEntry for fast lookup.
 */
function loadAllIndexEntries(): Map<string, SessionIndexEntry> {
  const map = new Map<string, SessionIndexEntry>();

  if (!existsSync(PROJECTS_BASE)) return map;

  try {
    const dirs = readdirSync(PROJECTS_BASE, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      const indexPath = join(PROJECTS_BASE, dir.name, 'sessions-index.json');
      if (!existsSync(indexPath)) continue;

      try {
        const content = readFileSync(indexPath, 'utf-8');
        const index = JSON.parse(content) as SessionIndex;
        for (const entry of index.entries) {
          map.set(entry.sessionId, entry);
        }
      } catch {
        // Skip malformed index files
      }
    }
  } catch {
    // Can't read projects dir
  }

  return map;
}

/**
 * Discover recent sessions by scanning JSONL files across ALL project directories.
 * Falls back gracefully when sessions-index.json is stale or missing.
 */
function discoverRecentSessions(
  currentSessionId: string,
  count: number
): SessionIndexEntry[] {
  if (!existsSync(PROJECTS_BASE)) return [];

  // Load index entries for metadata enrichment
  const indexMap = loadAllIndexEntries();

  // Scan all project dirs for JSONL files
  interface FileCandidate {
    fullPath: string;
    sessionId: string;
    mtime: Date;
    size: number;
    projectDir: string;
  }

  const candidates: FileCandidate[] = [];

  // Automated subagent sessions live in deep project dirs like -root--claude-hooks,
  // -root--claude-skills-*, etc. Skip those — only scan main project dirs.
  const SKIP_DIR_PATTERNS = [/-hooks$/, /-skills-/, /-Tools$/, /-MCP$/];

  try {
    const dirs = readdirSync(PROJECTS_BASE, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      if (SKIP_DIR_PATTERNS.some(p => p.test(dir.name))) continue;
      const dirPath = join(PROJECTS_BASE, dir.name);

      try {
        const files = readdirSync(dirPath);
        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue;

          // Extract session ID from filename (UUID.jsonl)
          const sessionId = basename(file, '.jsonl');
          if (sessionId === currentSessionId) continue;

          const fullPath = join(dirPath, file);
          try {
            const stats = statSync(fullPath);
            if (stats.size < MIN_FILE_SIZE) continue; // Skip tiny files

            candidates.push({
              fullPath,
              sessionId,
              mtime: stats.mtime,
              size: stats.size,
              projectDir: dir.name,
            });
          } catch {
            // Skip unreadable files
          }
        }
      } catch {
        // Skip unreadable dirs
      }
    }
  } catch {
    return [];
  }

  // Deduplicate by sessionId (same session might appear in multiple dirs — keep newest)
  const bySession = new Map<string, FileCandidate>();
  for (const c of candidates) {
    const existing = bySession.get(c.sessionId);
    if (!existing || c.mtime > existing.mtime) {
      bySession.set(c.sessionId, c);
    }
  }

  // Sort by mtime desc, take top N
  const sorted = [...bySession.values()]
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .slice(0, count);

  // Convert to SessionIndexEntry, enriching from index where available
  return sorted.map(c => {
    const indexed = indexMap.get(c.sessionId);
    if (indexed) {
      // Use index metadata but update fullPath to the discovered one (may have moved)
      return { ...indexed, fullPath: c.fullPath };
    }

    // No index entry — create a minimal one from file stats
    return {
      sessionId: c.sessionId,
      fullPath: c.fullPath,
      fileMtime: c.mtime.getTime(),
      firstPrompt: '', // Will be extracted from JSONL
      messageCount: 0, // Unknown — will estimate from JSONL
      created: c.mtime.toISOString(), // Approximate
      modified: c.mtime.toISOString(),
      gitBranch: '',
      projectPath: c.projectDir,
      isSidechain: false,
    };
  });
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
      // For large files, read first 128KB and last 50KB
      const fd = require('fs').openSync(sessionPath, 'r');
      const headBuf = Buffer.alloc(128 * 1024);
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
    /^You are analyzing/i,
    /^(Generate|Analyze|Process|Extract)\s+(a|the)\s+/i,
  ];

  const isIndexDirty = !indexPrompt ||
    indexPrompt.length < 3 ||
    dirtyPatterns.some(p => p.test(indexPrompt.trim()));

  const prompt = isIndexDirty ? extractedPrompt : indexPrompt;
  if (!prompt) return '(no prompt captured)';

  // Clean up and truncate
  return truncate(prompt.replace(/\n/g, ' ').trim(), MAX_CONTENT_LENGTH);
}

function extractTimestamps(sessionPath: string): { created: string; modified: string; lineCount: number } {
  const result = { created: '', modified: '', lineCount: 0 };

  try {
    const stats = statSync(sessionPath);

    if (stats.size <= MAX_DIRECT_READ) {
      const content = readFileSync(sessionPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      result.lineCount = lines.length;

      // Get timestamp from first entry
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          const ts = entry.timestamp || entry.snapshot?.timestamp;
          if (ts) { result.created = ts; break; }
        } catch { /* skip */ }
      }

      // Get timestamp from last entry
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(lines[i]);
          const ts = entry.timestamp || entry.snapshot?.timestamp;
          if (ts) { result.modified = ts; break; }
        } catch { /* skip */ }
      }
    } else {
      // Large file: read head + tail for timestamps
      const fd = require('fs').openSync(sessionPath, 'r');
      const headBuf = Buffer.alloc(5 * 1024);  // Timestamps are in first few lines
      const tailBuf = Buffer.alloc(10 * 1024);

      require('fs').readSync(fd, headBuf, 0, headBuf.length, 0);
      const tailStart = Math.max(0, stats.size - tailBuf.length);
      require('fs').readSync(fd, tailBuf, 0, tailBuf.length, tailStart);
      require('fs').closeSync(fd);

      // Estimate line count from file size (avg ~3KB per line based on observed data)
      result.lineCount = Math.round(stats.size / 3000);

      const headLines = headBuf.toString('utf-8').split('\n').filter(l => l.trim());
      for (const line of headLines) {
        try {
          const entry = JSON.parse(line);
          const ts = entry.timestamp || entry.snapshot?.timestamp;
          if (ts) { result.created = ts; break; }
        } catch { /* skip */ }
      }

      const tailLines = tailBuf.toString('utf-8').split('\n').filter(l => l.trim());
      for (let i = tailLines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(tailLines[i]);
          const ts = entry.timestamp || entry.snapshot?.timestamp;
          if (ts) { result.modified = ts; break; }
        } catch { /* skip */ }
      }
    }
  } catch { /* use defaults */ }

  // Fallback to file mtime
  if (!result.modified) {
    try { result.modified = statSync(sessionPath).mtime.toISOString(); } catch {}
  }
  if (!result.created) result.created = result.modified;

  return result;
}

function buildSessionSummary(entry: SessionIndexEntry): SessionSummary | null {
  if (!existsSync(entry.fullPath)) {
    return null;
  }

  const messages = extractSessionMessages(entry.fullPath);
  const timestamps = extractTimestamps(entry.fullPath);

  const created = (entry.messageCount > 0 && entry.created !== entry.modified)
    ? entry.created  // Use index data if it has real values
    : timestamps.created;
  const modified = (entry.messageCount > 0 && entry.created !== entry.modified)
    ? entry.modified
    : timestamps.modified;
  const messageCount = entry.messageCount > 0 ? entry.messageCount : timestamps.lineCount;

  const createdDate = new Date(created);
  const modifiedDate = new Date(modified);
  const durationMinutes = Math.max(1, Math.round((modifiedDate.getTime() - createdDate.getTime()) / 60000));

  return {
    sessionId: entry.sessionId,
    firstPrompt: cleanFirstPrompt(entry.firstPrompt, messages.firstUserMessage),
    created,
    modified,
    messageCount,
    completionStatus: messages.completionStatus,
    completionEvidence: messages.completionEvidence,
    lastAssistantMessage: messages.lastAssistantMessage,
    durationMinutes,
  };
}

// ============================================================================
// Visual Output (stderr — printed to terminal)
// ============================================================================

// ANSI colors matching PAI banner palette
const C = {
  reset:     '\x1b[0m',
  bold:      '\x1b[1m',
  dim:       '\x1b[2m',
  italic:    '\x1b[3m',
  deepBlue:  '\x1b[38;2;30;58;138m',
  blue:      '\x1b[38;2;59;130;246m',
  lightBlue: '\x1b[38;2;147;197;253m',
  slate:     '\x1b[38;2;51;65;85m',
  gray:      '\x1b[38;2;100;116;139m',
  lightGray: '\x1b[38;2;203;213;225m',
  green:     '\x1b[38;2;34;197;94m',
  yellow:    '\x1b[38;2;250;204;21m',
  red:       '\x1b[38;2;239;68;68m',
  orange:    '\x1b[38;2;251;146;60m',
};

function statusColor(status: string): string {
  switch (status) {
    case 'complete': return C.green;
    case 'partial':  return C.yellow;
    case 'failed':   return C.red;
    default:         return C.orange;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'complete': return 'DONE';
    case 'partial':  return 'IN PROGRESS';
    case 'failed':   return 'FAILED';
    default:         return 'UNKNOWN';
  }
}

function printVisualSummary(summaries: SessionSummary[]): void {
  const w = process.stderr.write.bind(process.stderr);
  const ln = (s: string) => w(s + '\n');

  ln('');
  ln(`${C.slate}┌──────────────────────────────────────────────────────────────────┐${C.reset}`);
  ln(`${C.slate}│${C.reset}  ${C.blue}↻${C.reset}  ${C.lightBlue}${C.bold}Session Recall${C.reset}${C.gray} — Last ${summaries.length} sessions${C.reset}${' '.repeat(Math.max(0, 34 - String(summaries.length).length))}${C.slate}│${C.reset}`);
  ln(`${C.slate}├──────────────────────────────────────────────────────────────────┤${C.reset}`);

  for (let i = 0; i < summaries.length; i++) {
    const s = summaries[i];
    const sc = statusColor(s.completionStatus);
    const sl = statusLabel(s.completionStatus);
    const time = formatRelativeTime(s.modified);

    // Topic line
    const topic = s.firstPrompt.length > 48 ? s.firstPrompt.slice(0, 45) + '...' : s.firstPrompt;
    ln(`${C.slate}│${C.reset}                                                                  ${C.slate}│${C.reset}`);
    ln(`${C.slate}│${C.reset}  ${C.lightBlue}${i + 1}.${C.reset} ${C.bold}${topic}${C.reset}${' '.repeat(Math.max(1, 60 - topic.length - String(i + 1).length))}${C.slate}│${C.reset}`);

    // Status + meta line
    const meta = `${sl}  ${C.gray}${time} · ${s.durationMinutes}m · ${s.messageCount} msgs${C.reset}`;
    const metaPlain = `${sl}  ${time} · ${s.durationMinutes}m · ${s.messageCount} msgs`;
    ln(`${C.slate}│${C.reset}     ${sc}${meta}${' '.repeat(Math.max(1, 59 - metaPlain.length))}${C.slate}│${C.reset}`);

    // Last response preview (truncated)
    if (s.lastAssistantMessage) {
      const preview = s.lastAssistantMessage.replace(/\n/g, ' ').slice(0, 52);
      ln(`${C.slate}│${C.reset}     ${C.dim}${C.gray}${preview}${preview.length >= 52 ? '…' : ''}${C.reset}${' '.repeat(Math.max(1, 59 - Math.min(preview.length, 52) - (preview.length >= 52 ? 1 : 0)))}${C.slate}│${C.reset}`);
    }
  }

  ln(`${C.slate}│${C.reset}                                                                  ${C.slate}│${C.reset}`);
  ln(`${C.slate}└──────────────────────────────────────────────────────────────────┘${C.reset}`);
  ln('');
}

// ============================================================================
// Context Output (stdout — injected as system-reminder)
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

    // Discover recent sessions across all project directories
    // Fetch extra candidates to account for automated sessions being filtered out
    const recentEntries = discoverRecentSessions(currentSessionId, MAX_SESSIONS * 3);

    if (recentEntries.length === 0) {
      console.error('[SessionRecall] No previous sessions found — skipping');
      process.exit(0);
    }

    console.error(`[SessionRecall] Processing ${recentEntries.length} candidates...`);

    // Patterns that indicate automated/hook-spawned sessions (not human-initiated)
    const AUTOMATED_PROMPT_PATTERNS = [
      /^You are analyzing/i,
      /^(Generate|Analyze|Process|Extract)\s+(a|the)\s+/i,
      /^(CONTEXT|<system-reminder|<local-command|<command-name)/i,
      /^(🤖|PAI ALGORITHM|ALGORITHM REQUIRED)/,
      /^\{/,  // JSON payloads
    ];

    // Build summaries, filtering out automated sessions
    const summaries: SessionSummary[] = [];
    for (const entry of recentEntries) {
      if (summaries.length >= MAX_SESSIONS) break;

      const summary = buildSessionSummary(entry);
      if (!summary) continue;

      // Skip automated sessions
      if (AUTOMATED_PROMPT_PATTERNS.some(p => p.test(summary.firstPrompt))) {
        console.error(`[SessionRecall]   SKIP (automated): ${truncate(summary.firstPrompt, 50)}`);
        continue;
      }

      summaries.push(summary);
      console.error(`[SessionRecall]   ${summary.completionStatus}: ${truncate(summary.firstPrompt, 60)}`);
    }

    if (summaries.length === 0) {
      console.error('[SessionRecall] No session data extractable — skipping');
      process.exit(0);
    }

    // Print visual summary to terminal (stderr)
    printVisualSummary(summaries);

    // Output the system-reminder context (stdout)
    console.log(buildOutput(summaries));
    console.error(`[SessionRecall] Injected ${summaries.length} session summaries`);

    process.exit(0);
  } catch (error) {
    console.error(`[SessionRecall] Error: ${error}`);
    process.exit(0); // Always exit 0
  }
}

main();
