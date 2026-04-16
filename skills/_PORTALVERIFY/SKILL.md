---
name: _PORTALVERIFY
description: Playwright E2E verification of the TourForce portal. USE WHEN verify portal, test portal, check portal, portal working, portal test, e2e test, browser test portal, click through portal.
---

# _PORTALVERIFY — TourForce Portal E2E Verification

Automated Playwright browser test that clicks through every page and interaction in the TourForce portal, takes screenshots, and reports pass/fail.

## Usage

```bash
bun run ~/.claude/skills/_PORTALVERIFY/Tools/VerifyPortal.ts [options]
```

### Options
- `--url <url>` — Portal URL (default: `http://localhost:4000`)
- `--screenshots <dir>` — Screenshot output dir (default: `/tmp/portal-verify`)
- `--verbose` — Show detailed output for each check

### What Gets Verified

#### 1. Server Health
- `/api/health` returns 200

#### 2. Login / Auth
- Login page loads (or dev bypass redirects)
- Session endpoint returns user data

#### 3. Call Log (`#/calls`)
- Page renders with "Calls" heading
- Table has call rows
- Search input exists
- Outcome filter dropdown exists

#### 4. Call Detail (`#/calls/:id`)
- Click first call row → navigates to detail
- Call detail shows phone number, duration, direction
- Back link returns to call list

#### 5. Analytics (`#/analytics`)
- Stat cards render (Total Calls, Answer Rate, etc.)
- Chart canvases exist
- Period buttons (7d, 30d, 90d) clickable

#### 6. Billing (`#/billing`)
- Billing page renders
- Subscribe or Manage button exists

#### 7. Admin (`#/admin`) — 7 tabs
- Centres tab: table with centre rows
- Users tab: table with user rows, status toggle visible
- Agents tab: table with agent mappings
- Subscriptions tab: renders (even if empty)
- Invoices tab: renders (even if empty)
- Logs tab: renders
- Invite tab: form with email, name, centre fields

#### 8. Settings (`#/settings`)
- Password change form renders with 3 fields

### Output

Prints a checklist:
```
[PASS] Server health
[PASS] Login/auth bypass
[PASS] Call log — table loaded (87 rows)
[PASS] Call detail — navigated to call_xxx
[FAIL] Analytics — chart canvas not found
...
23/24 checks passed
```

Screenshots saved to `--screenshots` dir for visual review.
