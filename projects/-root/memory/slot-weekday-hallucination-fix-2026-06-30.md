---
name: slot-weekday-hallucination-fix-2026-06-30
description: "Agents fabricated tour weekdays because SLOTS/get_tour_slots fed ISO dates only while prompts told them to speak the day-of-week; fixed at source + prompt + audit, fleet-wide"
metadata: 
  node_type: memory
  type: project
  originSessionId: 623188d3-e6e9-413d-a5f6-29953b1cd7cf
---

Daily audit (call_1befa6eee09ad775fd427067ef1, CNKB-Pickering outbound, 2026-06-29) caught the agent reciting 10 July tour dates ALL labelled "Thursday" — 6 wrong (2026-07-04/11/18/25 are Saturdays, 07-15/22 Wednesdays). Dates/times were real; only the **day-of-week was fabricated**.

**Root cause:** `{{SLOTS}}` (outbound) and `get_tour_slots` (inbound) emitted **ISO-dates-only** (`2026-07-02: 5:00 PM`), but the prompts told the agent "Day-of-week is in {{SLOTS}}" / "Convert to spoken format with day of week" — a contract the data never fulfilled, so GPT-4.1 invented the weekday.

**Provenance:** introduced by the **2026-06-01 outbound prompt trim** (token-surcharge cut). The condensed Stage 5 added the false weekday claim; the n8n Format Slots node never had a weekday (identical dates-only back to 2026-06-10). Cekura validation missed it because test calls fire with **empty dynamic variables** → `{{SLOTS}}` empty → the weekday branch never ran. June outbound is seasonally thin, so it took until a real populated call to surface.

**Fix shipped (all fleet-wide, UTC-safe weekday from iso_date):**
1. **n8n source** — `Format Slots` in BOTH `6sPwo7ngPyTWfmwM` (Outbound) + `rt0aEuDnFv3ZCl1y` (Retry Scheduler) now prefix weekday: `Thursday 2026-07-02: 5:00 PM`. Script+backups: `/root/n8n-backups/slots-weekday-fix-2026-06-30/`.
2. **Inbound source** — `calendar_api.py` `format_slots_text()` adds `strftime('%A')` weekday; service restarted, live render verified. (Same function also feeds the `SLOTS` convenience endpoint.)
3. **Prompts** — 7 outbound clones (`deploy.py`) + 5 inbound clones (`deploy_inbound.py`): rewrote the weekday line into "read EXACTLY as written, never compute/guess a weekday = CRITICAL FAILURE". Backups in `/root/cnkb-slots-weekday-prompt-2026-06-30/`.
4. **Audit** — `audit.py`: HALLUCINATION category broadened to cover fabricated tour dates/weekdays + added `LLM_SEVERITY_FLOOR={"HALLUCINATION":"HIGH"}` so hallucinations always render HIGH (Scott 2026-06-30). Sits alongside `LLM_SEVERITY_CAP` (NAME_ECHO→LOW). Live file `/root/daily-call-audit/audit.py` (the one the timer runs).

**Verified:** both formatters unit-tested (Sat for 07-04/11/18/25 etc.), all 12 prompt round-trips confirmed, audit floor unit-tested. Pipeline gate FAILs were pre-existing empty-`clickup_list_id` config (orthogonal). Relates to [[core-classifier-drop-2026-06-24]] class of "validation harness blind to real data". OPEN: confirm next real slot-reciting call renders correct weekdays; consider a real-slots assertion in the E2E/Cekura gate so empty-variable tests can't hide this class again.
