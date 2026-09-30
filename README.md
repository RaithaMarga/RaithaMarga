# RaithaMarga

**Sell Direct. Sell Together. Sell with Trust.**

RaithaMarga is a farmer-to-buyer agri-marketplace for Karnataka. It pools smallholder harvests, gives buyers verified, GPS/timestamp-proofed listings, and cuts out unnecessary middlemen — without needing expensive physical infrastructure.

This repository contains the React marketplace frontend. It connects to the local CRM/API at `http://localhost:5000/api`. The CRM/backend currently lives in the sibling `raithamarga-crm` folder.

## Project Status

This is a development demo. The farmer and buyer dashboards, login screens, route guards, matching screens, deal trackers, and camera capture are implemented. The frontend integrates with the CRM API, and authenticated Firebase Admin access in the backend has been verified with cloud write/readback checks.

A browser test created a labelled 10-quintal tomato order at Rs.2,500 per quintal, displayed it in the buyer Deals page and CRM, and verified the Rs.25,000 deal directly in Firestore.

Important remaining work:

- Password validation, API role checks, and record ownership are not yet secure. Login includes a local demo fallback.
- Some screens still use shared browser storage. Fresh buyers may not see listings from other devices; merging local and server records can duplicate listing cards.
- Some frontend actions show success before validating the API response.
- The backend reads local JSON and mirrors writes to Firestore; it is not yet a transactional Firestore source of truth.
- Real proof upload/admin review, correct partial-sale inventory, matching formula alignment, and full browser regression tests remain pending.
- Voice/missed-call listings and lot pooling are not implemented.

Do not treat this development demo as a production marketplace.

Keep all private server credentials outside the repository and outside the frontend. `.env`, audit outputs, local data, and Firebase Admin key filenames are ignored. `.env.example` contains placeholders only.

## Tech Stack

- **React 19** + **Vite** (no experimental React Compiler — removed after it caused a real production bug, see commit history on `main`)
- **React Router** for client-side routing
- Plain CSS with a shared design-token system (`src/styles/global.css`) — no CSS framework, no component library
- All state via React Context + `localStorage`, no external state management library

## Getting Started

```bash
npm install
npm run dev       # starts local dev server, usually http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build to /dist
npm run preview    # preview the production build locally
npm run lint       # eslint check
```

**Important:** avoid running this project inside a OneDrive/Dropbox/Google Drive–synced folder. Cloud sync tools can lock or partially corrupt files while a dev server is running, causing hard-to-diagnose bugs. Keep it in a plain local folder (e.g. `C:\Projects\RaithaMarga`) and use Git for backup/history instead.

## Project Structure

```
src/
├── assets/              # logo variants (resized, not distorted, from original artwork)
├── components/          # shared UI: dashboard primitives, camera capture, agri background, marketing sections
├── context/              # LanguageContext, FarmerDataContext, BuyerDataContext
├── data/                 # shared localStorage key constants (how Farmer/Buyer sides "talk" without a backend)
├── hooks/                # useLocalStorage (with cross-tab sync), useReveal, useCountUp, useSharedFarmerData
├── i18n/                 # English + Kannada translation strings
├── layouts/               # DashboardLayout (shared sidebar/topbar for both Farmer and Buyer)
├── pages/
│   ├── farmer/            # Farmer Dashboard pages
│   ├── buyer/              # Buyer Dashboard pages
│   └── Home.jsx            # public landing page
└── styles/                # global.css — design tokens (colors, type, spacing, shadows)
```

## Routes

| Path | Page |
|---|---|
| `/` | Public landing page |
| `/farmer/dashboard` | Farmer Overview |
| `/farmer/dashboard/add-produce` | Add Produce |
| `/farmer/dashboard/listings` | My Listings |
| `/farmer/dashboard/listings/:id/edit` | Edit a listing |
| `/farmer/dashboard/matches` | Buyer Matches (empty state — not built) |
| `/farmer/dashboard/deals` | My Deals (empty state — not built) |
| `/farmer/dashboard/verification` | Verification |
| `/farmer/dashboard/profile` | Farmer Profile |
| `/buyer/dashboard` | Buyer Overview |
| `/buyer/dashboard/browse` | Browse Produce |
| `/buyer/dashboard/recommended` | Recommended Matches (empty state — not built) |
| `/buyer/dashboard/requests` | Requests / Orders |
| `/buyer/dashboard/deals` | Deals (empty state — not built) |
| `/buyer/dashboard/trust` | Trust & Verification |
| `/buyer/dashboard/profile` | Buyer Profile |

Farmer and buyer routes have frontend role guards. Server authorization still needs completion; the frontend guard alone does not secure the API.

## Deployment

Deploys cleanly to Vercel/Netlify as a standard Vite SPA — no special config needed beyond the default. See project conversation history / your own notes for the exact steps used.

On Vercel's free (Hobby) plan, your production URL is publicly reachable once deployed — there's no free way to fully lock it behind a login. Treat the deployed link as unlisted (don't publish it widely) until real access control exists, or upgrade to Vercel Pro if you need enforced privacy sooner.

## Roadmap

1. Enforce password validation, authenticated sessions, API roles, and record ownership.
2. Make Firestore the authoritative data store with reliable errors and atomic inventory/deal writes.
3. Connect all frontend reads and writes to authenticated users and handle API failures.
4. Complete real proof upload/admin verification, partial-sale inventory, and matching correctness.
5. Run multi-device/browser checks and security regression tests before deployment.

No private key, local database, or audit screenshot should be committed.
