---
name: retell-llm-token-surcharge
description: "Retell \"LLM Token Surcharge\" line = prompt-size duration scaling; the static CNKB prompt (~6.6K tok) is the driver, not KB injection"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 6eac1eb0-d2fe-4cf0-81de-0d48c02452cd
---

Retell bills an **LLM Token Surcharge** when an agent's prompt exceeds **3,500 tokens** ([docs](https://docs.retellai.com/accounts/billing-exceptions)). Mechanism: `scaling = prompt_tokens / 3500`; billed call duration is multiplied by that scaling. It counts the FULL per-turn context (system prompt + injected KB + tool defs + accumulating transcript), so longer answered calls scale super-linearly.

**Receipt #2043-7710 (Apr29–May29 2026):** surcharge $36.95 = **56% of the $66.41 bill**. Qty 36,947 vs base 12,187 sec → blended **4.03× scaling** (avg prompt ~14K tok across all turns).

**Measured ground truth (St. Catharines, llm_5b4dbab1bf6dcc5007c61c2726ff):**
- Static CNKB outbound prompt = **26,494 chars ≈ 6,623 tok** — already **1.9× the 3,500 limit by itself**.
- Injected KB (crawler backup) = only ~1,373 tok. **KB is NOT the driver** — earlier assumption was wrong.
- Base footprint (static+KB+tools) ≈ **8,316 tok = 2.38× floor on EVERY call**, even 2-sec voicemails.

**Lever = trim the static prompt, not the KB.** Prompt caching / model swap does NOT help (surcharge is Retell's flat token-count duration scaler, not provider cost). Biggest bloat: Stage 3 (700 tok), Example Interactions (589 tok — cut 4→1), Non-Create Q&A (533 tok), redundant KB-usage rules stated 4× (Knowledge Base Usage / Booking Autonomy / Q&A / Pricing all repeat KB-gap). ~40% cut (6.6K→4K tok) drops floor 2.38×→1.63×, surcharge ~$37→~$25/mo est. Shared across all ~9 CNKB LLMs → multiply savings.

Any trim MUST be validated against the Cekura regression suite (agent 13260, 7 scenarios — see [[cekura-regression-inventory]]) before shipping to live LLMs. Surcharge is structural (lean prompt+KB still >3,500), so trimming reduces ~15-30%, doesn't eliminate; main value is capping growth as call volume/centres scale.

**SHIPPED 2026-06-01:** 41% trim (6,623→3,919 tok) validated on offboarded harness (Cekura run 594624, 6/7 EO=100; 7th was stale 248703). Pushed to all 6 live OUTBOUND CNKB LLMs — StCath (custom intro, 15,677 chars) + EG/Leaside/Burlington/Riverside/Pickering (generic, 15,567). begin_message untouched per-centre. Variants saved at /root/kb-crawler/_trimmed_prompt_cnkb.txt (StCath) + _trimmed_prompt_generic.txt; rollout + rollback details in /root/kb-crawler/llm-prompt-backups/2026-06-01/PUSH-LOG.md. **PENDING:** the 3 INBOUND CNKB agents (EG-Inbound, StCath-Inbound, Leaside-Inbound) run a different prompt, were NOT trimmed, and carry the same surcharge — needs a separate inbound trim + inbound Cekura validation.
