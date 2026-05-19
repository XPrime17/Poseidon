# Spanish Voice AI Research (2026-02-17)

## Key Finding: Do NOT Use Multi Mode on Working English Agents
- Retell `language: "multi"` degrades English performance: WER +1-7pts, turn detection -7pts (~97% → ~90%), ASR latency +50-110ms
- No vendor (Retell, Deepgram, ElevenLabs) claims multi mode equals single-language mode for English
- TTS is the exception: multilingual TTS models (Cartesia Sonic-3, ElevenLabs Flash v2.5) match or beat English-only predecessors
- **Recommendation: Dedicated Spanish agent (Option 2) over multi mode (Option 1)** — protects English quality

## Retell Spanish Support
- Full support: `es-ES` (Spain), `es-419` (Latin America), `multi` (auto-detect)
- 50+ languages total, Spanish is first-tier since multilingual launch
- No per-language surcharge — same $0.07/min
- LLM prompt MUST explicitly say "respond in Spanish" — `language` param only controls STT/TTS
- Use `usted` formality for business calls (Mexican Spanish convention)

## Platform Rankings for Spanish Voice AI
- **Retell** (current): Best overall — stay here, add dedicated Spanish agent ($0.07-0.12/min)
- **ElevenLabs Conv AI**: Best voice quality, 500+ Spanish voices, weaker telephony ($0.10-0.15/min)
- **Vapi**: Works but true cost 2.6-6x advertised $0.05/min ($0.13-0.31/min real)
- **Synthflow**: Good Spanish, $375/mo minimum, customer support red flags
- **Bland AI**: Spanish enterprise-gated, unreliable in production — avoid
- **PlayAI**: Meta acquired team July 2025, platform future uncertain — avoid
- **Air AI**: Dead platform, FTC lawsuit Aug 2025 — never recommend

## Implementation Plan (When Ready)
- Create new Retell agent with `language: es-419`, Mexican-accent ElevenLabs voice (e.g., "Leo")
- Write full Spanish prompt with `usted` formality, Code Ninjas context
- Route via IVR ("Press 1 for English, 2 para Espanol") or n8n webhook language detection
- Stone Oak is 64.7% Hispanic — Spanish is revenue capture, not a feature request
- No education franchise has deployed Spanish AI voice agents — first-mover advantage
- GitHub issue: XPrime17/lead-reactivation#19 (Ana Hockman callback + Spanish research)

## Multi-Mode Performance Data (Benchmarks)
| Component | English-Only (en-US) | Multi Mode | Delta |
|-----------|---------------------|------------|-------|
| STT WER | 6.8-9.1% | 8-15% | +1-7 pts |
| Turn Detection | ~97% accuracy | ~90% accuracy | -7 pts |
| ASR Latency | ~190ms | <300ms | +50-110ms |
| TTS Quality | Baseline | Same or better | No degradation |

## Voice Recommendations for Spanish
- **ElevenLabs "Leo"**: Energetic warm Mexican male — best for Stone Oak demographics
- Use `eleven_flash_v2_5` (multilingual, 75ms) NOT `eleven_multilingual_v2` (500-800ms) for agents
- **Cartesia Sonic-3**: 90ms, 42 languages, matches or beats Sonic-English — good alternative
- Voice selection matters more than language param for accent quality
