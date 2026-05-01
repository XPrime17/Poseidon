---
name: ManualFollowups
description: Registry of external/manual offboarding touchpoints the tool cannot automate. Tool reads the JSON block below at runtime to populate console output, exit-report checklist, and the followups email. Add new entries here — no code change needed.
---

# Manual Offboarding Followups

The Offboard.ts tool automates everything in `Inventory.md` that hits an API we control. Anything outside that — third-party vendors, billing portals, human approvals — lives here as a checklist Scott handles by hand.

## How it works

The tool parses the `FOLLOWUPS_JSON` fenced block below at runtime. Each entry has:
- `id` — stable slug for audit log
- `applies_to` — `["soft","hard"]` or `["hard"]` or `["soft"]` — which modes trigger this entry
- `condition` — optional gate: `"always"`, `"has_phone"`, `"has_kb"`, `"has_clickup"`, `"has_cekura"`, `"is_inbound"`
- `title` — one-line action
- `where` — vendor/portal name + URL or contact
- `details` — 1-3 lines on what to do
- `urgency` — `"before_call_routing_changes"` | `"within_24h"` | `"within_week"` | `"whenever"`

To add a new vendor (e.g. a new SMS service): add an entry to the JSON block. Tool picks it up next run.

## Registry

```FOLLOWUPS_JSON
[
  {
    "id": "hiya_caller_id_release",
    "applies_to": ["soft","hard"],
    "condition": "has_phone",
    "title": "Release Hiya caller-ID branding for {phone_number}",
    "where": "Hiya Connect portal — https://connect.hiya.com",
    "details": "Log in, find {phone_number} ({location_name}), remove the 'Code Ninjas {location_name}' display name registration. Keeps the phone number from showing the centre's brand if it's reassigned later.",
    "urgency": "within_week"
  },
  {
    "id": "chatdash_disconnect",
    "applies_to": ["soft","hard"],
    "condition": "always",
    "title": "Disconnect Chatdash integration for {location_name}",
    "where": "Chatdash admin — https://app.chatdash.com",
    "details": "Remove the agent webhook for {location_name} so any residual chat→voice handoffs stop firing. Centre-level toggle, not workspace-wide.",
    "urgency": "within_24h"
  },
  {
    "id": "kb_doc_archive",
    "applies_to": ["hard"],
    "condition": "has_kb",
    "title": "Rename KB Google Doc to [ARCHIVED-{date}]",
    "where": "Google Drive: {kb_url}",
    "details": "Open the doc, prefix the title with [ARCHIVED-{date}]. Optionally move to the 'Archived KBs' Drive folder. Doc content is preserved.",
    "urgency": "whenever"
  },
  {
    "id": "cekura_archive",
    "applies_to": ["hard"],
    "condition": "has_cekura",
    "title": "Archive Cekura test scenarios for agent {agent_id}",
    "where": "Cekura MCP — invoke from Claude Code",
    "details": "Run: mcp__cekura__scenarios_list filter agent_id={agent_id}. Then mcp__cekura__scenarios_folder_create name='[Archived] {agent_name}'. Then mcp__cekura__scenarios_folder_move each scenario into it.",
    "urgency": "within_week"
  },
  {
    "id": "twilio_account_review",
    "applies_to": ["hard"],
    "condition": "has_phone",
    "title": "Verify Twilio number {phone_number} fully released",
    "where": "Twilio Console — https://console.twilio.com → Phone Numbers → Active",
    "details": "After --hard, the Retell delete should release back to Twilio. Confirm the number no longer appears in your Active list. If it does, manually release. Avoids the ~$1.15/mo orphan-number charge.",
    "urgency": "within_24h"
  },
  {
    "id": "centre_call_forwarding",
    "applies_to": ["soft","hard"],
    "condition": "is_inbound",
    "title": "Email director to remove call forwarding for inbound centres",
    "where": "Centre director: {director} <{centre_email}>",
    "details": "Inbound-pilot centres set up *72 forwarding from their landline to our Twilio number. Ask them to dial *73 to cancel. Without this, their landline still routes to a dead Retell agent.",
    "urgency": "before_call_routing_changes"
  },
  {
    "id": "clickup_archive_check",
    "applies_to": ["hard"],
    "condition": "has_clickup",
    "title": "Verify ClickUp folder archived (auto-archived if found)",
    "where": "ClickUp — Voice AI space → {location_name}",
    "details": "Tool auto-archives if found. If skill skipped (folder not found), check manually. NV centres typically had no ClickUp footprint.",
    "urgency": "whenever"
  },
  {
    "id": "n8n_workflow_dead_branches",
    "applies_to": ["hard"],
    "condition": "always",
    "title": "Remove dead-branch references in n8n workflows (if present)",
    "where": "n8n cloud — https://xprime17.app.n8n.cloud",
    "details": "Most workflows key off Centre Lookup enabled flag → no edits needed. BUT: any hardcoded centre_id references in expressions (rare, mostly in legacy nodes) should be cleaned up. Grep workflows for '{centre_id}' first.",
    "urgency": "whenever"
  },
  {
    "id": "director_email_review",
    "applies_to": ["soft","hard"],
    "condition": "always",
    "title": "Review draft director email and send (or don't)",
    "where": "Exit report: /root/offboard-archives/{centre_id}-{date}/director-email.md",
    "details": "Draft prepared with final stats and offboard summary. Read, edit tone, send via your preferred method. Skill does NOT auto-send.",
    "urgency": "within_week"
  },
  {
    "id": "billing_proration",
    "applies_to": ["hard"],
    "condition": "always",
    "title": "Adjust billing — refund or stop next invoice",
    "where": "Internal — your billing system / Stripe / invoice tool",
    "details": "If centre prepaid the month: prorate and refund. If on monthly invoice: cancel next charge. Document the offboard date for audit. Voice AI Agency standard.",
    "urgency": "within_week"
  },
  {
    "id": "github_issue_close",
    "applies_to": ["soft","hard"],
    "condition": "always",
    "title": "Close any open GitHub issues tagged with this centre",
    "where": "https://github.com/XPrime17/lead-reactivation/issues",
    "details": "Search issues for '{location_name}' or '{centre_id}'. Close with comment referencing offboard date. Avoids stale-issue noise on next triage.",
    "urgency": "whenever"
  }
]
```

## Adding a New Vendor

1. Edit this file, add a new JSON entry to the array above
2. Use template variables in `title`/`details`: `{centre_id}`, `{location_name}`, `{director}`, `{centre_email}`, `{phone_number}`, `{agent_id}`, `{agent_name}`, `{kb_url}`, `{date}`
3. Test: `bun Tools/Offboard.ts --centre <id> --mode <m> --dry-run` — your entry should appear in the followups section
4. Commit (no code changes needed)

## Why This Lives Here Instead of in Code

- Adding a vendor doesn't require redeploying the tool
- Scott can edit the registry without touching TypeScript
- The registry IS the source of truth for what's manual — easier to audit
- Future skills can read this same file for similar manual-handoff patterns
