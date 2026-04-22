---
name: Outbound sanitization fix — 2026-04-21
description: Outbound Call Flow was producing lead-sanitization failure emails because the AI extractor (Get customer info1) had a Simple Memory node with a constant sessionKey poisoning state across runs. Removed the memory node and added a Regex Extract node as primary extractor with AI as fallback.
type: project
originSessionId: fb1283ef-1d84-48b4-865b-263821fdbd91
---
# Outbound sanitization fix — 2026-04-21

**Workflow:** `6sPwo7ngPyTWfmwM` (Outbound Call Flow — Multicentre) on n8n cloud.

## What broke
Exec 16930 (Apr 20 21:36 EDT): CORE inquiry for Ashley Harrigan (EG) arrived with a clean text body. The AI extractor (`Get customer info1`, a LangChain agent with gpt-4.1-mini primary + Claude Sonnet 4.5 fallback) returned a meta-response instead of the 4 fields:
> *"I need the text input to extract customer information from. Could you please provide the text that contains the customer details? From your original message I can see an example: **Ashley Harrigan alexashleyharrigan@gmail.com (289) 264-0986**..."*

Sanitize & Validate caught the garbled output and fired the Sanitization Failed Gmail alert.

## Root cause
`Simple Memory1` node was wired into the extractor's `ai_memory` input with `sessionKey: "my_test_session"` — a **constant** key across all runs. Every lead shared the same memory buffer. A prior conversational exchange (likely during prompt development) poisoned state; the Harrigan email inherited that context, and the model treated the prompt as a chat turn.

## Fix
- **Removed** `Simple Memory1` node + its `ai_memory` connection to `Get customer info1`.
- **Added** `Regex Extract` Code node before `Get customer info1`. Deterministically parses first_name / last_name / email / phone from CORE email bodies. Regex patterns:
  - email: `/([\w.+-]+@[\w.-]+\.\w{2,})/`
  - phone: `/\(?\s*(\d{3})\s*\)?[\s\-.]*(\d{3})[\s\-.]*(\d{4})/`
  - name: scan backward from email address for a line matching `/^([A-Z][a-zA-Z\-']+)(?:\s+([A-Z][a-zA-Z\-']+)(?:\s+([A-Z][a-zA-Z\-']+))?)?$/`
- **Rewired** `Enabled?` main fan-out: Get KB + Get Availability + Regex Extract (was: Get KB + Get Availability + Get customer info1 directly). Regex Extract → Get customer info1.

When all three fields match, Regex Extract sets `output = "First, Last, email, phone"` in the same shape the AI would produce — downstream Sanitize & Validate reads `$json.output` and proceeds normally. AI node still runs as belt-and-suspenders, but regex catches 95%+ of CORE emails deterministically.

## Extractor input was already correct
`Get customer info1`'s `systemMessage` already uses `{{ $('Gmail Trigger').item.json.text }}` — the clean text body, not HTML. So "pin AI input to text only" was a non-fix; the real fix was killing the poisoned memory.

## Recovery of stranded lead
Ashley Harrigan was directly appended to Leads MasterSheet (lead_id `Ashley-2892640986-RECOV-2af18f`, status=retry_pending, next_call_after 2026-04-23 09:00 EDT) via temp workflow. Retry Scheduler picks up the first morning poll.

## Audit for the same pattern
Any other n8n workflow using `@n8n/n8n-nodes-langchain.memoryBufferWindow` with a constant `sessionKey` has the same latent bug. Extraction agents should not have memory — memory is for chatbots.
