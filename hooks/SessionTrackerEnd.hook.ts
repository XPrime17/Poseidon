#!/usr/bin/env bun
/**
 * SessionTrackerEnd.hook.ts - Finalize Session + Sync to Google Sheet (SessionEnd)
 *
 * PURPOSE:
 * Marks the session as completed in session-tracker.json, computes duration,
 * reads message count from sessions-index.json, and fires an n8n webhook
 * to sync the completed session to the Google Sheet.
 *
 * TRIGGER: SessionEnd
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
 * - Updates: ~/.claude/session-tracker.json (status, ended_at, duration, message_count)
 * - HTTP POST: n8n webhook to sync session to Google Sheet (fire-and-forget)
 *
 * INTER-HOOK RELATIONSHIPS:
 * - DEPENDS ON: SessionTracker (session entry must exist)
 * - COORDINATES WITH: SessionTrackerDescribe (description should be set by now)
 * - MUST RUN AFTER: WorkCompletionLearning, SessionSummary (learning/cleanup first)
 *
 * PERFORMANCE:
 * - Typical execution: <200ms (file I/O + async HTTP)
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

interface SessionIndexEntry {
  sessionId: string;
  messageCount?: number;
}

// ============================================================================
// Configuration
// ============================================================================

const CLAUDE_DIR = process.env.PAI_DIR || join(process.env.HOME!, '.claude');
const TRACKER_FILE = join(CLAUDE_DIR, 'session-tracker.json');
const SESSIONS_INDEX = join(CLAUDE_DIR, 'projects', '-root', 'sessions-index.json');

// n8n webhook URL — will be set after workflow creation
const N8N_WEBHOOK_URL = 'https://xprime17.app.n8n.cloud/webhook/session-tracker-sync';

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
    console.error('[SessionTrackerEnd] Failed to read tracker:', err);
  }
  return { version: 1, sessions: [] };
}

function saveTracker(tracker: SessionTracker): void {
  const tmpFile = TRACKER_FILE + '.tmp';
  writeFileSync(tmpFile, JSON.stringify(tracker, null, 2), 'utf-8');
  renameSync(tmpFile, TRACKER_FILE);
}

function getMessageCount(sessionId: string): number {
  try {
    if (!existsSync(SESSIONS_INDEX)) return 0;
    const raw = readFileSync(SESSIONS_INDEX, 'utf-8');
    const index = JSON.parse(raw);
    const entries: SessionIndexEntry[] = index.entries || index;
    const entry = entries.find((e: SessionIndexEntry) => e.sessionId === sessionId);
    return entry?.messageCount || 0;
  } catch {
    return 0;
  }
}

function computeDurationMinutes(startedAt: string, endedAt: string): number {
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(endedAt).getTime();
  return Math.round((endMs - startMs) / (1000 * 60));
}

async function syncToSheet(session: TrackedSession): Promise<boolean> {
  try {
    const durationMinutes = session.ended_at
      ? computeDurationMinutes(session.started_at, session.ended_at)
      : 0;

    const payload = {
      session_id: session.session_id,
      description: session.description || '(no description)',
      first_prompt: session.first_prompt || '',
      started_at: session.started_at,
      ended_at: session.ended_at || '',
      status: session.status,
      message_count: session.message_count,
      duration_minutes: durationMinutes,
      resume_command: `claude -r ${session.session_id}`,
    };

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      console.error(`[SessionTrackerEnd] Synced to Sheet: ${session.session_id.substring(0, 8)}`);
      return true;
    } else {
      console.error(`[SessionTrackerEnd] Sheet sync failed: ${res.status}`);
      return false;
    }
  } catch (err) {
    console.error(`[SessionTrackerEnd] Sheet sync error:`, err);
    return false;
  }
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
    console.error('[SessionTrackerEnd] Failed to read stdin:', err);
    return;
  }

  if (!input.session_id) {
    console.error('[SessionTrackerEnd] No session_id in input');
    return;
  }

  const tracker = loadTracker();
  const session = tracker.sessions.find(s => s.session_id === input.session_id);

  if (!session) {
    console.error(`[SessionTrackerEnd] Session ${input.session_id.substring(0, 8)} not found in tracker`);
    return;
  }

  // Finalize session
  const now = getISOTimestamp();
  session.ended_at = now;
  session.status = 'completed';
  session.message_count = getMessageCount(input.session_id);

  // Sync to Google Sheet (fire-and-forget but capture result)
  const synced = await syncToSheet(session);
  session.synced = synced;

  saveTracker(tracker);
  console.error(`[SessionTrackerEnd] Session ${input.session_id.substring(0, 8)} completed (${session.message_count} messages)`);
}

main().catch((err) => {
  console.error('[SessionTrackerEnd] Fatal:', err);
  process.exit(0); // Always exit clean
});
