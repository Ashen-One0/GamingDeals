# Monetization Setup Guide

Your GameDeals app is **ad-ready** — banner slots are placed in strategic positions across the site. Until you connect an ad network, these slots show a tasteful "Advertisement" placeholder so the layout never breaks.

## Ad Slot Locations (5 slots)
| Page | Position | Component testid | Size |
|------|----------|------------------|------|
| Home | Between Hot Deals & Trending | `home-mid-ad` | Leaderboard (728×90) |
| Home | Below Trending | `home-bottom-ad` | Responsive banner |
| Deals | Sidebar (below filters) | `deals-sidebar-ad` | Rectangle (300×250) |
| Deals | After deal grid | `deals-inline-ad` | Leaderboard |
| All pages | Footer top | `footer-ad` | Responsive banner |

## Option A — Google AdSense (recommended)
1. Sign up at https://adsense.google.com and add your site (`game-deals-35.preview.emergentagent.com`)
2. Wait for approval (Google reviews; can take days/weeks). You typically need real traffic + a privacy policy + content.
3. Once approved, get your **Publisher ID** (looks like `ca-pub-1234567890123456`).
4. Open `/app/frontend/.env` and add:
   ```
   REACT_APP_ADSENSE_CLIENT=ca-pub-1234567890123456
   ```
5. Open `/app/frontend/public/index.html` and uncomment the AdSense `<script>` tag (line ~36), replacing `XXXXXXXXXXXXXXXX` with your publisher ID.
6. In AdSense dashboard create **Ad Units** for each slot above. For each unit, copy the `data-ad-slot` value (a long number).
7. In each page, pass the slot id to `<AdSlot>`. Example:
   ```jsx
   <AdSlot size="leaderboard" adSlot="1234567890" testId="home-mid-ad" />
   ```
8. Restart the frontend: `sudo supervisorctl restart frontend`

## Option B — Affiliate Revenue (immediate, no approval)
CheapShark already redirects `View Deal` clicks via affiliate links — but the commission goes to CheapShark. To redirect commission to you:
1. Sign up for direct partner programs (most don't need traffic):
   - **Humble Partner** — https://www.humblebundle.com/partners
   - **Fanatical Affiliate** — https://www.fanatical.com/en/affiliates
   - **Green Man Gaming Affiliate** — https://www.greenmangaming.com/affiliates/
   - **Indie Gala** — https://www.indiegala.com/affiliates
2. Each program gives you a tracking parameter (e.g. `?partner=YOUR_ID`).
3. In `/app/frontend/src/components/DealCard.js` swap the `dealUrl()` helper to detect the store and append your tracking parameter when the deal links to a supported store.

## Option C — Alternative Ad Networks (no approval friction)
- **Media.net** (Yahoo/Bing) — easier approval
- **Ezoic** — automated optimization, lower traffic minimum
- **PropellerAds**, **AdMaven** — accept new sites quickly
For all of these: paste the network's `<script>` tag in `index.html` and replace the `<AdSlot>` placeholder rendering with their tag.

## Best practices
- Keep ads above-the-fold but not as the first thing the user sees
- Don't put more than 1 ad per visible viewport
- Disclose affiliate links in your footer / privacy page
- Add `nofollow sponsored` to affiliate `<a>` tags

You're set up for revenue from day 1 once you wire any of the above.
