#!/usr/bin/env bun
/**
 * SessionTracker.hook.ts - Track Session IDs to Local JSON (SessionStart)
 *
 * PURPOSE:
 * Creates an entry in session-tracker.json for every new Claude Code session.
 * Marks stale active sessions as completed (safety net for missed SessionEnd).
 *
 * TRIGGER: SessionStart
 *
 * INPUT:
 * - stdin: Hook input JSON (session_id, transcript_path)
 *
 * OUTPUT:
 * - stdout: None
 * - stderr: Status messages
 * - exit(0): Always
 *
 * SIDE EFFECTS:
 * - Creates/updates: ~/.claude/session-tracker.json
 *
 * INTER-HOOK RELATIONSHIPS:
 * - DEPENDS ON: None
 * - COORDINATES WITH: SessionTrackerDescribe (populates description)
 * - COORDINATES WITH: SessionTrackerEnd (marks completed, syncs to Sheet)
 *
 * PERFORMANCE:
 * - Non-blocking: Yes (file I/O only)
 * - Typical execution: <50ms
 * - Skipped for subagents: Yes
 */

import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { join } from 'path';
import { getISOTimestamp } from './lib/time';

// ============================================================================
// Types
// ============================================================================

interface HookInput {
  session_id: string;
  transcript_path?: string;
  hook_event_name?: string;
}

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
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Helpers
// ============================================================================

function readStdinWithTimeout(timeout: number = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
    process.stdin.on('data', (chunk) => { data += chunk.toString(); });
    process.stdin.on('end', () => { clearTimeout(timer); resolve(data); });
    process.stdin.on('error', (err) => { clearTimeout(timer); reject(err); });
  });
}

function loadTracker(): SessionTracker {
  try {
    if (existsSync(TRACKER_FILE)) {
      return JSON.parse(readFileSync(TRACKER_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('[SessionTracker] Failed to read tracker file:', err);
  }
  return { version: 1, sessions: [] };
}

function saveTracker(tracker: SessionTracker): void {
  const tmpFile = TRACKER_FILE + '.tmp';
  writeFileSync(tmpFile, JSON.stringify(tracker, null, 2), 'utf-8');
  renameSync(tmpFile, TRACKER_FILE);
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  // Skip for subagents
  if (process.env.CLAUDE_AGENT_TYPE) {
    return;
  }

  let input: HookInput;
  try {
    const raw = await readStdinWithTimeout();
    input = JSON.parse(raw);
  } catch (err) {
    console.error('[SessionTracker] Failed to read stdin:', err);
    return;
  }

  if (!input.session_id) {
    console.error('[SessionTracker] No session_id in input');
    return;
  }

  const tracker = loadTracker();
  const now = getISOTimestamp();

  // Mark stale active sessions as completed (safety net)
  const nowMs = Date.now();
  for (const session of tracker.sessions) {
    if (session.status === 'active') {
      const startedMs = new Date(session.started_at).getTime();
      if (nowMs - startedMs > STALE_THRESHOLD_MS) {
        session.status = 'completed';
        session.ended_at = session.ended_at || now;
        console.error(`[SessionTracker] Marked stale session ${session.session_id.substring(0, 8)} as completed`);
      }
    }
  }

  // Check for duplicate (resuming existing session)
  const existing = tracker.sessions.find(s => s.session_id === input.session_id);
  if (existing) {
    // Resuming — just mark active again
    existing.status = 'active';
    existing.ended_at = null;
    console.error(`[SessionTracker] Resumed session ${input.session_id.substring(0, 8)}`);
  } else {
    // New session
    tracker.sessions.push({
      session_id: input.session_id,
      description: '',
      first_prompt: '',
      started_at: now,
      ended_at: null,
      status: 'active',
      message_count: 0,
      synced: false,
    });
    console.error(`[SessionTracker] Tracking new session ${input.session_id.substring(0, 8)}`);
  }

  saveTracker(tracker);
}

main().catch((err) => {
  console.error('[SessionTracker] Fatal:', err);
  process.exit(0); // Always exit clean
});
