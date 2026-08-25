---
name: sonamation-scheduler-migration-2026-08-14
description: CN migrating tour scheduling LineLeader→Sonamation; broke EG/Leaside slot scrapes for 10 days; fixed via Sonamation JSON API in calendar_api; Skyvern booking flow on migrated centres UNVALIDATED
metadata: 
  node_type: memory
  type: project
  originSessionId: 65a93970-0aa7-4862-ab9e-5daa7a1897f6
---

**Discovered 2026-08-14 during Barrhaven onboarding.** CN is migrating centre tour scheduling from LineLeader/ChildcareCRM (FullCalendar widget) to **codeninjas.sonamation.com** (iframe `?guid=<facilityId>`, age-picker UI, HubSpot form booking).

## Impact found
- **EG slot scrape dead since Aug 4 10:13** (last success; 187 fails/24h), Leaside dead ≥14d — old widget gone from their pages. Inbound agents silently served the safe "tour times unavailable → offer callback" fallback the whole time. **~10 days of EG inbound callers not offered real slots.**
- Migrated so far: EG (~Aug 4), Leaside, Barrhaven (born on it). Still on old widget (scrape works): StCath, Kanata, Burlington — though ALL centres already have Sonamation configs server-side, so more page-flips are coming.

## Fix shipped (live, verified)
- Sonamation has a clean public JSON API: `GET /api/config?location=<guid>` (calendars per age band: Create 8-15, Jr 5-7) + `GET /api/availability?location=<guid>&startDate&endDate&calendar=<uuid>` → UTC ISO slots. **GUID = `facilityId` from `services.codeninjas.com/api/v1/facility/profile/slug/<slug>`** — programmatic for any centre.
- New `/root/sonamation_slots.py` emits the exact extract_childcarecrm result shape (weeks→slots iso_date/time_12h/time_24h) → zero downstream changes.
- `calendar_api.py`: `SONAMATION_GUIDS` map (eg/leaside/barrhaven); `refresh_centre` + `/extract-calendar` route those centres to the API (2s vs 33-45s browser, no extraction lock). Verified: EG 22 slots (matches last-good Aug 4 count), Barrhaven 31, gate C1-C5 PASS; `/extract-calendar` returns `calendar_type: sonamation_api` for n8n outbound.
- **Rule: only add a centre to SONAMATION_GUIDS when its public page embeds the iframe** — quoting Sonamation slots while bookings still happen on the old widget = two-source disagreement ([[skyvern-calendar-disagreement]]).
- Leaside returns **304 slots** — wide-open calendar config on their side; sanity-check with Sharmila.

## OPEN — booking flow risk (HIGH)
**Skyvern books tours by driving the website UI, which for migrated centres is now the Sonamation scheduler (age→slot→HubSpot form).** Skyvern wf `wpid_472637885728525632` criteria were written for the old CN confirmation page → next real EG/Leaside/Barrhaven booking will likely fail→Manual-verify email (safety nets from [[skyvern-false-failure-fix-2026-06-27]] catch it, bookings degrade to manual, not lost). Options: rework Skyvern prompts for Sonamation UI, or better — book DIRECTLY via the HubSpot form/API (config exposes hubspotPortalId+FormId; a POST could replace Skyvern entirely for migrated centres). Watch which centres' pages flip next; add to SONAMATION_GUIDS as they do.

Related: [[barrhaven-onboarding-2026-08-14]], [[scraper-lock-deadlock-fix-2026-06-16]], [[inbound-slot-source-eg-contamination-2026-06-18]]
