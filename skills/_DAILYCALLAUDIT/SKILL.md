---
name: _DAILYCALLAUDIT
description: Daily automated call quality analysis across all Retell agents. Pulls last 24h of calls, filters Cekura tests, detects issues, suggests fixes, emails results. USE WHEN daily call audit, analyze calls, call quality, audit calls, call issues, call review.
---

# _DAILYCALLAUDIT — Daily Call Quality Audit

Automated daily analysis of all Retell voice AI calls. Detects issues, suggests fixes, emails results to Scott.

---

## When This Runs
- **Scheduled:** 9 PM EDT daily via scheduled agent trigger
- **Manual:** Scott says "analyze today's calls" or "daily call audit"

## Execution Steps

### Step 1: Pull Calls (Last 24 Hours)

Fetch calls from ALL 13 agents using `mcp__retell-voice-ai__list_calls`:

| Agent | Agent ID | Type |
|-------|----------|------|
| Emma | `agent_552e57364711f0eec51afa512a` | outbound |
| CNKB-EG | `agent_0c6c32b61cb506fefb6ac247f4` | outbound |
| CNKB-Canton | `agent_f10e56ab67fddf22bd60def599` | outbound |
| CNKB-StoneOak | `agent_cd531f218c39d6125098cf7abc` | outbound |
| CNKB-RoundRock | `agent_d06452d16a225cfbf207890350` | outbound |
| CNKB-Rayford | `agent_9c1c8996e054e87f6b76aa8a0a` | outbound |
| CNKB-Burlington | `agent_075f92a824314e958918af3d9c` | outbound |
| CNKB-Pickering | `agent_9d24e87943bc3b8105261bf308` | outbound |
| CNKB-Leaside | `agent_1f8c2799630cd6524fa8176e6d` | outbound |
| CNKB-Riverside | `agent_ee11bcfc9222c37df4de8bfe95` | outbound |
| CNKB-Sudbury | `agent_ccad25c0d5aab5eac8ce8c2354` | outbound |
| CNKB-StCatharines | `agent_c02bfb40888bba2275ea3a9f3a` | outbound |
| EG-Inbound | `agent_17d623c8a8f95fc674288d0e00` | inbound |

For each agent, fetch up to 50 calls with `list_calls`. Filter to calls where `start_time` falls within the last 24 hours from current time.

### Step 2: Filter Out Cekura Tests

Remove calls where `transcript_preview` contains `CEKURA_TEST` or `lead_id` contains `CEKURA_TEST`. These are automated QA runs, not real leads.

### Step 3: Categorize Calls

For each remaining real call, categorize:

| Category | Criteria |
|----------|----------|
| **Booked** | `appointment_booked: true` |
| **Busy/Callback** | `decline_reason: "busy"` or lead said "call back later" |
| **Not Interested** | `decline_reason: "not_interested"` |
| **Voicemail** | `in_voicemail: true` OR `disconnection_reason: "voicemail_reached"` |
| **Not Connected** | `call_status: "not_connected"` |
| **Inactivity** | `disconnection_reason: "inactivity"` |
| **Conversation (No Book)** | call_successful but no booking |
| **User Hangup** | `disconnection_reason: "user_hangup"` with duration < 15s |

### Step 4: Issue Detection

For each real call, run these checks. Pull full transcript (`get_transcript`) for any call flagged by preliminary checks.

#### 4A. Voicemail Misdetection (HIGH)
**Check:** `in_voicemail: false` AND any of:
- User utterances are short, stilted, flat (pre-recorded pattern)
- Final user utterance is a fragment (single word/number like "Five", "Thanks", partial phone number)
- Same `to_number` hit voicemail on a prior attempt in the same 24h window
- Total user word count < 15 despite call > 30s

**Suggest:** Flag for prompt-level heuristic or post-call reclassification in End Of Call workflow.

#### 4B. Data Capture Gaps (MEDIUM)
**Check on booked calls (`appointment_booked: true`):**
- Missing `child_name` or `Child First Name`
- Missing `child_age` or `Child's Age`
- Missing `tour_date` or `Tour Date`
- Missing `tour_time` or `Tour Time`
- For inbound: missing `caller_name`
- For inbound: missing `caller_email` (note if caller declined to share — not an issue)

**Suggest:** Prompt update to re-ask when non-name response received (e.g., "Got it" → should re-prompt).

#### 4C. Decline Reason Mismatch (LOW)
**Check:** Call where lead explicitly said not interested / already enrolled / stop calling, but `decline_reason` is empty or wrong.
- Look for keywords in transcript: "not interested", "already enrolled", "stop calling", "remove me", "don't call"
- If found AND `decline_reason != "not_interested"` → flag

**Suggest:** Prompt update to improve decline classification.

#### 4D. Fallback Phrase Repetition (LOW)
**Check:** Agent said "I'm having trouble hearing you" or "Are you still there?" 3+ times in one call.

**Suggest:** Add variety to fallback phrases in prompt, or escalate to call-end after 2 attempts.

#### 4E. Wrong Location (MEDIUM)
**Check:** `wrong_location_requested: true` in call analysis.

**Suggest:** Review lead source — may indicate centre routing issue in Gmail plus-addressing.

#### 4F. Pricing Without KB (HIGH)
**Check:** Agent mentioned dollar amounts (patterns like "two hundred", "dollars", "$") AND the call is from an outbound agent.

NOTE: CNKB outbound agents get KB injected dynamically via n8n at call time (`retell_llm_dynamic_variables.knowledge_base` from per-centre Google Doc). Pricing quotes from outbound agents are NOT hallucinations — they come from the centre's KB Google Doc. Only flag if:
- The dollar amount seems unreasonable (< $50 or > $500 for monthly programs)
- Multiple different prices quoted for same program in same call

**Suggest:** Verify the centre's Google Doc KB for accuracy.

#### 4G. Stage Skip (MEDIUM)
**Check on successful outbound calls (>60s):**
- Agent didn't ask about program interest (Stage 1)
- Agent didn't ask "any specific questions?" (Stage 2)
- Agent booked without collecting child age or name (Stage 3 skip)

**Suggest:** Prompt reinforcement on stage flow.

#### 4H. Name Echo Violation (LOW)
**Check:** After collecting child's name, agent repeated the child's actual name (instead of using "your kiddo" / "your child").

**Suggest:** Reminder in prompt — voice AI principle: collect but don't echo free-text fields that pass through ASR.

### Step 5: Compile Report

Structure the report:

```
DAILY CALL AUDIT — [DATE] EDT

═══ SUMMARY ═══
Total Calls: X (Y real, Z Cekura test)
Bookings: X
Voicemails: X
Busy/Callback: X
Not Interested: X
Not Connected: X
Issues Found: X (H high, M medium, L low)

═══ ISSUES ═══

[HIGH] Voicemail Misdetection — [Centre] [Lead Name]
  Call: [call_id] | Duration: Xs | Disconnect: [reason]
  Evidence: [specific pattern detected]
  Suggested Fix: [actionable recommendation]

[MEDIUM] Data Capture Gap — [Centre] [Lead Name]
  Call: [call_id] | Missing: [fields]
  Suggested Fix: [specific prompt change]

... (grouped by severity, then by issue type)

═══ CLEAN CALLS ═══
X calls had no issues detected.

═══ NOTABLE CALLS ═══
[Any calls worth special attention — long duration, unusual patterns, 
 new centres with first calls, etc.]
```

### Step 6: Email Results

Send via Resend HTTP API:
- **To:** `scott.james@codeninjas.com`
- **From:** `onboarding@resend.dev`
- **Subject:** `Daily Call Audit — [DATE] — [X issues found]`
- **Body:** HTML-formatted version of the report above
- **API Key:** `re_jZ1fNYUk_Nb3DrrinayxqTTMGYtyMiKCj`

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_jZ1fNYUk_Nb3DrrinayxqTTMGYtyMiKCj' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": ["scott.james@codeninjas.com"],
    "subject": "Daily Call Audit — DATE — X issues found",
    "html": "REPORT_HTML"
  }'
```

### Step 7: Report Completion

After sending email, output a brief summary to the conversation (if interactive) confirming:
- Email sent successfully (include Resend ID)
- Count of calls analyzed
- Count and severity of issues found
- Any calls that need immediate attention

---

## Issue Severity Guide

| Severity | Meaning | Action |
|----------|---------|--------|
| **HIGH** | Directly impacts lead experience or gives wrong info | Fix within 48h |
| **MEDIUM** | Data quality gap or minor UX issue | Fix within 1 week |
| **LOW** | Cosmetic or analytics gap | Batch with next prompt update |

## Edge Cases

- **Zero calls in 24h:** Report this fact — may indicate pipeline issue (Gmail trigger stuck, n8n down). Suggest running _SYSTEMCHECK.
- **Only Cekura calls:** Report that no real calls occurred. Not necessarily an issue.
- **Agent with no calls for 7+ days:** Flag as "inactive centre" — may need investigation.
