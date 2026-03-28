#!/usr/bin/env bun
/**
 * SessionTrackerDescribe.hook.ts - Auto-Generate Session Description (UserPromptSubmit)
 *
 * PURPOSE:
 * On the first user prompt in a session, generates a concise 5-10 word description
 * using Haiku inference and stores it in session-tracker.json. Short-circuits
 * immediately on subsequent prompts (only fires once per session).
 *
 * TRIGGER: UserPromptSubmit
 *
 * INPUT:
 * - stdin: Hook input JSON (session_id, prompt/user_prompt)
 *
 * OUTPUT:
 * - stdout: None
 * - stderr: Status messages
 * - exit(0): Always
 *
 * SIDE EFFECTS:
 * - Updates: ~/.claude/session-tracker.json (description, first_prompt)
 * - AI inference: Haiku call (~1-2s) on first prompt only
 *
 * INTER-HOOK RELATIONSHIPS:
 * - DEPENDS ON: SessionTracker (session entry must exist in tracker)
 * - COORDINATES WITH: SessionTrackerEnd (description used in Sheet sync)
 *
 * PERFORMANCE:
 * - First prompt: ~1-2s (Haiku inference)
 * - Subsequent prompts: <5ms (short-circuit)
 * - Skipped for subagents: Yes
 */

import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { join } from 'path';
import { inference } from '../skills/PAI/Tools/Inference';

// ============================================================================
// Types
// ============================================================================

interface HookInput {
  session_id: string;
  prompt?: string;
  user_prompt?: string;
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
const MAX_FIRST_PROMPT_LENGTH = 200;

const DESCRIPTION_SYSTEM_PROMPT = `Generate a concise 5-10 word description of a Claude Code work session based on the user's first message. The description should capture the main intent/task.

Rules:
- 5-10 words maximum
- Use imperative form (e.g., "Fix retry scheduler attempt cap")
- Be specific about what is being worked on
- Do not include filler words
- Output ONLY the description, nothing else

Examples:
- "Fix retry scheduler attempt cap"
- "Design session tracking feature"
- "Update EG inbound agent prompt"
- "Create n8n webhook workflow"
- "Debug voicemail detection logic"
- "Research Spanish voice AI options"
- "Build TourForce portal authentication"`;

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
    console.error('[SessionTrackerDescribe] Failed to read tracker:', err);
  }
  return { version: 1, sessions: [] };
}

function saveTracker(tracker: SessionTracker): void {
  const tmpFile = TRACKER_FILE + '.tmp';
  writeFileSync(tmpFile, JSON.stringify(tracker, null, 2), 'utf-8');
  renameSync(tmpFile, TRACKER_FILE);
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
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
    console.error('[SessionTrackerDescribe] Failed to read stdin:', err);
    return;
  }

  if (!input.session_id) {
    console.error('[SessionTrackerDescribe] No session_id in input');
    return;
  }

  const tracker = loadTracker();
  const session = tracker.sessions.find(s => s.session_id === input.session_id);

  if (!session) {
    console.error(`[SessionTrackerDescribe] Session ${input.session_id.substring(0, 8)} not in tracker`);
    return;
  }

  // Short-circuit: description already set
  if (session.description) {
    return;
  }

  const promptText = input.prompt || input.user_prompt || '';
  if (!promptText.trim()) {
    return;
  }

  // Set first_prompt
  session.first_prompt = truncate(promptText.trim(), MAX_FIRST_PROMPT_LENGTH);

  // Generate description via Haiku inference
  try {
    const result = await inference({
      systemPrompt: DESCRIPTION_SYSTEM_PROMPT,
      userPrompt: promptText.substring(0, 500), // Limit input size
      level: 'fast',
      timeout: 10000,
    });

    if (result.success && result.output.trim()) {
      // Clean up: remove quotes, trailing periods, extra whitespace
      let desc = result.output.trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\.$/, '')
        .trim();

      // Validate: reasonable length
      if (desc.length >= 5 && desc.length <= 80) {
        session.description = desc;
        console.error(`[SessionTrackerDescribe] Description: "${desc}"`);
      } else {
        session.description = truncate(promptText.trim(), 60);
        console.error(`[SessionTrackerDescribe] Inference result invalid length, using truncated prompt`);
      }
    } else {
      session.description = truncate(promptText.trim(), 60);
      console.error(`[SessionTrackerDescribe] Inference failed, using truncated prompt`);
    }
  } catch (err) {
    session.description = truncate(promptText.trim(), 60);
    console.error(`[SessionTrackerDescribe] Inference error, using truncated prompt:`, err);
  }

  saveTracker(tracker);
}

main().catch((err) => {
  console.error('[SessionTrackerDescribe] Fatal:', err);
  process.exit(0); // Always exit clean
});
