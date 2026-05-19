---
name: Centre onboarding requires writing KB URL to Centre Lookup explicitly
description: KB Crawler centres.json + Centre Lookup `knowledge_base` column are independent. Crawling a doc does not wire it to the outbound flow. Riverside hit this gap 2026-05-03.
type: feedback
originSessionId: f1073f82-dcec-4c11-b3d1-1bc8f78e3502
---
# Two stores hold the KB doc reference — onboard both

The KB Google Doc reference lives in **two** independent places:

1. **`/root/kb-crawler/centres.json`** on the n8n-production droplet — controls *which docs the nightly crawler refreshes*
2. **Centre Lookup sheet, `knowledge_base` column** — controls *which doc the Outbound Call Flow's `Get KB` node reads at call time*

If only #1 is set, the crawler refreshes content but the outbound agent gets nothing. The flow errors at the Get KB node (`NodeApiError: Bad request`) — looks like a Google Docs API problem; root cause is empty doc URL.

**Why:** Riverside was onboarded with the KB doc created (write access verified 2026-05-02) and added to centres.json (crawler successfully wrote on 2026-05-03 06:00 UTC), but the Centre Lookup row's `knowledge_base` column was never populated. First synthetic test lead (2026-05-03) hit `Get KB` failure.

**How to apply:**
- Any time a centre KB doc is created, write its URL to **both** centres.json AND Centre Lookup before the centre takes traffic.
- The format Centre Lookup expects: `https://docs.google.com/document/d/{docId}/edit?usp=sharing`
- Write path: POST to `https://xprime17.app.n8n.cloud/webhook/b4e7c2d1-9f3a-4a5b-8e6d-1c2d3e4f5a6b` (`Centre Directory - Write Row (Onboarding)` workflow) with all 11 columns to avoid blanking existing data
- The lead-reactivation-github fork's `onboard-centre.ts` already creates the doc via OAuth (commit `008bfb0`); verify that branch also writes the URL to Centre Lookup before merging back to the canonical fork.
