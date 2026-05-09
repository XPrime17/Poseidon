---
name: AI's "staff will reach out" promise has no follow-up wiring
description: When the AI offers a Junior program (or any secondary handoff), it tells the parent a staff member will contact them — but no workflow actually creates a notification or task. The promise dies.
type: project
originSessionId: d29cfbb1-96b5-46a9-911c-1cfb225d76c2
---
# AI "staff will reach out" promise — silent drop

When a parent calls about multiple children and one falls outside the Create age range (5–7 = Junior, 8–14 = Create), the voice AI prompt instructs it to say "a staff member will reach out to you with everything you need" for the Junior-aged child. **No workflow node currently honors that promise.** The post-call analysis captures the parent's name + phone but no downstream node fires a notification email to the centre flagging "Junior program follow-up needed for [child name, age N]".

**Why noticed:** Viji Ruban's call 2026-05-02 (call_a1a9b145c659495031388bc641f, Pickering). She has a 9yo (Cheney → Create tour booked) AND a 6yo (Junior → AI promised staff outreach). Tour booking flowed through; Junior outreach silently dropped. Even after the Skyvern dead-branch fix today, this separate dropping pattern remains.

**How to apply:** When the End Of Call workflow detects `Child's Age` ≤ 7 OR detects "Junior" / "younger sibling" / "second child" markers in the detailed_call_summary, fire a parallel Gmail node to centre_email with subject "JUNIOR PROGRAM FOLLOW-UP NEEDED" and the parent's contact info. Currently no such branch exists. Audit candidates: re-scan past EOC executions for transcripts containing "I'll have one of our staff members reach out" and confirm none were notified.
