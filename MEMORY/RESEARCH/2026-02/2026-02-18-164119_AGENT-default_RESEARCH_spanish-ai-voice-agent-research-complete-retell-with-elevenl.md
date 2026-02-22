---
capture_type: RESEARCH
timestamp: 2026-02-18 16:41:19 PST
executor: default
agent_completion: Spanish AI voice agent research complete -- Retell with ElevenLabs Mexican voice recommended.
---

# RESEARCH: Spanish AI voice agent research complete -- Retell with ElevenLabs Mexican voice recommended.

**Agent:** default
**Completed:** 2026:02:18:164119

---

## Agent Output

Now I have comprehensive data. Let me compile the full research report.

---

SUMMARY: Comprehensive research on Spanish-language AI voice agent platforms for Code Ninjas Stone Oak, San Antonio -- comparing 7 platforms, TTS providers, challenges, and market fit.

ANALYSIS: The popular narrative is that "all these platforms support Spanish equally." The data contradicts this. There are massive quality and reliability gaps between platforms for Spanish, and the bilingual mid-call switching that Stone Oak actually needs is only production-ready on 2-3 platforms.

---

# Spanish-Language AI Voice Agent Platform Comparison

## February 2026 Research Report -- Code Ninjas Stone Oak, San Antonio TX

---

## THE MARKET CONTEXT: WHY THIS MATTERS

Stone Oak, San Antonio has seen its Hispanic/Latino population grow to approximately 64.7% of the neighborhood according to recent demographic estimates ([AreaVibes](https://www.areavibes.com/san+antonio-tx/stone+oak/demographics/)). San Antonio citywide is 63.8% Hispanic ([Census QuickFacts](https://www.census.gov/quickfacts/sanantoniocitytexas)). A bilingual English-Spanish voice agent is not a nice-to-have -- it is a revenue capture tool. Research from Hostie AI found that businesses with bilingual voice AI capture **17% more call revenue** than English-only systems ([Hostie AI](https://hostie.ai/resources/bilingual-english-spanish-voice-ai-restaurant-revenue-tourist-markets)).

---

## PLATFORM-BY-PLATFORM COMPARISON

### 1. RETELL AI -- Spanish Support

**Status:** Full Spanish support. Production-ready. Multiple regional variants.

| Feature | Detail |
|---|---|
| Spanish supported | Yes -- since at least mid-2024 |
| Regional variants | es-ES (Spain), es-MX (Mexico), es-AR (Argentina), and Latin American variants via locale settings |
| Mid-call language switching | YES -- multilingual mode supports code-switching between English and Spanish in the same call |
| Auto language detection | Yes -- detects caller language and switches automatically |
| TTS providers for Spanish | ElevenLabs, Cartesia, MiniMax, OpenAI -- all available through Retell |
| Voice quality | High -- 4.7 stars on Product Hunt; users report callers cannot tell it is AI |
| Pricing | $0.07/min base, drops to $0.05/min at volume. No per-language surcharge |
| Latency | ~600ms response time (fastest in market) |
| Compliance | HIPAA, SOC 2 Type 1 & 2, GDPR across all plans |
| Limitation | Setting language to Spanish configures STT/pronunciation but does NOT force Spanish responses -- you must add "always respond in Spanish" to the prompt |

**Key fact:** Retell's docs confirm you can "make a multilingual agent who could speak English and Spanish at the same time" ([Retell Docs](https://docs.retellai.com/agent/language)). This is exactly what Stone Oak needs -- a caller who starts in Spanish gets Spanish; one who starts in English gets English; and Spanglish code-switching is handled.

**Sources:** [Retell Language Docs](https://docs.retellai.com/agent/language), [Retell Blog - Multilingual](https://www.retellai.com/blog/how-to-use-ai-phone-agents-for-multilingual-communication), [Retell Changelog](https://www.retellai.com/changelog)

---

### 2. VAPI -- Spanish Support

**Status:** Full Spanish support. Developer-focused. Requires manual provider configuration.

| Feature | Detail |
|---|---|
| Spanish supported | Yes -- 100+ languages claimed, Spanish explicitly supported |
| Mid-call language switching | YES -- two approaches: (1) automatic detection, (2) structured language selection at call start |
| Auto language detection | Yes, but requires specific STT provider: Deepgram Nova 2/3 "Multi" mode, Google STT "Multilingual", or Gladia |
| TTS providers for Spanish | Azure (e.g., es-ES-ElviraNeural), ElevenLabs, OpenAI TTS, PlayHT |
| Voice quality | Depends entirely on which TTS provider you configure |
| Pricing | $0.05/min platform fee ONLY. True cost is $0.13-$0.31/min including STT ($0.01/min), TTS ($0.02-$0.06/min), LLM ($0.02-$0.20/min), and telephony ($0.01/min) |
| Latency | ~700ms average |
| Limitation | You must "explicitly list the supported languages in your system prompt." More assembly required than Retell. Quality varies by provider stack chosen. |

**Key fact:** Vapi's real cost is 2.6x to 6.2x their advertised $0.05/min. A realistic Spanish voice agent on Vapi costs $0.15-$0.25/min once you add ElevenLabs TTS + Deepgram STT + GPT-4. ([Vapi Pricing Analysis](https://telnyx.com/resources/vapi-pricing))

**Sources:** [Vapi Multilingual Docs](https://docs.vapi.ai/customization/multilingual), [Vapi Pricing](https://vapi.ai/pricing), [CloudTalk Vapi Pricing Guide](https://www.cloudtalk.io/blog/vapi-ai-pricing/)

---

### 3. BLAND AI -- Spanish Support

**Status:** Technically supports Spanish. NOT recommended for production Spanish use.

| Feature | Detail |
|---|---|
| Spanish supported | Claimed yes. Practical reality: English is the only language that "reliably works for production use-cases" |
| Mid-call language switching | Not documented as a feature |
| Auto language detection | Not documented |
| Voice quality in Spanish | User reports suggest significantly lower quality than English |
| Pricing | $0.09-$0.11/min base. Hidden fees for GPT-4, transcription, voice cloning push real cost to $0.15-$0.25+/min |
| Enterprise requirement | "Accessing additional languages requires enterprise agreements and extra cost" |
| Latency | ~800ms (slowest of the three leaders) |

**The contrarian finding:** Bland AI markets itself as enterprise-grade, but multiple sources confirm Spanish is a second-class citizen. English is the only production-reliable language. If you need Spanish, look elsewhere. ([VoiceAI Space](https://www.voiceaispace.com/tool/bland-ai), [Smallest.ai Comparison](https://smallest.ai/blog/bland-ai-vs-smallest-ai))

**Pricing plans:** Start (free, 100 calls/day), Build ($299/mo, 2,000 calls/day), Scale ($499/mo, 5,000 calls/day), Enterprise (custom). ([Bland Billing Docs](https://docs.bland.ai/platform/billing))

---

### 4. SYNTHFLOW -- Spanish Support

**Status:** Good Spanish support. Markets to Spanish-speaking markets. Higher price point.

| Feature | Detail |
|---|---|
| Spanish supported | Yes -- including Argentinian Spanish accents confirmed in testing |
| Mid-call language switching | Yes -- tested moving between English and Spanish mid-conversation "without losing context or meaning" |
| Auto language detection | Yes, with speech recognition capturing regional accents |
| Voice quality | "Incredibly realistic" per user reviews. Spanish calls tested with <300ms latency on accent variations |
| Custom voice cloning | Upload 5 audio samples to create a custom Spanish voice |
| Pricing | Pro: $375/mo (2,000 min), Growth: $750/mo (4,000 min), Agency: $1,250/mo (6,000 min). Overage: $0.12-$0.13/min |
| Limitation | Removed $29 starter plan after Series A. Minimum entry is now $375/mo. User reports of poor customer support and billing issues. |

**Key fact:** Synthflow recently raised $20M Series A (June 2025) to drive global expansion. They are actively investing in multilingual, including Spanish. However, multiple users report billing disputes and absent support, which is a red flag for a franchise operation that needs reliability. ([BusinessWire - Synthflow $20M](https://www.businesswire.com/news/home/20250624442670/en/Synthflow-AI-Raises-$20M-to-Transform-the-$168B-Global-Conversational-AI-Market-With-Enterprise-AI-Voice-Agents), [Synthflow Reviews](https://synthflow.ai/reviews))

---

### 5. PLAYAI / PLAYHT -- Spanish Support

**Status:** Strong TTS platform. Meta acquired the team in July 2025. Future uncertain.

| Feature | Detail |
|---|---|
| Spanish supported | Yes -- 800+ voices across 140+ languages including Spanish regional variants |
| Conversational AI | Yes -- real-time conversational AI with turn-taking, interruption handling, emotion modulation |
| Languages | 30+ languages with local accents for voice agents |
| Voice quality | High quality -- generative model designed for conversational context |
| Pricing | Not publicly available post-Meta acquisition |
| CRITICAL NOTE | Meta acquired the entire PlayAI team in July 2025. The platform's independent future is uncertain. Building a business-critical system on a platform that just got acqui-hired is risky. |

**The contrarian take:** PlayAI had arguably the best conversational voice quality in the market. But the Meta acquisition means the standalone product could be deprecated, folded into Meta's ecosystem, or pivot direction at any time. Not recommended for a new deployment. ([TechRadar - PlayAI](https://www.techradar.com/computing/artificial-intelligence/what-is-playai-everything-we-know-about-this-text-to-speech-voice-cloning-platform), [YC - PlayAI](https://www.ycombinator.com/companies/playai))

---

### 6. AIR AI -- Spanish Support

**Status:** DO NOT USE. Platform is effectively dead.

| Feature | Detail |
|---|---|
| Spanish supported | No. English only. "Does not officially promote multilingual capabilities" |
| Pricing | $25,000-$100,000 upfront licensing fee + $0.11/min outbound, $0.32/min inbound |
| Platform status | "Inactive with no public roadmap or formal support channel" as of 2025 |
| FTC action | In August 2025, the FTC filed a lawsuit alleging deceptive claims about business growth and earnings potential |
| Recommendation | Avoid entirely |

**This is the starkest finding in the research:** Air AI is not just lacking Spanish support -- the platform appears to be functionally dead, facing an FTC lawsuit, and has no public support channels. Any agency recommending Air AI in 2026 is either uninformed or deceptive. ([Lindy - Air AI Review](https://www.lindy.ai/blog/airai-reviews), [ServiceAgent - Air AI Review](https://serviceagent.ai/blogs/air-ai-review/))

---

### 7. ELEVENLABS CONVERSATIONAL AI -- Spanish Support

**Status:** Best voice quality in the market. Newer as a full agent platform. Good for voice quality-critical use cases.

| Feature | Detail |
|---|---|
| Spanish supported | Yes -- 32+ languages. Specific Spanish regional variants (Castilian, Mexican, Colombian, Argentine, Chilean, etc.) |
| Conversational AI 2.0 | Launched with sub-100ms latency, enterprise features |
| Voice quality | Industry-leading. "Gold standard for AI-powered conversations" |
| Mid-call language switching | Supported -- "customer speaks Spanish, receives support in English, hears response in their preferred language" |
| Pricing | $0.08-$0.10/min for voice calls (Creator/Pro/Business plans). Does NOT include LLM costs (add 10-30%) |
| 95% silence discount | Periods of silence >10 seconds get 95% cost reduction |
| Test call discount | Setup/testing calls billed at half cost |
| Limitation | Not designed for enterprise call center workflows. Lacks strong human handoff, multi-channel (phone/SMS/email), persistent memory across customer profiles. Missing HIPAA compliance on lower tiers. |

**Key fact:** ElevenLabs has the best Spanish voices in the market hands down. Their voice library has 500+ Spanish voices across all regional accents (Castilian, Mexican, Colombian, Argentine, Chilean, Caribbean). If voice quality is the top priority, ElevenLabs wins. But as a full phone agent platform, it lacks the telephony maturity of Retell. ([ElevenLabs Spanish TTS](https://elevenlabs.io/text-to-speech/spanish), [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai))

---

## BEST SPANISH TTS VOICES BY PROVIDER

### ElevenLabs (Best Overall Quality)
- **Elena** -- Clear female voice, natural/pleasant, neutral Spanish
- **Yinet** -- Upbeat Colombian female, approachable, versatile with emotional range
- **Leo** -- Energetic warm Mexican male, charismatic, natural conversational delivery
- **Mariana** -- Intimate Argentine female, deep/clear/emotional
- **Dante** -- Castilian middle-aged male, excited/dynamic, good for narration
- **Ginyin** -- Young Castilian male, good for social media content
- 500+ total Spanish voices in their library
- Uses Multilingual V2 model for best stability
- Cost: Most expensive TTS option (~$0.036/min through Vapi, varies by plan)

### Azure Neural TTS (Best Value)
- **ElviraNeural** (es-ES) -- Female, Spain accent, very natural
- **DragonHDLatestNeural** -- New HD voice with automatic emotion detection
- 38 new es-MX (Mexico) voices added in public preview (Feb 2025)
- 46 new es-ES (Spain) voices added in preview
- HD voices detect emotional cues and adjust tone automatically
- Cost: ~$16 per 1,000,000 characters (very affordable at scale)

### Google Cloud TTS (Best for Scale)
- **Chirp 3: HD** -- Latest generation, 8 speakers across es-ES and es-US locales
- 380+ voices total across 75+ languages
- Good integration with Google ecosystem
- Cost: ~$16 per 1,000,000 characters (comparable to Azure)

**Sources:** [ElevenLabs Spanish Voices](https://json2video.com/ai-voices/elevenlabs/languages/spanish/), [Azure Feb 2025 Updates](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/azure-ai-speech-text-to-speech-feb-2025-updates-new-hd-voices-and-more/4387263), [Google Chirp 3 HD](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd)

---

## COMMON CHALLENGES WITH SPANISH AI VOICE AGENTS

### 1. Regional Dialect Variation
Models trained on one variant show **20-40% accuracy degradation** on other variants. Mexican Spanish vocabulary differs from Argentine, Colombian, Castilian, and Caribbean Spanish. For Stone Oak San Antonio, the target is primarily **Mexican Spanish** and **Tex-Mex/border Spanish** -- not Castilian. ([Hamming AI](https://hamming.ai/language/spanish))

### 2. Formality Levels (Tu vs. Usted)
Spanish has formal (usted/ustedes) and informal (tu/vos/vosotros) address systems that vary by region. In Mexico, usted is used more commonly with strangers and in business contexts. A voice agent for Code Ninjas parents should default to **usted** for initial calls -- it signals respect. The LLM prompt must specify this.

### 3. Code-Switching / Spanglish
In San Antonio specifically, many callers will mix English and Spanish within the same sentence ("I want to sign up mi hijo for the summer camp"). The STT must handle this Spanglish mid-sentence, not just full-language switches. Deepgram's "Multi" mode and Retell's multilingual mode both claim to support this. ([Hamming AI](https://hamming.ai/resources/multilingual-voice-agent-testing))

### 4. Cultural Sensitivity
Spanish-speaking users "quickly detect when interactions feel inauthentic or culturally tone-deaf." This means the voice, word choices, and conversational flow all need to feel natural to a Mexican-American parent in San Antonio -- not like a Spain-accent voice reading a translation. ([Gladia Blog](https://www.gladia.io/blog/multilingual-voice-agents))

### 5. Testing Requirements
Production-grade Spanish voice agents require testing with Mexican, Argentine, Colombian, and Castilian speakers -- at minimum 300+ test scenarios for production monitoring. ([Hamming AI](https://hamming.ai/language/spanish))

---

## CODE NINJAS AND SPANISH AI

No public evidence exists of any Code Ninjas franchise deploying a Spanish-language AI voice agent. Code Ninjas corporate has launched an AI Academy curriculum and Academies program, but these are English-language educational products -- not operational AI tools for franchise communication. ([Code Ninjas Blog](https://blog.codeninjas.com/ai-academy-code-ninjas/))

No kid-focused education franchise (Mathnasium, Kumon, Sylvan, Bricks 4 Kidz) has publicly deployed a Spanish AI voice agent either. This represents a **first-mover advantage opportunity** for Stone Oak.

---

## RANKED RECOMMENDATIONS FOR CODE NINJAS STONE OAK

### Tier 1: Recommended

**1. RETELL AI (Current Platform -- Best Overall Fit)**
- You are already on Retell. Spanish is a configuration change, not a platform migration.
- Mid-call code-switching works. Auto language detection works.
- $0.07/min with no per-language surcharge.
- HIPAA compliant (relevant if you capture any health-related info about kids).
- Use ElevenLabs voices through Retell for best Spanish voice quality.
- Fastest latency at ~600ms.
- **Action:** Add a second agent or modify Emma's prompt to include bilingual instructions. Set language to "multilingual" mode. Select a Mexican-Spanish ElevenLabs voice (like "Leo - Energetic Warm Mexican") for the Spanish TTS.

**2. ELEVENLABS CONVERSATIONAL AI (Best Voice Quality)**
- If voice quality is paramount and you want the most natural-sounding Spanish.
- 500+ Spanish voices with regional accent selection.
- $0.08-$0.10/min + LLM costs.
- Weaker on telephony features, human handoff, compliance compared to Retell.
- Consider this if you want to run ElevenLabs as a standalone for a Spanish-only line, while keeping Retell for English.

### Tier 2: Viable Alternatives

**3. VAPI (If You Want Full Control of Provider Stack)**
- Good if you want to hand-pick every component (STT, TTS, LLM, telephony).
- True cost is $0.13-$0.31/min.
- More developer work required than Retell.
- Mid-call switching works with correct provider configuration.

**4. SYNTHFLOW (If You Want a No-Code Approach)**
- Good Spanish quality, <300ms latency on Spanish reported.
- $375/mo minimum is steep for a single franchise location.
- Customer support concerns are a real risk.

### Tier 3: Avoid

**5. BLAND AI** -- English-only reliable. Spanish is enterprise-gated and underperforming.
**6. PLAYAI** -- Meta acquired the team. Platform future is uncertain.
**7. AIR AI** -- Dead platform. FTC lawsuit. No Spanish. No support. Avoid entirely.

---

## PRICING COMPARISON TABLE (All-In Estimated Cost Per Minute)

| Platform | Advertised | Realistic All-In | Spanish Surcharge |
|---|---|---|---|
| Retell AI | $0.07/min | $0.07-$0.12/min | None |
| Vapi | $0.05/min | $0.13-$0.31/min | None (but provider costs vary) |
| ElevenLabs | $0.08-$0.10/min | $0.10-$0.15/min | None |
| Synthflow | $0.12-$0.13/min overage | $0.19-$0.31/min (plan-based) | None |
| Bland AI | $0.09-$0.11/min | $0.15-$0.25/min | Enterprise agreement required |
| Air AI | $0.11/min outbound | $0.11-$0.32/min + $25K-$100K license | N/A -- no Spanish |

---

## BOTTOM LINE

The data shows a clear path: **Stay on Retell AI and enable multilingual mode with a Mexican-Spanish ElevenLabs voice.** You are already on the platform. Spanish is not a migration -- it is a configuration change. Retell has the best combination of Spanish support, code-switching capability, pricing transparency, compliance certifications, and latency performance.

The only scenario where you would consider moving is if voice quality alone is the deciding factor and you are willing to sacrifice telephony maturity -- in which case ElevenLabs Conversational AI standalone is the voice quality leader.

No education franchise has publicly deployed Spanish AI voice agents. Stone Oak would be a first mover in the Code Ninjas network for bilingual AI.

---

RESULTS: Seven platforms researched with specific facts on Spanish support, pricing, limitations, and production readiness. Three TTS providers compared for Spanish voice quality. Market demographics confirm 64.7% Hispanic population in Stone Oak.

STATUS: Research complete. Retell AI on your existing stack is the recommended path. Enable multilingual mode, configure a Mexican-Spanish ElevenLabs voice, update the prompt for bilingual behavior.

CAPTURE: Retell multilingual mode supports English-Spanish code-switching in same call. ElevenLabs has 500+ Spanish voices including Mexican accent (Leo voice). Air AI is dead with FTC lawsuit. No education franchise has deployed Spanish AI voice agents publicly. Stone Oak is 64.7% Hispanic. Synthflow has billing/support red flags despite good Spanish quality. Vapi true cost is 2.6-6.2x advertised rate.

NEXT: (1) Configure Retell Emma agent for bilingual English-Spanish with multilingual mode enabled. (2) Select and test a Mexican-Spanish ElevenLabs voice through Retell. (3) Write bilingual prompt that defaults to usted formality and handles Spanglish code-switching. (4) Create Cekura test scenarios for Spanish call flows. (5) Test with native Mexican-Spanish speakers in San Antonio.

STORY EXPLANATION:
1. Stone Oak San Antonio is 64.7% Hispanic -- Spanish-capable voice AI is a revenue necessity, not a feature request.
2. Retell AI, your current platform, already supports full Spanish with mid-call code-switching, auto language detection, and Mexican Spanish voices through ElevenLabs integration.
3. ElevenLabs has the highest quality Spanish voices in the market (500+ voices, regional accents including Mexican, Colombian, Argentine, Castilian) but is weaker as a standalone phone agent platform.
4. Vapi works for Spanish but costs 2.6-6.2x their advertised rate once you add all required providers, and requires more developer configuration.
5. Synthflow has good Spanish quality but a $375/month minimum entry point and concerning customer support/billing issues post-Series A.
6. Bland AI, Air AI, and PlayAI should all be avoided -- Bland's Spanish is unreliable in production, Air AI is dead with an FTC lawsuit, and PlayAI was acquired by Meta with uncertain future.
7. The biggest technical challenges for San Antonio specifically are Tex-Mex Spanglish code-switching within sentences, proper usted/tu formality defaults, and ensuring a Mexican (not Castilian) accent that feels culturally authentic.
8. No education franchise has publicly deployed Spanish AI voice agents -- this is a genuine first-mover advantage for Code Ninjas Stone Oak in a market where bilingual businesses capture 17% more call revenue.

COMPLETED: Spanish AI voice agent research complete -- Retell with ElevenLabs Mexican voice recommended.
agentId: af98baf (for resuming to continue this agent's work if needed)
<usage>total_tokens: 50365
tool_uses: 32
duration_ms: 244549</usage>

---

## Metadata

**Transcript:** `/root/.claude/projects/-root/01f06439-9b80-4a46-aa4f-86cc307f32b4.jsonl`
**Captured:** 2026-02-18 16:41:19 PST

---

*This output was automatically captured by UOCS SubagentStop hook.*
