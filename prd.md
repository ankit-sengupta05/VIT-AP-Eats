# PRD — Multi-Platform Food Delivery Marketplace (Web-First PWA)
**Version:** 3.0 (Agent-Executable Phased Plan)
**Date:** August 25, 2026
**Architecture:** Progressive Web App (Next.js) + Cloudflare Workers + Supabase
**Companion docs:** `techstack.md`, `theme.md`

> Note: The Stitch design link provided (`stitch.withgoogle.com/projects/13743577752831287259`) is a private project and could not be accessed for content extraction — it likely requires the project owner to share/export it (Figma link, image export, or public share toggle). Once accessible, visual specs from it should be mapped onto the design tokens in `theme.md` rather than replacing them outright.

---

## 0. How to use this document (for the executing AI agent)

- Work phase by phase, in order. **Do not start Phase N+1 until Phase N's "Definition of Done" is fully met.**
- Each phase is scoped to be completable and testable independently — treat each as its own PR/branch.
- Each task inside a phase is written as a discrete, verifiable unit of work (a good size for one agent turn / one commit).
- Every phase ends with a **Definition of Done (DoD)** checklist — do not mark a phase complete until every item is checked.
- Config values (colors, fonts, spacing) must be pulled from `theme.md` and `techstack.md` — never hardcode brand values inline in components.
- When a task references a page code (e.g. `C03`, `P05`, `A09`), that ID is stable across this doc — use it in commit messages and component folder names for traceability.

---

## 1. Product Summary

A single responsive web application (installable as a PWA) serving three user roles:

| Role | Surface | Core Job |
|---|---|---|
| **Customer** | Public web app | Browse restaurants, order food, track delivery |
| **Delivery Partner** | Partner web app (`/partner/*`) | Accept & fulfill delivery requests |
| **Restaurant/Admin** | Admin web app (`/admin/*`) | Manage menu, orders, partners, operations |

One Next.js codebase, role-based routing/auth, shared design system, deployed as a PWA so no native app store distribution is required.

---

## 2. Phase Roadmap Overview

| Phase | Name | Primary Output |
|---|---|---|
| 0 | Foundation & Environment Setup | Working repo, CI/CD skeleton, empty deploy pipeline |
| 1 | Design System & Theming | Tokenized theme, component library shell |
| 2 | Auth & User Accounts | Working login/signup for all 3 roles |
| 3 | Restaurant Discovery (Customer) | Home, search, restaurant, menu pages |
| 4 | Cart & Checkout | Cart, coupons, payment integration |
| 5 | Order Lifecycle & Live Tracking | Order state machine, tracking UI, notifications |
| 6 | Delivery Partner App | Partner onboarding, order assignment, earnings |
| 7 | Admin/Restaurant Dashboard | Menu mgmt, order ops, live partner map |
| 8 | PWA, Offline & Performance | Installability, caching, Core Web Vitals |
| 9 | Security Hardening | CSP, CSRF, secure auth, rate limiting |
| 10 | QA, Analytics & Launch | Monitoring, test coverage, launch checklist |

Each phase below expands into tasks + DoD.

---

## Phase 0 — Foundation & Environment Setup

**Goal:** A running skeleton app deployable end-to-end with nothing but placeholder pages.

### Tasks
1. Scaffold Next.js 14+ (App Router) + TypeScript project.
2. Install and configure: Tailwind CSS, ESLint, Prettier, Husky + lint-staged pre-commit hook.
3. Set up folder structure:
   ```
   /app
     /(customer)
     /partner
     /admin
     /api
   /components
     /ui
     /shared
   /lib
   /styles
   /public
   ```
4. Set up Supabase project (Postgres + PostGIS extension enabled, Auth, Storage buckets for images).
5. Set up Cloudflare Workers project (Hono) for the API layer; connect to Supabase.
6. Configure environment variable management (`.env.local`, `.env.example`) — never commit secrets.
7. Set up GitHub Actions CI: lint → typecheck → test → build on every PR.
8. Set up CD: auto-deploy `main` branch frontend to Vercel/Cloudflare Pages, backend to Cloudflare Workers.
9. Add a placeholder route for each role (`/`, `/partner`, `/admin`) that renders "Coming soon" so deploys can be verified visually.

### Definition of Done
- [ ] `npm run build` succeeds with zero errors/warnings.
- [ ] CI pipeline passes on a trivial PR.
- [ ] Frontend deploy produces a public URL serving all 3 placeholder routes.
- [ ] Supabase project reachable from a test API route.
- [ ] No secrets committed to git (verify with a secrets scan).

---

## Phase 1 — Design System & Theming

**Goal:** All visual decisions centralized as design tokens so the whole app is reskinnable later without touching components.

### Tasks
1. Implement the palette, typography, spacing, and radii from `theme.md` as CSS variables in `styles/tokens.css` and mirror them into `tailwind.config.ts`.
2. Build the base primitive component set using Radix UI + shadcn/ui, styled only via tokens (no ad-hoc hex codes in components):
   - Button (primary/secondary/ghost/destructive), Input, Select, Checkbox, Radio, Badge, Card, Modal/Dialog, Toast, Tabs, Skeleton loader, Avatar.
3. Build shared layout shells: `CustomerLayout`, `PartnerLayout`, `AdminLayout` (header/nav/footer per role).
4. Add dark-mode token set (even if not launched immediately) so the token architecture is proven flexible.
5. Create a `/dev/style-guide` internal route rendering every component + token swatch, for visual QA.

### Definition of Done
- [ ] Zero hardcoded colors/fonts outside `tokens.css`.
- [ ] Style guide route renders all primitives correctly on mobile + desktop widths.
- [ ] Swapping one token value (e.g. primary color) visibly updates every component with no code changes elsewhere.

---

## Phase 2 — Authentication & User Accounts

**Goal:** Any user can sign up/log in as a Customer, Partner, or Admin, with correct role-based routing.

### Tasks
1. Implement Supabase Auth (email/password + OTP-phone) for Customers.
2. Build **C03 — Login** page (web-optimized): email/phone + password, "Remember me," social login buttons (Google, Apple — stub if credentials unavailable), QR-login placeholder.
3. Build Signup + forgot-password flows.
4. Build Partner login/onboarding (KYC document upload stub → Supabase Storage).
5. Build Admin login (invite-only, no public signup).
6. Implement role-based route guards (middleware) so `/partner/*` and `/admin/*` reject unauthenticated/wrong-role users.
7. Session handling: httpOnly secure cookies (not localStorage) per `techstack.md` security notes.
8. Add "logout everywhere" and session expiry handling.

### Definition of Done
- [ ] All 3 roles can register, log in, log out, and are redirected to the correct app shell.
- [ ] Wrong-role access to a protected route redirects to an appropriate error/login page.
- [ ] Auth tokens are never accessible via `document.cookie` from JS (httpOnly verified).
- [ ] Forgot-password email flow works end-to-end in a staging environment.

---

## Phase 3 — Restaurant Discovery (Customer)

**Goal:** A customer can find a restaurant and view its menu.

### Tasks
1. **Home page**: location detector (Geolocation API + manual entry fallback), restaurant list/grid, cuisine filter chips, search bar.
2. **Search results page**: text search with debounce, filters (cuisine, rating, price, delivery time, veg/non-veg), sort (relevance, rating, delivery time).
3. **Restaurant detail page**: cover image, rating, delivery ETA, menu categorized by section, dish cards with image/price/veg-nonveg indicator/customization modal.
4. Implement Mapbox GL JS (or Leaflet) for address selection and restaurant-distance sorting, using PostGIS geospatial queries on the backend.
5. Favorites: add/remove restaurant to favorites, `/favorites` page.
6. Empty/loading/error states for every list (skeleton loaders from Phase 1).

### Definition of Done
- [ ] Search returns relevant, correctly filtered/sorted results against seeded test data.
- [ ] Restaurant page renders full menu with working "Add to Cart" on each dish (cart wiring finishes in Phase 4).
- [ ] All pages responsive from 360px to 1440px+ widths.
- [ ] Location permission-denied path has a working manual-address fallback.

---

## Phase 4 — Cart & Checkout

**Goal:** A customer can build a cart, apply a coupon, and pay.

### Tasks
1. **C10 — Cart** page: desktop sticky sidebar layout + mobile bottom-sheet cart, quantity steppers, item customization edit, "items from a different restaurant" conflict warning.
2. Coupon/promo code input + validation against backend rules.
3. Bill breakdown component: subtotal, discount, delivery fee, taxes, total (all sourced from backend calculation, never computed client-side only).
4. Address selection/creation at checkout (map pin drop + saved addresses).
5. Integrate Razorpay Checkout (web SDK) per the flow in `techstack.md`; handle success/failure/retry.
6. Order creation API: validate cart server-side, create order + payment record atomically.
7. Order confirmation page/screen.

### Definition of Done
- [ ] Full flow — browse → add to cart → checkout → pay (test mode) → confirmation — works without console errors.
- [ ] Server recomputes and validates totals; client-submitted prices are never trusted.
- [ ] Coupon abuse cases handled (expired, min-order not met, already used).
- [ ] Payment failure shows a clear retry path and does not create a duplicate order.

---

## Phase 5 — Order Lifecycle & Live Tracking

**Goal:** Customers see real-time order status; partners/restaurants can update it.

### Tasks
1. Define order state machine: `placed → accepted → preparing → picked_up → on_the_way → delivered` (+ `cancelled` at applicable states).
2. Backend: Supabase Realtime channel per order for state + partner location updates.
3. **C15 — Live Order Tracking** page: desktop split-pane (map + status timeline + partner info + address), mobile stacked layout.
4. Implement Web Push notifications (VAPID) for order status changes; email fallback for browsers/users without push permission granted.
5. "Share order" (copy tracking link) and "Print receipt."
6. Order history page + reorder action.
7. Cancellation flow with role-appropriate rules (e.g., customer can cancel only pre-`preparing`).

### Definition of Done
- [ ] Status changes made from the partner app appear on the customer tracking page within ~2s (Realtime, not polling).
- [ ] Push notification fires on each status transition when permission is granted; email fires when it is not.
- [ ] Tracking page correctly degrades to a non-live static view if Realtime connection drops, with a reconnect indicator.

---

## Phase 6 — Delivery Partner App

**Goal:** A partner can go online, receive, accept, and complete deliveries.

### Tasks
1. Partner dashboard: online/offline toggle, today's earnings summary, active order card.
2. **P05 — Incoming Order Assignment**: modal/full-screen request with restaurant + customer maps, distance, earnings, item count, countdown timer, accept/reject, sound + vibration alert per `techstack.md`.
3. Partner order flow screens: navigate-to-restaurant → mark picked up → navigate-to-customer → mark delivered (with optional delivery photo/OTP confirmation).
4. Partner earnings & payout history page.
5. Partner location broadcasting (throttled geolocation updates) feeding the admin live map (Phase 7) and customer tracking (Phase 5).

### Definition of Done
- [ ] A seeded partner account can go online, receive a simulated order request, accept it, and walk it through to "delivered."
- [ ] Rejected/expired requests correctly reassign to another available partner (or queue) without manual intervention.
- [ ] Location updates do not drain battery/network excessively (throttle interval documented and enforced).

---

## Phase 7 — Admin / Restaurant Dashboard

**Goal:** Operators can manage menus, monitor live operations, and handle partners.

### Tasks
1. Menu management CRUD (categories, dishes, pricing, availability toggle, images via R2/Supabase Storage).
2. Order operations view: incoming/active/completed orders with manual status override and support actions (refund, reassign partner).
3. **A09 — Live Partner Map**: clustered markers, status filter (online/busy/offline), partner list sidebar with search, click-to-assign.
4. Restaurant profile & hours management.
5. Basic reporting: orders/day, revenue, top dishes (can be simple aggregate queries at this stage — full analytics is Phase 10).

### Definition of Done
- [ ] Admin can create a restaurant, add a full menu, and that menu is immediately visible on the customer app.
- [ ] Live map reflects partner location changes from Phase 6 in near-real-time.
- [ ] Manual order override actions (cancel/refund/reassign) are logged with an audit trail (who/when/what).

---

## Phase 8 — PWA, Offline & Performance

**Goal:** The app installs like a native app and performs well under real network conditions.

### Tasks
1. Add `manifest.json` (icons 72–512px, shortcuts, screenshots) and wire `next-pwa`/Workbox.
2. Implement caching strategies: `NetworkFirst` for API, `CacheFirst` for images, `StaleWhileRevalidate` for static assets.
3. **P00 — Install prompt** (Chrome/Edge native prompt capture; manual instructions for iOS Safari).
4. **P00B — Browser compatibility check** with graceful "continue anyway" path.
5. Offline banner + offline fallback page for full navigation failures.
6. Code-split heavy components (Map, Live Tracking) via `next/dynamic`; lazy-load below-fold images with `next/image`.
7. Run Lighthouse + Web Vitals instrumentation (`onCLS/onFID/onLCP/onFCP/onTTFB` → analytics endpoint).

### Definition of Done
- [ ] Lighthouse PWA score ≥ 90; installable on Chrome (desktop + Android) and via manual steps on iOS Safari.
- [ ] Core Web Vitals: LCP < 2.5s, FID/INP within "good," CLS < 0.1 on the home and restaurant pages (mid-tier mobile network throttling).
- [ ] Initial JS bundle < 200KB (per original PRD budget) — verify with `next build` output.
- [ ] Killing network mid-session shows the offline banner; previously visited pages remain browsable from cache.

---

## Phase 9 — Security Hardening

**Goal:** Close the gaps a launch-blocking security review would flag.

### Tasks
1. Apply CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` headers (see `techstack.md` for exact policy).
2. CSRF token on all state-changing API routes.
3. Rate limiting on auth endpoints and order-creation endpoint (Cloudflare Workers rate limiting or KV-based).
4. Input validation on every form via Zod schemas shared between client and server.
5. Secrets/PII audit: confirm no tokens/PII in logs, confirm Sentry `beforeSend` strips auth headers.
6. Dependency vulnerability scan wired into CI (e.g. `npm audit` gate).

### Definition of Done
- [ ] Security headers verified present on every response (spot-check via browser devtools/`curl -I`).
- [ ] A scripted CSRF-less POST to a state-changing endpoint is rejected.
- [ ] Auth endpoints reject after N failed attempts within a time window.
- [ ] CI fails the build on high/critical vulnerabilities.

---

## Phase 10 — QA, Analytics & Launch

**Goal:** Ship with confidence and visibility.

### Tasks
1. Wire error tracking (Sentry) across frontend + Workers backend.
2. Wire product analytics events (signup, search, add-to-cart, checkout started/completed, order status views).
3. Write/execute the full pre-launch checklist (PWA, browser compatibility, performance, security, notifications, SEO — as enumerated in the source requirements).
4. Cross-browser manual QA pass: Chrome, Firefox, Safari (desktop + iOS), Edge, Samsung Internet.
5. Load-test the order-creation and live-tracking Realtime paths at expected peak concurrency.
6. Prepare rollback plan (previous Vercel/Workers deployment pinned and one-command revertible).

### Definition of Done
- [ ] Every item in the pre-launch checklist is checked and evidenced (screenshot/log link).
- [ ] No untriaged Sentry errors from the final QA pass.
- [ ] Rollback tested once in staging before go-live.

---

## 3. Out of Scope (explicitly, for this phased plan)

- Native iOS/Android apps (superseded by PWA per the architecture decision).
- Multi-language/i18n (flag for a future phase).
- Multi-currency support.
- Advanced ML-based recommendations (basic "recommended for you" via simple heuristics only, if time allows in Phase 3).

## 4. Open Questions for the Product Owner

- Final brand name (doc currently uses placeholder "FoodApp").
- Whether Apple/Google social login credentials are available before Phase 2, or should ship stubbed.
- Target city/cities for launch (affects PostGIS seed data and delivery radius defaults).
- Whether WhatsApp Business API / SMS fallback (Twilio/MSG91) is in scope for Phase 5 or deferred.
