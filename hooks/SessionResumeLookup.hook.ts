#!/usr/bin/env bun
/**
 * SessionResumeLookup.hook.ts - Detect Resume Intent & Inject Matching Sessions (UserPromptSubmit)
 *
 * PURPOSE:
 * When a user's prompt expresses intent to resume a previous session, this hook
 * fuzzy-matches the description against session-tracker.json and injects matching
 * sessions as context. PAI can then present the resume command directly.
 *
 * TRIGGER: UserPromptSubmit
 *
 * INPUT:
 * - stdin: Hook input JSON (session_id, prompt/user_prompt)
 *
 * OUTPUT:
 * - stdout: <system-reminder> with matching sessions (if resume intent detected)
 * - stderr: Status messages
 * - exit(0): Always
 *
 * DETECTION PATTERNS:
 * - "resume the X work"
 * - "pick up where I left off on X"
 * - "continue working on X"
 * - "get back to X"
 * - "go back to the X session"
 *
 * SIDE EFFECTS: None (read-only)
 *
 * PERFORMANCE:
 * - Non-resume prompts: <5ms (keyword check only)
 * - Resume prompts: <20ms (JSON read + fuzzy match)
 * - Skipped for subagents: Yes
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
const MAX_RESULTS = 5;

// Resume intent patterns — order matters (more specific first)
const RESUME_PATTERNS: RegExp[] = [
  /^(?:i\s+want\s+to\s+)?resume\s+(?:working\s+on\s+)?(?:the\s+)?(.+?)(?:\s+session|\s+work)?$/i,
  /^(?:pick\s+up|continue)\s+(?:where\s+i\s+left\s+off\s+(?:on|with)\s+)?(?:the\s+)?(.+?)(?:\s+session|\s+work)?$/i,
  /^(?:get|go)\s+back\s+to\s+(?:the\s+)?(.+?)(?:\s+session|\s+work)?$/i,
  /^(?:can\s+you\s+)?(?:find|look\s*up|search\s+for)\s+(?:the\s+)?(?:session\s+(?:about|for|where|on)\s+)?(.+?)(?:\s+session)?$/i,
  /^(?:i\s+was\s+working\s+on|what\s+session\s+(?:was|had))\s+(.+)$/i,
  /^resume\s+(.+)$/i,
];

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

function detectResumeIntent(prompt: string): string | null {
  const trimmed = prompt.trim();
  for (const pattern of RESUME_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function fuzzyScore(text: string, query: string): number {
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) return 0;

  let score = 0;
  for (const term of terms) {
    if (lower.includes(term)) {
      score += 1;
      // Bonus for exact word boundary match
      const wordBoundary = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (wordBoundary.test(text)) {
        score += 0.5;
      }
    }
  }
  return score / terms.length; // Normalize to 0-1.5 range
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
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
  } catch {
    return;
  }

  const promptText = (input.prompt || input.user_prompt || '').trim();
  if (!promptText) return;

  // Check for resume intent
  const searchQuery = detectResumeIntent(promptText);
  if (!searchQuery) return;

  console.error(`[SessionResumeLookup] Detected resume intent, searching: "${searchQuery}"`);

  // Load tracker
  if (!existsSync(TRACKER_FILE)) {
    console.error('[SessionResumeLookup] No tracker file found');
    return;
  }

  let tracker: SessionTracker;
  try {
    tracker = JSON.parse(readFileSync(TRACKER_FILE, 'utf-8'));
  } catch {
    console.error('[SessionResumeLookup] Failed to parse tracker');
    return;
  }

  if (tracker.sessions.length === 0) {
    console.error('[SessionResumeLookup] No sessions in tracker');
    return;
  }

  // Score each session
  const scored = tracker.sessions
    .map(s => ({
      session: s,
      score: Math.max(
        fuzzyScore(s.description, searchQuery),
        fuzzyScore(s.first_prompt, searchQuery) * 0.8 // Slight penalty for prompt-only matches
      ),
    }))
    .filter(s => s.score > 0.3) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  if (scored.length === 0) {
    // Output a hint that no sessions matched
    console.log(`<system-reminder>
SESSION RESUME LOOKUP — No matching sessions found for "${searchQuery}" in session-tracker.json.
The user wants to resume a previous session. You can suggest they check with:
  bun ~/.claude/skills/PAI/Tools/SessionLookup.ts --all
Or they may need to describe the session differently.
</system-reminder>`);
    console.error(`[SessionResumeLookup] No matches for "${searchQuery}"`);
    return;
  }

  // Build context injection
  const lines: string[] = [
    '<system-reminder>',
    `SESSION RESUME LOOKUP — Found ${scored.length} matching session(s) for "${searchQuery}":`,
    '',
  ];

  for (const { session: s, score } of scored) {
    const status = s.status === 'active' ? '🟢 ACTIVE' : '⚪ completed';
    const date = formatDate(s.started_at);
    const msgs = s.message_count > 0 ? ` | ${s.message_count} msgs` : '';
    lines.push(`  ${status} | ${s.description || s.first_prompt}`);
    lines.push(`    Started: ${date}${msgs}`);
    lines.push(`    Resume:  claude -r ${s.session_id}`);
    lines.push('');
  }

  lines.push('INSTRUCTION: Present these matches to the user. If there\'s one clear match, recommend it directly with the resume command. If multiple, present as options. Remind the user to exit this session first, then run the `claude -r` command.');
  lines.push('</system-reminder>');

  console.log(lines.join('\n'));
  console.error(`[SessionResumeLookup] Injected ${scored.length} match(es)`);
}

main().catch(() => {
  process.exit(0);
});
