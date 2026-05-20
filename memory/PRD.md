# GameDeals — PRD

## Original Problem Statement
اعمل تطبيق لعرض التخفيضات علي الالعاب من كل المنصات

## User Choices
- Data source: CheapShark (Steam, Epic, GOG, plus 30+ digital stores)
- Platforms: All (Steam, Epic, GOG, PlayStation, Xbox referenced visually)
- Features: Wishlist, price drop alerts, advanced search & filter
- Auth: Simple email/password (JWT) + Emergent-managed Google OAuth
- Languages: Arabic (RTL), English, Spanish
- Themes: Light + Dark (both)

## Architecture
- Backend: FastAPI + Motor + MongoDB. Proxies CheapShark with required `User-Agent` header.
- Frontend: React 19 + Tailwind + shadcn/ui + react-i18next + axios + sonner.
- Auth: dual mode (JWT via Authorization header, or session_token cookie from Emergent OAuth).
- Design: Tactical Gaming (Obsidian + Acid Green #D4FF00 + Crimson #FF2A4D), Unbounded/Outfit fonts, Cairo for Arabic.

## Implemented (2026-02-20)
- Backend endpoints: `/api/auth/{register,login,me,logout,session-process}`, `/api/deals`, `/api/stores`, `/api/games/{id}`, `/api/wishlist`, `/api/alerts`
- Frontend pages: Home (hero + Hot Deals + Trending), Deals (filterable grid), Login (JWT + Google), Wishlist (protected), Alerts (protected), AuthCallback
- Multilingual support with RTL for Arabic
- Light/Dark theme with localStorage persistence
- 100% backend test pass; frontend e2e verified

## Tech Notes
- CheapShark requires descriptive User-Agent (handled by `CHEAPSHARK_HEADERS`)
- Auth cookie: httpOnly, secure, samesite=none (preview is HTTPS)
- All MongoDB queries exclude `_id`

## Backlog (P1/P2)
- Game detail page with price history chart
- Email notifications when alerts trigger (cron + SMTP)
- Social sharing buttons
- More refined PlayStation/Xbox coverage (CheapShark is mostly PC stores)
- Mobile bottom navigation
- Saved searches / followed publishers
