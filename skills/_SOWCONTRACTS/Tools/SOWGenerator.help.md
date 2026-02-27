# SOWGenerator

Generate a Statement of Work for a Voice AI agent engagement.

## Usage

```bash
bun run ~/.claude/skills/_SOWCONTRACTS/Tools/SOWGenerator.ts [options]
```

## Required Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--client` | `-c` | Client company name |
| `--niche` | `-n` | Industry niche |
| `--tier` | `-t` | Package tier (starter, professional, enterprise) |

## Optional Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--calls` | Expected monthly call volume | Niche-based estimate |
| `--ticket` | Average ticket value ($) | Niche-based estimate |
| `--hours` | Business hours | "M-F 9am-5pm" |
| `--crm` | CRM/calendar system | "TBD" |
| `--compliance` | Compliance requirements | None |
| `--contact` | Client contact name/title | Placeholder |

## Supported Niches

dental, hvac, medspa, gym, legal, realestate

(Other values accepted — will use generic defaults)

## Examples

```bash
# Dental practice, professional tier
bun run SOWGenerator.ts --client "Smile Dental" --niche dental --tier professional --calls 500

# HVAC company, starter tier with custom hours
bun run SOWGenerator.ts --client "Riverside HVAC" --niche hvac --tier starter --hours "M-S 7a-7p"

# Law firm, enterprise with HIPAA
bun run SOWGenerator.ts --client "Metro Legal" --niche legal --tier enterprise --compliance HIPAA
```
