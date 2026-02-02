#!/usr/bin/env bun
/**
 * MoltbotSecurityCheck.ts - Security audit for Moltbot/Clawdbot
 *
 * Checks for security vulnerabilities in the Moltbot Telegram bot
 * running on Cloudflare Sandbox.
 *
 * Usage:
 *   bun ~/.claude/skills/SecurityAudit/Tools/MoltbotSecurityCheck.ts [options]
 *
 * Options:
 *   --json          Output as JSON
 *   --quiet         Only output if issues found
 *   --severity <l>  Minimum severity to report (critical|high|medium|low|info)
 *   --help          Show this help
 *
 * Exit codes:
 *   0 - No critical/high issues
 *   1 - Critical or high issues found
 *   2 - Error running checks
 */

import { $ } from "bun";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// ANSI colors
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const BLUE = "\x1b[34m";
const GRAY = "\x1b[90m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface Finding {
  severity: Severity;
  title: string;
  description: string;
  remediation: string;
}

interface AuditResult {
  timestamp: string;
  findings: Finding[];
  summary: Record<Severity, number>;
  passed: boolean;
}

const MOLTWORKER_PATH = "/root/moltworker";
const WORKER_URL = "https://moltbot-sandbox.scott-james1717.workers.dev";

async function checkSecrets(): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Check if wrangler.jsonc exists
  const wranglerPath = join(MOLTWORKER_PATH, "wrangler.jsonc");
  if (!existsSync(wranglerPath)) {
    findings.push({
      severity: "medium",
      title: "Moltworker project not found",
      description: `Expected moltworker at ${MOLTWORKER_PATH}`,
      remediation: "Verify moltworker installation path",
    });
    return findings;
  }

  // Check for hardcoded secrets in source files
  const sensitivePatterns = [
    { pattern: /sk-ant-[a-zA-Z0-9-_]+/, name: "Anthropic API key" },
    { pattern: /sk-[a-zA-Z0-9]{48}/, name: "OpenAI API key" },
    { pattern: /\d{10}:[A-Za-z0-9_-]{35}/, name: "Telegram bot token" },
  ];

  const srcFiles = await $`find ${MOLTWORKER_PATH}/src -name "*.ts" -type f 2>/dev/null`.text();
  for (const file of srcFiles.trim().split("\n").filter(Boolean)) {
    try {
      const content = readFileSync(file, "utf-8");
      for (const { pattern, name } of sensitivePatterns) {
        if (pattern.test(content)) {
          findings.push({
            severity: "critical",
            title: `${name} hardcoded in source`,
            description: `Found potential ${name} in ${file}`,
            remediation: `Remove hardcoded secret and use wrangler secret put`,
          });
        }
      }
    } catch {
      // File read error, skip
    }
  }

  // Check git history for secrets (last 10 commits)
  try {
    const gitLog = await $`cd ${MOLTWORKER_PATH} && git log -10 --oneline -p 2>/dev/null | head -500`.text();
    for (const { pattern, name } of sensitivePatterns) {
      if (pattern.test(gitLog)) {
        findings.push({
          severity: "critical",
          title: `${name} in git history`,
          description: `Found potential ${name} in recent git commits`,
          remediation: `Rotate the compromised key immediately and use git filter-branch or BFG to remove from history`,
        });
      }
    }
  } catch {
    // Git not available or not a repo
  }

  return findings;
}

async function checkEndpoints(): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Check if debug routes are accessible without auth
  const debugEndpoints = ["/debug/env", "/debug/processes", "/debug/logs"];

  for (const endpoint of debugEndpoints) {
    try {
      const response = await fetch(`${WORKER_URL}${endpoint}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        redirect: "manual",
      });

      if (response.status === 200) {
        findings.push({
          severity: "high",
          title: "Debug endpoint accessible without auth",
          description: `${endpoint} returns 200 without authentication`,
          remediation: `Set DEBUG_ROUTES=false or remove the secret entirely`,
        });
      }
    } catch {
      // Network error, endpoint not reachable - that's fine
    }
  }

  // Check if public endpoints are working (should NOT require auth)
  try {
    const statusResponse = await fetch(`${WORKER_URL}/api/status`, {
      redirect: "manual",
    });

    if (statusResponse.status === 302) {
      const location = statusResponse.headers.get("location") || "";
      if (location.includes("cloudflareaccess.com")) {
        findings.push({
          severity: "medium",
          title: "Public endpoints blocked by CF Access",
          description: `/api/status redirects to CF Access login`,
          remediation: `Update CF Access Application to bypass /api/status, /sandbox-health paths`,
        });
      }
    }
  } catch {
    findings.push({
      severity: "medium",
      title: "Worker not reachable",
      description: `Could not connect to ${WORKER_URL}`,
      remediation: `Check worker deployment status`,
    });
  }

  return findings;
}

async function checkConfiguration(): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Check start-moltbot.sh for security issues
  const startScript = join(MOLTWORKER_PATH, "start-moltbot.sh");
  if (existsSync(startScript)) {
    const content = readFileSync(startScript, "utf-8");

    // Check for open DM policy
    if (content.includes("dmPolicy = 'open'") || content.includes('dmPolicy: "open"')) {
      findings.push({
        severity: "medium",
        title: "Open DM policy configured",
        description: `Telegram DM policy is set to 'open', allowing anyone to message the bot`,
        remediation: `Consider using 'pairing' policy for controlled access`,
      });
    }

    // Check for verbose logging in production
    if (content.includes("--verbose")) {
      findings.push({
        severity: "low",
        title: "Verbose logging enabled",
        description: `Gateway running with --verbose flag may log sensitive data`,
        remediation: `Remove --verbose flag for production`,
      });
    }

    // Check model configuration
    if (content.includes("claude-opus-4-5")) {
      findings.push({
        severity: "info",
        title: "Using Opus model",
        description: `Opus has low rate limits (10k tokens/min), may cause 429 errors`,
        remediation: `Consider using Sonnet for higher rate limits`,
      });
    }
  }

  // Check index.ts for security middleware
  const indexPath = join(MOLTWORKER_PATH, "src/index.ts");
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, "utf-8");

    if (!content.includes("createAccessMiddleware")) {
      findings.push({
        severity: "high",
        title: "CF Access middleware not found",
        description: `index.ts doesn't appear to use CF Access authentication`,
        remediation: `Implement createAccessMiddleware for protected routes`,
      });
    }
  }

  return findings;
}

async function checkGatewayHealth(): Promise<Finding[]> {
  const findings: Finding[] = [];

  try {
    // Try to reach the public debug endpoint
    const response = await fetch(`${WORKER_URL}/debug-public`, {
      redirect: "manual",
    });

    if (response.status === 200) {
      const data = await response.json() as Record<string, unknown>;

      // Check if gateway is running
      const processes = data.processes as Array<{ status: string; command: string }> | undefined;
      const gateway = processes?.find(
        (p) => p.command?.includes("gateway") || p.command?.includes("moltbot")
      );

      if (!gateway || gateway.status !== "running") {
        findings.push({
          severity: "medium",
          title: "Gateway not running",
          description: `No healthy gateway process found`,
          remediation: `Trigger a request or wait for cron to start gateway`,
        });
      }
    }
  } catch {
    // Can't reach debug-public - might be blocked by CF Access
    findings.push({
      severity: "info",
      title: "Cannot verify gateway health",
      description: `/debug-public endpoint not accessible`,
      remediation: `This is expected if CF Access protects all paths`,
    });
  }

  return findings;
}

function formatFinding(finding: Finding): string {
  const severityColors: Record<Severity, string> = {
    critical: RED,
    high: RED,
    medium: YELLOW,
    low: BLUE,
    info: GRAY,
  };

  const color = severityColors[finding.severity];
  const label = `[${finding.severity.toUpperCase()}]`.padEnd(10);

  return `${color}${label}${RESET} ${BOLD}${finding.title}${RESET}
           ${finding.description}
           ${GRAY}→ ${finding.remediation}${RESET}`;
}

async function runAudit(): Promise<AuditResult> {
  const findings: Finding[] = [];

  // Run all checks
  findings.push(...(await checkSecrets()));
  findings.push(...(await checkEndpoints()));
  findings.push(...(await checkConfiguration()));
  findings.push(...(await checkGatewayHealth()));

  // Calculate summary
  const summary: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const finding of findings) {
    summary[finding.severity]++;
  }

  const passed = summary.critical === 0 && summary.high === 0;

  return {
    timestamp: new Date().toISOString(),
    findings,
    summary,
    passed,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
${BOLD}MoltbotSecurityCheck${RESET} - Security audit for Moltbot/Clawdbot

${BOLD}Usage:${RESET}
  bun MoltbotSecurityCheck.ts [options]

${BOLD}Options:${RESET}
  --json          Output as JSON
  --quiet         Only output if issues found
  --severity <l>  Minimum severity (critical|high|medium|low|info)
  --help          Show this help

${BOLD}Exit codes:${RESET}
  0 - No critical/high issues
  1 - Critical or high issues found
  2 - Error running checks
`);
    process.exit(0);
  }

  const jsonOutput = args.includes("--json");
  const quiet = args.includes("--quiet");
  const severityIdx = args.indexOf("--severity");
  const minSeverity: Severity = severityIdx >= 0 ? (args[severityIdx + 1] as Severity) : "info";

  try {
    const result = await runAudit();

    // Filter by minimum severity
    const severityOrder: Severity[] = ["critical", "high", "medium", "low", "info"];
    const minIdx = severityOrder.indexOf(minSeverity);
    const filteredFindings = result.findings.filter(
      (f) => severityOrder.indexOf(f.severity) <= minIdx
    );

    if (jsonOutput) {
      console.log(JSON.stringify({ ...result, findings: filteredFindings }, null, 2));
    } else {
      if (quiet && filteredFindings.length === 0) {
        process.exit(0);
      }

      console.log(`
${BOLD}=== MOLTBOT SECURITY AUDIT ===${RESET}
Date: ${result.timestamp}

${RED}[CRITICAL]${RESET} ${result.summary.critical} issues
${RED}[HIGH]${RESET}     ${result.summary.high} issues
${YELLOW}[MEDIUM]${RESET}   ${result.summary.medium} issues
${BLUE}[LOW]${RESET}      ${result.summary.low} issues
${GRAY}[INFO]${RESET}     ${result.summary.info} notes

${BOLD}DETAILS:${RESET}
${"─".repeat(60)}
`);

      if (filteredFindings.length === 0) {
        console.log(`${GREEN}✓ No issues found at ${minSeverity} severity or above${RESET}`);
      } else {
        for (const finding of filteredFindings) {
          console.log(formatFinding(finding));
          console.log();
        }
      }

      console.log("─".repeat(60));
      if (result.passed) {
        console.log(`${GREEN}${BOLD}✓ PASSED${RESET} - No critical or high severity issues`);
      } else {
        console.log(`${RED}${BOLD}✗ FAILED${RESET} - Critical or high severity issues found`);
      }
    }

    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error(`${RED}Error running audit:${RESET}`, error);
    process.exit(2);
  }
}

main();
