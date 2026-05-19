---
name: stripe-billing-tourforce
description: Stripe API config for TourForce voice AI agency billing via Chat-Dash
metadata: 
  node_type: memory
  type: reference
  originSessionId: b71eef49-9bc3-4b66-87da-b2564cd13727
---

## Stripe Account
- **Account ID:** `acct_1T3SS88QdbWckC7C`
- **Entity:** 2738714 Ontario Inc. (Scott's existing corp)
- **Currency:** CAD
- **Mode:** Live
- **Dashboard:** https://dashboard.stripe.com

## API Access
- **Secret key:** `op://Private/Stripe TourForce/secret-key` (1Password — rotate if literal previously committed)
- **Restricted key:** `op://Private/Stripe TourForce/restricted-key` (1Password — rotate if literal previously committed)
- **Restricted permissions:** Products, subscriptions, customers (no balance, no refunds)
- **Auth:** Bearer via `-u "KEY:"` (colon after key, no password)

## Products (as of 2026-03-29)
- **Voice AI Subscription - Test** (`prod_UD7H1SBAJRzl67`) — CA$1.00/mo, test product
- Default price: `price_1TEh308QdbWckC7CV0mInwhw`

## Tax Configuration
- **Tax registration:** Active for Canada (`taxreg_1TGAmq8QdbWckC7CxyIVTZsC`, standard)
- **Auto-tax:** Enabled — requires customer billing address on EVERY customer before creating subscriptions
- **Head office address:** Set in Stripe tax settings

## Customers (as of 2026-03-29)
- **Code Ninjas East Gwillimbury** (`cus_UEebdOCmqio8cL`) — 17215 Leslie St, Newmarket ON L3Y 0A3

## Prices (as of 2026-03-29)
- `price_1TEh308QdbWckC7CV0mInwhw` — CA$1.00/mo recurring (default)
- `price_1TGBIF8QdbWckC7CUkg8efdf` — CA$1.00 one-time (created by Chat-Dash)

## Capabilities
- `card_payments: active`, `acss_debit_payments: active`, `link_payments: active`, `klarna_payments: active`
- Statement descriptor: `2738714 - AI SERVICES`

## Chat-Dash Integration (BLOCKED as of 2026-03-29)
- Stripe connected via Stripe Connect OAuth
- "Cannot make live charges" error — Chat-Dash platform-side restriction, NOT Stripe
- Support ticket sent 2026-03-29
- Products and subscriptions were purged when Stripe was disconnected/reconnected
- Payment link (may be stale): `https://buy.stripe.com/aFabIV4AE0F99LI37v9AA00`
