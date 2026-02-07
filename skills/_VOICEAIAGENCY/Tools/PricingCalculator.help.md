# PricingCalculator

Calculate voice AI agency pricing, COGS, margins, and ROI per niche.

## Usage

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PricingCalculator.ts [options]
```

## Options

| Flag | Description |
|------|-------------|
| `-n, --niche` | Niche name (dental, hvac, medspa, gym, legal, etc.) |
| `-c, --calls` | Monthly call volume (default: 300) |
| `-t, --ticket` | Average ticket value (overrides niche default) |
| `-m, --missed` | Missed calls per day (overrides niche default) |
| `--tier` | Force pricing tier (starter, professional, enterprise) |
| `--roi-only` | Only output ROI calculation |
| `--list-niches` | Show all niches with defaults |
| `-o, --output` | Output format: text (default), json |

## Examples

```bash
# Full pricing breakdown
bun run PricingCalculator.ts --niche dental --calls 500

# ROI pitch numbers
bun run PricingCalculator.ts --niche hvac --calls 300 --roi-only

# JSON for programmatic use
bun run PricingCalculator.ts --niche dental --calls 500 --output json

# Custom values
bun run PricingCalculator.ts --niche medspa --calls 200 --ticket 800 --missed 5
```

## Used By

- `GenerateProposal` workflow — ROI math in proposals
- `PrepareDemo` workflow — pricing preparation
- `NicheTarget` workflow — compare ROI across niches
