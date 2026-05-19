---
name: NV Pilot Archive
description: Ninja Ventures voice AI pilot wrap-up artifacts (deck, report, source data) saved 2026-05-01 at /root/nv-pilot-archive/
type: project
originSessionId: 0becf12a-c36f-4fec-9f8b-af66cf13d63c
---
# Ninja Ventures Voice AI Pilot — Archive (2026-05-01)

**Why:** Scott built a HQ-facing pilot wrap-up for the four Ninja Ventures centres (Canton, Rayford, Stone Oak, Round Rock). Pilot ran Feb 21 – Apr 28, 2026. Saved mid-iteration so future sessions can resume.

**How to apply:** When Scott returns to NV pilot work, read `/root/nv-pilot-archive/README.md` first, then `nv-pilot-results.md` and the deck (`.pptx`).

## Headline findings (already in report + deck)
- NV pilot lead→tour: **1.5%** (65 real leads → 1 booking)
- Other CN outbound: **14.5%** (62 real leads → 9 bookings on identical agent stack)
- EG inbound: **29.4%** — the proof-of-product for the inbound offering
- The 10× outbound conversion gap is the report's key insight

## Strategic reframe (locked in deliverable)
The NV pilot's underperformance is positioned as the **catalyst** for the inbound voice agent + $199/mo Standard tier offering. Value prop: centres that don't convert outbound can save staff hours via inbound deflection independent of tour bookings.

## Per-centre recommendations (in deck Slide 7)
- Canton → Inbound + retest outbound on v2026-04-21 prompt
- Rayford → Both tiers
- Stone Oak → Inbound only, Standard tier
- Round Rock → Skip outbound (never activated), inbound from day one
- Multi-centre price for 4: $706/mo total ($176/centre avg)

## Open items
- Round Rock root cause unknown — never activated, no leads through pipeline
- Stone Oak stopped Apr 11 — reason unconfirmed
- Enrolment data (showed/enrolled/$) NOT collected — director email drafted at `/root/nv-pilot-archive/nv-director-email.md`, not yet sent
- Canva version of deck not built (native .pptx exists)

## Methodology to remember
- Real-lead filter = region area code + lead_id non-test markers (no AI-/Scott-/CEKURA/TEST/DUMMY)
- "Tours booked" source of truth = Retell `appointment_booked=True` on latest call per phone, AFTER excluding test phones (864/507/905/714/641 area codes)
- MasterSheet `Tour` column underpopulated — Retell `appointment_booked` is the broader truth, but MasterSheet is centre-side authoritative for what got written back
- Comparison centres: Sudbury, Leaside, Pickering, EG (out + in)
