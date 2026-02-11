#!/usr/bin/env bun

/**
 * FeedbackTracker - Voice AI Agent Feedback Management System
 *
 * JSON-backed feedback database for tracking centre feedback about
 * voice AI agent performance across deployments.
 *
 * Usage:
 *   bun run FeedbackTracker.ts --add --centre canton-ma-us --type specific_call --categories wrong_info,caller_frustrated --severity high --what-happened "Agent told caller wrong hours" --rating 2
 *   bun run FeedbackTracker.ts --list
 *   bun run FeedbackTracker.ts --list --centre pickering-on-ca --unanalyzed
 *   bun run FeedbackTracker.ts --trends
 *   bun run FeedbackTracker.ts --mark-analyzed --id abc123 --action-taken "Updated knowledge base with correct hours"
 *   bun run FeedbackTracker.ts --summary
 *
 * @version 1.0.0
 */

import { parseArgs } from "util";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";

const HOME = process.env.HOME || "/root";
const DATA_DIR = `${HOME}/.claude/skills/_VOICEAIAGENCY/Data`;
const DATA_FILE = `${DATA_DIR}/feedback.json`;

const VALID_CATEGORIES = [
  "wrong_info",
  "missed_booking",
  "caller_frustrated",
  "agent_weird",
  "scheduling_issue",
  "didnt_know_answer",
  "call_ended_wrong",
  "positive_feedback",
  "other",
] as const;

type FeedbackCategory = typeof VALID_CATEGORIES[number];

interface Feedback {
  id: string;
  centre_id: string;
  feedback_type: "specific_call" | "general";
  caller_reference?: string;
  categories: FeedbackCategory[];
  severity: "low" | "medium" | "high";
  what_happened: string;
  what_should_have_happened?: string;
  agent_rating: number;
  submitted_at: string;
  submitted_by?: string;
  analyzed: boolean;
  analyzed_at?: string;
  linked_call_id?: string;
  action_taken?: string;
}

interface FeedbackDB {
  feedback: Feedback[];
  version: string;
}

function loadDB(): FeedbackDB {
  if (!existsSync(DATA_FILE)) {
    return { feedback: [], version: "1.0.0" };
  }
  const content = readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(content) as FeedbackDB;
}

function saveDB(db: FeedbackDB): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function findFeedback(db: FeedbackDB, id: string): Feedback | undefined {
  return db.feedback.find((f) => f.id === id);
}

function formatFeedback(f: Feedback): string {
  const lines: string[] = [];
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`  ID: ${f.id}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`  Centre:     ${f.centre_id}`);
  lines.push(`  Type:       ${f.feedback_type}`);
  lines.push(`  Rating:     ${f.agent_rating}/5`);
  lines.push(`  Severity:   ${f.severity.toUpperCase()}`);
  lines.push(`  Categories: ${f.categories.join(", ")}`);
  if (f.caller_reference) lines.push(`  Caller Ref: ${f.caller_reference}`);
  lines.push(`  What:       ${f.what_happened}`);
  if (f.what_should_have_happened)
    lines.push(`  Should Be:  ${f.what_should_have_happened}`);
  if (f.submitted_by) lines.push(`  From:       ${f.submitted_by}`);
  lines.push(`  Submitted:  ${f.submitted_at}`);
  lines.push(`  Analyzed:   ${f.analyzed ? "YES" : "NO"}`);
  if (f.analyzed_at) lines.push(`  When:       ${f.analyzed_at}`);
  if (f.linked_call_id) lines.push(`  Call ID:    ${f.linked_call_id}`);
  if (f.action_taken) lines.push(`  Action:     ${f.action_taken}`);
  return lines.join("\n");
}

function validateCategories(categories: string[]): FeedbackCategory[] {
  const validated: FeedbackCategory[] = [];
  const invalid: string[] = [];

  for (const cat of categories) {
    if (VALID_CATEGORIES.includes(cat as FeedbackCategory)) {
      validated.push(cat as FeedbackCategory);
    } else {
      invalid.push(cat);
    }
  }

  if (invalid.length > 0) {
    console.error(
      `Error: Invalid categories: ${invalid.join(", ")}\nValid categories: ${VALID_CATEGORIES.join(", ")}`
    );
    process.exit(1);
  }

  return validated;
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      help: { type: "boolean" },
      add: { type: "boolean" },
      list: { type: "boolean" },
      trends: { type: "boolean" },
      "mark-analyzed": { type: "boolean" },
      summary: { type: "boolean" },
      centre: { type: "string" },
      type: { type: "string" },
      categories: { type: "string" },
      severity: { type: "string" },
      "what-happened": { type: "string" },
      "what-should-have-happened": { type: "string" },
      rating: { type: "string" },
      "caller-ref": { type: "string" },
      "submitted-by": { type: "string" },
      id: { type: "string" },
      "action-taken": { type: "string" },
      "linked-call-id": { type: "string" },
      unanalyzed: { type: "boolean" },
      limit: { type: "string" },
      output: { type: "string", short: "o", default: "text" },
    },
  });

  if (values.help) {
    console.log(`
FeedbackTracker - Voice AI Agent Feedback Management System

USAGE:
  bun run FeedbackTracker.ts <command> [options]

COMMANDS:
  --add              Add new feedback entry
  --list             List feedback entries
  --trends           Show trend analysis
  --mark-analyzed    Mark feedback as analyzed
  --summary          Show summary statistics
  --help             Show this help message

OPTIONS (for --add):
  --centre <id>              Centre ID (required, e.g., canton-ma-us)
  --type <type>              specific_call | general (required)
  --categories <cats>        Comma-separated categories (required)
  --severity <level>         low | medium | high (required)
  --what-happened <text>     What happened (required)
  --rating <1-5>             Agent rating 1-5 (required)
  --caller-ref <ref>         Caller name or date/time (optional)
  --what-should-have-happened <text>  Expected behavior (optional)
  --submitted-by <name>      Centre manager name (optional)

VALID CATEGORIES:
  wrong_info, missed_booking, caller_frustrated, agent_weird,
  scheduling_issue, didnt_know_answer, call_ended_wrong,
  positive_feedback, other

OPTIONS (for --list):
  --centre <id>              Filter by centre ID
  --unanalyzed              Show only unanalyzed feedback
  --limit <N>               Limit results to N entries

OPTIONS (for --mark-analyzed):
  --id <uuid>               Feedback ID (required)
  --action-taken <text>     What action was taken (optional)
  --linked-call-id <id>     Retell call ID if matched (optional)

OPTIONS (for all):
  -o, --output <format>     Output format: text | json (default: text)

EXAMPLES:
  # Add specific call feedback
  bun run FeedbackTracker.ts --add --centre canton-ma-us --type specific_call \\
    --categories wrong_info,caller_frustrated --severity high \\
    --what-happened "Agent told caller wrong business hours" \\
    --rating 2 --caller-ref "Sarah M. on 2/10 3pm" \\
    --submitted-by "John Manager"

  # Add general feedback
  bun run FeedbackTracker.ts --add --centre pickering-on-ca --type general \\
    --categories positive_feedback --severity low \\
    --what-happened "Agents are doing great with bookings" \\
    --rating 5

  # List unanalyzed feedback for a centre
  bun run FeedbackTracker.ts --list --centre canton-ma-us --unanalyzed

  # Show trend analysis
  bun run FeedbackTracker.ts --trends

  # Mark as analyzed with action
  bun run FeedbackTracker.ts --mark-analyzed --id abc-123 \\
    --action-taken "Updated knowledge base with correct hours" \\
    --linked-call-id "retell_call_456"

  # Show summary stats
  bun run FeedbackTracker.ts --summary
`);
    return;
  }

  const db = loadDB();
  const now = new Date().toISOString();

  if (values.add) {
    // Validate required fields
    if (!values.centre) {
      console.error("Error: --centre is required");
      process.exit(1);
    }
    if (!values.type || !["specific_call", "general"].includes(values.type)) {
      console.error("Error: --type must be 'specific_call' or 'general'");
      process.exit(1);
    }
    if (!values.categories) {
      console.error("Error: --categories is required");
      process.exit(1);
    }
    if (!values.severity || !["low", "medium", "high"].includes(values.severity)) {
      console.error("Error: --severity must be 'low', 'medium', or 'high'");
      process.exit(1);
    }
    if (!values["what-happened"]) {
      console.error("Error: --what-happened is required");
      process.exit(1);
    }
    if (!values.rating) {
      console.error("Error: --rating is required");
      process.exit(1);
    }

    const rating = parseInt(values.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      console.error("Error: --rating must be between 1 and 5");
      process.exit(1);
    }

    const categories = validateCategories(values.categories.split(",").map((c) => c.trim()));

    const newFeedback: Feedback = {
      id: randomUUID(),
      centre_id: values.centre,
      feedback_type: values.type as "specific_call" | "general",
      caller_reference: values["caller-ref"],
      categories,
      severity: values.severity as "low" | "medium" | "high",
      what_happened: values["what-happened"],
      what_should_have_happened: values["what-should-have-happened"],
      agent_rating: rating,
      submitted_at: now,
      submitted_by: values["submitted-by"],
      analyzed: false,
    };

    db.feedback.push(newFeedback);
    saveDB(db);

    if (values.output === "json") {
      console.log(JSON.stringify(newFeedback, null, 2));
    } else {
      console.log(`✅ Added feedback: ${newFeedback.id}`);
      console.log(`   Centre: ${newFeedback.centre_id}`);
      console.log(`   Rating: ${newFeedback.agent_rating}/5`);
      console.log(`   Severity: ${newFeedback.severity}`);
    }
    return;
  }

  if (values.list) {
    let feedback = db.feedback;

    if (values.centre) {
      feedback = feedback.filter((f) => f.centre_id === values.centre);
    }

    if (values.unanalyzed) {
      feedback = feedback.filter((f) => !f.analyzed);
    }

    if (values.limit) {
      const limit = parseInt(values.limit);
      if (!isNaN(limit)) {
        feedback = feedback.slice(0, limit);
      }
    }

    if (values.output === "json") {
      console.log(JSON.stringify(feedback, null, 2));
      return;
    }

    if (feedback.length === 0) {
      console.log("No feedback entries found.");
      return;
    }

    console.log(`\n  FEEDBACK ENTRIES: ${feedback.length} total\n`);
    console.log(
      "  " +
        "ID".padEnd(10) +
        "Centre".padEnd(18) +
        "Type".padEnd(15) +
        "Rating".padEnd(8) +
        "Severity".padEnd(10) +
        "Analyzed"
    );
    console.log("  " + "─".repeat(85));

    for (const f of feedback) {
      console.log(
        "  " +
          f.id.substring(0, 8).padEnd(10) +
          f.centre_id.padEnd(18) +
          f.feedback_type.padEnd(15) +
          `${f.agent_rating}/5`.padEnd(8) +
          f.severity.padEnd(10) +
          (f.analyzed ? "✓" : "✗")
      );
    }

    console.log("\nUse --id <id> with other commands to see full details.");
    return;
  }

  if (values.trends) {
    if (db.feedback.length === 0) {
      console.log("No feedback data available for trend analysis.");
      return;
    }

    // Category frequency
    const categoryFreq: Record<string, number> = {};
    for (const f of db.feedback) {
      for (const cat of f.categories) {
        categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
      }
    }
    const sortedCategories = Object.entries(categoryFreq).sort((a, b) => b[1] - a[1]);

    // Average rating by centre
    const centreRatings: Record<string, { sum: number; count: number }> = {};
    for (const f of db.feedback) {
      if (!centreRatings[f.centre_id]) {
        centreRatings[f.centre_id] = { sum: 0, count: 0 };
      }
      centreRatings[f.centre_id].sum += f.agent_rating;
      centreRatings[f.centre_id].count += 1;
    }

    // Severity distribution
    const severityDist: Record<string, number> = { low: 0, medium: 0, high: 0 };
    for (const f of db.feedback) {
      severityDist[f.severity]++;
    }

    // Unanalyzed count
    const unanalyzedCount = db.feedback.filter((f) => !f.analyzed).length;

    // Rating trend (last 10)
    const recentFeedback = db.feedback.slice(-10);

    if (values.output === "json") {
      console.log(
        JSON.stringify(
          {
            categoryFrequency: Object.fromEntries(sortedCategories),
            averageRatingByCentre: Object.fromEntries(
              Object.entries(centreRatings).map(([centre, data]) => [
                centre,
                (data.sum / data.count).toFixed(2),
              ])
            ),
            severityDistribution: severityDist,
            topIssues: sortedCategories.slice(0, 5),
            unanalyzedCount,
            recentRatingTrend: recentFeedback.map((f) => ({
              date: f.submitted_at,
              rating: f.agent_rating,
            })),
          },
          null,
          2
        )
      );
      return;
    }

    console.log(`\n${"═".repeat(50)}`);
    console.log(`  FEEDBACK TREND ANALYSIS`);
    console.log(`${"═".repeat(50)}`);

    console.log(`\n  📊 CATEGORY FREQUENCY (${db.feedback.length} total entries)`);
    console.log("  " + "─".repeat(40));
    for (const [cat, count] of sortedCategories) {
      const bar = "█".repeat(Math.ceil((count / db.feedback.length) * 20));
      console.log(`  ${cat.padEnd(20)} ${count.toString().padStart(3)} ${bar}`);
    }

    console.log(`\n  🏢 AVERAGE RATING BY CENTRE`);
    console.log("  " + "─".repeat(40));
    for (const [centre, data] of Object.entries(centreRatings)) {
      const avg = (data.sum / data.count).toFixed(2);
      console.log(`  ${centre.padEnd(20)} ${avg}/5 (${data.count} entries)`);
    }

    console.log(`\n  ⚠️  SEVERITY DISTRIBUTION`);
    console.log("  " + "─".repeat(40));
    console.log(`  High:   ${severityDist.high}`);
    console.log(`  Medium: ${severityDist.medium}`);
    console.log(`  Low:    ${severityDist.low}`);

    console.log(`\n  🔥 TOP 5 ISSUES`);
    console.log("  " + "─".repeat(40));
    for (const [cat, count] of sortedCategories.slice(0, 5)) {
      console.log(`  ${count}x ${cat}`);
    }

    console.log(`\n  📈 RECENT RATING TREND (last 10 entries)`);
    console.log("  " + "─".repeat(40));
    for (const f of recentFeedback) {
      const stars = "★".repeat(f.agent_rating) + "☆".repeat(5 - f.agent_rating);
      console.log(`  ${f.submitted_at.split("T")[0]} ${stars} (${f.centre_id})`);
    }

    console.log(`\n  🔍 ANALYSIS STATUS`);
    console.log("  " + "─".repeat(40));
    console.log(`  Unanalyzed: ${unanalyzedCount}`);
    console.log(`  Analyzed:   ${db.feedback.length - unanalyzedCount}`);
    console.log();
    return;
  }

  if (values["mark-analyzed"]) {
    if (!values.id) {
      console.error("Error: --id is required");
      process.exit(1);
    }

    const feedback = findFeedback(db, values.id);
    if (!feedback) {
      console.error(`Error: Feedback with ID "${values.id}" not found`);
      process.exit(1);
    }

    if (feedback.analyzed) {
      console.log(`⚠️  Feedback ${values.id} is already marked as analyzed`);
      return;
    }

    feedback.analyzed = true;
    feedback.analyzed_at = now;
    if (values["action-taken"]) {
      feedback.action_taken = values["action-taken"];
    }
    if (values["linked-call-id"]) {
      feedback.linked_call_id = values["linked-call-id"];
    }

    saveDB(db);

    if (values.output === "json") {
      console.log(JSON.stringify(feedback, null, 2));
    } else {
      console.log(`✅ Marked feedback ${feedback.id} as analyzed`);
      if (feedback.action_taken) {
        console.log(`   Action: ${feedback.action_taken}`);
      }
    }
    return;
  }

  if (values.summary) {
    if (db.feedback.length === 0) {
      console.log("No feedback data available.");
      return;
    }

    const totalCount = db.feedback.length;
    const avgRating = (
      db.feedback.reduce((sum, f) => sum + f.agent_rating, 0) / totalCount
    ).toFixed(2);
    const unanalyzedCount = db.feedback.filter((f) => !f.analyzed).length;

    const categoryBreakdown: Record<string, number> = {};
    for (const f of db.feedback) {
      for (const cat of f.categories) {
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      }
    }

    if (values.output === "json") {
      console.log(
        JSON.stringify(
          {
            totalFeedback: totalCount,
            averageRating: parseFloat(avgRating),
            unanalyzedCount,
            categoryBreakdown,
          },
          null,
          2
        )
      );
      return;
    }

    console.log(`\n${"═".repeat(40)}`);
    console.log(`  FEEDBACK SUMMARY`);
    console.log(`${"═".repeat(40)}`);
    console.log(`\n  Total Feedback:  ${totalCount}`);
    console.log(`  Average Rating:  ${avgRating}/5`);
    console.log(`  Unanalyzed:      ${unanalyzedCount}`);
    console.log(`\n  Category Breakdown:`);
    for (const [cat, count] of Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${cat.padEnd(25)} ${count}`);
    }
    console.log();
    return;
  }

  // No command specified
  console.error("Error: No command specified. Use --help for usage.");
  process.exit(1);
}

main().catch(console.error);
