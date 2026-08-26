---
name: voicemail-hallucination-fix-2026-07-16
description: "Outbound agents spoke test numbers on voicemail — ROOT CAUSE CORRECTED 2026-08-26 (not LLM hallucination; see vm-callback-test-number-2026-08-26)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6473ff0a-0b96-4c84-ab86-16b1944896c9
---

> **ROOT CAUSE CORRECTED 2026-08-26:** the "hallucination" theory below is WRONG. The number came deterministically from the Retry Scheduler's per-call `agent_override.agent.voicemail_option` static_text, whose template read col I `test_number` — a layer this investigation never checked. Proven by identical-template attempt-2 VMs on Jul 11/13, before this fix shipped. See [[vm-callback-test-number-2026-08-26]] for the real fix. The Options 1-3 mitigations below remain in place and rule 5K is what caught it.

**call_ac4627d26570b56758f1c13b22c** (StCath outbound, Cimo→Candice, 2026-07-04): hit voicemail and spoke callback "905-220-0332" = the centre's **test_number** (Centre Lookup col I `9052200332`). Traced it through every layer — NOT in prompt, dynamic vars, KB, or voicemail_option. The LLM (gpt-4.1) **hallucinated** it: Retell streams the answering-machine greeting to the LLM as "user" speech; with no voicemail script the model improvised a whole VM message and pulled a plausible number from parametric memory (likely the centre's real/public listing). Same class as [[slot-weekday-hallucination-fix-2026-06-30]]. `voicemail_option` was `hangup` but the LLM spoke before detection completed.

Correct landline = **289-974-0871** (sheet col E `12899740871` AND KB agree — no discrepancy; my "997" on the call was a hand-grouping slip).

**Fix shipped fleet-wide (all 7 ENABLED outbound CNKB agents), 2026-07-16:**
1. **Option 1 — deterministic voicemail:** set Retell `voicemail_option.action = {type:"static_text", text:...}` per agent (PATCH `/update-agent/{id}`). Landline centres speak col E number; blank-col-E centres get a safe no-number message. Retell now plays a FIXED VM message instead of letting the LLM improvise.
2. **Option 2 — prompt guard:** inserted `# Voicemail / Answering Machine` + `# Phone Number Rule (CRITICAL)` ("NEVER say a phone number not verbatim in {{knowledge_base}}") before `# Ending Calls` in each LLM `general_prompt` (PATCH `/update-retell-llm/{id}`), +958 chars each. Backstop for when VM detection misfires.
3. **Option 3 — audit rule 5K** in `/root/daily-call-audit/audit.py`: flags HIGH any agent-spoken phone number whose 10 digits aren't in that call's injected `knowledge_base`. Also fetches VOICEMAIL calls (excluded from `transcript_targets`) since that's where the failure occurs. Stores `_dynamic_vars` per call. Unit-tested: flags 905-220-0332, passes 289-974-0871.

**Landline centres (col E present):** EG 905-478-1664, Burlington 905-332-0707, StCath 289-974-0871, Kanata 613-963-4472. **Blank col E (no-number VM):** Pickering, Leaside, Riverside — OPEN: Scott to backfill col E `centre_landline` so their VM can name a number.

**UPDATE 2026-08-20 — per-attempt behavior now overrides the agent-level config:** both dial nodes pass `agent_override.agent.voicemail_option` per call, superseding the static_text set on agents above. Initial dial (outbound `Retell: Call Prospect`) always forces `{action:{type:"hangup"}}`; the retry scheduler (`Retell: Retry Call`) injects a personalized `static_text` ("Hi <First>, this is an AI assistant calling on behalf of Code Ninjas <centre>…") **only when the upcoming attempt === 2**, else hangup. Net policy: a lead gets exactly ONE voicemail across the 4-attempt cadence, on attempt 2. EOC `Calculate Next Call` labels `voicemail_reached` accordingly (`voicemail_left` on attempt 2, else `voicemail_hangup`); `Format Email Data` renders these as "Voicemail left" / "Voicemail (hung up)". Verified live: call_effc8b8644cc… (attempt 1) = 5s hangup mid-greeting, no message recorded.

Backups: `/root/n8n-backups/voicemail-hallucination-fix-2026-07-16/` (each agent + llm JSON + manifest.json). Revert = PATCH `voicemail_option` back to `{action:{type:"hangup"}}` and restore `general_prompt` from `.llm.json`. Disabled centres (ma-canton, tx-*, ma-sudbury) untouched. Analysis emailed to Scott (Resend f1d89341). OPEN: confirm next real voicemail plays the fixed message.
