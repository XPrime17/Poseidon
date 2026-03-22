# Lead Reactivation & Speed-to-Lead System

## Architecture (UPDATED 2026-03-06 — n8n ONLY)

**The Cloudflare Worker has been ABANDONED.** All retry logic now lives in n8n workflows on `xprime17.app.n8n.cloud`, using Google Sheets as the state store.

### Active Flow (UPDATED 2026-03-12)
```
CN Form → n8n "Outbound Call Flow - Multicentre" → CNKB (1st call)
    ↓ call ends
Retell webhook → n8n "[TEST] End Of Call - Retry System"
    ↓
    Filter: only process "call_analyzed" event
    ↓
    Call Successful? (call_analysis.call_successful)
      ├─ TRUE → Wrong Location? → Appointment flow / Update Lead - Completed
      └─ FALSE → Switch on disconnection_reason:
            ├─ voicemail_reached → Lookup Centre for Retry → Calculate Next Call → Retry
            ├─ dial_no_answer OR user_declined → Lookup Centre for Retry → Calculate Next Call → Retry
            ├─ agent_hangup → Decline Reason Check:
            │     ├─ decline_reason="busy" → Retry (lead couldn't talk)
            │     └─ decline_reason="not_interested" → Update Lead - Completed (no retry)
            └─ fallback → Outcome Unsuccessful email (no retry, no sheet update!)
    ↓
n8n "Retry Scheduler" picks up retry_pending leads every 15 min
```

### Key n8n Workflows (on xprime17.app.n8n.cloud)
| Workflow | ID | Status | Purpose |
|----------|----|--------|---------|
| Outbound Call Flow - Multicentre | `6sPwo7ngPyTWfmwM` | **ACTIVE** | Initial calls + retry pickup |
| [TEST] End Of Call - Retry System | `4p1V0wESn3kZySt6` | **ACTIVE** | Post-call routing, retry scheduling |
| Lead Reactivation - Call Scheduler | `MUwF0o7FrEEV5y6B` | INACTIVE | Old scheduler (superseded) |
| [DEV] End Of Call + Retry Bridge | `bZpmw7W3GkgAnaZ3` | INACTIVE | Old Worker bridge (superseded) |

### Retry Cadence (Inbound/Speed-to-Lead — 4 attempts)
- Attempt 1: Immediate (n8n Outbound Call Flow)
- Attempt 2: +1 hour (clamped to 9am-8pm calling hours)
- Attempt 3: 6:30pm same day (or 9am next day if already evening)
- Attempt 4: +1 day at 2pm
- Then: exhausted

### Retry Cadence (Reactivation — 3 attempts)
- Attempt 1: Scheduled by cron
- Attempt 2: +1 day, different window
- Attempt 3: +2 days, different window
- Then: exhausted

### State Store: Google Sheets (Leads MasterSheet)
Key columns: `lead_id`, `status`, `attempt_count`, `next_call_after`, `last_call_at`, `last_outcome`, `call_windows_tried`
Statuses: `pending`, `calling`, `retry_pending`, `completed`, `exhausted`

### Gmail Trigger
- Test workflow uses subject filter: `ALPHA_1`
- Production uses: `New CORE Inquiry`
- **GOTCHA:** Gmail trigger gets stuck after workspace downtime. Fix: deactivate/reactivate the workflow.
- Polls every 1 minute (`everyMinute` mode)

## Cloudflare Worker (ABANDONED — 2026-03-06)
- Code still in `/root/lead-reactivation-github/` but NOT the active system
- Worker URL: `https://lead-reactivation.scott-james1717.workers.dev` — still deployed but unused
- `TEST_MODE = "true"` in wrangler.toml — was routing to test phone `+19059672357`
- Worker had its own retry logic in `src/lib/retry.ts` and used Supabase as state store
- **Do NOT check Worker status or Supabase for lead retry state** — use n8n + Google Sheets

## ChatDash Integration
- One Retell agent clone per centre → one ChatDash agent per client
- **ChatDash API key:** `CD.1c0708fa4744841e82e9a0253be0ef0c` (agency profile)
- Canton VALIDATED (2026-02-22): 100% pass, 5/5 all metrics
- **Client IDs:** StoneOak=`699b95470ba4ecf14090cc5a`, RoundRock=`699b95620ba4ecf14090cd0c`, Rayford=`699b95670ba4ecf14090cd4a`, Pickering=`699b956d0ba4ecf14090cd9a`
- Canton ChatDash agent: `6998716d34ff0eb25cde47fe`
- Leaside ChatDash agent: `699bd4f622a7590562b0428f`
- **Burlington NOT onboarded** — still shares source ChatDash ID
- Agent-per-client rule: Since Sept 2025, one agent = one client (no sharing)
- Partner discount: 40% off annual Premium/Growth via retellai.com/app-partner/chatdash
- Onboarding checklist: `docs/CHATDASH-ONBOARDING.md` in lead-reactivation repo

## Latency Analysis (2026-03-07)
- Average response time: 3-5s across Sudbury and Canton calls
- Worst spikes: 6-7s (KB lookups, schedule generation)
- Bottleneck: GPT-4.1 inference, not TTS or network
- Source prompt: 27,858 chars (contributes to latency)
- Potential fixes: responsiveness setting, shorter prompt, pre-canned responses for common questions

## Pending Manual Steps
- **Sudbury ChatDash:** Create agent + client + assign
- **Sudbury Cekura cron:** Wed 6:40 AM ET (create via dashboard)
- **Burlington ChatDash:** Not onboarded yet
- **Riverside Twilio:** Still on shared xprime trunk (onboarded before sub-account automation)
- **Riverside ChatDash:** Create agent + client
- **Hiya registration:** Riverside `+12036484197`
