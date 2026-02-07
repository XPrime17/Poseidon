#!/usr/bin/env bun

/**
 * PricingCalculator - Voice AI Agency Pricing & ROI Calculator
 *
 * Calculates setup fees, retainer pricing, COGS, margins, and ROI
 * based on niche, call volume, and client parameters.
 *
 * Usage:
 *   bun run PricingCalculator.ts --niche dental --calls 500
 *   bun run PricingCalculator.ts --niche hvac --calls 300 --ticket 250 --missed 8
 *   bun run PricingCalculator.ts --niche dental --calls 500 --roi-only
 *   bun run PricingCalculator.ts --output json --niche dental --calls 500
 *   bun run PricingCalculator.ts --list-niches
 *
 * @version 1.0.0
 */

import { parseArgs } from "util";

// Niche defaults based on industry research
interface NicheDefaults {
  name: string;
  avgTicket: number;
  missedCallsPerDay: number;
  bookingConvRate: number;
  recommendedTier: string;
  businessDays: number;
}

const NICHE_DEFAULTS: Record<string, NicheDefaults> = {
  dental: {
    name: "Dental Practice",
    avgTicket: 350,
    missedCallsPerDay: 12,
    bookingConvRate: 0.40,
    recommendedTier: "professional",
    businessDays: 22,
  },
  hvac: {
    name: "HVAC Company",
    avgTicket: 250,
    missedCallsPerDay: 8,
    bookingConvRate: 0.35,
    recommendedTier: "professional",
    businessDays: 22,
  },
  medspa: {
    name: "Med Spa / Aesthetics",
    avgTicket: 500,
    missedCallsPerDay: 6,
    bookingConvRate: 0.45,
    recommendedTier: "professional",
    businessDays: 22,
  },
  gym: {
    name: "Gym / Fitness Studio",
    avgTicket: 50,
    missedCallsPerDay: 10,
    bookingConvRate: 0.50,
    recommendedTier: "starter",
    businessDays: 26,
  },
  legal: {
    name: "Law Firm",
    avgTicket: 400,
    missedCallsPerDay: 5,
    bookingConvRate: 0.30,
    recommendedTier: "enterprise",
    businessDays: 22,
  },
  realestate: {
    name: "Real Estate",
    avgTicket: 300,
    missedCallsPerDay: 8,
    bookingConvRate: 0.25,
    recommendedTier: "professional",
    businessDays: 22,
  },
  homeservices: {
    name: "Home Services",
    avgTicket: 200,
    missedCallsPerDay: 10,
    bookingConvRate: 0.35,
    recommendedTier: "professional",
    businessDays: 22,
  },
  veterinary: {
    name: "Veterinary Clinic",
    avgTicket: 250,
    missedCallsPerDay: 8,
    bookingConvRate: 0.40,
    recommendedTier: "professional",
    businessDays: 24,
  },
  auto: {
    name: "Auto Repair",
    avgTicket: 300,
    missedCallsPerDay: 7,
    bookingConvRate: 0.35,
    recommendedTier: "professional",
    businessDays: 24,
  },
  restaurant: {
    name: "Restaurant",
    avgTicket: 40,
    missedCallsPerDay: 15,
    bookingConvRate: 0.60,
    recommendedTier: "starter",
    businessDays: 30,
  },
};

// Pricing tiers
interface TierPricing {
  name: string;
  setupMin: number;
  setupMax: number;
  monthlyMin: number;
  monthlyMax: number;
  maxCalls: number;
  features: string[];
}

const TIERS: Record<string, TierPricing> = {
  starter: {
    name: "Starter",
    setupMin: 500,
    setupMax: 1000,
    monthlyMin: 297,
    monthlyMax: 497,
    maxCalls: 200,
    features: [
      "1 AI agent (inbound only)",
      "Up to 200 calls/month",
      "Basic FAQ + booking",
      "Single calendar integration",
      "Weekly performance email",
    ],
  },
  professional: {
    name: "Professional",
    setupMin: 1500,
    setupMax: 2500,
    monthlyMin: 697,
    monthlyMax: 997,
    maxCalls: 500,
    features: [
      "1-2 AI agents (inbound + outbound reminders)",
      "Up to 500 calls/month",
      "Full FAQ + booking + transfer logic",
      "CRM integration",
      "Call recording + transcription",
      "Monthly review call",
      "24/7 coverage",
    ],
  },
  enterprise: {
    name: "Enterprise",
    setupMin: 3000,
    setupMax: 5000,
    monthlyMin: 1497,
    monthlyMax: 1997,
    maxCalls: Infinity,
    features: [
      "Multi-agent system (3+ agents)",
      "Unlimited calls",
      "Complex routing + IVR replacement",
      "Multi-location support",
      "Custom integrations",
      "Dedicated account manager",
      "SLA: 99.9% uptime",
    ],
  },
};

// COGS per call (2-minute average)
const COGS_PER_CALL_LOW = 0.16;
const COGS_PER_CALL_HIGH = 0.34;

function calculateROI(
  missedPerDay: number,
  businessDays: number,
  convRate: number,
  avgTicket: number,
  monthlyRetainer: number
) {
  const monthlyMissed = missedPerDay * businessDays;
  const recoveredBookings = monthlyMissed * convRate;
  const recoveredRevenue = recoveredBookings * avgTicket;
  const roiRatio = recoveredRevenue / monthlyRetainer;
  const paybackDays = monthlyRetainer / (recoveredRevenue / businessDays);

  return {
    monthlyMissed,
    recoveredBookings: Math.round(recoveredBookings),
    recoveredRevenue: Math.round(recoveredRevenue),
    roiRatio: Math.round(roiRatio * 10) / 10,
    paybackDays: Math.round(paybackDays * 10) / 10,
    annualRecovery: Math.round(recoveredRevenue * 12),
  };
}

function calculateCOGS(callsPerMonth: number) {
  return {
    low: Math.round(callsPerMonth * COGS_PER_CALL_LOW),
    high: Math.round(callsPerMonth * COGS_PER_CALL_HIGH),
    perCallLow: COGS_PER_CALL_LOW,
    perCallHigh: COGS_PER_CALL_HIGH,
  };
}

function selectTier(callsPerMonth: number, niche: string): string {
  const nicheDefault = NICHE_DEFAULTS[niche];
  if (nicheDefault) return nicheDefault.recommendedTier;
  if (callsPerMonth <= 200) return "starter";
  if (callsPerMonth <= 500) return "professional";
  return "enterprise";
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      niche: { type: "string", short: "n" },
      calls: { type: "string", short: "c" },
      ticket: { type: "string", short: "t" },
      missed: { type: "string", short: "m" },
      tier: { type: "string" },
      output: { type: "string", short: "o", default: "text" },
      "roi-only": { type: "boolean" },
      "list-niches": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    console.log(`
PricingCalculator - Voice AI Agency Pricing & ROI Calculator

USAGE:
  bun run PricingCalculator.ts [options]

OPTIONS:
  -n, --niche <name>     Niche name (dental, hvac, medspa, gym, legal, realestate, etc.)
  -c, --calls <number>   Monthly call volume
  -t, --ticket <amount>  Average ticket value (overrides niche default)
  -m, --missed <number>  Missed calls per day (overrides niche default)
      --tier <tier>      Force tier (starter, professional, enterprise)
      --roi-only         Only output ROI calculation
      --list-niches      List available niches with defaults
  -o, --output <format>  Output format: text (default), json
  -h, --help             Show this help

EXAMPLES:
  # Full pricing for dental practice with 500 calls/month
  bun run PricingCalculator.ts --niche dental --calls 500

  # ROI only with custom values
  bun run PricingCalculator.ts --niche hvac --calls 300 --ticket 250 --missed 8 --roi-only

  # JSON output for programmatic use
  bun run PricingCalculator.ts --niche dental --calls 500 --output json

  # List all niches
  bun run PricingCalculator.ts --list-niches
`);
    return;
  }

  if (values["list-niches"]) {
    console.log("AVAILABLE NICHES\n");
    console.log(
      "Niche".padEnd(15) +
        "Avg Ticket".padEnd(12) +
        "Missed/Day".padEnd(12) +
        "Conv Rate".padEnd(11) +
        "Rec. Tier"
    );
    console.log("─".repeat(60));
    for (const [key, n] of Object.entries(NICHE_DEFAULTS)) {
      console.log(
        key.padEnd(15) +
          `$${n.avgTicket}`.padEnd(12) +
          `${n.missedCallsPerDay}`.padEnd(12) +
          `${(n.bookingConvRate * 100).toFixed(0)}%`.padEnd(11) +
          n.recommendedTier
      );
    }
    return;
  }

  if (!values.niche) {
    console.error("Error: --niche is required. Use --list-niches to see options.");
    process.exit(1);
  }

  const niche = values.niche.toLowerCase();
  const nicheData = NICHE_DEFAULTS[niche];

  if (!nicheData) {
    console.error(`Error: Unknown niche "${niche}". Use --list-niches to see options.`);
    process.exit(1);
  }

  const callsPerMonth = values.calls ? parseInt(values.calls) : 300;
  const avgTicket = values.ticket ? parseFloat(values.ticket) : nicheData.avgTicket;
  const missedPerDay = values.missed ? parseInt(values.missed) : nicheData.missedCallsPerDay;
  const tierKey = values.tier || selectTier(callsPerMonth, niche);
  const tier = TIERS[tierKey];

  if (!tier) {
    console.error(`Error: Unknown tier "${tierKey}". Options: starter, professional, enterprise`);
    process.exit(1);
  }

  const monthlyRetainer = (tier.monthlyMin + tier.monthlyMax) / 2;
  const roi = calculateROI(missedPerDay, nicheData.businessDays, nicheData.bookingConvRate, avgTicket, monthlyRetainer);
  const cogs = calculateCOGS(callsPerMonth);
  const marginLow = ((monthlyRetainer - cogs.high) / monthlyRetainer * 100).toFixed(1);
  const marginHigh = ((monthlyRetainer - cogs.low) / monthlyRetainer * 100).toFixed(1);

  if (values.output === "json") {
    console.log(JSON.stringify({
      niche: { key: niche, ...nicheData },
      tier: { key: tierKey, ...tier },
      inputs: { callsPerMonth, avgTicket, missedPerDay },
      roi,
      cogs: { ...cogs, monthly_low: cogs.low, monthly_high: cogs.high },
      margins: { low: parseFloat(marginLow), high: parseFloat(marginHigh) },
      retainer: { min: tier.monthlyMin, max: tier.monthlyMax, mid: monthlyRetainer },
    }, null, 2));
    return;
  }

  if (values["roi-only"]) {
    console.log(`\nROI CALCULATION: ${nicheData.name}`);
    console.log("═".repeat(50));
    console.log(`Missed calls/day:      ${missedPerDay}`);
    console.log(`Monthly missed:        ${roi.monthlyMissed}`);
    console.log(`Booking conv. rate:    ${(nicheData.bookingConvRate * 100).toFixed(0)}%`);
    console.log(`Recovered bookings:    ${roi.recoveredBookings}/month`);
    console.log(`Avg ticket value:      $${avgTicket}`);
    console.log(`Monthly recovery:      $${roi.recoveredRevenue.toLocaleString()}`);
    console.log(`Annual recovery:       $${roi.annualRecovery.toLocaleString()}`);
    console.log(`Monthly retainer:      $${monthlyRetainer}`);
    console.log(`ROI ratio:             ${roi.roiRatio}:1`);
    console.log(`Payback period:        ${roi.paybackDays} days`);
    return;
  }

  // Full output
  console.log(`\n${"═".repeat(55)}`);
  console.log(`  PRICING ANALYSIS: ${nicheData.name}`);
  console.log(`${"═".repeat(55)}`);

  console.log(`\nINPUTS:`);
  console.log(`  Niche:              ${nicheData.name}`);
  console.log(`  Monthly calls:      ${callsPerMonth}`);
  console.log(`  Avg ticket:         $${avgTicket}`);
  console.log(`  Missed calls/day:   ${missedPerDay}`);

  console.log(`\nRECOMMENDED TIER: ${tier.name}`);
  console.log(`  Setup fee:          $${tier.setupMin.toLocaleString()} - $${tier.setupMax.toLocaleString()}`);
  console.log(`  Monthly retainer:   $${tier.monthlyMin} - $${tier.monthlyMax}/mo`);
  console.log(`  Includes:`);
  tier.features.forEach(f => console.log(`    • ${f}`));

  console.log(`\nCOGS (at ${callsPerMonth} calls/mo):`);
  console.log(`  Per call:           $${cogs.perCallLow.toFixed(2)} - $${cogs.perCallHigh.toFixed(2)}`);
  console.log(`  Monthly:            $${cogs.low} - $${cogs.high}`);
  console.log(`  Gross margin:       ${marginLow}% - ${marginHigh}%`);

  console.log(`\nROI (for prospect pitch):`);
  console.log(`  Missed calls/month: ${roi.monthlyMissed}`);
  console.log(`  Recovered bookings: ${roi.recoveredBookings}/month`);
  console.log(`  Revenue recovered:  $${roi.recoveredRevenue.toLocaleString()}/month`);
  console.log(`  Annual recovery:    $${roi.annualRecovery.toLocaleString()}/year`);
  console.log(`  ROI ratio:          ${roi.roiRatio}:1`);
  console.log(`  Payback period:     ${roi.paybackDays} days`);

  console.log(`\n${"═".repeat(55)}`);
}

main().catch(console.error);
