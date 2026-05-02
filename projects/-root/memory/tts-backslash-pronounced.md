---
name: TTS reads backslash-escaped exclamation as "Hush"
description: Retell TTS pronounces `\!` (backslash-escaped exclamation) as the word "Hush" or similar audible artifact. Never escape punctuation in begin_message or prompt text.
type: feedback
originSessionId: a90d282e-326b-4650-a035-86b23df65325
---
Retell TTS reads `\!` literally — the backslash is not stripped, and the engine produced the audible word "Hush" on call_47c3f2f7ef40c81bd7cdd07d0f8 (EG inbound, 2026-05-02). Affected token took 1.1s to speak vs ~0.3s for a clean `!`.

**Why:** TTS engines tokenize on whitespace and don't honor markdown/shell escape conventions. Backslashes in `begin_message` or any spoken text get pronounced. Whoever wrote the EG `begin_message` likely escaped `!` thinking JSON or markdown required it — it doesn't.

**How to apply:**
- Never escape punctuation in Retell `begin_message`, `general_prompt`, `static_text` voicemails, or any other field that gets spoken.
- When auditing a new agent, grep for `\\!`, `\\?`, `\\.`, `\\,` in the spoken fields specifically (begin_message > prompt body, since first sentence is highest-impact).
- This is a sister gotcha to the existing rule "write symbols as words" ($3 → "three dollars"): TTS is dumb about anything other than plain alphanumerics + standard punctuation.
- Other 10 CNKB outbound agents and Leaside inbound should be spot-checked for the same escape pattern next time their begin_message is touched.
