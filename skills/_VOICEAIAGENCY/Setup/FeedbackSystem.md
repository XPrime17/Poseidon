# Centre Feedback System — Setup Guide

Complete setup for collecting, storing, and analyzing centre feedback on voice AI agents.

## Architecture

```
Centre Manager (Google Form)
     |
     v
Google Sheets (auto-populated, free dashboard)
     |
     v (n8n webhook on new row)
Supabase `centre_feedback` table
     |
     v (pulled during Analyze workflow)
FeedbackTracker CLI (trends, analysis)
     |
     v
Prompt optimization recommendations
```

## Components

| Component | Status | Location |
|-----------|--------|----------|
| FeedbackTracker CLI | BUILT | `Tools/FeedbackTracker.ts` |
| n8n Webhook Workflow | BUILT | `n8n/feedback-webhook.n8n.json` |
| Supabase Table DDL | READY | See below |
| Google Form | MANUAL SETUP | See below |
| Analyze Workflow Integration | BUILT | `_CNKB/Workflows/Analyze.md` (Step 0b, 4, 7b) |

---

## Step 1: Create Supabase Table

Run this SQL in the Supabase Dashboard SQL Editor (`https://supabase.com/dashboard/project/uajdbjotlqvyursytlph/sql`):

```sql
CREATE TABLE centre_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  centre_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('specific_call', 'general')),
  caller_reference TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  what_happened TEXT NOT NULL,
  what_should_have_happened TEXT,
  agent_rating INTEGER NOT NULL CHECK (agent_rating BETWEEN 1 AND 5),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by TEXT,
  analyzed BOOLEAN DEFAULT FALSE,
  analyzed_at TIMESTAMPTZ,
  linked_call_id TEXT,
  action_taken TEXT
);

-- Enable RLS
ALTER TABLE centre_feedback ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON centre_feedback
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX idx_feedback_centre ON centre_feedback(centre_id);
CREATE INDEX idx_feedback_analyzed ON centre_feedback(analyzed);
CREATE INDEX idx_feedback_submitted ON centre_feedback(submitted_at DESC);
```

---

## Step 2: Create Google Form

Create a Google Form with these fields:

### Form Title
**Code Ninjas Voice Agent Feedback**

### Form Description
Help us improve the AI calling agent. Your feedback directly influences how the agent is updated.

### Fields

1. **Which centre are you from?** (Dropdown, Required)
   - Canton
   - Pickering
   - East Gwillimbury
   _(Add new centres as they onboard)_

2. **What type of feedback is this?** (Multiple choice, Required)
   - About a specific call
   - General observation about the agent

3. **If about a specific call, what's the caller's name or the date/time of the call?** (Short text, Optional)
   _(Show only when "About a specific call" is selected)_

4. **What category does this fall into?** (Checkboxes - multi-select, Required)
   - Gave wrong information
   - Missed a booking opportunity
   - Caller was frustrated or upset
   - Agent said something weird or confusing
   - Scheduling or time slot issue
   - Agent didn't know the answer to a question
   - Call ended too early or too late
   - Positive feedback - agent did great!
   - Other

5. **How serious is this?** (Multiple choice, Required)
   - Low - minor issue, not urgent
   - Medium - should be fixed soon
   - High - this is hurting our business

6. **What happened?** (Long text, Required)
   _Describe what the agent said or did._

7. **What should have happened instead?** (Long text, Optional)
   _How should the agent have handled this?_

8. **Rate the agent's overall performance (1-5)** (Linear scale, Required)
   - 1 = Very poor
   - 5 = Excellent

9. **Your name** (Short text, Optional)

### Form Settings
- Collect email addresses: OFF (keep it frictionless)
- Limit to 1 response: OFF (allow multiple submissions)
- Response destination: Google Sheets (auto-created)

---

## Step 3: Connect Google Sheets to n8n

### Option A: Google Sheets Trigger (Recommended)

1. In n8n (`http://138.197.171.204:5678`), create a new workflow
2. Add a **Google Sheets Trigger** node:
   - Event: "Row Added"
   - Sheet: The Google Form responses sheet
   - Poll interval: Every 5 minutes
3. Connect to the data transformation and Supabase insert (import `n8n/feedback-webhook.n8n.json` for the transformation logic)

### Option B: Webhook + Apps Script

1. In the Google Form's linked Sheet, go to Extensions > Apps Script
2. Add this trigger script:

```javascript
function onFormSubmit(e) {
  var response = e.namedValues;
  var payload = {
    centre_name: response['Which centre are you from?'][0],
    feedback_type: response['What type of feedback is this?'][0],
    caller_reference: response['If about a specific call, what\'s the caller\'s name or the date/time of the call?'][0] || '',
    categories: response['What category does this fall into?'][0],
    severity: response['How serious is this?'][0].split(' - ')[0],
    what_happened: response['What happened?'][0],
    what_should_have_happened: response['What should have happened instead?'][0] || '',
    agent_rating: parseInt(response['Rate the agent\'s overall performance (1-5)'][0]),
    submitted_by: response['Your name'][0] || ''
  };

  UrlFetchApp.fetch('http://138.197.171.204:5678/webhook/centre-feedback', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}
```

3. Set trigger: On form submit

---

## Step 4: Import n8n Workflow

1. Go to `http://138.197.171.204:5678`
2. Import `n8n/feedback-webhook.n8n.json`
3. Configure the SUPABASE_SERVICE_KEY environment variable in n8n Settings > Variables
4. Activate the workflow

---

## Step 5: Test the Pipeline

```bash
# Test the webhook directly
curl -X POST http://138.197.171.204:5678/webhook/centre-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "centre_name": "Canton",
    "feedback_type": "About a specific call",
    "caller_reference": "Sarah, Feb 10 around 3pm",
    "categories": "Gave wrong information,Agent didn'\''t know the answer",
    "severity": "Medium",
    "what_happened": "Agent said our program costs $175 but we charge $209",
    "what_should_have_happened": "Agent should have said $209 for Create Lite",
    "agent_rating": 3,
    "submitted_by": "Mike"
  }'

# Verify in Supabase
curl -s "https://uajdbjotlqvyursytlph.supabase.co/rest/v1/centre_feedback?order=submitted_at.desc&limit=1" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"

# Or use the FeedbackTracker
bun ~/.claude/skills/_VOICEAIAGENCY/Tools/FeedbackTracker.ts --list --limit 5
```

---

## Step 6: Share Form with Centres

Send each centre manager the Google Form link. Recommend they:
- Bookmark it
- Submit feedback within 24 hours of noticing an issue (while it's fresh)
- Use "specific call" type whenever possible (helps us find the transcript)

---

## Using Feedback in Analysis

The Analyze workflow (CNKB, EMMA, CNEGGPT) now includes:

- **Step 0b**: Pulls unanalyzed feedback for the centre
- **Step 4**: Cross-references centre feedback with transcript findings
- **Step 7b**: Marks feedback as analyzed after review

Run trends anytime:
```bash
bun ~/.claude/skills/_VOICEAIAGENCY/Tools/FeedbackTracker.ts --trends
bun ~/.claude/skills/_VOICEAIAGENCY/Tools/FeedbackTracker.ts --summary
```

---

## Centre ID Mapping

| Centre Name (Form) | centre_id (Supabase) |
|--------------------|---------------------|
| Canton | canton-ma-us |
| Pickering | pickering-on-ca |
| East Gwillimbury | east-gwillimbury-on-ca |

Add new centres to: n8n transformation node + this table + Google Form dropdown.
