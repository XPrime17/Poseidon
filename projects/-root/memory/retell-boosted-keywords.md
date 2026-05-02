---
name: Retell boosted_keywords lives on the agent, not the LLM
description: Retell ASR boosting is configured via `boosted_keywords` on the agent object (HTTP PATCH /update-agent). Not exposed in the MCP — must use curl + Bearer key.
type: reference
originSessionId: a90d282e-326b-4650-a035-86b23df65325
---
`boosted_keywords` primes Retell's ASR to prefer specific tokens — useful for short phone-call confirmations that get mistranscribed ("it is" → "who's this", "yep" → "yeah", "that's me" → "that's mean", "speaking" → "speak in").

**Where it lives:** on the agent object, NOT the LLM. The Retell MCP `update_agent_prompt` and `get_retell_llm` don't expose it.

**How to set:**
```bash
curl -X PATCH "https://api.retellai.com/update-agent/{agent_id}" \
  -H "Authorization: Bearer $RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"boosted_keywords": ["it is", "that's right", "yep", ...]}'
```

**How to verify:** `GET https://api.retellai.com/get-agent/{agent_id}` → response has `boosted_keywords` field.

**Default seed list for CN inbound/outbound agents (proven on EG inbound 2026-05-02):**
`["it is", "that is right", "that's right", "that is correct", "correct", "yep", "yeah", "yes it is", "that is me", "that's me", "speaking", "mhm", "uh-huh", "Cimo", "Code Ninjas", "East Gwillimbury", "Junior", "Create", "Roblox", "Minecraft"]`

Apply per-centre — swap "East Gwillimbury" for the relevant centre name when sweeping the other 10 clones.
