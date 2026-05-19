---
name: SystemCheck Skill & Recovery Runbook
description: _SYSTEMCHECK skill for health checks AND outage recovery. Contains runbook for recovering backlog leads after system downtime. Updated after April 2026 incident.
type: project
originSessionId: 27476f17-a806-4bd6-87a9-e345b77df934
---
`_SYSTEMCHECK` skill handles two modes: health check (verify all systems) and outage recovery (resume operations).

**Why:** April 2026 incident: Gmail trigger died for 7 days, Retry Scheduler connection broke for weeks, scraper crashed from concurrent requests. 9 backlog leads were lost and required manual recovery.

**How to apply:**
- Say "system check" or "health check" for diagnostics
- Say "recover leads" or "backlog recovery" or "resume operations" after any outage
- Daily automated check runs at 9 AM EDT via scheduled remote agent (`trig_01C22DnX7QHRaxXQbCi6xGiL`)

**Key recovery rules (from painful experience):**
1. Gmail trigger pointer jumps forward on re-auth — backlog emails are SILENTLY SKIPPED
2. NEVER clone production workflows for batch processing (Code node modes, timeouts, expression references break)
3. NEVER use `row_number` as matching column in Google Sheets appendOrUpdate (it's metadata)
4. Append backlog leads directly to sheet as retry_pending — let Retry Scheduler handle calls
5. Gmail `after:` is date-inclusive — use day AFTER outage start to avoid re-processing
6. Check for duplicate lead_ids BEFORE running Retry Scheduler — duplicates corrupt appendOrUpdate
7. Scraper can't handle concurrent Playwright requests — thread lock serializes them

**Scraper files (on this machine):**
- API: `/root/calendar_api.py` (Flask + threading.Lock)
- Extractor: `/root/extract_childcarecrm_fixed4.py` (Playwright, wait_until='commit')
- Service: `calendar-api.service` (systemd, restart with `systemctl restart calendar-api.service`)
