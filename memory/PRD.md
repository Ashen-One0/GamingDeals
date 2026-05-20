# GameDeals — PRD

## Original Problem Statement
اعمل تطبيق لعرض التخفيضات علي الالعاب من كل المنصات

## User Choices
- Data: CheapShark (Steam, Epic, GOG, +30 stores)
- Platforms: All
- Features: Wishlist, price alerts, advanced filter, **ads + Pro subscription**, **affiliate tracking**
- Auth: JWT + Emergent Google OAuth
- Languages: AR / EN / ES (RTL for AR)
- Themes: Light + Dark

## Architecture
- Backend: FastAPI + Motor + MongoDB + Stripe (emergentintegrations)
- Frontend: React 19 + Tailwind + shadcn/ui + react-i18next + axios + sonner
- Payments: Stripe Checkout (monthly $4.99 / yearly $39.99) via `STRIPE_API_KEY=sk_test_emergent`
- MongoDB collections: users, user_sessions, wishlist, alerts, payment_transactions

## Implemented Timeline
**2026-02-20 (MVP)** — Auth, deals proxy, wishlist, alerts, i18n, themes
**2026-02-20 (+ads)** — 5 ad slots, AdSense-ready loader, AdsSetup guide
**2026-02-20 (+pro+affiliate)** — Stripe checkout, Pro page, hidden ads for Pro users, affiliate tracking helper

## Endpoints
Auth: `/api/auth/{register,login,me,logout,session-process}`
Deals: `/api/deals`, `/api/stores`, `/api/games/{id}`
Wishlist: `/api/wishlist` (CRUD)
Alerts: `/api/alerts` (CRUD)
Pro: `/api/pro/{packages,checkout,status/{sid}}`, `/api/webhook/stripe`
Affiliate: `/api/affiliate/config`

## Tests
- Backend pytest: 28/29 (97%) — `tests/test_game_deals.py` + `tests/test_pro_affiliate.py`
- Frontend: e2e via testing agent for filters, theme, lang, login, wishlist, alerts, Pro page

## Backlog
- Game detail page with price history chart
- Email/Telegram notifications when alerts trigger
- DekuDeals integration for PS/Xbox
- Pro-only features (CSV export, bulk wishlist import)
- Stripe Billing Portal for subscription management
- Apply real affiliate IDs once partner accounts approved
