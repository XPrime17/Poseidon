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
| CNKB-Kanata | `agent_aac09671305b8903483ceee6df` | outbound |
| CNKB-Barrhaven | `agent_78b3b359c341d2a084a893f161` | outbound |
| EG-Inbound | `agent_17d623c8a8f95fc674288d0e00` | inbound |
| StCatharines-Inbound | `agent_fa924598caf3662856ac3cea3b` | inbound |
| Burlington-Inbound | `agent_7950e8ff24a902abfd3d5b34cc` | inbound |
| Kanata-Inbound | `agent_c3d64fc094dccb0fa486bde5f9` | inbound |
| Leaside-Inbound | `agent_50a754cd5b9ba4ec988c764427` | inbound |
| Pickering-Inbound | `agent_eac2f0557671b9d15543a02a79` | inbound |

For each agent, fetch up to 50 calls with `list_calls`. Filter to calls where `start_time` falls within the last 24 hours from current time.

### Step 2: Filter Out Cekura Tests

Remove **every** call matching ANY of these Cekura-test signals. A single check on `transcript_preview`/`lead_id` is NOT enough — synthetic scenarios like the "Wrong Location – Wants Bayview" test (#141951) carry their tell only in the dynamic variables and otherwise slip through and get reported as real production issues (this is what happened on the 2026-06-06 weekly audit → MED-2 false alarm):

- `transcript_preview` contains `CEKURA_TEST`, OR `lead_id` contains `CEKURA_TEST`
- **`retell_llm_dynamic_variables.first_name == "CEKURA_TEST"`** — pull the call's dynamic vars and check this; it is the most reliable tell
- `retell_llm_dynamic_variables.PHONE == "+15555550100"` — the placeholder test number
- `call_status == "not_connected"` with `duration_ms == 0` — common Cekura artifact

These are automated QA runs, not real leads. The automated daily `audit.py` additionally cross-references the Cekura runs API by `(agent_id, to_number, minute)`; if you have `CEKURA_API_KEY`, do the same — otherwise the signals above catch the vast majority. **Apply this same filter for weekly/ad-hoc audits, not just the daily run.**

### Step 3: Group Retry Chains by `to_number`

**CRITICAL:** Before categorising or counting "X calls to Y", group calls by `to_number` — NOT by name mentioned in transcript. Two different leads can share a first name (e.g., two "Ashleys"). Conflating them produces false retry-cap-breach reports.

For each `to_number` with multiple calls in the window:
- Sort by `start_time` ascending
- Read each call's `metadata.retry_attempt` — this is the canonical attempt counter
- Expected cadence (retry A/B live since 2026-06-10): attempt 1 ASAP, later attempts on the 6:30 PM ET day+1/+2/+3 tick — so **18–36h between attempts is BY DESIGN**, not lag
- Flag if attempt > 4 (cap breach) OR gap 3–18h / >36h (scheduler lag: off-pattern or missed daily tick) OR gap < 60min (premature fire). Do NOT flag 18–36h gaps — that stale rule produced recurring false MEDIUMs through 2026-08-30.

**Known-issues register (`known-issues.json`, next to `audit.py`, added 2026-09-01):** signatures listed there as `fixed` (with `fixed_date`) or `noise` get a ✓ "no action needed" note in the issue row and a subject-line count (e.g. "— all 3 known/fixed, no action needed") instead of the REPEAT escalation, so a scary subject always means something real. A `fixed` signature firing on a run >2 days past its `fixed_date` escalates as **⚠ RECURRED AFTER FIX** — a regression tripwire, never silence. When you fix a recurring audit finding, add its signature (`kind|last-10-digits-of-phone` or `kind|centre`) to the register in the same commit. `AUDIT_DRY_RUN=1` skips both the email and the issue-history write.

When writing the report, NEVER say "X dialled [Name] N times" — say "X dialled [to_number] N times (lead name: [First])". If two different `to_number`s share the same First name, list them as separate chains.

### Step 4: Categorize Calls

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

### Step 5: Issue Detection

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

**FIRST — rule out a Cekura test (see Step 2):** the "Wrong Location – Wants Bayview" regression scenario (#141951) sets `wrong_location_requested: true` on purpose. Before flagging, confirm `retell_llm_dynamic_variables.first_name != "CEKURA_TEST"` and `PHONE != "+15555550100"`. If it's a test, drop it — not a production issue.

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

### Step 6: Compile Report

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

### Step 7: Email Results

Send via Resend HTTP API:
- **To:** `scott.james@codeninjas.com`
- **From:** `onboarding@resend.dev`
- **Subject:** `Daily Call Audit — [DATE] — [X issues found]`
- **Body:** HTML-formatted version of the report above
- **API Key:** in env var `RESEND_API_KEY` (same as `audit.py`) — never hardcode the literal; this repo is public.

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": ["scott.james@codeninjas.com"],
    "subject": "Daily Call Audit — DATE — X issues found",
    "html": "REPORT_HTML"
  }'
```

### Step 8: Report Completion

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
