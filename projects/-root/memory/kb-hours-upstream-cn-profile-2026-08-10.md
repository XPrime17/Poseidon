---
name: kb-hours-upstream-cn-profile
description: "Agent-spoken store hours come verbatim from CN services API studentHours/officeHours — wrong hours = fix the centre's CN website profile, not the crawler"
metadata: 
  node_type: memory
  type: project
  originSessionId: 01fc7d3a-ac4b-4141-a77d-a3bd88a788d8
---

Voice-agent store hours are free-text `studentHours` / `officeHours` fields on `https://services.codeninjas.com/api/v1/facility/profile/slug/<slug>` — maintained by the centre in the CN website admin. The KB crawler (`/root/kb-crawler/crawl.ts:284-285`) mirrors them verbatim into the "Store Hours" doc; no normalization, no override. Wrong hours in a call = wrong data upstream in the centre's CN profile (also wrong on the public website). Fix there, then `bun run crawl.ts --centre <slug>` to push immediately.

Fleet sweep 2026-08-10:
- **EG**: studentHours wrongly includes Wednesday (centre closed Wed; officeHours correct). Scott reported; awaiting portal edit.
- **Burlington**: studentHours says Mon open, officeHours says Tue–Thu — one is wrong.
- **Pickering** officeHours empty; **Kanata** studentHours empty; **Sudbury/Riverside** both empty → no Store Hours doc in KB at all.

**2026-08-11 FIX SHIPPED:** `crawl.ts` Store Hours now uses `officeHours` only (fallback to `studentHours` when officeHours empty — covers Pickering). Single "Store Hours:" line, no more Student/Office split. Backup `backups/crawl.ts.pre-officehours-pref-2026-08-11`. Full crawl pushed: 10 updated, EG verified live (hash ead889d3, no Wednesday). Riverside slug `ct-riverside` now 400s at the services API (KB stale-but-intact; worked earlier same day — watch next nightly run). Leaside doc write now works (old read-only known-issue appears resolved).

**2026-08-11 correction (Scott's catch):** the public CN website renders ONLY `officeHours` (client-side JS injects `franchisingData.officeHours`; `studentHours` appears 0 times in page source). `studentHours` is invisible to centres/public → rots silently; the KB crawler is likely its only consumer. Treat `officeHours` as the authoritative spoken-hours field; `studentHours` is stale-prone (EG's wrong Wed proves it). Candidate fix: crawler prefers/only uses officeHours, or drops studentHours when the two conflict.

Interim mitigation if portal edit is slow: correction line in the KB doc's MANUAL NOTES section (survives nightly crawls). Related: [[kb-crawler]] skill `_KBCRAWLER`, [[feedback-onboarding-kb-url-checklist]].
