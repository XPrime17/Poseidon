---
name: Droplet /usr/bin/claude missing after npm half-upgrade
description: How to recognize and recover from an interrupted npm global upgrade of @anthropic-ai/claude-code on the DigitalOcean droplet
type: reference
originSessionId: 6f3a6f1f-46a9-433c-afc6-34aa9146c41a
---
# Symptom
Other shells (new ones, not currently-running claude sessions) error with:
```
-bash: /usr/bin/claude: No such file or directory
```
…while existing claude sessions keep working. `which claude` returns nothing in fresh shells.

# Root cause pattern
`npm install -g @anthropic-ai/claude-code` was started but never finished. Tells:
- `/usr/lib/node_modules/@anthropic-ai/claude-code/` contains ONLY `node_modules/` — no `package.json`, no `bin/`, no `install.cjs`, no `cli-wrapper.cjs`.
- Platform stub dirs (e.g. `claude-code-linux-x64/`) are empty.
- A sibling staging dir like `/usr/lib/node_modules/@anthropic-ai/.claude-code-<HASH>/` (leading dot + 8-char hash) still exists, fully populated with the previous version.
- `/usr/bin/claude` does not exist — npm removed the symlink during the swap and never recreated it.
- `readlink /proc/<pid>/exe` on a running claude shows `…claude.exe (deleted)` — that's the unlinked inode the process is holding open.

# Two recovery options
## A. Symlink fix (zero-risk, 30 sec, keeps current version)
```
ln -s /usr/lib/node_modules/@anthropic-ai/.claude-code-<HASH>/bin/claude.exe /usr/bin/claude
```
Restores other shells instantly. Use the staging dir name from `ls /usr/lib/node_modules/@anthropic-ai/`.

## B. Clean reinstall (upgrade to latest, npm re-creates symlink)
```
npm install -g @anthropic-ai/claude-code@latest
```
Replaces the broken `claude-code/` husk and recreates `/usr/bin/claude`. Running claude sessions are unaffected (they hold the old inode in memory until restart).

# Verification (always run from clean env so test doesn't ride on parent shell state)
```
env -i HOME=/root PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin bash -lc 'which claude && claude --version'
```
Should print `/usr/bin/claude` and a version line.

# Historic incident
2026-06-12: Scott reported the error. Symlink fix chosen (Option A) to match the 2.1.170 version live sessions were already on. Registry had 2.1.174 available for later upgrade. Old staging dir was `.claude-code-ZjqcDZyQ`.
