#!/usr/bin/env bun
/**
 * SessionLookup.ts - Search and list tracked Claude Code sessions
 *
 * PURPOSE:
 * Reads session-tracker.json and displays sessions in a formatted table
 * with resume commands ready to copy-paste.
 *
 * USAGE:
 *   bun SessionLookup.ts                  # Last 10 sessions
 *   bun SessionLookup.ts "retry bug"      # Fuzzy search description + first_prompt
 *   bun SessionLookup.ts --recent 20      # Last 20 sessions
 *   bun SessionLookup.ts --active         # Only active sessions
 *   bun SessionLookup.ts --all            # All sessions (no limit)
 *   bun SessionLookup.ts --help           # Show help
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseArgs } from 'util';

// ============================================================================
// Types
// ============================================================================

interface TrackedSession {
  session_id: string;
  description: string;
  first_prompt: string;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'completed';
  message_count: number;
  synced: boolean;
}

interface SessionTracker {
  version: number;
  sessions: TrackedSession[];
}

// ============================================================================
// Configuration
// ============================================================================

const CLAUDE_DIR = process.env.PAI_DIR || join(process.env.HOME!, '.claude');
const TRACKER_FILE = join(CLAUDE_DIR, 'session-tracker.json');
const DEFAULT_LIMIT = 10;

// ============================================================================
// Helpers
// ============================================================================

function loadTracker(): SessionTracker {
  if (!existsSync(TRACKER_FILE)) {
    console.error(`No session tracker found at ${TRACKER_FILE}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(TRACKER_FILE, 'utf-8'));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${h12}:${minutes}${ampm}`;
}

function shortId(id: string): string {
  return id.substring(0, 8);
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/);
  return terms.every(term => lower.includes(term));
}

function pad(text: string, len: number): string {
  if (text.length >= len) return text.substring(0, len);
  return text + ' '.repeat(len - text.length);
}

// ============================================================================
// Display
// ============================================================================

function displaySessions(sessions: TrackedSession[]): void {
  if (sessions.length === 0) {
    console.log('No sessions found.');
    return;
  }

  // ANSI colors
  const DIM = '\x1b[2m';
  const BOLD = '\x1b[1m';
  const GREEN = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const CYAN = '\x1b[36m';
  const RESET = '\x1b[0m';

  // Header
  console.log('');
  console.log(`${BOLD} #   ID         Description                          Started            Status     Msgs${RESET}`);
  console.log(`${DIM}${'─'.repeat(95)}${RESET}`);

  // Rows
  sessions.forEach((s, i) => {
    const num = String(i + 1).padStart(2, ' ');
    const id = shortId(s.session_id);
    const desc = pad(truncate(s.description || s.first_prompt || '(no description)', 36), 36);
    const started = pad(formatDate(s.started_at), 18);
    const statusColor = s.status === 'active' ? GREEN : DIM;
    const status = pad(s.status, 10);
    const msgs = String(s.message_count).padStart(4, ' ');

    console.log(` ${num}  ${CYAN}${id}${RESET}   ${desc} ${started} ${statusColor}${status}${RESET} ${msgs}`);
  });

  console.log('');
  console.log(`${DIM}Resume a session:${RESET}`);

  // Show resume commands for the most relevant sessions (first 3)
  const toShow = sessions.slice(0, 3);
  toShow.forEach((s) => {
    const label = truncate(s.description || s.first_prompt || shortId(s.session_id), 30);
    console.log(`  ${YELLOW}claude -r ${s.session_id}${RESET}  ${DIM}# ${label}${RESET}`);
  });

  if (sessions.length > 3) {
    console.log(`  ${DIM}... and ${sessions.length - 3} more (use full session_id from ID column)${RESET}`);
  }
  console.log('');
}

function showHelp(): void {
  console.log(`
SessionLookup - Search and list tracked Claude Code sessions

USAGE:
  bun SessionLookup.ts                  # Last 10 sessions
  bun SessionLookup.ts "retry bug"      # Search by description/prompt
  bun SessionLookup.ts --recent 20      # Last 20 sessions
  bun SessionLookup.ts --active         # Only active sessions
  bun SessionLookup.ts --all            # All sessions (no limit)
  bun SessionLookup.ts --id abc123      # Find by session ID prefix
  bun SessionLookup.ts --help           # This help

OUTPUT:
  Formatted table with session details and ready-to-use resume commands.
`);
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      recent: { type: 'string', short: 'r' },
      active: { type: 'boolean', short: 'a' },
      all: { type: 'boolean' },
      id: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  if (values.help) {
    showHelp();
    return;
  }

  const tracker = loadTracker();
  let sessions = [...tracker.sessions];

  // Sort by started_at descending (most recent first)
  sessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  // Filter by ID prefix
  if (values.id) {
    const idPrefix = values.id.toLowerCase();
    sessions = sessions.filter(s => s.session_id.toLowerCase().startsWith(idPrefix));
  }

  // Filter by active status
  if (values.active) {
    sessions = sessions.filter(s => s.status === 'active');
  }

  // Fuzzy search by description/first_prompt
  const searchQuery = positionals.join(' ').trim();
  if (searchQuery) {
    sessions = sessions.filter(s =>
      fuzzyMatch(s.description + ' ' + s.first_prompt, searchQuery)
    );
  }

  // Apply limit
  if (!values.all) {
    const limit = values.recent ? parseInt(values.recent, 10) : DEFAULT_LIMIT;
    sessions = sessions.slice(0, limit);
  }

  displaySessions(sessions);
}

main();
