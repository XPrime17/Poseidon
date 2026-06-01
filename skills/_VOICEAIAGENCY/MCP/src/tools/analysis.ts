import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";
import { z } from "zod";
import { handler } from "../utils.js";

const AnalyzeTranscriptsSchema = z.object({
  agent_id: z.string().describe("The Retell agent ID to analyze calls for."),
  num_calls: z.number().optional().describe("Number of recent calls to analyze (default 10, max 50)."),
});

// ────────────────────────────────────────────────────────────────
// Voice Agent Best Practices Checklist
// Derived from GPT 4.1 voice agent prompt engineering framework
// ────────────────────────────────────────────────────────────────

interface Issue {
  category: string;
  rule: string;
  severity: "critical" | "warning" | "info";
  evidence: string;
  call_id: string;
  suggestion: string;
}

interface TranscriptUtterance {
  role: string;
  content: string;
  words?: Array<{ word: string; start: number; end: number }>;
}

function analyzeTranscript(
  callId: string,
  transcript: string,
  utterances: TranscriptUtterance[] | null
): Issue[] {
  const issues: Issue[] = [];
  const agentLines = utterances
    ? utterances.filter((u) => u.role === "agent").map((u) => u.content)
    : extractAgentLines(transcript);
  const userLines = utterances
    ? utterances.filter((u) => u.role === "user").map((u) => u.content)
    : extractUserLines(transcript);

  // ── 1. MULTIPLE QUESTIONS IN ONE TURN ─────────────────────
  for (const line of agentLines) {
    const questionMarks = (line.match(/\?/g) || []).length;
    if (questionMarks >= 2) {
      issues.push({
        category: "Communication Flow",
        rule: "Ask only one question at a time",
        severity: "critical",
        evidence: truncate(line, 200),
        call_id: callId,
        suggestion:
          "Split into separate turns. Ask one question, wait for response, then ask the next.",
      });
    }
  }

  // ── 2. BUNDLED REQUESTS ───────────────────────────────────
  const bundlePatterns = [
    /(?:email|phone|number|address|name).+(?:and|&).+(?:email|phone|number|address|name)/i,
    /what(?:'s| is) your .+ and .+\?/i,
    /can you (?:give|provide|share) (?:me )?your .+ and .+/i,
  ];
  for (const line of agentLines) {
    for (const pattern of bundlePatterns) {
      if (pattern.test(line)) {
        issues.push({
          category: "Communication Flow",
          rule: "Never bundle multiple requests",
          severity: "critical",
          evidence: truncate(line, 200),
          call_id: callId,
          suggestion:
            'Ask for each piece of information separately. E.g., "What\'s your email?" then wait, then "And your phone number?"',
        });
        break;
      }
    }
  }

  // ── 3. REPEATED ENTHUSIASTIC RESPONSES ────────────────────
  const enthusiasticWords = [
    "great",
    "perfect",
    "awesome",
    "wonderful",
    "fantastic",
    "excellent",
    "amazing",
    "sounds good",
  ];
  const recentEnthusiastic: string[] = [];
  for (const line of agentLines) {
    const lower = line.toLowerCase();
    for (const word of enthusiasticWords) {
      if (lower.includes(word)) {
        if (recentEnthusiastic.length >= 2 && recentEnthusiastic.includes(word)) {
          issues.push({
            category: "Communication Flow",
            rule: "Vary enthusiastic responses - avoid repetition",
            severity: "warning",
            evidence: `Repeated "${word}" - used ${recentEnthusiastic.filter((w) => w === word).length + 1} times in recent exchanges`,
            call_id: callId,
            suggestion:
              'Rotate between "Great!", "Sounds good", "Perfect", "Got it", etc.',
          });
        }
        recentEnthusiastic.push(word);
        if (recentEnthusiastic.length > 6) recentEnthusiastic.shift();
        break;
      }
    }
  }

  // ── 4. EM DASH USAGE ──────────────────────────────────────
  for (const line of agentLines) {
    if (line.includes("\u2014") || line.includes("\u2013")) {
      issues.push({
        category: "Technical Precision",
        rule: 'Never use em dash (\u2014), always use hyphen (-)',
        severity: "warning",
        evidence: truncate(line, 200),
        call_id: callId,
        suggestion: "Replace all em dashes (\u2014) and en dashes (\u2013) with regular hyphens (-).",
      });
    }
  }

  // ── 5. SYMBOLS NOT WRITTEN AS WORDS ───────────────────────
  const symbolPatterns = [
    { pattern: /\$\d+/g, name: "dollar sign", fix: 'Write out as "X dollars"' },
    { pattern: /\d+%/g, name: "percent symbol", fix: 'Write out as "X percent"' },
    { pattern: /[^\w.+\-]@[^\w]/g, name: "@ symbol", fix: 'Write out as "at"' },
    { pattern: /\d+:\d{2}\s*(?:am|pm|AM|PM)/g, name: "colon in time", fix: 'Write as "one pm" not "1:00 PM"' },
  ];
  for (const line of agentLines) {
    for (const { pattern, name, fix } of symbolPatterns) {
      if (pattern.test(line)) {
        issues.push({
          category: "Technical Precision",
          rule: `Write out symbols as words: ${name}`,
          severity: "warning",
          evidence: truncate(line, 200),
          call_id: callId,
          suggestion: fix,
        });
      }
      pattern.lastIndex = 0; // reset regex
    }
  }

  // ── 6. ASKING FOR SAME DATA TWICE ────────────────────────
  const dataRequests = new Map<string, number>();
  const dataPatterns = [
    { pattern: /(?:what(?:'s| is)) your (?:first |last )?name/i, key: "name" },
    { pattern: /(?:what(?:'s| is)) your (?:email|e-mail)/i, key: "email" },
    { pattern: /(?:what(?:'s| is)) your (?:phone|number|cell)/i, key: "phone" },
    { pattern: /(?:what(?:'s| is)) your (?:address|zip|postal)/i, key: "address" },
  ];
  for (const line of agentLines) {
    for (const { pattern, key } of dataPatterns) {
      if (pattern.test(line)) {
        const count = (dataRequests.get(key) ?? 0) + 1;
        dataRequests.set(key, count);
        if (count > 1) {
          issues.push({
            category: "Call Management",
            rule: "Track information provided - never ask for same data twice",
            severity: "critical",
            evidence: `Asked for "${key}" ${count} times`,
            call_id: callId,
            suggestion:
              "Store provided information and reference it. Never re-ask for data already given.",
          });
        }
      }
    }
  }

  // ── 7. TOO MANY OPTIONS OFFERED ───────────────────────────
  for (const line of agentLines) {
    // Count numbered options or "or" separated items
    const orCount = (line.match(/\bor\b/gi) || []).length;
    const numberedOptions = line.match(/(?:^|\s)(?:1\)|2\)|3\)|4\)|first|second|third|fourth)/gi);
    if (orCount >= 3 || (numberedOptions && numberedOptions.length >= 4)) {
      issues.push({
        category: "Call Management",
        rule: "Limit choices to 3 options maximum",
        severity: "warning",
        evidence: truncate(line, 200),
        call_id: callId,
        suggestion:
          "Present at most 3 options. If more exist, offer the top 3 and ask if they'd like other options.",
      });
    }
  }

  // ── 8. LONG AGENT RESPONSES ───────────────────────────────
  for (const line of agentLines) {
    const wordCount = line.split(/\s+/).length;
    if (wordCount > 80) {
      issues.push({
        category: "Communication Flow",
        rule: "Keep interactions brief with short sentences",
        severity: "warning",
        evidence: `Agent response was ${wordCount} words: "${truncate(line, 150)}"`,
        call_id: callId,
        suggestion:
          "Break long responses into shorter segments. Aim for 1-3 sentences per turn.",
      });
    }
  }

  // ── 9. NO FILLER WORDS USED ───────────────────────────────
  const fillerWords = ["umm", "um", "uh", "so,", "well,", "hmm", "let me see"];
  let fillerCount = 0;
  for (const line of agentLines) {
    const lower = line.toLowerCase();
    for (const filler of fillerWords) {
      if (lower.includes(filler)) {
        fillerCount++;
        break;
      }
    }
  }
  if (agentLines.length > 4 && fillerCount === 0) {
    issues.push({
      category: "Communication Flow",
      rule: "Use natural filler words for human-like conversation",
      severity: "info",
      evidence: `0 filler words detected across ${agentLines.length} agent turns`,
      call_id: callId,
      suggestion:
        'Add natural fillers like "umm", "so" - minimum one every two sentences for natural flow.',
    });
  }

  // ── 10. REPEATED TIMEZONE MENTIONS ────────────────────────
  const timezonePatterns = /(?:eastern|pacific|central|mountain|ET|PT|CT|MT|EST|PST|CST|MST|EDT|PDT|CDT|MDT)\s*(?:time|timezone|standard|daylight)?/gi;
  let tzMentions = 0;
  for (const line of agentLines) {
    const matches = line.match(timezonePatterns);
    if (matches) tzMentions += matches.length;
  }
  if (tzMentions > 2) {
    issues.push({
      category: "Technical Precision",
      rule: "State timezone once, don't repeat throughout call",
      severity: "warning",
      evidence: `Timezone mentioned ${tzMentions} times across the call`,
      call_id: callId,
      suggestion: "State the timezone once at the beginning and don't repeat it.",
    });
  }

  // ── 11. MISSING UH-HUH FOR UNFINISHED MESSAGES ───────────
  if (utterances) {
    for (let i = 0; i < utterances.length - 1; i++) {
      const curr = utterances[i];
      const next = utterances[i + 1];
      // Two user messages in a row (indicates broken/unfinished message)
      if (
        curr.role === "user" &&
        next.role === "user" &&
        i + 2 < utterances.length &&
        utterances[i + 2].role === "agent"
      ) {
        const agentResponse = utterances[i + 2].content.toLowerCase();
        if (!agentResponse.includes("uh-huh") && !agentResponse.includes("uh huh") && !agentResponse.includes("mhm")) {
          issues.push({
            category: "Technical Precision",
            rule: 'Respond "uh-huh" to obviously unfinished messages',
            severity: "info",
            evidence: `User sent two messages in a row: "${truncate(curr.content, 80)}" then "${truncate(next.content, 80)}"`,
            call_id: callId,
            suggestion:
              'When receiving broken/unfinished messages (2 in a row), respond with "uh-huh" to acknowledge.',
          });
        }
      }
    }
  }

  // ── 12. MISSING VERBAL BRIDGES FOR TOOL CALLS ────────────
  // Check if agent says something like "let me check" before pauses
  const bridgePhrases = [
    "let me check",
    "let me look",
    "one moment",
    "give me a sec",
    "checking",
    "looking into",
    "pulling that up",
    "let me see",
    "hold on",
    "bear with me",
  ];
  if (utterances) {
    for (let i = 0; i < utterances.length - 1; i++) {
      const curr = utterances[i];
      const next = utterances[i + 1];
      // Look for agent turns followed by long gaps (if word timing is available)
      if (curr.role === "agent" && next.role === "agent" && curr.words && next.words) {
        const gap = (next.words[0]?.start ?? 0) - (curr.words[curr.words.length - 1]?.end ?? 0);
        if (gap > 3000) {
          // 3+ second gap
          const hasBridge = bridgePhrases.some((p) =>
            curr.content.toLowerCase().includes(p)
          );
          if (!hasBridge) {
            issues.push({
              category: "Function Integration",
              rule: "Use verbal bridges during processing",
              severity: "warning",
              evidence: `${(gap / 1000).toFixed(1)}s gap without verbal bridge: "${truncate(curr.content, 100)}"`,
              call_id: callId,
              suggestion:
                'Add phrases like "Let me check that for you..." before tool calls or lookups.',
            });
          }
        }
      }
    }
  }

  // ── 13. CALL ENDING CHECK ─────────────────────────────────
  if (agentLines.length > 0) {
    const lastAgentLine = agentLines[agentLines.length - 1].toLowerCase();
    const goodbyePhrases = [
      "goodbye",
      "bye",
      "take care",
      "have a great",
      "have a good",
      "have a wonderful",
      "thanks for calling",
      "thank you for calling",
    ];
    const hasGoodbye = goodbyePhrases.some((p) => lastAgentLine.includes(p));
    if (!hasGoodbye && agentLines.length > 3) {
      issues.push({
        category: "Call Management",
        rule: "End calls cleanly after goodbye phrases",
        severity: "info",
        evidence: `Last agent message: "${truncate(agentLines[agentLines.length - 1], 150)}"`,
        call_id: callId,
        suggestion:
          "Ensure the agent ends with a clear goodbye and triggers the end_call function.",
      });
    }
  }

  // ── 14. PROMPT STRUCTURE CHECK (via prompt text) ──────────
  // This is checked at the prompt level, not transcript level.
  // Included here as a placeholder - the actual prompt audit happens
  // when Claude reads the prompt via get_agent_prompt.

  return issues;
}

// ── Helpers ─────────────────────────────────────────────────────

function extractAgentLines(transcript: string): string[] {
  const lines: string[] = [];
  const agentPattern = /^(?:Agent|AI|Bot|Assistant):\s*(.+)$/gim;
  let match;
  while ((match = agentPattern.exec(transcript)) !== null) {
    lines.push(match[1]);
  }
  // Fallback: if no labeled lines found, try Retell's format
  if (lines.length === 0) {
    // Retell transcripts often don't have labels - use utterance objects instead
    // This fallback splits on newlines and alternates (rough heuristic)
    const allLines = transcript.split("\n").filter((l) => l.trim());
    for (let i = 0; i < allLines.length; i += 2) {
      if (i + 1 < allLines.length) lines.push(allLines[i + 1]);
    }
  }
  return lines;
}

function extractUserLines(transcript: string): string[] {
  const lines: string[] = [];
  const userPattern = /^(?:User|Human|Caller|Customer):\s*(.+)$/gim;
  let match;
  while ((match = userPattern.exec(transcript)) !== null) {
    lines.push(match[1]);
  }
  return lines;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.substring(0, max) + "..." : text;
}

// ── Tool Registration ───────────────────────────────────────────

export const registerAnalysisTools = (server: McpServer, client: Retell) => {
  server.tool(
    "analyze_transcripts",
    "Analyze recent call transcripts for a Retell agent against voice AI best practices. " +
    "Checks 14 rules including: question bundling, repeated data requests, enthusiasm " +
    "variation, symbol formatting, filler word usage, option limits, timezone repetition, " +
    "verbal bridges, and call ending. Returns categorized issues with severity, evidence, " +
    "and specific suggestions. Use this to find problems before updating the prompt.",
    AnalyzeTranscriptsSchema.shape,
    handler(async (data: z.infer<typeof AnalyzeTranscriptsSchema>) => {
      const numCalls = Math.min(data.num_calls ?? 10, 50);

      // Fetch recent calls via /v3/list-calls directly — the installed SDK (4.x)
      // still targets the deprecated POST /v2/list-calls.
      const res = await fetch("https://api.retellai.com/v3/list-calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter_criteria: { agent_id: [data.agent_id] },
          limit: numCalls,
          sort_order: "descending",
        }),
      });
      if (!res.ok) {
        throw new Error(`list-calls v3 failed: ${res.status} ${await res.text()}`);
      }
      const listJson = await res.json();
      // v3 wraps results in { items, pagination_key, has_more }.
      const calls: any[] = Array.isArray(listJson) ? listJson : (listJson.items ?? []);

      if (calls.length === 0) {
        return {
          agent_id: data.agent_id,
          calls_analyzed: 0,
          message: "No calls found for this agent.",
          issues: [],
        };
      }

      // Fetch full transcripts for calls that have them
      const allIssues: Issue[] = [];
      let callsWithTranscripts = 0;

      for (const call of calls) {
        if (!call.transcript && !call.transcript_object) continue;
        callsWithTranscripts++;

        const issues = analyzeTranscript(
          call.call_id,
          call.transcript ?? "",
          (call.transcript_object as TranscriptUtterance[] | null) ?? null
        );
        allIssues.push(...issues);
      }

      // Aggregate: group by rule, count occurrences
      const ruleCount = new Map<string, number>();
      for (const issue of allIssues) {
        const key = `${issue.category}: ${issue.rule}`;
        ruleCount.set(key, (ruleCount.get(key) ?? 0) + 1);
      }

      // Sort by frequency (most common issues first)
      const sortedRules = [...ruleCount.entries()].sort((a, b) => b[1] - a[1]);

      return {
        agent_id: data.agent_id,
        calls_analyzed: callsWithTranscripts,
        total_calls_fetched: calls.length,
        total_issues: allIssues.length,
        issue_summary: sortedRules.map(([rule, count]) => ({
          rule,
          occurrences: count,
          severity: allIssues.find(
            (i) => `${i.category}: ${i.rule}` === rule
          )?.severity,
        })),
        critical_issues: allIssues.filter((i) => i.severity === "critical"),
        warning_issues: allIssues.filter((i) => i.severity === "warning"),
        info_issues: allIssues.filter((i) => i.severity === "info"),
        recommendations:
          allIssues.length === 0
            ? ["No issues detected. Agent appears to follow voice AI best practices well."]
            : [
                ...new Set(
                  allIssues
                    .filter((i) => i.severity === "critical")
                    .map((i) => i.suggestion)
                ),
              ],
      };
    })
  );
};
