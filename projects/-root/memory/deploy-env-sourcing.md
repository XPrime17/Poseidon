---
name: deploy-env-sourcing
description: "n8n/Retell deploy creds live in /root/.env; the Bash tool shell doesn't auto-load it"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1a67023f-0c20-4946-b9ff-54ae4799cbad
---

The droplet's deploy credentials live in **`/root/.env`**: `N8N_API_KEY` (n8n cloud, `https://xprime17.app.n8n.cloud/api/v1`, sent as `X-N8N-API-KEY`) and `ELEVENLABS_API_KEY`. The `deploy-*.py` scripts read `os.environ["N8N_API_KEY"]` but do **not** load `.env` themselves, and nothing sources it in `.bashrc`/`.profile`.

The Claude Code **Bash tool spawns a fresh non-login shell per call and shell state does NOT persist between calls** — so `N8N_API_KEY` is absent unless you load it in the *same* command. This is not "lost n8n access"; there is no persistent n8n session, just a missing env var.

**Always prefix n8n/Retell deploy commands inline:**
```
set -a; . /root/.env 2>/dev/null; set +a
python3 /root/deploy-*.py
```

Note: `RETELL_API_KEY` lives in **`/root/.claude/.env`** (verified 2026-08-20), not `/root/.env` — source whichever file has the key you need. That file's `EMAIL_SEND_WEBHOOK_URL` was unquoted with `&` chars (sourcing spawned stray background jobs and truncated the var) — quoted 2026-08-20; keep multi-param URLs quoted. Never commit literal keys: the memory dir and kb-crawler are public GitHub. See [[feedback-no-credentials-in-memory]]. Related: [[eg-inbound-camp-handoff-2026-06-15]].
