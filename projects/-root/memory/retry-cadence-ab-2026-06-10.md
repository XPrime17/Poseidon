---
name: retry-cadence-ab-2026-06-10
description: "Active A/B on outbound retry cadence — global switch to ASAP + 6:30pm-ET x3 days, started 2026-06-10"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6cfb44c4-3f56-4d2a-9ffe-e9b10d6e1c79
---

Outbound retry cadence changed for ALL live centres on **2026-06-10** to A/B-test (global before/after, not a concurrent split) against the pre-2026-06-10 baseline. Scott's call.

**New cadence** (4-attempt cap unchanged): attempt 1 ASAP on lead arrival, then attempts 2/3/4 at **6:30pm centre-local on day+1, day+2, day+3**. Old cadence was attempt2=+1hr, attempt3=6:30pm same day, attempt4=2pm next day.

**Where:** single node `Calculate Next Call` in `[TEST] End Of Call - Retry System` (`4p1V0wESn3kZySt6`) — collapsed the 3 timing branches into `dayOffset = attemptCount` → 18:30. The `attemptCount===2` voicemail-message logic (voicemail_left vs voicemail_hangup) was preserved.

**6:30pm fidelity fix:** the Retry Scheduler (`rt0aEuDnFv3ZCl1y`) polls every 90 min, which would drift a 6:30 target toward the 8pm cutoff. Added a deterministic daily cron trigger **"Every Day 6:30pm ET"** (`30 18 * * *`) wired to `Get All Leads` alongside the 90-min poll, and pinned the workflow `settings.timezone = America/New_York`. Had to deactivate→activate the workflow for the new cron to register.

**Phase-in:** leads already `retry_pending` keep their old-scheduled time for the current pending attempt; their NEXT attempt uses the new logic. So the switch rolls in per-attempt, not instantly.

**Revert:** backups at `/root/n8n-backups/{4p1V0wESn3kZySt6,rt0aEuDnFv3ZCl1y}.20260610-031451.json`; old cadence code at `/root/calc-next-call.LIVE.js`. To revert: restore the node jsCode, delete the 6:30pm trigger + sticky, reactivate. Gate must PASS ([[pipeline-regression-gate]]).

**Measuring:** compare booking/contact rate for leads first-dialed ≥2026-06-10 vs before. Volume is low per centre (~7 real leads/2wk at St. Cath), so pool across all live centres and give it weeks. Relates to [[returned-outbound-calls-hit-inbound-agent]] context on outbound behaviour.

**Auto read-out scheduled:** systemd one-shot `retry-ab-readout.timer` (this box) fires **2026-06-24 13:00 UTC (09:00 ET)** → runs `/root/retry-ab-readout/ab_readout.py`, which splits leads by first-dial date (BASELINE 2026-05-27→06-10 vs NEW ≥06-10) across the 6 live outbound agents, excludes test numbers +19052200332/+19059672357/+15555550100, and emails Scott contact-rate + booking-rate + a keep/revert/extend rec. Dry-run today: baseline = 32 leads, 56% contact, 6% booking. Re-run anytime: `python3 ab_readout.py --dry-run`. (Cloud `schedule` skill couldn't be used — no Retell/Gmail connector + no local-file access in the cloud sandbox.)
