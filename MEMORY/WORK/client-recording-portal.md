# Client Recording Portal — Option C (Full Dashboard)

**Created:** 2026-02-14
**Status:** Planned — not yet started
**Context:** Discussion about providing Code Ninjas franchise clients access to voice recordings

## Decision
Scott chose **Option C: Full Dashboard with Auth** over simpler alternatives (email per call, token-gated page) because this is the direction the agency is heading.

## Architecture Notes
- **Auth:** Supabase Auth for client accounts + RLS policies
- **Frontend:** React/Next.js or Cloudflare Pages
- **Data:** Retell provides public CloudFront `recording_url` and `recording_multi_channel_url` per call
- **Multi-tenancy:** Map client users → centres, filter calls by centre's `from_number`
- **Features:** Call log, audio playback, transcripts, booking rate, analytics, downloadable recordings

## Key Technical Details
- Retell `recording_url` format: `https://dxc03zgurdly9.cloudfront.net/{hash}/recording.wav`
- Calls already indexed by `centre_id` in Supabase `call_attempts` table
- `retell_call_id` stored in `call_attempts` — can fetch recording URL from Retell API
- Existing internal dashboard at `/dashboard` (observability only, not client-facing)
- No auth system exists yet — needs to be built from scratch

## Existing Infrastructure
- Cloudflare Workers (lead-reactivation)
- Supabase (leads, call_attempts, centres tables)
- Retell API (key in settings.json)
- N8N (feedback webhooks)
- 3 centres currently: Pickering, East Gwillimbury, Canton MA

## Options Considered & Rejected
- **Option A (Email per call):** Too simple, no historical browsing
- **Option B (Token-gated page):** Better but not scalable for 10+ clients
