# PromptBuilder

Generate 4-section voice AI agent prompts using Paige's framework.

## Usage

```bash
bun run ~/.claude/skills/_VOICEAIAGENCY/Tools/PromptBuilder.ts [options]
```

## Options

| Flag | Description |
|------|-------------|
| `-n, --niche` | Niche template (dental, hvac, medspa, gym, legal, realestate) |
| `-b, --business` | Business name (required) |
| `-a, --agent-name` | Agent name (defaults to niche-appropriate) |
| `-v, --voice` | Voice recommendation override |
| `--list-niches` | Show available templates |
| `-o, --output` | Output format: text (default), json |

## The 4 Sections

1. **Identity & Role** — Who the agent is, personality, tone
2. **Knowledge Base** — Business info, services, FAQs (needs [FILL IN])
3. **Conversation Flow** — Call handling steps, silence handling, tools, escalation
4. **Guardrails** — What agent must NEVER do, fallback behavior

## Output

The generated prompt has `[FILL IN]` placeholders for business-specific data:
- Business hours, address, phone, website
- FAQ answers
- Staff names
- Pricing details

Fill these in with actual client data during onboarding.

## Examples

```bash
# Dental receptionist
bun run PromptBuilder.ts --niche dental --business "Smile Dental Clinic"

# HVAC with custom agent name
bun run PromptBuilder.ts --niche hvac --business "Cool Air" --agent-name "Mike"

# JSON with metadata
bun run PromptBuilder.ts --niche medspa --business "Glow Aesthetics" --output json
```

## Used By

- `PromptEngineer` workflow — scaffold prompt for customization
- `BuildAgent` workflow — initial prompt generation
- `PrepareDemo` workflow — build demo-ready agent quickly
