# Deploy Workflow

Deploy Moltbot changes to Cloudflare.

## Prerequisites

- CLOUDFLARE_API_TOKEN (ask user if not available)
- Changes committed or ready to deploy

## Steps

### 1. Build the Project

```bash
cd /root/moltworker && npm run build
```

Verify build completes without errors.

### 2. Deploy to Cloudflare

```bash
CLOUDFLARE_API_TOKEN=<token> npx wrangler deploy
```

**If token not available:** Ask user to provide CLOUDFLARE_API_TOKEN.

### 3. Verify Deployment

Look for in output:
- `Uploaded moltbot-sandbox` - Worker code uploaded
- `Current Version ID: xxx` - New version deployed
- Container image changes (if Dockerfile or start-moltbot.sh changed)

### 4. Post-Deploy Notes

After deployment:
- Durable Object may reset, killing existing gateway
- Next cron tick (every 5 min) or request will start fresh gateway
- Config hash ensures new config is applied

## Output

Report to user:
- Version ID
- Whether container image was updated
- URL: https://moltbot-sandbox.scott-james1717.workers.dev
- Note about gateway restart timing
