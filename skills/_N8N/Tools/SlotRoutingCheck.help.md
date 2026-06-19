# SlotRoutingCheck

Regression + onboarding gate that proves every **live inbound voice agent serves its OWN centre's
tour slots** — never East Gwillimbury's by silent default.

## Why it exists
2026-06-18 incident: inbound agents were cloned off the EG template whose `get_tour_slots` tool
pointed at the **generic** `calendar_api` endpoint (`/retell/get-slots`, no centre in the path).
`calendar_api` silently **defaulted unknown centre → east-gwillimbury**, so StCath / Kanata /
Burlington callers were read EG's availability (StCath even offered a Friday slot at a
Friday-closed centre). Plausible-but-wrong output, no error, caught only by a human. This check
makes that whole class loud and blocking.

## Checks
- **C1** agent's `get_tour_slots` URL is centre-specific → `/retell/get-slots/<centre>` (not generic)
- **C2** `<centre>` is cached in `calendar_api` (`/health`) with `total_slots > 0`
- **C3** `POST /retell/get-slots/<centre>` returns real slots (not the safe 'unavailable' fallback)
- **C4** a non-EG centre's slots are **distinct from EG's** (canary for 'silently defaulting to EG')
- **C5** (fleet) the generic endpoint returns 'unavailable', never a real centre's slots (footgun stays closed)

## Usage
```
python3 SlotRoutingCheck.py                  # whole fleet — regression gate (run after any inbound/agent/calendar change)
python3 SlotRoutingCheck.py --agent agent_x  # one agent — onboarding gate (provision-inbound passes the id)
python3 SlotRoutingCheck.py --centre kanata  # loose name filter (human/debug)
```
Exit 0 = PASS (ship) · 1 = FAIL (do not ship) · 2 = setup error.

## Env
- `RETELL_API_KEY` (or `RETELL_KEY`) — in `~/.claude/.env`
- `CAL_API_BASE` — calendar_api base, default `http://localhost:5001` (runs on the n8n-production droplet)

## Wired in
`lead-reactivation/scripts/provision-inbound.ts` → **Step 6** calls this with `--agent <newAgentId>`
and throws (fails provisioning) if the new inbound agent isn't serving its own centre. Run the
fleet form alongside `PipelineRegressionCheck.py` after any inbound/agent/calendar change.

## When adding a centre to the fleet
A new live inbound centre must be added to `CENTRES` in `/root/calendar_api.py` (key = the URL
centre slug, e.g. `st-catharines`) with its `*-on-ca/schedule-tour` calendar_url, and the agent's
`get_tour_slots` URL must be `/retell/get-slots/<that-key>`. Then this check passes.
