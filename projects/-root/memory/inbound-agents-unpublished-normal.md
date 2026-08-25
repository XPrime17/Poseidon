---
name: inbound-agents-unpublished-normal
description: "All CNKB inbound Retell agents run is_published=False — this is normal, not a bug; don't chase it"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 166b127f-0d9e-4431-83a7-500b89423214
---

Every CNKB inbound agent shows **`is_published: False`** on `/get-agent`, yet inbound calls work fine. Verified 2026-07-19 across all four live-inbound numbers — StCath (`agent_fa9245…`) and EG (`agent_17d623…`), both proven with real tour bookings, are also `is_published:False`. So do NOT treat that flag as the cause of an inbound problem.

Phone-number bindings (`/get-phone-number`): Burlington `+12899071911`→`agent_7950e8ff24a902abfd3d5b34cc`, StCath `+12895140137`→`agent_fa924598caf3662856ac3cea3b`, EG `+12898038797`→`agent_17d623c8a8f95fc674288d0e00`, Kanata `+16137028134`→`agent_c3d64fc094dccb0fa486bde5f9`. Note StCath/EG pin `agent_version:0` while Burlington/Kanata bind with no version (`v=None`); both forms serve calls (June-12 smoke passed for Burlington/Kanata). If an inbound number ever truly fails to answer on DIRECT dial, investigate the binding/version — not the publish flag.

Related: [[single-number-model-fleetwide]], [[feedback-did-from-centre-lookup]].
