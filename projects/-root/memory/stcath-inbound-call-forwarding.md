---
name: stcath-inbound-call-forwarding
description: "How to activate the St. Catharines inbound AI — no-answer forward (ring ~4x) the centre's main line (289-974-0871) to the Retell number; carrier = NRBN"
metadata: 
  node_type: memory
  type: project
  originSessionId: daf9b54d-cf72-4951-aaf7-76c61340ca26
---

# St. Catharines inbound call forwarding (2026-06-03)

To go live on the inbound AI receptionist, the centre's **main business line — `+1 289-974-0871`** (confirmed by director Janet 2026-06-16) — must be forwarded to the St. Catharines Retell inbound number **`+1 289-514-0137`** (`+12895140137`, the same number outbound calls originate from — see [[returned-outbound-calls-hit-inbound-agent]]).

> **NUMBER GOTCHA:** the centre's real line is **289-974-0871**. Do NOT use `905-220-0332` — that's the `test_number` field in `centre-lookup.csv` (synthetic-lead test target), which I once wrongly assumed was the main line because of the local 905 code. Also not the forwarding source: `289-514-0137` is the Retell/AI DID, not the centre line.

**Mode: NO-ANSWER forwarding ONLY** (ring centre ~4x first, AI catches missed calls) — never unconditional `*72`. Standing rule, see [[feedback-no-answer-forwarding-always]]. On 2026-06-03 the blurb wrongly used `*72` (unconditional); Janet's 2026-06-04 test showed it skipping the centre entirely ("AI answered after 1 ring, centre never rang"). Forwarding path itself is confirmed working.

**Activation:** first cancel the unconditional forward with `*73`, then set no-answer forwarding to `2895140137`. Exact code is carrier-specific — Bell = `*92` + 10-digit (fires after 4 rings; cancel `*93`); Rogers/others differ.

**Verification:** call the centre's main number from a cell — it must ring at the centre a few times *before* the AI answers. The cell-test against the *main centre number* is the real proof; a returned missed-call reaching the AI is NOT proof (those bypass forwarding — [[returned-outbound-calls-hit-inbound-agent]]).

**Why:** the inbound agent (`agent_c02bfb40888bba2275ea3a9f3a`, llm `llm_5b4dbab1bf6dcc5007c61c2726ff`) only receives calls once the centre's published line forwards to the Retell DID.

**Carrier = Niagara Regional Broadband Network (NRBN)**, https://www.nrbn.ca/ (confirmed by Scott 2026-06-04). Key constraint:
- **NRBN RESIDENTIAL** voice (Resi-Voice-Features.pdf) offers ONLY `*72` unconditional Call Forwarding (`*73` off). **No Call-Forward-No-Answer star code exists** on residential. `*610` = rings before *voicemail*; `*86` = NRBN voicemail. So a residential line CANNOT do the 4-ring policy via star codes.
- **NRBN BUSINESS "Hosted Voice" runs on Cisco BroadSoft (BroadWorks)**, which DOES support Call-Forward-No-Answer with configurable ring count (standard BroadWorks FAC `*92` activate / `*93` deactivate; ring count set in the Webex/BroadSoft portal or by NRBN, NOT in the dial code).

**How to apply:** Janet's `*72` test worked — consistent with either tier (both honor `*72`). To honor the no-answer policy, confirm the centre's line is on **NRBN Business Hosted Voice** and have NRBN configure **CFNA → `+12895140137` after 4 rings** server-side (most reliable). NRBN support 1-877-331-6726 / business@nrbn.ca. If the line is residential-only, the no-answer policy is NOT achievable without upgrading to Hosted Voice — fallback is the current `*72` unconditional.

**Status 2026-06-16: ✅ RESOLVED — fully functional.** Scott confirmed StCath inbound is live with **no-answer (CFNA) forwarding after 3 rings** on line 289-974-0871 → `+12895140137`. CFNA working means the line is on **NRBN Business Hosted Voice** (BroadWorks), as predicted. Validated same day by the **first real inbound tour booking** (call_03baab9144d416e9e460bab2c34, from a real parent +12897839013, tour 2026-06-26) — see [[stcath-first-real-booking-2026-06-16]]. Note: configured at 3 rings, slightly under the ~4-ring guideline in [[feedback-no-answer-forwarding-always]]; acceptable per Scott.
