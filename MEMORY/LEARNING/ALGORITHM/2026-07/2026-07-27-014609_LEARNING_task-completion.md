---
capture_type: LEARNING
timestamp: 2026-07-27 01:46:09 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-07-27
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

**✅ VERIFY** — Double-greeting fix is now fleet-wide and future-proofed:

| Inbound centre | Stage 1 de-dup | `begin_message_delay_ms` |
|---|---|---|
| Leaside (earlier) | ✅ | 1500 |
| **EG** (golden source) | ✅ | 1500 |
| **St. Catharines** | ✅ | 1500 |
| **Burlington** | ✅ | 1500 |
| **Kanata** | ✅ | 1500 |

- The other 4 used a slightly different bullet (`- Greeting (already in begin_message): …`) that still carried the full greeting text — a tolerant regex caught all four; each verified (guard present, old block gone).
- **Future centres:** `provision-inbound.ts` clones the **EG inbound agent** via `{...src}` (strips only IDs/timestamps). Since EG is now fixed, every new centre inherits the corrected prompt **and** the 1.5s delay automatically — confirmed by reading the clone logic, not assumed.
- Backups: `/root/n8n-backups/inbound-double-greeting-fanout-2026-07-27/`. Recorded in [[leaside-inbound-double-greeting-2026-07-27]].

**🧠 LEARN** — The bug was fleet-wide as predicted, and the golden-source clone pattern means one fix (EG) covers all future onboards — no separate template file to maintain. **Open:** task #9, Sharmila's "name is the agent" — still awaiting her clarification.

🗣️ **PAI:** All five inbound centres now greet once, with a 1.5-second delay so forwarded calls don't clip the opening — and because new centres are cloned from the EG agent I just fixed, future onboards inherit it automatically. Everything's backed up. Still just waiting on Sharmila to explain the "name is the agent" part.

</details>
