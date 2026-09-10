---
name: cekura-inbound-email-suppress-2026-09-10
description: Cekura inbound test calls no longer email centre inboxes; test-list ClickUp task still created
metadata: 
  node_type: memory
  type: project
  originSessionId: 80e2b26f-e8f0-4807-8c10-38a4a353d1fe
---

Scott flagged Cekura inbound tests as noise. Diagnosed in inbound EOC `3oV7SpPKWmr3xJlQ` (Inbound End Of Call - Multicentre): `Detect Test Call` node correctly flags `_is_test` (non-Canadian area code OR known persona names) but only sets `_drop` for junk/spam — NOT test. So detected tests sailed past `Drop Junk?` and ran the full task+email path. `Email: Message for Staff` (and `Email: Urgent Call`) send to `_centre_email` — the REAL centre inbox — with just a `[CEKURA TEST]` subject prefix.

**Scott's decision (2026-09-10): kill emails only, KEEP the test-list ClickUp task** (list `901113648956`) for his visibility.

**Fix:** inserted one IF node `Suppress Test Emails?` (id `if-suppress-test-emails`) between `Create ClickUp Task` → `Is Urgent?`. Condition `_is_test == false`: TRUE(real)→`Is Urgent?` (normal emails); FALSE(test)→dead-end. Task is created UPSTREAM of the gate so it survives; both reachable emails (`Urgent Call`, `Message for Staff`) hang off `Is Urgent?` so both are suppressed for tests.

**Why one node sufficed:** the 5 booking emails live on the Skyvern Test Gate branch, which for a test call already diverts `Skyvern Test Gate` FALSE→`Test Booking?`→`Create Cancel Task` (never reaches `Booking Result`), so they were already unreachable by tests. Skyvern test-booking auto-cancel cleanup is untouched.

VERIFIED live (active=true): Create ClickUp Task→Suppress gate; gate TRUE→Is Urgent?, FALSE→empty. Backups `/root/n8n-backups/cekura-email-suppress-2026-09-10/` PRE+POST. Supersedes the "email still hits centre inbox" note in [[cekura-camp-date-regression-2026-09-02]]. OPEN: confirm on next real Cekura inbound run that no centre email fires and the test-list task still lands.
