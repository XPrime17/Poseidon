---
name: Centre live-launch has two registration surfaces
description: Onboarding/launching a centre touches both lead-reactivation Centre Lookup AND TourForce portal Postgres. Different centre_id namespaces. Riverside flagged this gap 2026-05-03.
type: project
originSessionId: f1073f82-dcec-4c11-b3d1-1bc8f78e3502
---
# Centre live-launch: two registration surfaces

When flipping a centre from test → live, two independent systems each need their own setup:

## Surface 1 — Lead reactivation (call placement)
- **Centre Lookup sheet** (`1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0`) — centre_id format: `ct-riverside`, `leaside-on-ca`, `ma-canton`
- Columns: centre_id, timezone, enabled, location_name, from_number, Testing, test_number, centre_email, Director, agent_id, knowledge_base
- Toggle `Testing` from TRUE→FALSE to enable real-prospect dialing
- Write KB Google Doc URL to `knowledge_base` column (kb-crawler centres.json is separate — both must be set)

## Surface 2 — TourForce portal (centre-facing dashboard)
- **Postgres tables** in `/root/tourforce-portal/migrations/`: `centres`, `centre_agents`, `portal_users`, `subscriptions`
- centre_id format: `riverside-ct-us`, `leaside-on-ca` — **different from Surface 1 in some cases**
- Riverside example: lead-reactivation uses `ct-riverside`, portal uses `riverside-ct-us`
- Required rows for live access: centres (location), centre_agents (agent_id mapping), portal_users (auth_uid → centre_id), optionally subscriptions (Stripe tier)

## Why: 
Voice AI was built before the portal. Centre IDs in the sheet match `codeninjas.com/{slug}` URL paths (Canadian centres add `-on-ca`); portal IDs were chosen separately and not retro-aligned. Cross-system joins require explicit ID translation.

## How to apply:
- "Live launch a centre" checklist must cover BOTH surfaces — easy to miss the portal because it's a separate codebase
- For each new centre: run `bun migrate.ts` after appending centre row + agent mapping, create Leo/owner's portal_user row tied to their Supabase Auth uid
- If you're tempted to write a `_LAUNCHCENTRE` skill, encode both surfaces with explicit ID-translation table
