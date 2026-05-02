---
name: Daily Call Audit (droplet)
description: Daily call audit migrated from Anthropic-cloud to droplet systemd timer on 2026-04-29
type: project
originSessionId: 46a6a10a-203d-485f-b391-cd2271be6cdd
---
# Daily Call Audit — Droplet Architecture (2026-04-29)

The audit moved from Anthropic-cloud scheduled agent → systemd timer on the n8n droplet.

**Why:** Cloud agent silently failed every night because `curl` POSTing to `api.resend.com` got Cloudflare-1010 403'd (default `curl`/`python-urllib` User-Agent is blocked). No alerts, no logs Scott could read. Cost ~$3-15/month for what is mostly a deterministic ETL job.

**Hybrid LLM pass (added 2026-05-01):** Connected calls >15s now get full transcript fetched and sent to Sonnet 4.6 via Anthropic API for fuzzy issue review (STAFF_DEFLECTION, AGE_GATE_ERROR, BOOKING_FUMBLE, NAME_ECHO, etc.). Capped at `AUDIT_LLM_MAX_CALLS` (default 20) per run. Key sourced from `/root/.claude/.env` via systemd `EnvironmentFile=`.

**How to apply:** When updating the audit, edit `/root/daily-call-audit/audit.py` and `systemctl restart daily-call-audit.timer` is NOT needed (timer just fires the service). To force a run: `systemctl start daily-call-audit.service`. Logs: `journalctl -u daily-call-audit.service -n 100`. Artifacts in `/var/log/daily-call-audit/audit-*.html` + `latest.html`.

## Files
- `/root/daily-call-audit/audit.py` — main script (Python stdlib only)
- `/etc/systemd/system/daily-call-audit.service` — oneshot
- `/etc/systemd/system/daily-call-audit.timer` — `OnCalendar=*-*-* 01:00:00 UTC` (= 9 PM EDT / 8 PM EST)

## Cloudflare-1010 trap
Any HTTP POST to `api.resend.com` MUST set `User-Agent: Mozilla/5.0 (...)` or it 403s with Cloudflare error 1010. Same gotcha will hit any future n8n HTTP node, curl invocation, or scripted send.

## Retired cloud routine
`trig_01DTTBcgns1s4nGDD3EvhPkG` — enabled=false, renamed "RETIRED (moved to droplet 2026-04-29)". Do NOT re-enable; if needed, delete via https://claude.ai/code/routines.

## DST handling
Cron is fixed at 01:00 UTC. In Nov when EDT→EST, this becomes 8 PM EST instead of 9 PM EDT. If Scott wants to keep it at 9 PM local year-round, switch the timer to `OnCalendar=*-*-* 21:00 America/Toronto` and reload.
