#!/usr/bin/env bun

/**
 * TestCaseManager - Retell Simulator Test Case CLI
 *
 * Validates, lists, and summarizes test case suites per agent.
 *
 * Usage:
 *   bun run TestCaseManager.ts --agent emma
 *   bun run TestCaseManager.ts --agent emma --list
 *   bun run TestCaseManager.ts --agent emma --validate
 *   bun run TestCaseManager.ts --agent cnkb --output json
 *
 * @version 1.0.0
 */

import { parseArgs } from "util";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

interface TestCase {
  name: string;
  dynamic_variables: Record<string, string>;
  metrics: string[];
  user_prompt: string;
  creation_timestamp: number;
  user_modified_timestamp: number;
  type: string;
  tool_mocks: unknown[];
  llm_model: string;
}

interface ValidationResult {
  index: number;
  name: string;
  status: "PASS" | "FAIL";
  issues: string[];
}

const AGENT_PATHS: Record<string, string> = {
  emma: resolve(`${process.env.HOME}/.claude/skills/_EMMA/TestCases.json`),
  cnkb: resolve(`${process.env.HOME}/.claude/skills/_CNKB/TestCases.json`),
  cneggpt: resolve(`${process.env.HOME}/.claude/skills/_CNEGGPT/TestCases.json`),
};

const AGENT_NAMES: Record<string, string> = {
  emma: "Emma (Code Ninjas Lead Reactivation)",
  cnkb: "CNKB (Code Ninjas with Knowledge Base)",
  cneggpt: "CNEGGPT (Code Ninjas EG GPT)",
};

function showHelp(): void {
  console.log(`
TestCaseManager - Retell Simulator Test Case CLI

USAGE:
  bun run TestCaseManager.ts --agent <name> [options]

AGENTS:
  emma      Code Ninjas Lead Reactivation - Emma
  cnkb      Code Ninjas with Knowledge Base
  cneggpt   Code Ninjas EG GPT

OPTIONS:
  --agent <name>   Target agent (required)
  --list           List all test cases with details
  --validate       Validate test cases against schema
  --output <fmt>   Output format: text (default) or json
  --help           Show this help

EXAMPLES:
  bun run TestCaseManager.ts --agent emma
  bun run TestCaseManager.ts --agent emma --list
  bun run TestCaseManager.ts --agent cnkb --validate
  bun run TestCaseManager.ts --agent emma --validate --output json
`);
}

function loadTestCases(agent: string): TestCase[] | null {
  const path = AGENT_PATHS[agent];
  if (!path) {
    console.error(`Unknown agent: ${agent}. Valid: ${Object.keys(AGENT_PATHS).join(", ")}`);
    return null;
  }
  if (!existsSync(path)) {
    console.error(`No test cases found at: ${path}`);
    console.error(`Run "generate tests for ${agent}" to create a test suite.`);
    return null;
  }
  try {
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw) as TestCase[];
  } catch (e) {
    console.error(`Failed to parse ${path}: ${(e as Error).message}`);
    return null;
  }
}

function validateTestCase(tc: TestCase, index: number): ValidationResult {
  const issues: string[] = [];

  if (!tc.name || typeof tc.name !== "string") issues.push("Missing or invalid 'name'");
  if (!tc.dynamic_variables || typeof tc.dynamic_variables !== "object") issues.push("Missing 'dynamic_variables'");
  if (!Array.isArray(tc.metrics) || tc.metrics.length === 0) issues.push("'metrics' must be non-empty array");
  if (!tc.user_prompt || typeof tc.user_prompt !== "string") issues.push("Missing 'user_prompt'");
  if (tc.type !== "simulation") issues.push(`'type' must be "simulation", got "${tc.type}"`);
  if (!Array.isArray(tc.tool_mocks)) issues.push("'tool_mocks' must be an array");
  if (!tc.llm_model || typeof tc.llm_model !== "string") issues.push("Missing 'llm_model'");
  if (typeof tc.creation_timestamp !== "number") issues.push("Missing or invalid 'creation_timestamp'");
  if (typeof tc.user_modified_timestamp !== "number") issues.push("Missing or invalid 'user_modified_timestamp'");

  if (tc.user_prompt) {
    if (!tc.user_prompt.includes("## Identity")) issues.push("user_prompt missing '## Identity' section");
    if (!tc.user_prompt.includes("## Goal")) issues.push("user_prompt missing '## Goal' section");
    if (!tc.user_prompt.includes("## Personality")) issues.push("user_prompt missing '## Personality' section");
  }

  if (tc.dynamic_variables) {
    if (!tc.dynamic_variables.FIRST_NAME && !tc.dynamic_variables.first_name) {
      issues.push("dynamic_variables missing FIRST_NAME");
    }
    if (!tc.dynamic_variables.LAST_NAME) {
      issues.push("dynamic_variables missing LAST_NAME");
    }
  }

  return {
    index,
    name: tc.name || `(unnamed #${index})`,
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues,
  };
}

function categorize(name: string): string {
  if (name.startsWith("Regression:")) return "Regression";
  if (name.startsWith("Verify:")) return "Verification";
  if (name.startsWith("Happy path:")) return "Happy path";
  if (name.startsWith("Edge:")) return "Edge case";
  if (name.startsWith("Stress:")) return "Stress";
  return "Other";
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}

function showSummary(agent: string, cases: TestCase[], format: string): void {
  const categories: Record<string, number> = {};
  for (const tc of cases) {
    const cat = categorize(tc.name);
    categories[cat] = (categories[cat] || 0) + 1;
  }

  if (format === "json") {
    console.log(JSON.stringify({
      agent: AGENT_NAMES[agent],
      total: cases.length,
      categories,
      path: AGENT_PATHS[agent],
    }, null, 2));
    return;
  }

  console.log(`\nTEST SUITE: ${AGENT_NAMES[agent]}`);
  console.log(`Path: ${AGENT_PATHS[agent]}`);
  console.log(`Total: ${cases.length} test cases\n`);
  console.log("Categories:");
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`  ${cat}: ${count}`);
  }
}

function showList(agent: string, cases: TestCase[], format: string): void {
  if (format === "json") {
    console.log(JSON.stringify(cases.map((tc, i) => ({
      index: i,
      name: tc.name,
      category: categorize(tc.name),
      metrics: tc.metrics.length,
      model: tc.llm_model,
      created: formatDate(tc.creation_timestamp),
    })), null, 2));
    return;
  }

  console.log(`\nTEST CASES: ${AGENT_NAMES[agent]} (${cases.length} total)\n`);
  console.log("  #  | Name                                       | Category     | Metrics | Created");
  console.log("-----|--------------------------------------------|--------------|---------|-----------");
  cases.forEach((tc, i) => {
    const name = tc.name.length > 42 ? tc.name.slice(0, 39) + "..." : tc.name.padEnd(42);
    const cat = categorize(tc.name).padEnd(12);
    const metrics = String(tc.metrics.length).padEnd(7);
    const created = formatDate(tc.creation_timestamp);
    console.log(`  ${String(i + 1).padStart(2)} | ${name} | ${cat} | ${metrics} | ${created}`);
  });
}

function showValidation(agent: string, cases: TestCase[], format: string): void {
  const results = cases.map((tc, i) => validateTestCase(tc, i));
  const passed = results.filter((r) => r.status === "PASS").length;

  if (format === "json") {
    console.log(JSON.stringify({ agent: AGENT_NAMES[agent], total: cases.length, passed, failed: cases.length - passed, results }, null, 2));
    return;
  }

  console.log(`\nVALIDATION: ${AGENT_NAMES[agent]}\n`);
  console.log("  #  | Name                                       | Status | Issues");
  console.log("-----|--------------------------------------------|---------|-----------");
  for (const r of results) {
    const name = r.name.length > 42 ? r.name.slice(0, 39) + "..." : r.name.padEnd(42);
    const status = r.status === "PASS" ? "PASS  " : "FAIL  ";
    const issues = r.issues.length > 0 ? r.issues.join("; ") : "—";
    console.log(`  ${String(r.index + 1).padStart(2)} | ${name} | ${status} | ${issues}`);
  }
  console.log(`\nResult: ${passed}/${cases.length} passed`);
}

// --- Main ---

const { values } = parseArgs({
  options: {
    agent: { type: "string", short: "a" },
    list: { type: "boolean", short: "l", default: false },
    validate: { type: "boolean", short: "v", default: false },
    output: { type: "string", short: "o", default: "text" },
    help: { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (values.help) {
  showHelp();
  process.exit(0);
}

if (!values.agent) {
  console.error("Error: --agent is required. Use --help for usage.");
  process.exit(1);
}

const agent = values.agent.toLowerCase();
const cases = loadTestCases(agent);
if (!cases) process.exit(1);

const format = values.output || "text";

if (values.validate) {
  showValidation(agent, cases, format);
} else if (values.list) {
  showList(agent, cases, format);
} else {
  showSummary(agent, cases, format);
}
