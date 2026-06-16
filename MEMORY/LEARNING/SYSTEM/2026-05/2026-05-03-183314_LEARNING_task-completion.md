---
capture_type: LEARNING
timestamp: 2026-05-03 18:33:14 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-05-03
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

## ✅ EXECUTE — Findings

### Skyvern booking — **NO**, didn't fire.

**Root cause:** Riverside agent's `webhook_url` points to Cekura (`api.chat-dash.com/v1/private/agents/69f793c0.../import/webhook`). Cekura forwards events to n8n for Pickering and others (verified — execution 17991 was a Pickering call_analyzed at 18:01), but Riverside's events aren't relaying. Cekura *did* receive the event (Riverside agent's `analyticsLastUpdated: 18:00:00 UTC`) — the relay back to n8n is missing/broken.

**Evidence of failure:**
- Last 50 EOC executions scanned — zero references to `call_39bfec715bb6ed41fe1233ef3fe`
- Riverside agent webhook pointed at chat-dash, not n8n directly
- The synthetic lead row in MasterSheet still shows `status=calling` (stuck — never updated to `completed/tour_booked`)
- Skyvern node sits inside EOC; if EOC never fires, Skyvern never fires
- Tour confirmation email to Leo never sent
- Booking exists ONLY in Retell's call analysis — not in LineLeader

So: **agent verbally booked the tour, but no system on the back-end knows about it.** Same gap would happen for any real lead today.

### Portal DB state — confirmed
- ✅ `centres` row exists, `riverside-ct-us`, calling_enabled=true, knowledge_base=null (portal copy is separate from Centre Lookup)
- ✅ `centre_agents` mapping exists for Riverside outbound
- ❌ `portal_users` empty — Leo has no row. Can't pre-create: `auth.users(id)` foreign key requires Leo to authenticate first OR I admin-invite via Supabase. Plus needs his Supabase Auth uid.

## 🔍 VERIFY

Two clear gaps remaining:

**A. Webhook fix** — point Riverside's Retell `webhook_url` directly at n8n EOC URL `https://xprime17.app.n8n.cloud/webhook/ac45848d-559c-4b66-9058-5d76b8476531`. Trade-off: bypasses Cekura analytics ingestion for Riverside. (No Cekura suite exists for Riverside yet, so material loss = zero today.) Then replay our call's `call_analyzed` payload to fire Skyvern + email + sheet update for the existing booking.

**B. Other CNKB clones may have the same bug** — every centre cloned with the chat-dash webhook depends on the Cekura→n8n relay. If Riverside's relay is broken, others may be silently broken too. Worth auditing.

**C. Leo's portal access** — needs Supabase admin invite (creates auth.users row + sends magic link). I can do that via service key if you want.

## 🧠 LEARN

Big finding worth capturing: **the chat-dash → n8n forwarder is a hidden dependency** for outbound EOC processing. Every CNKB clone inherits this dependency and there's no monitoring on it. If Cekura ever drops events, **the agents will keep talking and "booking" tours but no booking actually persists** — invisible failure mode. This wants alerting (e.g., compare daily Retell call count to daily EOC executions and flag deltas).

</details>
