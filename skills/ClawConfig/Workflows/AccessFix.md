# AccessFix Workflow

Fix Cloudflare Access authentication issues blocking public endpoints.

## Symptom

All requests to the worker return `302 Redirect` to `cloudflareaccess.com`, including public endpoints like `/api/status` or `/sandbox-health`.

## Diagnosis

```bash
curl -sS -I "https://moltbot-sandbox.scott-james1717.workers.dev/sandbox-health" | head -5
```

**If you see:**
```
HTTP/2 302
location: https://xxx.cloudflareaccess.com/cdn-cgi/access/login/...
```

Then Cloudflare Access is intercepting ALL requests before they reach the worker.

## Root Cause

The Cloudflare Access Application is configured to protect `/*` (all paths) instead of just protected paths like `/_admin/*`.

**Important:** This is a Cloudflare Access configuration issue, NOT a worker code issue. The redirect happens at the network level before the worker runs.

## Fix Options

### Option 1: Update Access Application Path (Recommended)

1. Go to **Cloudflare Zero Trust Dashboard**: https://one.dash.cloudflare.com/
2. Navigate to **Access** → **Applications**
3. Find the `moltbot-sandbox` application
4. Edit the Application
5. Change the **Application domain** path from `/*` to:
   - `/_admin/*` (only protect admin UI)
   - Or create multiple rules with Bypass for public paths

### Option 2: Add Bypass Policies

1. In the Access Application settings
2. Add **Bypass** policies for public paths:
   - `/sandbox-health`
   - `/api/status`
   - `/debug-public`
   - `/logo.png`
   - `/cdp/*`

### Option 3: Remove Access Protection (Not Recommended for Production)

Only for development/testing:
1. Delete the Access Application entirely
2. Rely on `MOLTBOT_GATEWAY_TOKEN` for authentication

## Verification

After making changes:

```bash
# Should return JSON, not 302
curl -sS "https://moltbot-sandbox.scott-james1717.workers.dev/api/status"
```

Expected:
```json
{"ok": true, "status": "running", "processId": "proc_xxx"}
```

Or:
```json
{"ok": false, "status": "not_running"}
```

## Note on Worker Code

The worker code at `/root/moltworker/src/index.ts` has a public paths check:

```typescript
const publicPaths = [
  '/sandbox-health',
  '/api/status',
  '/debug-public',
  // ...
];
```

But this only works AFTER the request reaches the worker. If Cloudflare Access blocks the request at the network level, the worker never sees it.

**The fix must be made in Cloudflare Zero Trust Dashboard, not in code.**
