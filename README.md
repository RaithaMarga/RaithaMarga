# RaithaMarga

**Sell Direct. Sell Together. Sell with Trust.**

RaithaMarga is a farmer-to-buyer agri-marketplace for Karnataka. It pools smallholder harvests, gives buyers verified, GPS/timestamp-proofed listings, and cuts out unnecessary middlemen — without needing expensive physical infrastructure.

This repository contains the React marketplace frontend. Firebase Email/Password Authentication is used for sign-in, and authenticated API requests go to the RaithaMarga backend.

## Firebase and backend configuration

Copy `.env.example` to `.env.local` and fill in the Firebase **web app** settings from Firebase Console → Project settings → General → Your apps. These `VITE_FIREBASE_*` values are public client configuration; never put a Firebase service-account private key in the frontend.

Set `VITE_API_BASE_URL` to the backend origin, for example `https://raithamarga-backend.onrender.com`. During local development, Vite proxies `/api` calls to this backend to avoid browser CORS restrictions. Protected API requests include the Firebase ID token in `Authorization: Bearer <token>`. Vite exposes only variables prefixed with `VITE_` to browser code, so do not put `FIREBASE_CLIENT_EMAIL` or `FIREBASE_PRIVATE_KEY` in this project.

In Firebase Console:

1. Open Authentication → Sign-in method and enable **Email/Password**.
2. Under Authentication → Settings → Authorized domains, add the deployed frontend domain.
3. Ensure the Firebase web app and the Render backend service account belong to the same Firebase project.
4. Keep `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` configured only as Render backend environment variables. Rotate any service-account key that has been shared or exposed.

Firebase Authentication does not need the service-account key in the frontend. Registration creates the Firebase account and then creates its farmer or buyer profile through the protected backend API.

## Project Status

Authentication, farmer/buyer profiles, listings, requirements, matching, and deal status updates use the authenticated backend API. Marketplace requests send the signed-in Firebase user's ID token. Registration creates the profile in the backend; the Firebase web configuration belongs in the frontend, while Firebase Admin credentials stay on the backend.

The frontend currently supports:

- Firebase Email/Password sign-in and authenticated `/api/me` role/profile checks.
- Creating and browsing active produce listings; publishing buyer requirements.
- Reading backend-generated matches and opening deals as a buyer.
- Updating deal status through the backend's allowed transitions.

Backend limitations that still prevent full workflow parity:

- Buyer requirements and deal creation are restricted to buyers manually marked `VERIFIED` in Firestore. New registrations are not automatically verified.
- The backend has no listing/requirement edit or delete endpoints, no farmer-document verification or proof-upload endpoints, and no farmer directory endpoint.
- Deal status updates are supported, but proof uploads, pickup scheduling, and payment settlement are not.
- The profile DTOs do not persist phone numbers, pincode, preferred crops, or buyer business/contact preferences. Those extra form values are local browser preferences only.
- Listings GET returns currently available inventory; it omits reserved or sold-out listings and does not provide a complete listing history.
- Full browser testing with real Firebase accounts and cross-role deal flows still needs to be performed. Voice/missed-call listings and lot pooling are not implemented.

Do not treat the current deployment as a complete production marketplace. Backend authorization and ownership checks are the security boundary; frontend route guards only improve user experience.

Keep all private server credentials outside the repository and outside the frontend. `.env`, audit outputs, local data, and Firebase Admin key filenames are ignored. `.env.example` contains only the public Firebase web app settings and the backend URL; never add service-account credentials there.

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

Set up `.env.local` before starting the app. For Vercel, add the same `VITE_*` values in Project Settings → Environment Variables and redeploy. After changing environment variables, restart the Vite dev server or redeploy the frontend.

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
├── data/                 # local profile preferences and storage keys
├── hooks/                # useLocalStorage, useReveal, useCountUp
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
| `/farmer/dashboard/matches` | Buyer Matches |
| `/farmer/dashboard/deals` | My Deals |
| `/farmer/dashboard/verification` | Verification |
| `/farmer/dashboard/profile` | Farmer Profile |
| `/buyer/dashboard` | Buyer Overview |
| `/buyer/dashboard/browse` | Browse Produce |
| `/buyer/dashboard/recommended` | Recommended Matches |
| `/buyer/dashboard/requests` | Requests / Orders |
| `/buyer/dashboard/deals` | Deals |
| `/buyer/dashboard/trust` | Trust & Verification |
| `/buyer/dashboard/profile` | Buyer Profile |

Farmer and buyer routes have frontend role guards. Every protected backend request also validates the Firebase ID token and applies server-side role and ownership checks.

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
