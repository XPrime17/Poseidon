# CNKB — Agent Configuration

**This file contains the baked-in Retell configuration for CN /w KB.**

Used by workflows to avoid manual ID lookups.

## Source Agent (East Gwillimbury)

| Field | Value |
|-------|-------|
| **Agent Name** | CN /w KB |
| **Agent ID** | `agent_0c6c32b61cb506fefb6ac247f4` |
| **LLM ID** | `llm_44111168b1a2a469f50891b26e34` |
| **Version** | 39 |

## Voice Configuration

| Field | Value |
|-------|-------|
| **Voice** | 11labs-Cimo |
| **Language** | en-US |

## Knowledge Base

| Field | Value |
|-------|-------|
| **Google Doc ID** | `1QTvkO1d72KYIi2ALtPEIrOASsbxggxeyCRiS1rWK3Ek` |
| **Retell KB ID** | TBD (discover via `list_knowledge_bases`) |
| **KB Skill** | `_KB` -- use for reading/writing doc and syncing to Retell KB |

## Centre Clone Registry

Each clone has its own LLM copy (Retell blocks version changes on agents).
Prompt updates must be pushed to all clones using `SyncPrompt.ts`.

| Centre | Agent ID | LLM ID | Cekura Agent ID |
|--------|----------|--------|-----------------|
| East Gwillimbury (source) | `agent_0c6c32b61cb506fefb6ac247f4` | `llm_44111168b1a2a469f50891b26e34` | `13260` |
| Canton | `agent_f10e56ab67fddf22bd60def599` | `llm_d25bbc493b20eb095ab92bceb116` | `13779` |
| StoneOak | `agent_cd531f218c39d6125098cf7abc` | `llm_c26de057ffe1ff9a71366e95c447` | `13780` |
| RoundRock | `agent_d06452d16a225cfbf207890350` | `llm_7b795d82b19f42562ef0abaf857f` | `13781` |
| Rayford | `agent_9c1c8996e054e87f6b76aa8a0a` | `llm_118c93e692e7255083a56043c3e9` | `13782` |
| Burlington | `agent_2f5419fc0c45a24a02bb820cce` | `llm_97ac9c35e7387a448b927ce509b6` | `13783` |
| Pickering | `agent_9d24e87943bc3b8105261bf308` | `llm_9b4bcc9bd77a2bd3c3c04ed579b1` | `13784` |

## Prompt Sync Workflow

1. Edit the prompt on the **source LLM** (via Retell dashboard or MCP `update_agent_prompt`)
2. Run `bun Tools/SyncPrompt.ts --status` to check drift
3. Run `bun Tools/SyncPrompt.ts --push` to distribute to all clones

## Cekura Testing Architecture (Two-Tier)

### Tier 1 — Full Regression (Source Agent Only)
- **Agent:** East Gwillimbury (Cekura ID 13260)
- **Scenarios:** 14 total (6 regression + 4 known-pattern + 3 edge + 1 redteam)
- **Metrics:** All org-level metrics (118268-118273, 119187, 119652)
- **Cron:** ID 427 — Monday 6AM ET, tag `tier1`
- **Tag filter:** `tier1`

| ID | Scenario | Tags |
|----|----------|------|
| 139031 | Happy Path with Pricing Question | tier1, regression, happy-path |
| 139032 | Fast-Track Booking | tier1, regression, fast-track |
| 139033 | Fast-Track with Unavailable Time | tier1, regression, slot-validation |
| 139034 | Identity Test - Call Screening | tier1, regression, identity |
| 139035 | Callback Without Committing to Time | tier1, regression, callback |
| 141951 | Wrong Location - Wants Bayview | tier1, regression, wrong-location |
| 213661 | Day-of-Week in Slot Offers | tier1, known-pattern, day-of-week |
| 213662 | Anti-Teaser Line | tier1, known-pattern, anti-teaser |
| 213663 | Em Dash Avoidance | tier1, known-pattern, em-dash |
| 213664 | Info Overload - One Question at a Time | tier1, known-pattern, info-overload |
| 213665 | Frustrated Repeat Caller | tier1, edge, frustrated-caller |
| 213666 | Junior Program Question | tier1, edge, junior-program |
| 213667 | Sibling Discount Question | tier1, edge, sibling-discount |
| 213668 | Off-Topic Manipulation | tier1, redteam, off-topic |

### Cekura Outbound Calling Config

Cekura must have `outbound_auto_call: true` to trigger Retell calls automatically.
Each agent's `contact_number` must use a Retell phone number with a working SIP outbound credential.

**Known issue:** The `XPrime17` SIP credential gets `telephony_provider_permission_denied` on Twilio.
Working credentials: `xprime` (xprime trunk), `agent` (centre-specific trunks).

| Centre | Cekura Agent | Contact Number | SIP Auth | Status |
|--------|-------------|----------------|----------|--------|
| East Gwillimbury | 13260 | `+12494492726` (Emma fallback) | `xprime` | Working |
| Canton | 13779 | `+17744062037` | `agent` | Working |
| StoneOak | 13780 | `+12107969951` | `agent` | Working |
| RoundRock | 13781 | `+15128170652` | `agent` | Working |
| Rayford | 13782 | `+18326395862` | `agent` | Working |
| Burlington | 13783 | `+12494492726` (Emma fallback) | `xprime` | Working |
| Pickering | 13784 | `+12494492726` (Emma fallback) | `xprime` | Working |

### Tier 2 — Clone Smoke Tests (2 per clone)
- **Agents:** 6 Cekura agents (Canton 13779, StoneOak 13780, RoundRock 13781, Rayford 13782, Burlington 13783, Pickering 13784)
- **Scenarios per clone:** Location Verification + Happy Path Smoke (12 total)
- **Metric:** Location Name Accuracy (ID 119652)
- **Cron:** ID 429 — Wednesday 6AM ET, scenario-based (all 12 IDs)
- **Tag filter:** `tier2`

### Cekura Metrics Registry

| ID | Metric | Type | Scope |
|----|--------|------|-------|
| 118268 | Tour Booking Success | llm_judge | org |
| 118269 | One Question Per Turn | llm_judge | org |
| 118270 | Slot Validation Accuracy | llm_judge | org |
| 118271 | AI Disclosure Handling | llm_judge | org |
| 118272 | Graceful Rejection Handling | llm_judge | org |
| 118273 | Natural Conversation Flow | llm_judge | org |
| 119187 | Wrong Location Handling | llm_judge | org |
| 119652 | Location Name Accuracy | llm_judge | org |

### Tier 2 Scenario IDs

| Centre | Location Verification | Happy Path Smoke |
|--------|----------------------|-----------------|
| Canton | 213691 | 213685 |
| Stone Oak | 213692 | 213686 |
| Round Rock | 213693 | 213687 |
| Rayford | 213694 | 213688 |
| Burlington | 213695 | 213689 |
| Pickering | 213696 | 213690 |

## MCP Tools Used

These Retell MCP server tools are used by the Analyze workflow:

- `list_calls` — Fetch recent calls (filter by agent_id above)
- `get_transcript` — Get full transcript for a specific call
- `analyze_transcripts` — Run 14-rule best practices analysis
- `get_agent_prompt` — Pull current prompt (resolves LLM ID automatically)
- `update_agent_prompt` — Push approved prompt changes (REQUIRES APPROVAL)
