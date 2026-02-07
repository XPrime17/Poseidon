# ClientTracker

JSON-backed client lifecycle management for the voice AI agency.

## Usage

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/ClientTracker.ts <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `add` | Add a new client |
| `get` | Get client details |
| `update` | Update client fields |
| `list` | List clients (filter by status) |
| `remove` | Remove a client |
| `stats` | Show agency statistics (MRR, counts, health) |

## Client Statuses

`prospect` → `onboarding` → `active` → `paused` / `churned`

## Examples

```bash
# Add prospect
bun run ClientTracker.ts add --name "Smile Dental" --niche dental --status prospect

# Move to onboarding
bun run ClientTracker.ts update --name "Smile Dental" --status onboarding --tier professional

# Set as active with retainer
bun run ClientTracker.ts update --name "Smile Dental" --status active --retainer 697

# Update health score
bun run ClientTracker.ts update --name "Smile Dental" --health-score 85

# List active clients
bun run ClientTracker.ts list --status active

# Agency overview
bun run ClientTracker.ts stats
```

## Data Storage

Client data stored at: `~/.claude/skills/_VOICEAIAGENCY/Data/clients.json`

## Used By

- `OnboardClient` workflow — register + track onboarding
- `PerformanceReport` workflow — get client data
- `RetentionCheck` workflow — health scores + notes
