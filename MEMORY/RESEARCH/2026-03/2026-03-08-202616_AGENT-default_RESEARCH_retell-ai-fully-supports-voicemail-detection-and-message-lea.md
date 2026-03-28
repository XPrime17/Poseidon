---
capture_type: RESEARCH
timestamp: 2026-03-08 20:26:16 PST
executor: default
agent_completion: Retell AI fully supports voicemail detection and message-leaving via API.
---

# RESEARCH: Retell AI fully supports voicemail detection and message-leaving via API.

**Agent:** default
**Completed:** 2026:03:08:202616

---

## Agent Output

I now have all the information needed. Here is the complete research report.

---

SUMMARY: Complete research on Retell AI's voicemail detection (AMD) capabilities, API configuration, and practical limitations.

ANALYSIS:

## 1. Does Retell Support AMD (Answering Machine Detection)?

**Yes.** Retell AI has built-in voicemail/answering machine detection. It is NOT traditional telephony AMD (which relies on carrier-level tone detection) -- it is Retell's own real-time audio analysis that runs during the first 3 minutes of a call and adds under 30ms of latency.

Key facts:
- Detection runs continuously within a configurable timeout window (default 30 seconds, max 3 minutes)
- Phone calls only -- not available for web calls
- Also includes separate **IVR detection** (automated phone menu detection) which is a distinct feature from voicemail detection

## 2. Can a Retell Agent Detect Voicemail and Leave a Pre-Configured Message?

**Yes.** When voicemail is detected, you can configure one of four actions via the `voicemail_option` parameter:

| Action Type | Behavior |
|---|---|
| `hangup` | Immediately disconnects the call, even if the voicemail greeting is still playing |
| `static_text` | Waits for the beep, then speaks a fixed text message (supports dynamic variables like `{{user_name}}`) |
| `prompt` | Waits for the beep, then generates a dynamic message via the LLM based on instructions you provide |
| `bridge_transfer` | Transfers the call when voicemail is detected |

**Example static_text:** "Hi, this is Emma from Code Ninjas. We tried reaching you about your child's enrollment. Please call us back at your convenience."

**Example prompt:** "Summarize why we called and ask them to call back, keeping it under 20 seconds."

## 3. Configuration Level -- Where Is This Set?

Voicemail detection is configurable at **two levels**:

### A. Agent Level (Dashboard or Create/Update Agent API)

Three parameters on the agent object:

```json
{
  "enable_voicemail_detection": true,
  "voicemail_detection_timeout_ms": 30000,
  "voicemail_option": {
    "action": {
      "type": "static_text",
      "text": "Hi {{user_name}}, please give us a callback."
    }
  }
}
```

| Parameter | Type | Default | Range |
|---|---|---|---|
| `enable_voicemail_detection` | boolean | false | -- |
| `voicemail_detection_timeout_ms` | integer | 30000 (30s) | 5000 - 180000 (5s to 3min) |
| `voicemail_option` | object or null | null | See action types above |

### B. Per-Call Override (Create Phone Call API)

You **can** override voicemail settings on a per-call basis using the `agent_override` field in the Create Phone Call API:

```json
{
  "from_number": "+12494492726",
  "to_number": "+1XXXXXXXXXX",
  "override_agent_id": "agent_552e57364711f0eec51afa512a",
  "agent_override": {
    "enable_voicemail_detection": true,
    "voicemail_detection_timeout_ms": 60000,
    "voicemail_option": {
      "action": {
        "type": "static_text",
        "text": "Hi, this is Emma. Please call us back."
      }
    }
  }
}
```

This means you can dynamically change voicemail behavior per call without modifying the base agent -- critical for the lead reactivation system where different retry attempts might want different voicemail strategies.

**Note:** The Retell dashboard UI also supports configuring this under Agent > Call Settings > Voicemail Detection, but the API gives full programmatic control.

## 4. Known Limitations and Gotchas

**Detection Window:** Voicemail detection only runs for the first 3 minutes. If voicemail kicks in after 3 minutes (rare but possible in some B2B IVR chains), it will not be detected.

**False Positives:** The detection can trigger on long-playing hold music or extended greetings. B2B calls with welcome messages before voicemail are particularly vulnerable. Mitigation: increase `voicemail_detection_timeout_ms` beyond the default 30 seconds (e.g., 60000ms).

**IVR vs Voicemail Confusion:** If a call hits an IVR system (press 1 for sales, etc.), it may be classified as `ivr_reached` rather than `voicemail_reached`. These are separate detection systems. You need to enable **IVR Hangup** separately if you also want to handle automated menus.

**Disconnect Reasons:** When voicemail is detected, the call's disconnect reason will be `voicemail_reached`. When IVR is detected, it will be `ivr_reached`. These are distinct from normal `agent_hangup` or `user_hangup` reasons -- important for your n8n post-call webhook routing.

**Phone Calls Only:** Voicemail detection is exclusively for phone calls. It does not work on web-based calls.

**Latency Impact:** Adds under 30ms of latency, which is negligible.

**Timeout Behavior:** If the detection timeout is reached without detecting voicemail, the system stops detection and continues the call normally. The agent then behaves as if voicemail detection was never enabled.

**Static vs Dynamic Messages:** Static text (`static_text`) is more predictable but less personalized. Prompt-based (`prompt`) messages use the LLM to generate content, which adds slight latency and unpredictability but allows context-aware messages.

## 5. Recent Updates

Retell's changelog shows voicemail detection was introduced alongside IVR navigation and SIP trunking support. They have since improved voicemail detection performance according to subsequent changelog entries. The feature is now mature and part of the standard agent configuration.

## Relevance to Your Architecture

For the lead reactivation system (Outbound Call Flow - Multicentre), here is what matters:

1. **Enable voicemail detection on all CNKB agents** -- either via dashboard or API update to each agent
2. **Use `agent_override` in the n8n Create Phone Call node** to dynamically set voicemail messages per call (e.g., include the parent's name via `retell_llm_dynamic_variables`)
3. **Handle `voicemail_reached` in the post-call webhook** -- your End Of Call retry system should treat voicemail-reached calls differently from no-answer or human-answered calls
4. **Consider different strategies per retry attempt** -- first attempt might leave a voicemail, subsequent attempts might just hang up to avoid multiple voicemails

RESULTS: Retell AI fully supports voicemail detection and voicemail-leaving at both the agent level and per-call override level via API. Four action types are available: hangup, static_text, prompt, and bridge_transfer.

STATUS: Research complete. All five questions answered with verified data from official Retell documentation.

CAPTURE: Retell voicemail detection parameters: `enable_voicemail_detection` (bool), `voicemail_detection_timeout_ms` (5000-180000, default 30000), `voicemail_option` with action types: hangup, static_text, prompt, bridge_transfer. Overridable per-call via `agent_override`. Disconnect reason: `voicemail_reached`. Phone calls only. Under 30ms latency.

NEXT:
1. Enable voicemail detection on all CNKB agents (can be done via Retell API bulk update)
2. Update n8n Outbound Call Flow to include `agent_override` with voicemail settings
3. Update End Of Call webhook to handle `voicemail_reached` disconnect reason
4. Decide voicemail strategy: static message vs dynamic prompt, and whether to vary by retry attempt

STORY EXPLANATION:
1. Retell AI has native answering machine detection built into its platform, running real-time audio analysis during the first 3 minutes of every outbound phone call.
2. Three API parameters control the feature: `enable_voicemail_detection` (on/off), `voicemail_detection_timeout_ms` (how long to scan), and `voicemail_option` (what action to take).
3. Four action types are supported when voicemail is detected: immediately hang up, speak a fixed static text message, generate a dynamic LLM-powered message from a prompt, or bridge transfer the call.
4. Configuration lives at the agent level but can be overridden per-call using the `agent_override` field in the Create Phone Call API -- critical for dynamic lead reactivation workflows.
5. The system distinguishes between voicemail detection and IVR detection, producing different disconnect reasons (`voicemail_reached` vs `ivr_reached`) that your post-call webhook can route on.
6. Known gotchas include false positives on B2B welcome messages (mitigated by increasing timeout), the 3-minute detection window ceiling, and the fact that this only works for phone calls.
7. For the CNKB lead reactivation system, the practical path is enabling detection on agents, passing dynamic voicemail text via `agent_override` in n8n, and adding `voicemail_reached` handling to the End Of Call retry logic.
8. The feature is mature, adds under 30ms latency, and is fully API-accessible -- no dashboard-only limitation for the core configuration parameters.

COMPLETED: Retell AI fully supports voicemail detection and message-leaving via API.

Sources:
- [Handle voicemail and IVR - Retell AI](https://docs.retellai.com/build/handle-voicemail)
- [Create Voice Agent API - Retell AI](https://docs.retellai.com/api-references/create-agent)
- [Create Phone Call API - Retell AI](https://docs.retellai.com/api-references/create-phone-call)
- [Best Voicemail Practices for AI Voice Agents - Retell AI](https://www.retellai.com/blog/5-best-voicemail-practices-when-using-ai-voice-agents)
- [IVR Navigation, Voicemail Detection Changelog - Retell AI](https://www.retellai.com/changelog/new-updates-ivr-navigation-voicemail-detection-sip-trunking-more)
- [Platform Changelogs - Retell AI](https://www.retellai.com/changelog)
- [Troubleshooting AI Voice Agent Issues - Retell AI](https://www.retellai.com/blog/troubleshooting-common-issues-in-voice-agent-development)
agentId: a509a63960e289a00 (for resuming to continue this agent's work if needed)
<usage>total_tokens: 32856
tool_uses: 18
duration_ms: 186872</usage>

---

## Metadata

**Transcript:** `/root/.claude/projects/-root/f4517053-88f8-40d5-881b-a848d58520a9.jsonl`
**Captured:** 2026-03-08 20:26:16 PST

---

*This output was automatically captured by UOCS SubagentStop hook.*
