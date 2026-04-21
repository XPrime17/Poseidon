---
name: Voice AI issue tracker
description: Where to file bugs for the voice AI pipeline (Retell + n8n + Skyvern + ClickUp)
type: reference
originSessionId: d6b5ab44-7a3a-4f8f-9d31-dab3a6089bda
---
## GitHub repo for Voice AI bugs

**Repo:** `XPrime17/lead-reactivation` (private)

Despite its name referring to the (abandoned) Cloudflare Worker, this is the **active issue tracker for all voice AI pipeline bugs** — Retell agents (inbound + outbound), n8n workflows, Skyvern tour booking, ClickUp integrations, Bell forwarding, KB injection, etc.

## Conventions

Labels available:
- **Type:** `bug`, `enhancement`, `question`, `documentation`
- **Agent scope:** `emma`, `cnkb`, `cneggpt` (cnkb covers both outbound + inbound variants)
- **Priority:** `priority-high` (hurting business, fix ASAP), `priority-medium` (should fix soon), `priority-low`
- **Other:** `prompt` (for prompt-engineering changes), `centre-feedback`, `urgent`, `feedback-escalation`

Example issues: #47 (Retell voicemail detection bug), #48 (retry gap enhancement), #49 (Skyvern silent-failure).

## Use gh CLI

`gh issue create --repo XPrime17/lead-reactivation --label bug,cnkb,priority-high --title "..." --body "..."`

Check existing issues first: `gh issue list --repo XPrime17/lead-reactivation --state open`
