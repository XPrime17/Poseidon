# TechStackSetup Workflow

**Configure the voice AI platform, telephony, and integrations for an agent build.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the TechStackSetup workflow to configure the voice AI platform"}' \
  > /dev/null 2>&1 &
```

Running **TechStackSetup** in **Voice AI Agency**...

---

## When to Use

- "Set up Vapi for this agent"
- "Configure the tech stack"
- "What platform should I use?"
- "Connect Twilio / GHL / Make"

---

## Prerequisite Knowledge

**Load before starting:**
- `TechStack.md` — Full platform reference, pricing, configuration

---

## Workflow

### Step 1: Platform Selection

Use AskUserQuestion if not already specified:

| Factor | Vapi | Retell | Bland |
|--------|------|--------|-------|
| Custom inbound | ✅ Best | Good | Limited |
| Outbound campaigns | Good | Good | ✅ Best |
| Ease of setup | Moderate | ✅ Easiest | Easy |
| Cost at scale | Good | Good | ✅ Cheapest |
| Voice quality | ✅ Best | Good | Good |

**Default: Vapi** for agency work.

### Step 2: Configure STT → LLM → TTS Pipeline

**Recommended defaults:**

| Component | Choice | Rationale |
|-----------|--------|-----------|
| STT | Deepgram Nova-2 | Best accuracy, fastest, cheapest |
| LLM | GPT-4o-mini | Best speed/cost/quality balance |
| TTS | ElevenLabs | Best voice quality |
| Background | "office" | Natural ambient sound |

**For cost-sensitive clients:**

| Component | Choice | Savings |
|-----------|--------|---------|
| STT | Deepgram Nova-2 | Already cheapest |
| LLM | GPT-4o-mini | Already cheapest |
| TTS | Deepgram Aura | 10x cheaper than ElevenLabs |

### Step 3: Telephony Setup (Twilio)

1. **New number** or **port existing**
   - New number: Instant, $1/mo — best for pilots
   - Port: 1-3 weeks, keeps existing number — best for full launch

2. **Configure webhook:**
   ```
   Voice URL: https://api.vapi.ai/twilio/inbound
   Method: POST
   Fallback URL: [voicemail or backup system]
   Status Callback: [analytics endpoint]
   ```

3. **Call forwarding for transfers:**
   - Primary transfer: [client's main line]
   - Emergency transfer: [on-call number]
   - After-hours: [voicemail or 24/7 answering]

### Step 4: CRM / Calendar Integration

**GoHighLevel (most common):**
```
Webhook: Vapi → Make/n8n → GHL API
Events:
  - Call completed → Create/update contact
  - Appointment booked → Create calendar event
  - Transfer requested → Log in pipeline
```

**Calendly:**
```
Webhook: Vapi → Make/n8n → Calendly API
Events:
  - Check availability → Calendly slots API
  - Book appointment → Calendly create event
```

**Google Calendar:**
```
Webhook: Vapi → Make/n8n → Google Calendar API
Events:
  - Check slots → Calendar freebusy API
  - Book → Calendar events.insert
```

### Step 5: Function/Tool Setup

Define the tools/functions the voice agent can call:

```json
{
  "tools": [
    {
      "name": "book_appointment",
      "description": "Book an appointment for the caller",
      "parameters": {
        "caller_name": "string",
        "date": "string",
        "time": "string",
        "service": "string"
      }
    },
    {
      "name": "transfer_call",
      "description": "Transfer to a human when needed",
      "parameters": {
        "reason": "string",
        "department": "string"
      }
    },
    {
      "name": "send_confirmation_sms",
      "description": "Send appointment confirmation via SMS",
      "parameters": {
        "phone_number": "string",
        "message": "string"
      }
    }
  ]
}
```

### Step 6: Output Configuration Document

Deliver platform-ready configuration:
1. Platform settings (JSON)
2. Twilio configuration
3. Integration webhook URLs
4. Function definitions
5. Environment variables needed

---

## Agent Delegation

**Riley Nakamura** is the primary named agent for tech configuration. He knows the platforms, APIs, and integration patterns.

---

## Related Workflows

- `BuildAgent.md` — Full build orchestrator (calls this workflow)
- `PromptEngineer.md` — Prompt to load into the platform
- `QaTest.md` — Test after configuration
