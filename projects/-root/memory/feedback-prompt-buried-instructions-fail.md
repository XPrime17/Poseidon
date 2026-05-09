---
name: Buried "skip" instructions in numbered lists are unreliable
description: When writing voice-agent prompts, hard behavioral rules ("skip X", "do NOT do Y") need to be top-level paragraphs, not sub-steps inside a numbered list — the LLM partially complies then resumes the surrounding default flow
type: feedback
originSessionId: 2c97f9cb-4cdb-4e97-bcba-8723ce37c09d
---
# Buried "skip" instructions in numbered lists are unreliable

**Rule:** When a voice-agent prompt has a numbered procedure that includes a step like "5. Confirm booking → Stage 6 closing. SKIP discovery questions" — the LLM will often follow steps 1–4 of that procedure but then drop back into the prompt's default flow (Stage 3 in this case) instead of honoring the SKIP. The structural gravity of an explicit Stage 3 section beats a "skip" bullet inside a step list.

**Why:** Concrete observation — 2026-05-09 St. Catharines call (call_5499f166200778f0a537716c8e0): Fast-Track Booking step 5 said "SKIP discovery questions" but the LLM still asked the Stage 3 Minecraft/Roblox question after collecting name. The "skip" instruction was 3 levels deep (subsection → numbered list → end of bullet text) while Stage 3 was a top-level section heading.

**How to apply:**
1. When you need an LLM to "not do X," put the rule at the TOP level of its containing section, not buried in a step.
2. Phrase it as a commitment / state ("Once X, you are committed. Do NOT do Y.") rather than a footnote ("...skip X").
3. List the specific behaviors to avoid by name (e.g., "Do NOT ask the Minecraft/Roblox question, do NOT pitch what kids build, do NOT re-invite") — generic phrases like "skip discovery" leave too much room for LLM to define what counts as discovery.
4. Ideally, also gate the trigger more permissively so the right path fires reliably. Edit the routing rule, not just the destination.
