# Tech Stack Reference

Platform, telephony, and integration reference for voice AI agent builds.

---

## Voice AI Platforms

### Vapi (Primary Recommendation)

**What it does:** End-to-end voice AI platform — handles STT → LLM → TTS pipeline
**Pricing:** Pay-per-minute (~$0.05-0.15/min depending on models)
**Best for:** Custom builds, complex flows, developer-friendly

| Feature | Details |
|---------|---------|
| STT engines | Deepgram (default), Google, Azure, AssemblyAI |
| LLM support | OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude), custom |
| TTS engines | ElevenLabs, PlayHT, Deepgram, Azure |
| Telephony | Built-in Twilio integration, supports BYO carrier |
| Latency | ~500ms-1.2s first response (with tuning) |
| Function calling | Full tool/function support for booking, CRM, etc. |
| Dashboard | Call logs, transcripts, analytics, cost tracking |

**Key config for low latency:**
```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.3,
    "maxTokens": 150
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "VOICE_ID_HERE",
    "stability": 0.5,
    "similarityBoost": 0.75
  },
  "firstMessage": "Thanks for calling [Business]! How can I help you today?",
  "silenceTimeoutSeconds": 10,
  "maxDurationSeconds": 300,
  "backgroundSound": "office"
}
```

### Retell AI

**What it does:** Voice AI platform focused on natural conversation
**Pricing:** ~$0.07-0.20/min
**Best for:** Agencies wanting managed platform, less DIY

| Feature | Details |
|---------|---------|
| Custom LLM | Retell LLM (hosted) or bring your own |
| Voice | 20+ built-in voices, custom voice cloning |
| Latency | ~800ms-1.5s (slightly higher than Vapi) |
| Integrations | Webhook-based, works with any backend |
| Dashboard | Built-in analytics + call recordings |

### Bland AI

**What it does:** Simple voice AI for high-volume outbound
**Pricing:** ~$0.09/min
**Best for:** Outbound campaigns, appointment reminders, surveys

### Platform Selection Guide

| Criterion | Vapi | Retell | Bland |
|-----------|------|--------|-------|
| **Latency priority** | ✅ Best | Good | Good |
| **Custom integrations** | ✅ Most flexible | Moderate | Limited |
| **Ease of setup** | Moderate | ✅ Easiest | Easy |
| **Outbound calling** | Good | Good | ✅ Best |
| **Cost at scale** | Good | Good | ✅ Cheapest |
| **Voice quality** | ✅ Best (ElevenLabs) | Good | Good |

**Default recommendation:** Vapi for custom agency builds. Retell for clients wanting managed solution. Bland for outbound-only use cases.

---

## Telephony — Twilio

### Setup Checklist
1. Create Twilio account + verify
2. Purchase phone number ($1/mo per number)
3. Configure voice webhook to point to Vapi/Retell
4. Set up call forwarding for transfers
5. Enable call recording (if required)
6. Configure SMS for appointment confirmations

### Key Twilio Settings
```
Voice URL: https://api.vapi.ai/twilio/inbound (for Vapi)
Method: POST
Fallback URL: [your backup/voicemail URL]
Status Callback URL: [your analytics webhook]
```

### Number Porting
- Client wants to keep existing number → port to Twilio (takes 1-3 weeks)
- Alternative: new number + call forwarding from existing (instant)
- Best practice: start with new number, port later once proven

---

## CRM & Automation

### GoHighLevel (GHL)

**What it does:** All-in-one CRM, calendar, pipeline, communication
**Pricing:** $97-497/mo (agency plan allows sub-accounts)
**Integration:** Webhook → GHL API for booking, contact creation, pipeline updates

**Common GHL automations:**
1. Voice agent books → GHL calendar event created
2. New contact created → welcome SMS sent
3. Appointment booked → confirmation email sent
4. No-show → follow-up SMS triggered
5. Call completed → contact tagged for follow-up

### Make (formerly Integromat)

**What it does:** Visual workflow automation (connects any API to any API)
**Pricing:** Free tier (1,000 ops), $9/mo+ for agency use
**Best for:** Connecting Vapi/Retell webhooks to CRM, spreadsheets, email

**Common Make scenarios:**
```
Vapi webhook → Parse call data → Create GHL contact → Book appointment → Send SMS
Vapi webhook → Parse transcript → Log to Google Sheets → Notify Slack
Retell webhook → Check calendar availability → Respond to agent
```

### n8n (Self-Hosted Alternative)

**What it does:** Open-source Make alternative, self-hosted
**Pricing:** Free (self-hosted), $20/mo (cloud)
**Best for:** Technical agencies wanting full control, no per-operation limits

### Calendar Integrations

| Calendar | Integration Method | Notes |
|----------|--------------------|-------|
| Google Calendar | API via Make/n8n | Most common for SMBs |
| Calendly | Webhook + API | Good for service businesses |
| GHL Calendar | Built-in | Best if already on GHL |
| Acuity | API via Make | Good for med spas, salons |

---

## AI Models & Voices

### LLM Selection

| Model | Cost/1K tokens | Speed | Best For |
|-------|---------------|-------|----------|
| GPT-4o-mini | $0.15/$0.60 | Very fast | Default choice — best speed/cost/quality |
| GPT-4o | $2.50/$10.00 | Fast | Complex multi-step conversations |
| Claude 3.5 Haiku | $0.25/$1.25 | Very fast | Alternative to 4o-mini, good at instructions |
| Claude 3.5 Sonnet | $3.00/$15.00 | Fast | Complex reasoning, long conversations |

**Default recommendation:** GPT-4o-mini for 90% of use cases. Upgrade to GPT-4o only for enterprise/complex agents.

### Voice (TTS) Selection

| Provider | Quality | Cost | Latency | Best For |
|----------|---------|------|---------|----------|
| ElevenLabs | ✅ Best | $0.15-0.30/1K chars | ~200ms | Premium agents, natural sound |
| Deepgram Aura | Good | $0.015/1K chars | ✅ Fastest | High volume, cost-sensitive |
| PlayHT | Good | $0.10-0.25/1K chars | ~300ms | Custom voice cloning |
| Azure Neural | Good | $0.016/1K chars | ~250ms | Enterprise, compliance needs |

**Default recommendation:** ElevenLabs for quality-first. Deepgram for cost-first.

### STT (Speech-to-Text) Selection

| Provider | Accuracy | Cost | Latency |
|----------|----------|------|---------|
| Deepgram Nova-2 | ✅ Best | $0.0043/min | ✅ Fastest |
| Google Chirp | Good | $0.006/min | Fast |
| Azure Whisper | Good | $0.006/min | Medium |
| AssemblyAI | Good | $0.0065/min | Fast |

**Default recommendation:** Deepgram Nova-2 — best accuracy, fastest, cheapest.

---

## COGS Reference (Per Call)

Typical cost breakdown for a 2-minute inbound call:

| Component | Cost |
|-----------|------|
| Twilio (telephony) | $0.02 |
| Deepgram STT | $0.009 |
| GPT-4o-mini (LLM) | $0.01-0.03 |
| ElevenLabs TTS | $0.03-0.06 |
| Vapi platform | $0.05-0.10 |
| **Total per call** | **$0.12-0.23** |
| **500 calls/month** | **$60-115/month COGS** |

At $697/month retainer → **~83-91% gross margin**
