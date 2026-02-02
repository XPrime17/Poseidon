# Config Workflow

Modify Moltbot configuration settings.

## Configuration Files

| File | Purpose |
|------|---------|
| `start-moltbot.sh` | Runtime config, model selection, channel settings |
| `src/gateway/env.ts` | Environment variable mapping |
| `src/gateway/version.ts` | Config hash computation |
| `wrangler.jsonc` | Worker configuration |

## Common Configuration Changes

### Change Default AI Model

**File:** `/root/moltworker/start-moltbot.sh`

**Location:** Look for `config.agents.defaults.model.primary`

**Available models:**
- `anthropic/claude-opus-4-5-20251101` - Highest quality, LOW rate limits (10k/min)
- `anthropic/claude-sonnet-4-5-20250929` - Balanced, HIGHER rate limits (recommended)
- `anthropic/claude-haiku-4-5-20251001` - Fast, highest rate limits

**Example change:**
```javascript
// Change from Opus to Sonnet
config.agents.defaults.model.primary = 'anthropic/claude-sonnet-4-5-20250929';
```

### Change Telegram DM Policy

**File:** `start-moltbot.sh`

**Options:**
- `pairing` - Require device pairing (default)
- `open` - Allow all DMs

**Set via environment:**
```bash
wrangler secret put TELEGRAM_DM_POLICY
# Enter: open
```

### Add Environment Variables

**File:** `src/gateway/env.ts` in `buildEnvVars()` function

Add new variable:
```typescript
if (env.NEW_VAR) envVars.NEW_VAR = env.NEW_VAR;
```

### Update Config Hash Tracking

**File:** `src/gateway/version.ts`

If adding new config that should trigger restart, add to `relevantConfig` object:
```typescript
const relevantConfig = {
  // ... existing config
  newSetting: env.NEW_SETTING || '',
};
```

## After Making Changes

1. **Build:** `npm run build`
2. **Deploy:** `CLOUDFLARE_API_TOKEN=xxx npx wrangler deploy`
3. **Verify:** Gateway will auto-restart due to config hash change

## Managing Secrets

```bash
# List secrets
CLOUDFLARE_API_TOKEN=xxx wrangler secret list

# Add/update secret
CLOUDFLARE_API_TOKEN=xxx wrangler secret put SECRET_NAME

# Delete secret
CLOUDFLARE_API_TOKEN=xxx wrangler secret delete SECRET_NAME
```

**Required secrets:**
- `ANTHROPIC_API_KEY` or `AI_GATEWAY_API_KEY`
- `MOLTBOT_GATEWAY_TOKEN`
- `CF_ACCESS_TEAM_DOMAIN`
- `CF_ACCESS_AUD`
- `TELEGRAM_BOT_TOKEN` (for Telegram)
