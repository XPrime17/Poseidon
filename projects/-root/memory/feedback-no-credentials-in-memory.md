---
name: No live credentials in memory files
description: Memory files get pushed to public GitHub — passwords, API keys, SIP auth secrets, and full account credentials must be redacted with 1Password pointers
type: feedback
originSessionId: a1d4090d-9041-46db-b8be-d9a7c18eafa5
---
Never write live credentials into memory files. The memory dir is committed to a public GitHub repo (XPrime17/Poseidon), and GitHub secret scanning will block pushes containing detected secrets. Even if scanning misses a credential, public exposure is the bigger risk.

**Why:**
- 2026-02-14: prior incident where assistant committed sensitive memory files to public GitHub (logged in MEMORY/LEARNING/FAILURES).
- 2026-04-25: GitHub push protection caught a Twilio SIP password (`Twiliopass!7`) in `leaside-inbound.md:15` and rejected the push. Commit had to be reset, redacted, and re-committed. The bad credential lived in the local reflog briefly — required rotation as defense-in-depth.

**How to apply:**
- When documenting infrastructure in a memory file, write **pointers**, not secrets:
  - Bad: `SIP auth: leaside / Twiliopass!7`
  - Good: `SIP auth: leaside / [REDACTED — see 1Password "Twilio Leaside SIP password"]`
- Treat as secret: passwords, API keys, JWT tokens, SIP auth, OAuth refresh tokens, signing keys, webhook signing secrets, full DSNs/connection strings.
- Treat as borderline (avoid co-locating with secrets): Twilio Account SIDs, Phone SIDs — secret scanners flag these as patterns when they appear near passwords.
- Identifiers safe to write: agent IDs, workflow IDs, phone numbers, sheet IDs, public webhook URLs (even on n8n cloud — these are public endpoints).
- If you catch yourself about to write a credential, redact at the point of writing — don't rely on a later cleanup pass.
- After a push is blocked by secret scanning: redact, reset --soft, recommit, push, AND tell Scott to rotate the credential since it lived in the local reflog.
