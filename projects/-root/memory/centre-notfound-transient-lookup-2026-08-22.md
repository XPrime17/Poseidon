---
name: ""
metadata: 
  node_type: memory
  originSessionId: 07c2f2da-2c13-43ca-8da2-a72b86302836
---

Scott's 8/21 "Centre not found" n8n email (body was literally just "Centre not found" — zero context): outbound exec 28527, 8/21 21:12 ET. HubSpot Zap lead **Mariem Ben Sayeh, +1 437-318-9340, myriambensayeh@gmail.com, Leaside** (`scott.james1717+leaside-on-ca@gmail.com`). `Extract Centre` parsed the slug fine; **`Lookup Centre` returned an empty item for a slug that exists** (row 8, exact match, worked 8/19 and 8/22) → transient Sheets lookup miss (mid-edit or API hiccup) → `Centre Found?` false → email → **lead consumed, never appended, never dialed**.

Recovery 8/22 ~16:19 ET: appended row 513 per _SYSTEMCHECK runbook (`Mariem-4373189340`, retry_pending, attempts 0, `last_outcome=backlog_recovered`, lead_program=create), read-back verified; scheduler dials on next tick (Leaside cached).

Also shipped: `Centre not found` Gmail node now includes slug/To/From/subject/snippet + recovery instruction (was a contentless one-liner — cost real diagnosis time). Backup `/root/n8n-backups/centre-notfound-email-2026-08-22-before.json`. No literal braces used (see [[n8n-brace-escape-invalid-syntax-2026-08-20]]).

**Pattern to watch:** transient Centre Lookup misses on valid slugs are a silent-drop class — the false branch consumes the lead with no retry. If a second occurrence shows up, add a one-retry (or 5s wait + re-lookup) before the Centre Found? gate, or alwaysOutputData audit. Related: [[testing-flag-string-false-misdial-2026-08-20]] (same HubSpot go-live week), [[outbound-email-overhaul-2026-08-14]] (silent-drop email fixes).
