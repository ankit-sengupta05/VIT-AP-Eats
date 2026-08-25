# QA Checklist: VIT-AP Eats

Before officially launching the product, the following manual Quality Assurance (QA) pass must be completed.

## 1. Authentication & Onboarding
- [ ] Sign up with a new email address.
- [ ] Verify the email confirmation works.
- [ ] Log in with correct credentials.
- [ ] Test "Forgot Password" flow.
- [ ] Test the PWA "Install App" prompt on Chrome/Android.
- [ ] Test the "Share > Add to Home Screen" instructions on iOS Safari.

## 2. Browsing & Ordering (Customer App)
- [ ] Search for a restaurant (verify debouncing works).
- [ ] Add items to cart from multiple restaurants (should clear old cart or prompt).
- [ ] Apply a valid coupon code at checkout.
- [ ] Apply an invalid coupon code (verify error state).
- [ ] Simulate network offline while browsing (verify `~offline` fallback page appears).
- [ ] Pay via Razorpay (use test card details `4111 1111...`).
- [ ] Verify order appears in the "Live Tracking" map.
- [ ] Wait for an order update via Supabase Realtime (partner accepts the order).

## 3. Partner Dashboard
- [ ] Log in as a user with the `partner` role.
- [ ] Verify the active orders dashboard streams new orders via Realtime.
- [ ] Update an order status from `pending` to `preparing` to `out_for_delivery`.
- [ ] Verify earnings chart renders without errors.

## 4. Admin Panel
- [ ] Log in as a user with the `admin` role.
- [ ] Verify total metrics (Revenue, Active Partners) load.
- [ ] Check the Audit Logs to ensure backend actions are being recorded.
- [ ] Verify non-admins cannot access `/admin` or `/api/admin`.

## 5. Security & Edge Cases
- [ ] Reload checkout page repeatedly (verify Cloudflare KV Rate Limiter kicks in).
- [ ] Try to access the Next.js frontend with Javascript disabled (basic noscript fallback).
- [ ] Run `npm run audit-ci` and ensure it passes (or has overrides).
- [ ] Confirm Sentry captures a test error triggered on the frontend.
