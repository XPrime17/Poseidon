---
name: feedback-schedule-via-systemd-timer
description: "Default to systemd timers on the n8n-production droplet for scheduled tasks, NOT the cloud /schedule skill"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e0a2d807-8a9a-40f7-b458-afe81ee530dd
---

For recurring/one-shot scheduled tasks, default to a **systemd timer + service on the n8n-production droplet** (this box, 138.197.171.204) — e.g. the pattern that fired the Retry Cadence A/B read-out (`retry-ab-readout.timer` → `.service` → `/root/.../*.py`, emailed via Resend). Scott confirmed this is the preferred method 2026-06-25.

**Why:** the cloud `/schedule` skill runs in a sandbox with **no Retell/Gmail/n8n connectors and no local-file access**, so it can't drive the pipeline, read backups, or hit Resend. Droplet timers run with full env (`/root/.env` creds), real network, and the actual scripts. Scott liked that it "just worked" and is self-contained.

**How to apply:** when asked to schedule anything (read-outs, canaries, backfills, health checks), create a `.timer` + `.service` pair under `/etc/systemd/system/` invoking a script in `/root/...`. Use `OnCalendar=` (recurring) or a one-shot `OnCalendar=<date>` for single fires; pin `Environment`/timezone as needed; send mail via Resend with `User-Agent: Mozilla/5.0` (Cloudflare 1010). Verify with `systemctl status` + `journalctl -u`. Keep `Description=` to ONE line (multi-line desc caused `Invalid URL, ignoring:` log spam). Reserve cloud `/schedule` only for self-contained tasks needing no connectors/local files. Sibling examples: [[daily-call-audit-droplet]], [[systemcheck-skill]], [[e2e-leadflow-regression-harness-2026-06-24]], [[retry-cadence-ab-2026-06-10]].
