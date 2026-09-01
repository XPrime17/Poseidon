---
name: shauna-base-tier-cutover
description: "Shauna's 3 centres (StCath/Burlington/Kanata) signed Base tier 2026-08-31 — outbound fully disabled, inbound tour booking converted to request-capture; all cutover changes + backups + open items"
metadata: 
  node_type: memory
  type: project
  originSessionId: 635b9053-51af-4458-be62-3c9280a7e1ed
---

# Shauna Base-tier cutover (2026-08-31)

**Deal (WhatsApp 8/31):** Base ×3 for St. Catharines / Burlington / Kanata. Shauna's rationale: team does personal lead follow-ups; values inbound answering ("generated business we would have missed"). Scott confirmed scope in-thread: **NO outbound calls at all** + **inbound tour booking disabled** — agent records the tour request, staff calls back. **Revisit booking when her centres roll into HubSpot** (her words: "easiest for now until we get into Hubspot"). Subscription emails sent via dashboard 8/31; per-centre-credit-cards question pending her answer. Watch for [[playbook-chatdash-billing-recovery]] past_due repeat.

## Cutover executed (2026-08-31, Poseidon)
1. **Outbound off:** Centre Lookup `enabled`=FALSE rows 11 (Burlington), 12 (StCath), 13 (Kanata). `enabled` gates ONLY outbound ingestion (verified: inbound EOC + retry scheduler have zero refs).
2. **Queued leads closed:** retry scheduler does NOT check `enabled`, so 7 active MasterSheet rows (L col) set `cancelled_base_tier`: rows 524/535/542 (Kanata: Tiffany Gervais, Katrina Brant, Jill Jeffery), 526/537/539 (StCath: Elena Renda, Colton Mein, Michelle Burgio), 528 (Burlington test row). First redial would have been Sep 1 18:30 ET. **6 real families handed to Shauna's team for personal follow-up.**
3. **Inbound booking-disable on 3 LLMs** (StCath llm_769e0ba…, Burlington llm_fd20e83…, Kanata llm_7cd3dd9…): `get_tour_slots` tool REMOVED; sections replaced — "Tour Availability" (never offer/confirm times), 2D → "Tour Request Capture" (preference + staff callback, NO timeframe — [[feedback-no-staff-response-time-promises]], fixed 2026-09-01), 2E → "Fast-Track Tour Request" (record preferred time, never confirm availability), 2F close (request-recorded language). Verified: 0 get_tour_slots refs, tools=[end_call] on all 3. **Backups: `/root/cnkb-base-tier-cutover-2026-08-31/`** — restore = PATCH general_prompt+general_tools from backup JSON.
4. **Cekura Tier-2 crons paused** (Happy-Path expects booking, would false-fail Wed Sep 2): Burlington 439 + Kanata 511 → crontab `0 6 31 2 *` (never fires) + [PAUSED] names. StCath has no Tier-2 cron. Un-pause = restore `20 6 1-7,15-21 * 3` / `40 6 1-7,15-21 * 3` US/Eastern (pause reset tz to US/Pacific — fix when restoring).

## Open items
- **Scott: remove 3 slugs from Zapier facility_slug filter** — else every real HubSpot lead for these centres fires a "Not Enabled" alert email to Scott (drop is safe, just noisy). StCath LineLeader dual-source echoes also land Not-Enabled (fine).
- Billing: confirm Shauna adds card same-day (Sharmila sat past_due 14d); answer on per-centre cards pending.
- Base price actually configured in dashboard = Scott's call ($149/$126.65 anchor vs $99 — unresolved anchor, see [[tourforce-pricing-model]]).
- Later: rewrite Cekura inbound scenarios for request-capture flow if we want smoke coverage back; audit.py expectations unaffected (slot rules only fire when slots ARE offered).
- HubSpot rollover = upsell trigger: re-enable booking (restore from backups) + revisit Pro.
- Booked-tour data for any future upsell: free period = 438 real calls, ~11 tours booked (StCath 8).
