---
capture_type: LEARNING
timestamp: 2026-06-12 03:39:16 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-06-12
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

**🔧 BUILD** — Diagnosis complete, awaiting your call before touching global state.

## What happened
On **Jun 10, 01:06** an npm upgrade was started but never finished. The new dir `/usr/lib/node_modules/@anthropic-ai/claude-code/` only contains empty platform-stub folders — no `package.json`, no `bin/`, no `install.cjs`. The previous install's staging dir `.claude-code-ZjqcDZyQ/` is still intact (v2.1.170, 247 MB binary), and the `/usr/bin/claude` symlink that used to point into it was removed during the failed swap and never recreated.

All your currently-running `claude` shells (PIDs 399287, 460237, 784487, 848775, 862070, 1176368, 2245557, this one) are running off an inode they held open — they'll keep working until you exit them.

## Two ways to fix — pick one

**Option A — Symlink fix (30 seconds, zero risk, keeps you on 2.1.170)**
```
ln -s /usr/lib/node_modules/@anthropic-ai/.claude-code-ZjqcDZyQ/bin/claude.exe /usr/bin/claude
```
Restores other shells immediately. Pins to the version your running sessions are already on. Leaves the broken `claude-code/` shell on disk (cosmetic).

**Option B — Clean reinstall (1-2 minutes, upgrades to 2.1.174)**
```
npm install -g @anthropic-ai/claude-code@latest
```
npm replaces the broken dir and recreates `/usr/bin/claude` itself. New shells get 2.1.174; your existing claude sessions keep running on the old in-memory binary until restart.

**Recommendation: Option A first** — fastest, reversible, keeps version parity with your live sessions. You can do Option B later at a calmer time.

Which one? (Or both — A now, B tonight.)

**📊 ISC**
- ✅ Located real binary: `/usr/lib/node_modules/@anthropic-ai/.claude-code-ZjqcDZyQ/bin/claude.exe` (v2.1.170, runs)
- ✅ Root cause identified: interrupted npm upgrade Jun 10 01:06 left `claude-code/` an empty husk and removed the `/usr/bin/claude` symlink
- ⏳ Awaiting your A/B choice before mutating global state
- ⏳ Post-fix verification from clean shell

🗣️ **PAI**: Your shells are pointing at a path that no longer exists, Scott — the `claude` install half-upgraded itself two days ago and never finished. The old binary is still on disk and runs fine; I just need your go-ahead to either symlink it back (safe, 30 seconds) or reinstall fresh (bumps you to 2.1.174). Which way?

</details>
