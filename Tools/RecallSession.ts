#!/usr/bin/env bun
/**
 * RecallSession - Search and recall session history with narrative timeline
 *
 * Searches sessions-index.json for matching sessions, clusters them by time,
 * extracts meaningful messages, and builds a narrative timeline.
 *
 * Usage:
 *   bun RecallSession.ts <query>           Search sessions by query
 *   bun RecallSession.ts --session <id>    Recall specific session by ID
 *   bun RecallSession.ts --recent [N]      Show N most recent sessions (default: 5)
 *   bun RecallSession.ts --help            Show this help
 *
 * Examples:
 *   bun RecallSession.ts "Poseidon"
 *   bun RecallSession.ts --session abc-123
 *   bun RecallSession.ts --recent 10
 *
 * Output Format:
 *   Session Timeline: <query>
 *   --------------------
 *
 *   CLUSTER: <timeRange>
 *   Sessions: <list of sessionIds>
 *
 *   Timeline:
 *     [timestamp] USER: <message>
 *     [timestamp] ASSISTANT: <response>
 *     ...
 *
 *   Completion Status: <complete|partial|failed>
 *   Evidence: <the text that indicates this>
 */

import { parseArgs } from "util";
import * as fs from "fs";
import * as path from "path";
import { spawn, execSync } from "child_process";

// ============================================================================
// Configuration
// ============================================================================

const CLAUDE_DIR = path.join(process.env.HOME!, ".claude");
const PROJECTS_DIR = path.join(CLAUDE_DIR, "projects", "-root--claude");
const SESSIONS_INDEX = path.join(PROJECTS_DIR, "sessions-index.json");

// Time window for clustering related sessions (10 minutes)
const CLUSTER_WINDOW_MS = 10 * 60 * 1000;

// Message types to include in timeline (skip progress, hooks, etc.)
const MEANINGFUL_TYPES = ["user", "assistant"];

// Patterns indicating completion status
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

interface TimelineMessage {
  timestamp: string;
  role: "USER" | "ASSISTANT";
  content: string;
}

interface SessionCluster {
  timeRange: string;
  startTime: Date;
  endTime: Date;
  sessions: SessionIndexEntry[];
  timeline: TimelineMessage[];
  completionStatus: "complete" | "partial" | "failed" | "unknown";
  completionEvidence: string;
}

// ============================================================================
// Session Index Loading
// ============================================================================

function loadSessionsIndex(): SessionIndex | null {
  if (!fs.existsSync(SESSIONS_INDEX)) {
    console.error(`Sessions index not found: ${SESSIONS_INDEX}`);
    return null;
  }

  try {
    const content = fs.readFileSync(SESSIONS_INDEX, "utf-8");
    return JSON.parse(content) as SessionIndex;
  } catch (error) {
    console.error(`Failed to parse sessions index: ${error}`);
    return null;
  }
}

// ============================================================================
// Session Search
// ============================================================================

function searchSessions(
  index: SessionIndex,
  query: string
): SessionIndexEntry[] {
  const lowerQuery = query.toLowerCase();

  // First pass: Search in index metadata (fast)
  const indexMatches = index.entries.filter((entry) => {
    // Search in firstPrompt
    if (entry.firstPrompt.toLowerCase().includes(lowerQuery)) return true;

    // Search in sessionId
    if (entry.sessionId.toLowerCase().includes(lowerQuery)) return true;

    return false;
  });

  // Second pass: Deep content search in JSONL files (slower but thorough)
  // This catches sessions with "No prompt" or unrelated firstPrompt
  const contentMatches = index.entries.filter((entry) => {
    // Skip if already matched in index
    if (indexMatches.some((m) => m.sessionId === entry.sessionId)) return false;

    try {
      // Read first 100 lines and last 100 lines of session file for efficiency
      const content = execSync(
        `head -100 "${entry.fullPath}" && tail -100 "${entry.fullPath}"`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      ).toLowerCase();

      return content.includes(lowerQuery);
    } catch {
      // File read error, skip this entry
      return false;
    }
  });

  // Merge and deduplicate results
  return [...indexMatches, ...contentMatches];
}

function getRecentSessions(
  index: SessionIndex,
  count: number
): SessionIndexEntry[] {
  return [...index.entries]
    .sort(
      (a, b) =>
        new Date(b.modified).getTime() - new Date(a.modified).getTime()
    )
    .slice(0, count);
}

function getSessionById(
  index: SessionIndex,
  sessionId: string
): SessionIndexEntry | null {
  return (
    index.entries.find(
      (e) => e.sessionId === sessionId || e.sessionId.startsWith(sessionId)
    ) || null
  );
}

// ============================================================================
// Session Clustering
// ============================================================================

function clusterSessions(sessions: SessionIndexEntry[]): SessionCluster[] {
  if (sessions.length === 0) return [];

  // Sort by created time
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  const clusters: SessionCluster[] = [];
  let currentCluster: SessionIndexEntry[] = [sorted[0]];
  let clusterStartTime = new Date(sorted[0].created);

  for (let i = 1; i < sorted.length; i++) {
    const session = sorted[i];
    const sessionTime = new Date(session.created);
    const lastSessionTime = new Date(
      currentCluster[currentCluster.length - 1].modified
    );

    // Check if this session is within the time window of the last session
    if (sessionTime.getTime() - lastSessionTime.getTime() <= CLUSTER_WINDOW_MS) {
      currentCluster.push(session);
    } else {
      // Finalize current cluster and start new one
      clusters.push(
        createClusterShell(currentCluster, clusterStartTime)
      );
      currentCluster = [session];
      clusterStartTime = sessionTime;
    }
  }

  // Don't forget the last cluster
  if (currentCluster.length > 0) {
    clusters.push(createClusterShell(currentCluster, clusterStartTime));
  }

  return clusters;
}

function createClusterShell(
  sessions: SessionIndexEntry[],
  startTime: Date
): SessionCluster {
  const endTime = new Date(sessions[sessions.length - 1].modified);

  return {
    timeRange: formatTimeRange(startTime, endTime),
    startTime,
    endTime,
    sessions,
    timeline: [],
    completionStatus: "unknown",
    completionEvidence: "",
  };
}

function formatTimeRange(start: Date, end: Date): string {
  const dateOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const startStr = start.toLocaleString("en-US", dateOpts);

  // If same day, just show end time
  if (start.toDateString() === end.toDateString()) {
    const timeOpts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    const endStr = end.toLocaleString("en-US", timeOpts);
    return `${startStr} - ${endStr}`;
  }

  const endStr = end.toLocaleString("en-US", dateOpts);
  return `${startStr} - ${endStr}`;
}

// ============================================================================
// JSONL Message Extraction (Streaming for large files)
// ============================================================================

async function extractMessagesFromSession(
  sessionPath: string
): Promise<TimelineMessage[]> {
  const messages: TimelineMessage[] = [];

  // Check file size - if small enough, read directly
  const stats = fs.statSync(sessionPath);
  const MAX_DIRECT_READ = 1024 * 1024; // 1MB threshold

  if (stats.size <= MAX_DIRECT_READ) {
    return extractMessagesDirectly(sessionPath);
  }

  // For larger files, use jq for surgical extraction
  return extractMessagesWithJq(sessionPath);
}

function extractMessagesDirectly(sessionPath: string): TimelineMessage[] {
  const messages: TimelineMessage[] = [];

  try {
    const content = fs.readFileSync(sessionPath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        const message = extractMessageFromEntry(entry);
        if (message) {
          messages.push(message);
        }
      } catch {
        // Skip malformed lines
      }
    }
  } catch (error) {
    console.error(`Error reading session file: ${error}`);
  }

  return messages;
}

async function extractMessagesWithJq(
  sessionPath: string
): Promise<TimelineMessage[]> {
  const messages: TimelineMessage[] = [];

  return new Promise((resolve) => {
    // Use jq to extract only user/assistant messages with relevant fields
    const jqFilter = `select(.type == "user" or .type == "assistant") | {type, timestamp, message}`;

    const jq = spawn("jq", ["-c", jqFilter, sessionPath]);

    let buffer = "";

    jq.stdout.on("data", (data) => {
      buffer += data.toString();

      // Process complete lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const entry = JSON.parse(line);
          const message = extractMessageFromEntry(entry);
          if (message) {
            messages.push(message);
          }
        } catch {
          // Skip malformed
        }
      }
    });

    jq.on("close", () => {
      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const entry = JSON.parse(buffer);
          const message = extractMessageFromEntry(entry);
          if (message) {
            messages.push(message);
          }
        } catch {
          // Skip
        }
      }
      resolve(messages);
    });

    jq.on("error", () => {
      // Fallback to direct read if jq fails
      resolve(extractMessagesDirectly(sessionPath));
    });
  });
}

function extractMessageFromEntry(entry: any): TimelineMessage | null {
  // Only process user/assistant messages
  if (!MEANINGFUL_TYPES.includes(entry.type)) return null;

  // Skip meta/system messages
  if (entry.isMeta) return null;

  const content = extractTextContent(entry.message?.content);

  // Skip empty or very short messages
  if (!content || content.length < 5) return null;

  // Skip system/hook messages
  if (
    content.startsWith("<local-command") ||
    content.startsWith("<command-name>") ||
    content.includes("hook_progress")
  ) {
    return null;
  }

  return {
    timestamp: entry.timestamp || new Date().toISOString(),
    role: entry.type === "user" ? "USER" : "ASSISTANT",
    content: truncateContent(content, 500),
  };
}

function extractTextContent(content: any): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    // Extract text blocks, skip tool_use, thinking, etc.
    const textParts = content
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text);

    return textParts.join("\n");
  }

  return "";
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + "...";
}

// ============================================================================
// Completion Status Detection
// ============================================================================

function detectCompletionStatus(
  messages: TimelineMessage[]
): { status: "complete" | "partial" | "failed" | "unknown"; evidence: string } {
  // Check last few messages for completion indicators
  const lastMessages = messages.slice(-5);

  for (const msg of lastMessages.reverse()) {
    // Check for complete patterns
    for (const pattern of COMPLETION_PATTERNS.complete) {
      const match = msg.content.match(pattern);
      if (match) {
        return {
          status: "complete",
          evidence: extractEvidence(msg.content, match),
        };
      }
    }

    // Check for failed patterns
    for (const pattern of COMPLETION_PATTERNS.failed) {
      const match = msg.content.match(pattern);
      if (match) {
        return {
          status: "failed",
          evidence: extractEvidence(msg.content, match),
        };
      }
    }

    // Check for partial patterns
    for (const pattern of COMPLETION_PATTERNS.partial) {
      const match = msg.content.match(pattern);
      if (match) {
        return {
          status: "partial",
          evidence: extractEvidence(msg.content, match),
        };
      }
    }
  }

  return { status: "unknown", evidence: "No clear completion indicator found" };
}

function extractEvidence(content: string, match: RegExpMatchArray): string {
  // Extract surrounding context around the match
  const matchIndex = match.index || 0;
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(content.length, matchIndex + match[0].length + 50);

  let evidence = content.slice(start, end).trim();

  // Clean up and add ellipsis if truncated
  if (start > 0) evidence = "..." + evidence;
  if (end < content.length) evidence = evidence + "...";

  return evidence.replace(/\n/g, " ");
}

// ============================================================================
// Timeline Building
// ============================================================================

async function buildClusterTimeline(cluster: SessionCluster): Promise<void> {
  const allMessages: TimelineMessage[] = [];

  for (const session of cluster.sessions) {
    const messages = await extractMessagesFromSession(session.fullPath);
    allMessages.push(...messages);
  }

  // Sort by timestamp
  allMessages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  cluster.timeline = allMessages;

  // Detect completion status
  const { status, evidence } = detectCompletionStatus(allMessages);
  cluster.completionStatus = status;
  cluster.completionEvidence = evidence;
}

// ============================================================================
// Output Formatting
// ============================================================================

function formatOutput(query: string, clusters: SessionCluster[]): string {
  const lines: string[] = [];

  lines.push(`Session Timeline: ${query}`);
  lines.push("─".repeat(40));
  lines.push("");

  if (clusters.length === 0) {
    lines.push("No matching sessions found.");
    return lines.join("\n");
  }

  for (const cluster of clusters) {
    lines.push(`CLUSTER: ${cluster.timeRange}`);
    lines.push(
      `Sessions: ${cluster.sessions.map((s) => s.sessionId.slice(0, 8)).join(", ")}`
    );
    lines.push("");

    if (cluster.timeline.length > 0) {
      lines.push("Timeline:");

      for (const msg of cluster.timeline) {
        const time = formatTimestamp(msg.timestamp);
        const prefix = `  [${time}] ${msg.role}:`;
        const content = msg.content.replace(/\n/g, "\n    ");
        lines.push(`${prefix} ${content}`);
        lines.push("");
      }
    } else {
      lines.push("  (No extractable messages)");
      lines.push("");
    }

    lines.push(`Completion Status: ${cluster.completionStatus}`);
    lines.push(`Evidence: ${cluster.completionEvidence}`);
    lines.push("");
    lines.push("─".repeat(40));
    lines.push("");
  }

  return lines.join("\n");
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ============================================================================
// CLI
// ============================================================================

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    session: { type: "string", short: "s" },
    recent: { type: "string", short: "r" },
    help: { type: "boolean", short: "h" },
    json: { type: "boolean", short: "j" },
  },
  allowPositionals: true,
});

async function main() {
  if (values.help) {
    console.log(`
RecallSession - Search and recall session history with narrative timeline

Usage:
  bun RecallSession.ts <query>           Search sessions by query
  bun RecallSession.ts --session <id>    Recall specific session by ID
  bun RecallSession.ts --recent [N]      Show N most recent sessions (default: 5)
  bun RecallSession.ts --json            Output as JSON
  bun RecallSession.ts --help            Show this help

Examples:
  bun RecallSession.ts "Poseidon"
  bun RecallSession.ts --session abc-123
  bun RecallSession.ts --recent 10
`);
    process.exit(0);
  }

  // Load sessions index
  const index = loadSessionsIndex();
  if (!index) {
    process.exit(1);
  }

  let sessions: SessionIndexEntry[] = [];
  let queryDescription: string;

  if (values.session) {
    // Specific session lookup
    const session = getSessionById(index, values.session);
    if (session) {
      sessions = [session];
      queryDescription = `Session ${values.session.slice(0, 8)}`;
    } else {
      console.error(`Session not found: ${values.session}`);
      process.exit(1);
    }
  } else if (values.recent !== undefined) {
    // Recent sessions
    const count = values.recent ? parseInt(values.recent) : 5;
    sessions = getRecentSessions(index, count);
    queryDescription = `${count} most recent sessions`;
  } else if (positionals.length > 0) {
    // Search by query
    const query = positionals.join(" ");
    sessions = searchSessions(index, query);
    queryDescription = query;
  } else {
    console.error("Please provide a search query or use --session/--recent");
    console.error("Use --help for usage information");
    process.exit(1);
  }

  if (sessions.length === 0) {
    console.log(`No sessions found matching: ${queryDescription}`);
    process.exit(0);
  }

  // Cluster sessions
  const clusters = clusterSessions(sessions);

  // Build timelines for each cluster
  for (const cluster of clusters) {
    await buildClusterTimeline(cluster);
  }

  // Output
  if (values.json) {
    console.log(JSON.stringify(clusters, null, 2));
  } else {
    console.log(formatOutput(queryDescription, clusters));
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
