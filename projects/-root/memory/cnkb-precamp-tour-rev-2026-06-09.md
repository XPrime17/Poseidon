---
name: cnkb-precamp-tour-rev-2026-06-09
description: "Pre-camp tour exception shipped fleet-wide — a \"come see the place before camp\" request now books as a normal Create tour, not a deflection"
metadata: 
  node_type: memory
  type: project
  originSessionId: 546ea15a-9b3d-4de1-8986-da9f2129038a
---

Shipped 2026-06-09 (Scott directive): added a "Booking gate" **exception** to all 9 live CNKB LLMs so that a caller wanting to *visit/tour/check out the centre in person* — even when motivated by an upcoming camp or other non-Create program — is booked as a **normal Create tour** (standard flow, `appointment_booked=true`), NOT deflected to staff or refused with "we don't do camp trials."

**Why:** call_577bee417849614ac2a5e979f7a (EG-Inbound, 2026-06-01) — parent of an Aug-camp-registered kid asked to come try/see the place before camp; the agent dodged ("no camp trials") and fumbled the Create-tour pivot. Recurrence was only 1/300 calls, but Scott set policy: pre-camp visits are bookable.

**How applied:** one exception bullet inserted immediately after the `Booking gate` line in each prompt. Marker string: `Exception — an in-person visit is ALWAYS bookable`.
- Outbound source EG `llm_44111168b1a2a469f50891b26e34` (16175→16844 chars) → `SyncPrompt.ts --push` propagated to Burlington/Pickering/Leaside-out/Riverside (all 16844, in sync).
- Patched in place (excluded from SyncPrompt): StCath-out `llm_5b4dbab1bf6dcc5007c61c2726ff`.
- Inbound (separate prompts, patched individually): EG-in `llm_6d77f36696f6fbfad97d03fa5ef8`, StCath-in `llm_769e0ba68dc37cea573904c474fe`, Leaside-in `llm_cfedf58fd1274e15835042d8b6c8` (Leaside-in not live yet but patched for when it goes live).
- No n8n/schema change (books as standard Create tour).
- Backups of all 9 pre-edit prompts: `/root/kb-crawler/llm-prompt-backups/2026-06-09-precamp-tour/`.
- Verified: all 9 contain exactly one exception bullet (live get-retell-llm round-trip).

Preserves the gate's original intent (don't substitute a tour for a non-Create program inquiry). Relates to [[prompt-v2026-04-21]], [[cnkb-repeated-objection-escape]]. ⏳ Not done: deeper MED-1 layer — inbound agents still don't capture caller identity or recognize existing camp customers (no MyStudio lookup). Optional follow-up: Cekura regression scenario "pre-camp tour → books Create tour".
