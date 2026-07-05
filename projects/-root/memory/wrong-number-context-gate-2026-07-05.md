---
name: wrong-number-context-gate-2026-07-05
description: Garbled name reply made StCath inbound declare wrong number and hang up on a real customer — fixed fleet-wide with prompt context gate + audit 5J rule
metadata: 
  node_type: memory
  type: project
  originSessionId: 8fee3ada-2ef7-486d-b221-91f2cd2f3fdc
---

**Root cause** (call_aef194102ebd50506f03746fddd, StCath inbound 2026-07-04): caller running late for an 11:30 lesson asked to cancel; agent correctly ran the [[onsite-callback-rev-2026-06-19]] flow, then asked for the name. ASR garbled the reply into "I'm calling for nine six building" → agent pattern-matched the prompt's wrong-number rule, declared wrong number + goodbye in ONE fused turn, misread the caller's overlapping "Yes" (word timings prove it answered "This is Code Ninjas St. Catharines", not "wrong number") as confirmation, and hung up (`agent_hangup`). Misclassified `call_type=wrong_number, urgency=none, call_successful=true` → no team notification, invisible to audit, and it contradicted its own "call back in a few minutes" instruction.

**Fix shipped 2026-07-05** to all 5 live inbound LLMs (StCath, Kanata, Burlington, Leaside, EG):
1. `## Handling Wrong Numbers` rewritten: context gate (never wrong_number after any in-scope utterance; treat confusing mid-call replies as transcription errors and re-ask), confirmation question must be a separate turn with a WAIT — never declare + goodbye in one breath.
2. New **Garbled-name recovery** bullet after Pending-question recovery: unparseable name reply → re-ask once, never reinterpret the call.
3. audit.py check **5J Wrong-Number Misclassification** (HIGH): `call_type=wrong_number` + in-scope keywords in user turns before the wrong-number declaration. Dry-run: flags the real call, clean on genuine wrong numbers; test_rubric 5/5.

**Backups/scripts:** `/root/cnkb-wrong-number-context-gate-2026-07-05/` (before/after per agent + patch.py).

**Gotchas:** patch.py's `CENTRE_RE` truncated "St. Catharines" to "St" (period-delimited regex) — hot-fixed post-deploy; watch for abbreviated centre names in future prompt extraction regexes. Also `/root/.claude/.env` has unquoted `&` in EMAIL_SEND_WEBHOOK_URL, so `set -a; . …` spawns junk background jobs (harmless).

**Cekura regression scenario:** 296430 "REGRESSION: Garbled name reply must NOT become a wrong-number hangup" on agent 16633 (CNKB - EG Inbound — the only inbound agent registered in Cekura; the patched block is identical fleet-wide so it covers the shared logic). Replays the real call: in-scope opener, word-salad name reply, pushes back if told wrong number, protests early hangup. FAIL = wrong_number classification, agent-initiated hangup, or declare+goodbye in one turn.

**OPEN:** confirm behavior on the next real garbled-reply call; run scenario 296430 for a live pass; older scenario 246780 "Edge: Wrong number" expects call_type=other for a genuine wrong number (prompt now says wrong_number) — reconcile if it starts failing.
