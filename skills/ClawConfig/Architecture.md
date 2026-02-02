# Moltbot Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge                              │
├─────────────────────────────────────────────────────────────────┤
│  Cloudflare Access (optional)                                    │
│    ↓ (302 redirect if not authenticated)                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Cloudflare Worker (moltbot-sandbox)                         │ │
│  │   - Hono router                                             │ │
│  │   - Auth middleware                                         │ │
│  │   - Proxy to container                                      │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────────┐ │
│  │ Cloudflare Sandbox (Durable Object)                         │ │
│  │   - Container lifecycle                                     │ │
│  │   - Process management                                      │ │
│  │   - R2 storage mounting                                     │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────────┐ │
│  │ Moltbot Container                                           │ │
│  │   - Node.js runtime                                         │ │
│  │   - Clawdbot gateway (port 18789)                           │ │
│  │   - Telegram/Discord/Slack channels                         │ │
│  │   - Claude API integration                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### Cloudflare Worker (`src/index.ts`)

- **Hono router** for HTTP handling
- **Middleware chain:**
  1. Logging
  2. Sandbox initialization
  3. Public routes (before auth)
  4. CF Access authentication
  5. Protected routes
  6. Catch-all proxy to container

### Gateway Process Management (`src/gateway/`)

- **process.ts** - Start/stop/find gateway processes
- **version.ts** - Config hash computation for version tracking
- **env.ts** - Environment variable mapping to container
- **r2.ts** - R2 storage mounting for persistence
- **sync.ts** - Backup sync to R2

### Startup Script (`start-moltbot.sh`)

1. Stores config hash to `/tmp/gateway-config-hash`
2. Restores config from R2 backup if available
3. Generates moltbot config from environment variables
4. Configures AI provider (Anthropic/OpenAI)
5. Configures channels (Telegram/Discord/Slack)
6. Starts clawdbot gateway

### Version-Aware Lifecycle

**Problem solved:** Config changes weren't applied because old gateway kept running.

**Solution:**
1. Compute hash of all config-affecting environment variables
2. Pass hash to container via `CONFIG_HASH` env var
3. Container stores hash in `/tmp/gateway-config-hash`
4. On each request/cron, compare expected vs running hash
5. If mismatch → kill old gateway → start new one

```typescript
// version.ts
const relevantConfig = {
  gatewayToken, aiGatewayApiKey, telegramToken, telegramPolicy, ...
};
const hash = djb2Hash(JSON.stringify(relevantConfig));
```

## Request Flow

### HTTP Request

```
Client → CF Access → Worker → ensureMoltbotGateway() → containerFetch() → Response
```

### WebSocket Request

```
Client → CF Access → Worker → wsConnect() → WebSocket Proxy → Moltbot Gateway
```

### Cron Trigger (every 5 min)

```
Cron → ensureMoltbotGateway() → Check version → Start if needed → syncToR2()
```

## Configuration Hierarchy

1. **Worker secrets** (wrangler secret put)
2. **Worker environment** (wrangler.jsonc)
3. **Container environment** (passed via buildEnvVars)
4. **Moltbot config** (generated in start-moltbot.sh)
5. **R2 backup** (restored on container start)

## Persistence

- **R2 bucket** mounted at `/data/moltbot`
- Contains: `clawdbot/clawdbot.json`, `skills/`, `.last-sync`
- Sync runs on cron (every 5 min)
- Restore runs on container start if R2 is newer
