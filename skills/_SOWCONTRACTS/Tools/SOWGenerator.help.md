# SOWGenerator

Generate a Code Ninjas Speed-to-Lead Statement of Work from centre parameters.

## Usage

```bash
bun run ~/.claude/skills/_SOWCONTRACTS/Tools/SOWGenerator.ts [options]
```

## Required Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--centre` | `-c` | Centre name (e.g., "East Gwillimbury", "Canton") |
| `--city` | | City and province/state (e.g., "Canton, MI") |

## Optional Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--calls` | 300 | Expected monthly inbound call volume |
| `--ticket` | 2400 | Average annual enrollment value in dollars |
| `--phone` | "To be provisioned" | Dedicated phone number for the centre |
| `--contact` | Placeholder | Centre Director name and title |
| `--setup` | "[TBD]" | Setup fee amount (numbers only, e.g., 1500) |
| `--monthly` | "[TBD]" | Monthly retainer amount (numbers only, e.g., 697) |
| `--discount` | none | Multi-location discount percentage (e.g., 10) |

## Examples

```bash
# Basic — centre name and location only (pricing TBD)
bun run SOWGenerator.ts --centre "East Gwillimbury" --city "East Gwillimbury, ON"

# With call volume and contact
bun run SOWGenerator.ts --centre "Canton" --city "Canton, MI" --calls 350 --contact "Jane Smith, Centre Director"

# Full — all params including pricing
bun run SOWGenerator.ts --centre "Stone Oak" --city "San Antonio, TX" --calls 400 --setup 1500 --monthly 697 --discount 10 --phone "+12107969951"
```

## Output

Produces a complete SOW in markdown with:
- Code Ninjas-specific deliverables (Cimo agent, tour booking, KB, ChatDash, Cekura QA)
- ROI calculation based on call volume and enrollment value
- 3-5 day deployment timeline
- Multi-location discount table (if `--discount` provided)
- Acceptance signature block
