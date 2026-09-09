# RaithaMarga

**Sell Direct. Sell Together. Sell with Trust.**

RaithaMarga is a farmer-to-buyer agri-marketplace for Karnataka. It pools smallholder harvests, gives buyers verified, GPS/timestamp-proofed listings, and cuts out unnecessary middlemen — without needing expensive physical infrastructure.

This repository is the **frontend**. There is currently **no backend, database, or authentication** — see [Project Status](#project-status) below for exactly what that means in practice.

---

## Project Status

This is an honest snapshot, not marketing copy. Update this table as things change.

| Area | Status |
|---|---|
| Public landing page | ✅ Built — hero, trust bar, how-it-works, features, impact stats, final CTA, footer, Kannada toggle |
| Farmer Dashboard | ✅ Built — Overview, Add Produce, My Listings, Verification, Profile all fully functional |
| Buyer Dashboard | ✅ Built — Overview, Browse Produce (with filters), Requests/Orders, Trust & Verification, Profile all fully functional |
| Weighing Proof camera | ✅ Built — live in-app camera capture, GPS + timestamp watermark, auto-compression. See [caveats](#weighing-proof-camera-caveats) below |
| Farmer ↔ Buyer matching | ❌ Not built — "Buyer Matches" / "Recommended Matches" pages show honest empty states |
| Deal lifecycle (confirm → pickup → complete) | ❌ Not built — "My Deals" / "Deals" pages show honest empty states |
| Authentication / login | ❌ Not built — both dashboards are currently open, unprotected routes |
| Backend / API / database | ❌ Not built — all data lives in the browser's `localStorage`, per device |
| "List Without Typing" (missed-call/voice listing) | ❌ Marketing copy only, not implemented — needs telephony/IVR integration, a backend-heavy feature for later |

### What "no backend" actually means for you right now

Every piece of data (listings, profiles, requests, weighing photos) is stored in the visitor's own browser via `localStorage`. This means:

- A farmer's listing is only visible **on that same browser/device** — a buyer on a different phone or laptop will not see it
- Farmer and Buyer dashboards *do* sync live with each other **if opened in two tabs of the same browser** (useful for demos)
- Nothing here should be presented to real farmers/buyers as a live, working two-sided marketplace yet — it's a demo/pilot tool until a backend exists

### Weighing Proof camera caveats

The live camera capture genuinely prevents gallery uploads (it's a real video stream, not a file picker) and genuinely watermarks GPS/timestamp/Lot ID onto the photo. What it **cannot** do without a backend: verify the GPS/clock weren't spoofed before the browser read them. Status is created as, and stays, `Pending_Verification` — nothing in the frontend can promote it to "Verified."

---

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

None of these routes are currently protected — anyone with the link can open any dashboard.

## Deployment

Deploys cleanly to Vercel/Netlify as a standard Vite SPA — no special config needed beyond the default. See project conversation history / your own notes for the exact steps used.

On Vercel's free (Hobby) plan, your production URL is publicly reachable once deployed — there's no free way to fully lock it behind a login. Treat the deployed link as unlisted (don't publish it widely) until real access control exists, or upgrade to Vercel Pro if you need enforced privacy sooner.

## Roadmap

Recommended build order for what's left, based on the project's own MVP guide:

1. **Authentication** — login/signup, role selection, protected routes
2. **Backend + database** — so data exists outside a single browser
3. **Farmer ↔ Buyer matching** — deterministic, rule-based first (not ML)
4. **Deal lifecycle** — Listed → Matched → Interested → Confirmed → Weighed → Delivered → Completed
5. **Real verification** — a backend/admin flow that can actually flip a status to "Verified"
6. Advanced features (voice/missed-call listing creation, lot pooling across farmers, payments) — after the core loop above is proven

## Known Issues

- 5 pre-existing/consistent-convention ESLint warnings remain (documented in commit history) — none block functionality
- No automated tests yet
- Not verified on physical iOS devices (camera capture in particular)

---

*Keep this README updated as features move from "not built" to "built" — it's meant to stay accurate, not aspirational.*
