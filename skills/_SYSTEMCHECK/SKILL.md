---
name: _SYSTEMCHECK
description: Verify all lead reactivation systems are healthy AND recover from outages. USE WHEN system check, health check, verify system, check systems, is everything working, system status, pipeline check, lead system check, verify pipeline, system down, recover leads, backlog recovery, resume operations.
---

# _SYSTEMCHECK -- Lead Reactivation System Health & Recovery

Two modes: **health check** (verify everything is working) and **recovery** (resume operations after an outage).

---

## Mode 1: Health Check

Run a comprehensive health check across all lead reactivation infrastructure. Use after making changes to workflows, credentials, or agent configs.

### What Gets Checked

#### 1. n8n Workflow Health
Check execution recency and duration for all essential workflows:

| Workflow | ID | Healthy Signal |
|----------|-----|----------------|
| Outbound Call Flow | `6sPwo7ngPyTWfmwM` | Last success <24h |
| Retry Scheduler | `rt0aEuDnFv3ZCl1y` | Last execution >1s duration (reads sheet) |
| End Of Call | `4p1V0wESn3kZySt6` | Workflow active |
| Orphan Sweep | `H7sxzNFsME4wkeJp` | Last success <3h |
| Heartbeat Monitor | `tjV2GzfUksyS4t4m` | Workflow active |

#### 2. Google Sheets Health
- Read the Leads MasterSheet (`1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`, sheet: "All Centres")
- Check for leads stuck at `status=calling` for >2 hours (orphans)
- Check for `retry_pending` leads older than 7 days (stale retries)
- Check for leads with empty status (incomplete processing)
- **Check for duplicate lead_ids among active leads** (retry_pending/calling) — duplicates break `appendOrUpdate` matching

#### 3. Retell API Health
- List agents to verify API key is valid
- Confirm all 11 CNKB agents + Emma are accessible

#### 4. Connection Integrity
- Verify all n8n workflow connections match node names (the rename bug)
- Check trigger nodes have outgoing connections

#### 5. Scraper Health (NEW)
- Check `calendar-api.service` status: `systemctl status calendar-api.service`
- Verify tasks count < 100 and memory < 500MB (Playwright leak detection)
- Test a single scraper request: `curl -s -X POST http://138.197.171.204:5001/extract-calendar -H "Content-Type: application/json" -d '{"calendar_url": "https://www.codeninjas.com/east-gwillimbury-on-ca/schedule-tour", "location_id": "EG"}' -m 60`
- If tasks > 1000 or memory > 500MB: `systemctl restart calendar-api.service`

### Dashboard Format

```
SYSTEM HEALTH CHECK — {date} {time}
============================================

n8n WORKFLOWS
[PASS/FAIL] Outbound Call Flow    -- last exec: Xh ago, status: success
[PASS/FAIL] Retry Scheduler       -- last exec: Xh ago, duration: Xs
[PASS/FAIL] End Of Call            -- active: true/false
[PASS/FAIL] Orphan Sweep           -- last exec: Xh ago
[PASS/FAIL] Heartbeat Monitor      -- active: true/false

CONNECTION INTEGRITY
[PASS/FAIL] Outbound Call Flow    -- OK / broken keys: [...]
[PASS/FAIL] Retry Scheduler       -- OK / broken keys: [...]

GOOGLE SHEETS
[PASS/FAIL] Sheet readable         -- X leads loaded
[PASS/FAIL] No stuck leads         -- X at calling >2h
[PASS/WARN] Stale retries          -- X retry_pending >7d
[PASS/FAIL] No empty statuses      -- X with blank status
[PASS/FAIL] No active duplicates   -- X duplicate lead_ids among active leads

RETELL API
[PASS/FAIL] API accessible         -- X agents found

SCRAPER
[PASS/FAIL] Service running        -- tasks: X, memory: XMB
[PASS/FAIL] Extraction test        -- X slots in Xs

SCORE: X/Y PASS | X FAIL | X WARN
```

---

## Mode 2: Outage Recovery Runbook

**When to use:** After ANY system downtime — Gmail trigger died, n8n cloud went down, credentials expired, etc.

### Step 1: Diagnose the Outage

Run the health check first. Identify WHICH system(s) failed and WHEN.

**Key timestamps to establish:**
- `OUTAGE_START`: When did the system stop processing? (Check last successful execution time)
- `OUTAGE_END`: When was the system restored? (After credential re-auth, workflow fix, etc.)
- `OUTAGE_DURATION`: How long were leads accumulating without processing?

### Step 2: Fix the Root Cause

| Failure | Fix |
|---------|-----|
| Gmail OAuth expired | Re-auth in n8n UI → deactivate/reactivate workflow |
| Retry Scheduler connection broken | Update connections map via n8n API (match node names) |
| Scraper memory leak | `systemctl restart calendar-api.service` |
| Scraper page.goto timeout | Check `/root/extract_childcarecrm_fixed4.py` wait_until setting |
| Google Sheets credential expired | Re-auth in n8n UI |

### Step 3: Identify Backlog Leads

**CRITICAL: Gmail trigger pointer advances on re-auth.** It resumes from "now", NOT from where it left off. Backlog emails are silently skipped.

To find backlog leads:

1. Create a temp n8n webhook workflow with a Gmail node (`operation: getAll`, `simple: false`)
2. Search query: `subject:"New CORE Inquiry" after:YYYY/MM/DD before:YYYY/MM/DD`
   - `after:` = day AFTER outage started (inclusive! `after:2026/04/03` includes Apr 3)
   - `before:` = day outage ended (exclusive)
3. Cross-reference with existing sheet leads to find UNPROCESSED emails
4. **Important:** Exclude emails from dates that WERE processed before the outage

### Step 4: Recover Backlog Leads

**DO NOT clone the production Outbound Call Flow.** It has per-item assumptions that break with batch processing:
- Code nodes default to `runOnceForAllItems` (drops items when >1)
- `executionTimeout: 90` (too short for batch)
- Gmail Trigger references in expressions

**Instead, append leads directly to the sheet:**

1. Extract lead data from backlog emails (name, phone, email, centre_id)
2. Use Google Sheets API `values:append` to add rows with:
   ```
   centre_id, FALSE, lead_id, First, Last, Phone, Email, "", "", "", "", "retry_pending", "0", next_call_after, "backlog_recovered"
   ```
   - `lead_id` format: `FirstName-Phone` (must be unique in the sheet)
   - `next_call_after`: Set to next 9 AM local time for the centre
3. The Retry Scheduler will pick them up automatically during business hours

**Verify before appending:**
- No duplicate lead_ids exist in the sheet for these leads
- Centre IDs are valid (exist in Centre Lookup Sheet)

### Step 5: Verify Recovery

Run the health check again. Confirm:
- 0 stuck calling leads
- Backlog leads visible as retry_pending
- Retry Scheduler duration > 1s on next run
- No duplicate lead_ids among active leads

### Step 6: Monitor First Retry Cycle

Watch the next Retry Scheduler execution to verify:
- Filter Eligible picks up backlog leads
- Get Availability succeeds (scraper healthy)
- Retell calls are placed
- End Of Call webhook updates the sheet

---

## Known Failure Modes (from April 2026 incident)

### 1. Gmail Trigger Silent Death
**Symptom:** Outbound Call Flow shows `active: true` but last execution is days old.
**Cause:** OAuth token expired/revoked. Google Cloud Console "Testing" mode expires tokens in 7 days. Even "Production" mode can revoke tokens.
**Fix:** Re-auth Gmail credential in n8n UI → deactivate/reactivate workflow.
**Prevention:** Heartbeat Monitor workflow alerts if no execution in 24h.

### 2. Retry Scheduler Zero-Duration Runs
**Symptom:** Execution completes in 0.0s (only trigger node runs, nothing downstream).
**Cause:** Node renamed via API without updating connection keys. n8n connections reference nodes BY NAME.
**Fix:** GET workflow JSON, find mismatched keys in `connections`, rename to match current node names, PUT back.
**Rule:** When renaming n8n nodes via API, ALWAYS update the connections map too. The n8n UI does this automatically; the API does NOT.

### 3. Scraper Playwright Crashes
**Symptom:** Get Availability returns 500 with "Timeout exceeded" for ALL centres.
**Cause:** Concurrent Playwright requests exhaust memory. Or `wait_until='domcontentloaded'` fails on pages with blocking scripts.
**Fix:** `systemctl restart calendar-api.service`. Verify `threading.Lock()` is in `/root/calendar_api.py`. Verify `wait_until='commit'` in `/root/extract_childcarecrm_fixed4.py`.

### 4. Duplicate lead_id Corruption
**Symptom:** "Multiple matches found" errors in Google Sheets appendOrUpdate nodes.
**Cause:** Failed batch operations or cloned workflows appending duplicate rows.
**Fix:** Neutralize duplicates: set `lead_id=""` and `status="completed"` on non-canonical rows. Use Google Sheets API `values:batchUpdate` to update specific cells by range (e.g., `'All Centres'!C<row>` for lead_id, `'All Centres'!L<row>` for status).
**Prevention:** NEVER use `row_number` as a matching column (it's n8n metadata, not a real sheet column). NEVER clone production workflows for batch processing.

### 5. Reset Lead on Error Empty lead_id
**Symptom:** Retell error branch outputs items with empty lead_id → Reset Lead on Error matches random rows.
**Cause:** Items flowing through Merge KB + Slots → Retell lose the original lead data context.
**Fix:** Reset Lead on Error was disconnected. The Orphan Sweep catches stuck `calling` leads every 2 hours instead.

---

## API References

- **n8n Cloud API**: `https://xprime17.app.n8n.cloud/api/v1/`
- **n8n API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzE0ODRiZS1mNjg1LTQ3M2EtYmUxNC0xOTZkOTdlZDE0YTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4NjY3MDI5fQ.Ky5Z-77U6ldB6STvg7JJ4ULXb58Htdt7L-QUCwhI0Yk`
- **Leads MasterSheet**: `1ExfXo3eVDcMMgsifXZdMTAcJI4WJ0OzcrKO24ptiJ5A`
- **Sheet name**: `All Centres`
- **Google Sheets Read Credential (n8n)**: `ybuxqM8F2NkyCA7e`
- **Google Sheets Write Credential (n8n)**: `yjVHcEWrpyDmxkvv`
- **Gmail Credential (n8n)**: `x1W7EpNhmEdx8cOR`
- **Scraper API**: `http://138.197.171.204:5001/extract-calendar` (local, same machine)
- **Scraper service**: `calendar-api.service` (systemd)
- **Scraper code**: `/root/calendar_api.py` + `/root/extract_childcarecrm_fixed4.py`

## Google Sheets Column Layout (All Centres)

A=centre_id, B=testing, C=lead_id, D=First, E=Last, F=Phone, G=Email, H=Tour, I=Date, J=Time, K=CRM Confirm, L=status, M=attempt_count, N=next_call_after, O=last_outcome, P=last_call_at

## n8n API Gotchas

1. **`active` is read-only on PUT.** Use `/activate` and `/deactivate` endpoints.
2. **Strip before PUT:** `updatedAt`, `createdAt`, `id`, `description`, `isArchived`, `meta`, `pinData`, `versionId`, `activeVersionId`, `versionCounter`, `triggerCount`, `shared`, `activeVersion`, `active`, `tags`, `availableInMCP`, `timeSavedMode`
3. **`appendOrUpdate` matching:** Only works on REAL sheet columns. `row_number` is n8n metadata — matching on it causes silent append instead of update.
4. **Node rename = connection break** when done via API. Connections map uses node names as keys.
5. **Gmail `after:` is date-inclusive.** `after:2026/04/03` includes April 3rd emails.
6. **Temp webhook workflows:** Create → activate → trigger → deactivate → delete. The `responseMode: "onReceived"` returns immediately while workflow runs in background.
