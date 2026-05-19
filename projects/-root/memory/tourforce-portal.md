---
name: TourForce Portal
description: Custom ChatDash replacement — client-facing dashboard for Voice AI centres with auth, call logs, analytics, admin, and Stripe billing
type: project
---

TourForce Portal is a custom-built replacement for ChatDash ($300/month saved).

**Why:** ChatDash Growth plan costs $300/month for client dashboard features. Scott uses ~30% of ChatDash. ChatDash MRR declining (-49.7%). Building custom eliminates dependency and cost.

**How to apply:** When Scott mentions portal, client dashboard, or centre owner access — this is the project. Located at `/root/tourforce-portal/`. Running under PM2 as `tourforce-portal` on port 4000.

## Architecture
- **Stack:** Bun + Hono + Supabase Auth + Stripe + Retell API + Tailwind v4
- **Port:** 4000 on DO droplet (`138.197.171.204`)
- **Process:** PM2 (`ecosystem.config.cjs`), auto-restart, 512MB memory limit
- **Data model:** Proxies Retell API for calls (no sync), reads `call_analytics` for stats
- **Auth:** Supabase Auth with JWT + refresh token, dev bypass via `DEV_BYPASS_AUTH=true`
- **Billing:** Stripe Checkout + Billing Portal (direct integration, not Connect)
- **Frontend:** Bun HTML imports + React 19 + hash-based routing, light theme
- **Repo:** `XPrime17/lead-reactivation` branch `tourforce-portal`

## Status (as of 2026-04-27)
- **All phases code-complete** — 29/29 E2E checks passing
- **LIVE at `https://app.tourforce.ca`** — Cloudflare tunnel → localhost:4000
- **Running under PM2** — `tourforce-portal` on port 4000
- **Latest commit:** `0463935` (PM2 config, admin route guard, URL setup docs)

## Features Built
- **Auth:** Login, JWT + refresh, dev bypass, password change
- **Calls:** List (100 calls), search, outcome filter, detail view with recording/transcript/analysis
- **Analytics:** Stat cards (total/answered/booked/duration), Chart.js line + doughnut charts, period selector (7d/30d/90d)
- **Billing:** Subscription status, Stripe checkout redirect, portal redirect, webhook handler
- **Admin panel (7 tabs):** Centres, Users (with active toggle), Agents (CRUD), Subscriptions (Stripe), Invoices (Stripe), Webhook Logs, Invite
- **Settings:** Password change
- **Layout:** Mobile responsive sidebar, SVG icons, error boundary, favicon

## Supabase Setup DONE
- Migrations 003-005 run (portal_users, centre_agents, RLS)
- Admin user: `scott.james@codeninjas.com` / `TourForce2026!` (UUID: `7259ba8c-12b0-434a-8c12-3a9e36ae142f`)
- 12 centres in `centres` table
- 12 outbound + 1 inbound agent mappings in `centre_agents`

## BLOCKERS — Remaining Infrastructure (Scott only)
Email sent 2026-04-16 with full instructions (Resend ID `fa45d188-e2b3-4c7d-b104-27f3d9abe540`).

1. ~~**Permanent URL**~~ — DONE (2026-04-27). `app.tourforce.ca` → tunnel → localhost:4000. DNS CNAME + tunnel ingress configured via API. `PORTAL_URL` set in `.env`.
2. ~~**Migration 006**~~ — DONE (2026-04-28). `subscriptions` table created with RLS.
3. ~~**Migration 007**~~ — DONE (2026-04-28). `is_active` column + `webhook_logs` table created with RLS.
4. **Fresh Stripe secret key** — current `sk_live_...` in `.env` is EXPIRED. Get new one from Stripe Dashboard → API Keys.
5. **Create Stripe Price** — under product `prod_UD7H1SBAJRzl67`, add recurring monthly price, copy `price_xxx`, set as `STRIPE_PRICE_ID`.
6. **Create Stripe Webhook** — endpoint `https://app.tourforce.ca/api/webhooks/stripe`, subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Copy signing secret to `STRIPE_WEBHOOK_SECRET`.

## What's broken until blockers done
- Billing checkout/portal buttons (expired Stripe key)
- Admin → Subscriptions/Invoices tabs (expired key)
- Admin → Users active/inactive toggle (needs migration 007)
- Admin → Logs tab (stays empty until webhook endpoint is live)
- External access (only works via SSH port forward or temporary tunnels)
- Invite email links point to `portal.tourforce.ca` (ChatDash) not TourForce

## E2E Verification
`_PORTALVERIFY` skill at `~/.claude/skills/_PORTALVERIFY/` — Playwright test suite covering 29 checks. Run: `bun run ~/.claude/skills/_PORTALVERIFY/Tools/VerifyPortal.ts`. Or say "verify portal".

## Key Files
- `/root/tourforce-portal/server.ts` — entry
- `/root/tourforce-portal/ecosystem.config.cjs` — PM2 config
- `/root/tourforce-portal/lib/auth-middleware.ts` — JWT + dev bypass
- `/root/tourforce-portal/api/admin.ts` — 11 admin endpoints
- `/root/tourforce-portal/components/AdminPanel.tsx` — 7-tab admin UI
- `/root/tourforce-portal/migrations/` — 007 migrations total, 003-005 run, 006-007 pending
- `/root/tourforce-portal/docs/PERMANENT-URL-SETUP.md` — Cloudflare tunnel steps

## Build notes
- Tailwind v4 utilities NOT compiled by Bun bundler — pre-compile with `@tailwindcss/cli`. Run `bun run css` before `pm2 restart`. See `tourforce-tailwind-fix.md`.
- PM2 env gotcha: `NODE_ENV: 'production'` breaks Bun JSX runtime. Omit it from `ecosystem.config.cjs`.

## Future enhancements
- Install Anthropic Frontend Design Plugin (see `tourforce-frontend-plugin.md`) to push design beyond ChatDash
- Custom email domain (`hello@tourforce.ca` via Resend) — currently uses `onboarding@resend.dev`
- Client onboarding automation
- Merge `tourforce-portal` branch → `master`

See also: `tourforce-branding.md`, `tourforce-pricing.md`, `tourforce-tailwind-fix.md`, `tourforce-frontend-plugin.md`
