# Tech Stack — Multi-Platform Food Delivery Marketplace

**Companion docs:** `prd.md`, `theme.md`
**Architecture:** Single Next.js codebase (PWA), Cloudflare Workers API, Supabase data layer.

---

## 1. Guiding Principles

1. **One codebase, all platforms.** No React Native/Flutter — responsive web + PWA covers desktop, mobile, tablet.
2. **Edge-first backend.** Cloudflare Workers keep API latency low across India (and beyond) without managing servers.
3. **Managed data layer.** Supabase handles Postgres, auth, realtime, and storage so the team isn't building auth/realtime infra from scratch.
4. **Tokens over hardcoding.** All visual values come from `theme.md` — the stack must make that easy (Tailwind + CSS variables), not fight it.
5. **Everything replaceable.** Prefer swappable providers (e.g., Mapbox vs. Leaflet, Razorpay vs. another PSP) documented but not deeply coupled.

---

## 2. Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR/ISR for SEO on restaurant/menu pages, file-based routing per role, first-class PWA tooling |
| Language | **TypeScript** | Type safety across a multi-role app with shared schemas (Zod) |
| Styling | **Tailwind CSS** + CSS variables (design tokens) | Fast iteration, token-driven theming without a CSS-in-JS runtime cost |
| Component primitives | **Radix UI** | Accessible, unstyled — pairs with Tailwind for full styling control |
| Component library | **shadcn/ui** | Copy-in components (not a black-box dependency), easy to theme |
| Motion | **Framer Motion** | Micro-interactions, page transitions, status-change animations |
| Client state | **Zustand** | Cart, UI state — minimal boilerplate vs. Redux |
| Server/cache state | **React Query (TanStack Query)** | Caching, background refetch, optimistic updates for cart/order actions |
| Forms | **React Hook Form** + **Zod** | Shared validation schemas between client and Worker API |
| Maps | **Mapbox GL JS** (primary) / **Leaflet** (fallback/open-source option) | Interactive restaurant/partner maps, geolocation |
| Real-time | **Supabase Realtime** (primary), **Socket.io-client** or SSE as fallback for custom channels | Order status + partner location streaming |

## 3. Backend

| Layer | Choice | Why |
|---|---|---|
| API runtime | **Cloudflare Workers** | Edge execution, low cold-start, scales to zero |
| API framework | **Hono** | Lightweight, TypeScript-native, fast on Workers |
| Database | **Supabase Postgres** | Managed Postgres with row-level security |
| Geospatial | **PostGIS** (Supabase extension) | Distance queries, delivery radius, partner proximity |
| Auth | **Supabase Auth (JWT)** | Email/password, phone OTP, social login providers |
| Realtime | **Supabase Realtime** | Order status channels, partner location broadcast |
| Object storage | **Cloudflare R2** | Restaurant/dish images, partner KYC docs, user uploads — no egress fees |

## 4. Notifications

| Channel | Choice | Notes |
|---|---|---|
| Push | **Web Push API** (VAPID) via Service Worker | Replaces FCM; iOS requires 16.4+ and PWA installation |
| Email | Transactional email provider (e.g. Resend/SendGrid — pick one in Phase 5) | Fallback when push permission not granted |
| SMS/WhatsApp | **Twilio** or **MSG91**, WhatsApp Business API | Optional fallback — confirm scope with product owner (see PRD open questions) |

## 5. Payments

- **Razorpay Checkout (web SDK)** — loaded dynamically, order created server-side, payment verified server-side via webhook + response signature. Never trust client-reported payment status.

## 6. PWA & Performance Tooling

| Tool | Purpose |
|---|---|
| **next-pwa** | Service worker generation/registration |
| **Workbox** | Caching strategies (`NetworkFirst`, `CacheFirst`, `StaleWhileRevalidate`) |
| **web-vitals** | Core Web Vitals measurement (CLS, FID/INP, LCP, FCP, TTFB) |
| **next/image** | Automatic image optimization, lazy loading, blur placeholders |
| **next/dynamic** | Code-splitting heavy components (maps, live tracking) |

## 7. Security

- **CSP** via Next.js custom headers (`next.config.js`), scoped to only the third-party origins actually in use (Mapbox/Google Maps, Razorpay, Supabase, fonts).
- **httpOnly, Secure, SameSite=Strict cookies** for session tokens — never localStorage for auth.
- **CSRF tokens** on all state-changing requests.
- **Rate limiting** at the Worker layer on auth and order-creation endpoints.
- **Sentry** with `beforeSend` scrubbing of auth headers/PII.

## 8. DevOps & Deployment

| Concern | Choice |
|---|---|
| Frontend hosting | **Vercel** (or Cloudflare Pages as an alternative — pick one before Phase 0 sign-off) |
| Backend hosting | **Cloudflare Workers** (`wrangler.toml`, `bom1`/Mumbai-adjacent region preferred for India latency) |
| CI | **GitHub Actions** — lint, typecheck, test, build on every PR |
| CD | Auto-deploy `main` → production; PR previews for review |
| Error tracking | **Sentry** (frontend + Workers) |
| Analytics | Custom events via `navigator.sendBeacon` to a Workers analytics endpoint, or a managed product analytics tool (decide in Phase 10) |

## 9. Testing

| Layer | Tool |
|---|---|
| Unit/component | **Vitest** + **React Testing Library** |
| E2E | **Playwright** (covers cross-browser matrix: Chrome, Firefox, Safari, Edge) |
| API | **Vitest** against Workers (Miniflare or local Wrangler dev) |
| Accessibility | **axe-core** integrated into Playwright runs |

## 10. Versioning Notes

- Pin exact major versions in `package.json` at Phase 0 setup time (avoid drifting mid-project); re-verify compatibility before Phase 8 (PWA) since `next-pwa`/Workbox APIs shift between Next.js majors.
- `compatibility_date` in `wrangler.toml` should be bumped deliberately, not left to auto-update, to avoid silent Workers runtime behavior changes.

## 11. Explicitly Deferred / Not in Stack (v1)

- React Native / Flutter (superseded by PWA decision).
- Native push (FCM/APNs) — Web Push covers this; revisit only if native apps are reintroduced later.
- GraphQL — REST via Hono is sufficient for current scope; revisit if client data-fetching complexity grows.
