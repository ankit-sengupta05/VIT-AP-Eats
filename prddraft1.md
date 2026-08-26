# 📋 UPDATED PRODUCT REQUIREMENTS DOCUMENT
## Multi-Platform Food Delivery Marketplace — Web-First Architecture

**Document Version:** 2.1
**Date:** August 25, 2026
**Architecture:** Progressive Web App (PWA) + Responsive Web

---

# 🔄 KEY ARCHITECTURE CHANGES

## From Native Apps to Web-First

**Previous:** Native Android + iOS + Web
**New:** Single responsive web application (PWA-capable)

```
┌─────────────────────────────────────────────────────────┐
│                    SINGLE CODEBASE                       │
│                 (React/Next.js + PWA)                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Desktop Web      Mobile Web         Tablet Web
   (Chrome,         (Chrome,           (iPad,
    Firefox,         Safari,            Android
    Edge)            Samsung)           Tablet)
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                   PWA Installation
                   (Add to Home Screen)
```

---

# 📱 PLATFORM SUPPORT MATRIX

## Supported Platforms

| Platform | Browser | Status | PWA Install |
|----------|---------|--------|-------------|
| **Desktop** | Chrome 90+ | ✅ Full | ✅ Yes |
| **Desktop** | Firefox 90+ | ✅ Full | ✅ Yes |
| **Desktop** | Edge 90+ | ✅ Full | ✅ Yes |
| **Desktop** | Safari 14+ | ✅ Full | ⚠️ Limited |
| **Mobile** | Chrome Android 90+ | ✅ Full | ✅ Yes |
| **Mobile** | Safari iOS 14+ | ✅ Full | ✅ Yes (iOS 16.4+) |
| **Mobile** | Samsung Internet | ✅ Full | ✅ Yes |
| **Tablet** | iPad Safari | ✅ Full | ✅ Yes |
| **Tablet** | Android Tablet Chrome | ✅ Full | ✅ Yes |

## PWA Capabilities

### ✅ Supported on All Platforms
- Offline access to cached content
- Push notifications (with permission)
- Home screen installation
- Splash screen on launch
- Full-screen mode (no browser UI)
- Background sync (limited)
- Service Worker caching

### ⚠️ Platform-Specific Limitations

**iOS Safari:**
- Push notifications: iOS 16.4+ only (requires PWA installation)
- Background sync: Limited
- Storage: May be cleared if not used frequently
- Camera access: Works but less seamless than native

**Android Chrome:**
- Full PWA support
- Best-in-class push notifications
- Reliable background sync
- Persistent storage

---

# 🛠️ UPDATED TECHNOLOGY STACK

## Frontend

```typescript
// Core Framework
Next.js 14+ (App Router)
├── React 18+
├── TypeScript
├── Tailwind CSS
└── PWA Configuration

// State Management
├── Zustand (client state)
├── React Query (server state)
└── Context API (auth, theme)

// UI Components
├── Radix UI (accessible primitives)
├── shadcn/ui (pre-built components)
└── Framer Motion (animations)

// Maps & Location
├── Mapbox GL JS (interactive maps)
├── Leaflet (alternative, open-source)
└── Geolocation API (browser native)

// Real-time
├── Socket.io-client (WebSocket)
└── Server-Sent Events (fallback)

// Forms & Validation
├── React Hook Form
└── Zod (schema validation)

// PWA
├── next-pwa (service worker)
├── Workbox (caching strategies)
└── Web Push API
```

## Backend (Unchanged)

```typescript
Cloudflare Workers (API)
├── Hono (lightweight framework)
├── TypeScript
└── Edge runtime

Supabase
├── PostgreSQL (database)
├── PostGIS (geospatial)
├── Auth (JWT)
├── Realtime (WebSocket)
└── Storage (R2 for images)

Cloudflare R2 (object storage)
├── Restaurant images
├── Dish images
├── Partner documents
└── User uploads
```

## Notifications

```typescript
// Web Push (replaces FCM)
Web Push API
├── Service Worker registration
├── Push subscription management
└── VAPID keys for authentication

// Fallback Options
├── Email notifications
├── WhatsApp Business API
└── SMS (via Twilio/MSG91)
```

---

# 📄 UPDATED PAGE SPECIFICATIONS

## PWA-Specific Pages

### P00 — PWA Installation Prompt

**Purpose:** Encourage users to install the app

**Trigger Conditions:**
- User has visited 3+ times
- User has placed an order
- User is on mobile device
- PWA not already installed

**Layout:**
```
┌──────────────────────────────┐
│                              │
│   ┌──────────────────────┐  │
│   │                      │  │
│   │   [App Icon]         │  │
│   │                      │  │
│   │   Install FoodApp?   │  │
│   │                      │  │
│   │   Get quick access   │  │
│   │   from your home     │  │
│   │   screen             │  │
│   │                      │  │
│   │   [Not Now] [Install]│  │
│   │                      │  │
│   └──────────────────────┘  │
│                              │
└──────────────────────────────┘
```

**Browser-Specific Installation:**

**Chrome/Edge:**
```javascript
// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  // Show custom install UI
  deferredPrompt = event;
});

// Trigger installation
deferredPrompt.prompt();
```

**Safari iOS:**
```
Show manual instructions:
1. Tap Share button [⬆️]
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add"
```

---

### P00B — Browser Compatibility Warning

**Purpose:** Warn users on unsupported browsers

**Detection Logic:**
```javascript
const isSupported = () => {
  const ua = navigator.userAgent;
  
  // Check for very old browsers
  if (/MSIE|Trident/.test(ua)) return false; // IE
  if (/Edge\/1[2-6]\./.test(ua)) return false; // Old Edge
  
  // Check for required features
  if (!('serviceWorker' in navigator)) return false;
  if (!('caches' in window)) return false;
  if (!('PushManager' in window)) return false;
  
  return true;
};
```

**UI:**
```
┌──────────────────────────────┐
│                              │
│   ⚠️ Browser Not Supported   │
│                              │
│   Your browser is outdated   │
│   and may not support all    │
│   features.                  │
│                              │
│   Recommended browsers:      │
│   • Chrome 90+               │
│   • Firefox 90+              │
│   • Safari 14+               │
│   • Edge 90+                 │
│                              │
│   [Continue Anyway]          │
│                              │
└──────────────────────────────┘
```

---

## Updated Customer Pages

### C03 — Login (Web-Optimized)

**Changes from mobile:**
- Email + password login as primary (not just phone/OTP)
- Social login buttons (Google, Apple, Facebook)
- "Remember me" checkbox
- QR code login option (scan from mobile)

**Layout:**
```
┌────────────────────────────────────────┐
│                                        │
│         Welcome Back                   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Email or Phone                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Password                  [👁]   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ☐ Remember me      Forgot password? │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         LOGIN                    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ─────────── OR ───────────            │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  [G] Continue with Google        │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  [] Continue with Apple          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Don't have an account? Sign up       │
│                                        │
└────────────────────────────────────────┘
```

---

### C15 — Live Order Tracking (Web-Enhanced)

**Web-Specific Features:**
- Larger map view on desktop
- Split-pane layout (map + details side-by-side)
- Browser notifications for status changes
- Share order link (copy to clipboard)
- Print receipt option

**Desktop Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Order #ORD123456                        [Share] [Print]│
├───────────────────────────────┬──────────────────────┤
│                               │                      │
│                               │  Status              │
│        MAP VIEW               │                      │
│   (Larger on desktop)         │  ✅ Order placed     │
│                               │  ✅ Restaurant       │
│   🍽️ ────── 🏍️ ── 🏠        │  ✅ Preparing        │
│                               │  ✅ Picked up        │
│   ETA: 12 min                 │  🔄 On the way       │
│   Distance: 1.8 km            │  ○ Delivered         │
│                               │                      │
│                               │──────────────────────│
│                               │                      │
│                               │  Partner Info        │
│                               │  🏍️ Arjun Kumar     │
│                               │  ⭐ 4.8              │
│                               │  📞 [Call]           │
│                               │                      │
│                               │──────────────────────│
│                               │                      │
│                               │  Delivery Address    │
│                               │  🏠 123 Main St     │
│                               │  Bangalore 560001    │
│                               │                      │
└───────────────────────────────┴──────────────────────┘
```

**Browser Notification:**
```javascript
// Request permission
Notification.requestPermission();

// Show notification on status change
if (Notification.permission === 'granted') {
  new Notification('Order Update', {
    body: 'Your order is out for delivery!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'order-ORD123456',
    requireInteraction: false,
    actions: [
      { action: 'track', title: 'Track Order' },
      { action: 'call', title: 'Call Partner' }
    ]
  });
}
```

---

### C10 — Cart (Web-Optimized)

**Desktop Enhancements:**
- Sticky cart sidebar
- Quick edit inline
- Save for later option
- Compare with other restaurants

**Desktop Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Restaurant Menu                          [Cart (3)] │
├───────────────────────────────┬──────────────────────┤
│                               │                      │
│  RECOMMENDED                  │  YOUR CART           │
│                               │                      │
│  ┌─────────────────────────┐ │ │  🍽️ Paradise       │
│  │ [Dish Card]             │ │ │                      │
│  │ Chicken Biryani         │ │ │  1× Chicken Biryani │
│  │ ₹249      [ADD +]       │ │ │    Size: Large      │
│  └─────────────────────────┘ │ │    +₹80             │
│                               │ │    ₹369    [−][1][+]│
│  ┌─────────────────────────┐ │ │                      │
│  │ [Dish Card]             │ │ │  2× Paneer Tikka    │
│  │ Paneer Tikka            │ │ │    ₹498    [−][2][+]│
│  │ ₹249      [ADD +]       │ │ │                      │
│  └─────────────────────────┘ │ │──────────────────────│
│                               │ │                      │
│  BIRYANI                      │ │  🎁 Apply Coupon     │
│                               │ │  [Enter code] [Apply]│
│  ┌─────────────────────────┐ │ │                      │
│  │ [Dish Card]             │ │ │  Bill Details        │
│  │ Mutton Biryani          │ │ │  Subtotal    ₹867    │
│  │ ₹349      [ADD +]       │ │ │  Discount   −₹100   │
│  └─────────────────────────┘ │ │  Delivery     ₹25    │
│                               │ │  Taxes        ₹62    │
│                               │ │──────────────────────│
│                               │ │  TOTAL       ₹854    │
│                               │ │                      │
│                               │ │  [CHECKOUT →]        │
│                               │ │                      │
└───────────────────────────────┴──────────────────────┘
```

---

## Updated Admin Pages

### A09 — Live Partner Map (Web-Enhanced)

**Desktop Features:**
- Full-screen map option
- Cluster markers for dense areas
- Real-time partner list sidebar
- Filter by status, rating, distance
- Click partner to see details

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Live Partner Map              [Fullscreen] [Filter] │
├───────────────────────────────┬──────────────────────┤
│                               │                      │
│                               │  Partners (188)      │
│        MAP VIEW               │                      │
│                               │  🔍 Search...        │
│   [Cluster markers]           │                      │
│                               │  [All] [Online]      │
│   🟢 🟢 🟢                    │  [Busy] [Offline]    │
│        🟠 🟠                  │                      │
│   🟢       🟢 🟢              │  ─────────────────── │
│      🟠                       │                      │
│   🔴 🔴                       │  🟢 Arjun Kumar      │
│                               │     0.5 km • ⭐ 4.8  │
│                               │     [View] [Assign]  │
│                               │                      │
│                               │  🟢 Ravi Singh       │
│                               │     0.8 km • ⭐ 4.5  │
│                               │     [View] [Assign]  │
│                               │                      │
│                               │  🟠 Suresh P         │
│                               │     1.2 km • ⭐ 4.2  │
│                               │     Delivering       │
│                               │     [View Details]   │
│                               │                      │
└───────────────────────────────┴──────────────────────┘
```

---

## Updated Partner Pages

### P05 — Incoming Order Assignment (Web-Optimized)

**Desktop Layout:**
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              NEW DELIVERY REQUEST                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │  🍽️ Paradise Biryani                          │ │
│  │  📍 456 Food Street                           │ │
│  │                                                │ │
│  │  [MAP: Restaurant location]                   │ │
│  │                                                │ │
│  │  Distance: 1.2 km                             │ │
│  │                                                │ │
│  ├────────────────────────────────────────────────┤ │
│  │                                                │ │
│  │  🏠 Customer: John Doe                        │ │
│  │  📍 123 Main Street                           │ │
│  │                                                │ │
│  │  [MAP: Customer location]                     │ │
│  │                                                │ │
│  │  Distance from restaurant: 2.5 km             │ │
│  │                                                │ │
│  ├────────────────────────────────────────────────┤ │
│  │                                                │ │
│  │  📦 Items: 3                                  │ │
│  │  💰 Earnings: ₹85                             │ │
│  │  🕒 Estimated time: 25 min                    │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │        Accept in: 00:28                        │ │
│  │        ████████████████░░░░░░░░░░░░░░░░        │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──────────────────────┐ ┌────────────────────────┐│
│  │                      │ │                        ││
│  │    [REJECT]          │ │     [ACCEPT]           ││
│  │                      │ │                        ││
│  └──────────────────────┘ └────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Sound/Vibration:**
```javascript
// Play notification sound
const audio = new Audio('/notification.mp3');
audio.play();

// Vibrate (if supported)
if ('vibrate' in navigator) {
  navigator.vibrate([200, 100, 200, 100, 200]);
}
```

---

# 🔐 UPDATED SECURITY ARCHITECTURE

## Web-Specific Security

### 1. Content Security Policy (CSP)

```javascript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.fooddelivery.com wss: https://*.supabase.co;
  frame-src 'self' https://razorpay.com https://accounts.google.com;
  worker-src 'self' blob:;
  manifest-src 'self';
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 2. Secure Authentication Flow

```typescript
// Web-specific auth considerations

// 1. Token storage
// Use httpOnly cookies for web (more secure than localStorage)
document.cookie = `token=${jwt}; HttpOnly; Secure; SameSite=Strict; Path=/`;

// 2. CSRF protection
// Include CSRF token in all state-changing requests
const csrfToken = await getCsrfToken();
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(orderData),
});

// 3. Session management
// Detect tab close vs browser close
window.addEventListener('beforeunload', () => {
  // Don't logout on tab close
});

// Logout on browser close (optional)
window.addEventListener('unload', () => {
  // Send beacon to logout
  navigator.sendBeacon('/api/auth/logout');
});
```

### 3. Secure Payment Integration

```typescript
// Razorpay integration (web)
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handlePayment = async (order) => {
  const isLoaded = await loadRazorpay();
  
  if (!isLoaded) {
    alert('Razorpay SDK failed to load');
    return;
  }
  
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
    amount: order.total * 100, // paise
    currency: 'INR',
    name: 'FoodApp',
    description: `Order #${order.order_number}`,
    order_id: order.razorpay_order_id,
    handler: async (response) => {
      // Verify payment on backend
      await verifyPayment(response);
    },
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone,
    },
    theme: {
      color: '#FF6B35',
    },
  };
  
  const rzp = new Razorpay(options);
  rzp.open();
};
```

---

# 📊 UPDATED PERFORMANCE OPTIMIZATION

## Web-Specific Optimizations

### 1. Code Splitting & Lazy Loading

```typescript
// pages/index.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const MapComponent = dynamic(() => import('@/components/Map'), {
  loading: () => <p>Loading map...</p>,
  ssr: false, // Disable SSR for map
});

const LiveTracking = dynamic(() => import('@/components/LiveTracking'), {
  loading: () => <TrackingSkeleton />,
});

export default function Home() {
  return (
    <>
      <HeroSection />
      <MapComponent /> {/* Loaded only when needed */}
      <LiveTracking /> {/* Loaded only on order page */}
    </>
  );
}
```

### 2. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={dish.image_url}
  alt={dish.name}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL={dish.blur_hash}
  loading="lazy"
  quality={80}
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

### 3. Service Worker Caching Strategy

```javascript
// sw.js (Service Worker)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses (network-first for dynamic data)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Cache images (cache-first)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache static assets (stale-while-revalidate)
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-cache',
  })
);
```

### 4. Offline Support

```typescript
// components/OfflineBanner.tsx
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500 text-white p-4 text-center">
      You are offline. Some features may be unavailable.
    </div>
  );
}
```

---

# 📱 PWA MANIFEST & CONFIGURATION

## manifest.json

```json
{
  "name": "FoodApp - Food Delivery",
  "short_name": "FoodApp",
  "description": "Order food from your favorite restaurants",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#FF6B35",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["food", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png"
    },
    {
      "src": "/screenshots/restaurant.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "My Orders",
      "short_name": "Orders",
      "description": "View your orders",
      "url": "/orders",
      "icons": [{ "src": "/icons/orders.png", "sizes": "96x96" }]
    },
    {
      "name": "Favorites",
      "short_name": "Favorites",
      "description": "View favorite restaurants",
      "url": "/favorites",
      "icons": [{ "src": "/icons/favorites.png", "sizes": "96x96" }]
    }
  ]
}
```

## next.config.js (PWA Configuration)

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.fooddelivery\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 5 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:image)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['r2.fooddelivery.com', 'api.fooddelivery.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
});
```

---

# 🔔 UPDATED NOTIFICATION SYSTEM

## Web Push Notifications

### 1. Service Worker Registration

```typescript
// lib/push-notifications.ts
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

export async function subscribeToPushNotifications() {
  const registration = await navigator.serviceWorker.ready;
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    
    // Send subscription to backend
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    
    return subscription;
  } catch (error) {
    console.error('Push notification subscription failed:', error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
```

### 2. Backend Push Notification Service

```typescript
// api/notifications/send.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:notifications@fooddelivery.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(userId: string, payload: any) {
  // Get user's push subscriptions from database
  const subscriptions = await db.push_subscriptions.findMany({
    where: { user_id: userId },
  });
  
  const promises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth_key,
            p256dh: sub.p256dh_key,
          },
        },
        JSON.stringify(payload)
      );
    } catch (error) {
      if (error.statusCode === 410) {
        // Subscription expired, remove from database
        await db.push_subscriptions.delete({
          where: { id: sub.id },
        });
      }
    }
  });
  
  await Promise.all(promises);
}

// Usage
await sendPushNotification(customerId, {
  title: 'Order Update',
  body: 'Your order is out for delivery!',
  icon: '/icon-192.png',
  badge: '/badge-72.png',
  data: {
    url: `/orders/${orderId}`,
    orderId: orderId,
  },
  actions: [
    { action: 'track', title: 'Track Order' },
    { action: 'call', title: 'Call Partner' },
  ],
});
```

### 3. Service Worker Push Handler

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    actions: data.actions,
    requireInteraction: false,
    tag: `order-${data.data.orderId}`,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'track') {
    event.waitUntil(
      clients.openWindow(`/orders/${event.notification.data.orderId}`)
    );
  } else if (event.action === 'call') {
    // Handle call action
  } else {
    // Default: open notification URL
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

---

# 🚀 UPDATED DEPLOYMENT STRATEGY

## Web Deployment

### 1. Frontend Deployment (Vercel/Netlify/Cloudflare Pages)

```yaml
# vercel.json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["bom1"], // Mumbai for India
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

### 2. Backend Deployment (Cloudflare Workers)

```toml
# wrangler.toml
name = "fooddelivery-api"
main = "src/index.ts"
compatibility_date = "2026-08-25"

[env.production]
vars = { ENVIRONMENT = "production" }

[[routes]]
pattern = "api.fooddelivery.com/*"
zone_name = "fooddelivery.com"

[triggers]
crons = ["*/5 * * * *"] // Every 5 minutes for scheduled tasks

[observability]
enabled = true
head_sampling_rate = 1
```

### 3. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_RAZORPAY_KEY: ${{ secrets.RAZORPAY_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
  
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          command: deploy --env production
```

---

# 📈 UPDATED ANALYTICS & MONITORING

## Web-Specific Metrics

### 1. Core Web Vitals

```typescript
// lib/analytics.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function trackWebVitals() {
  onCLS(sendToAnalytics); // Cumulative Layout Shift
  onFID(sendToAnalytics); // First Input Delay
  onLCP(sendToAnalytics); // Largest Contentful Paint
  onFCP(sendToAnalytics); // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}

function sendToAnalytics(metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    timestamp: Date.now(),
  };
  
  // Send to analytics backend
  navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify(body));
}
```

### 2. PWA Installation Tracking

```typescript
// Track PWA installations
window.addEventListener('appinstalled', (event) => {
  // Send to analytics
  trackEvent('pwa_installed', {
    timestamp: Date.now(),
    user_agent: navigator.userAgent,
    platform: navigator.platform,
  });
});

// Track beforeinstallprompt
window.addEventListener('beforeinstallprompt', (event) => {
  trackEvent('pwa_install_prompted', {
    timestamp: Date.now(),
  });
});
```

### 3. Error Tracking

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  
  // Filter out common browser errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  beforeSend(event) {
    // Remove sensitive data
    if (event.request && event.request.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  },
});

// Track unhandled errors
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
});
```

---

# ✅ UPDATED CHECKLIST

## Pre-Launch Checklist

### PWA Requirements
- [ ] manifest.json configured
- [ ] Service worker registered
- [ ] Icons in all required sizes (72, 96, 128, 144, 152, 192, 384, 512)
- [ ] Splash screens configured
- [ ] Offline fallback page
- [ ] Push notifications working
- [ ] Install prompt implemented
- [ ] PWA tested on iOS Safari
- [ ] PWA tested on Android Chrome

### Browser Compatibility
- [ ] Tested on Chrome 90+
- [ ] Tested on Firefox 90+
- [ ] Tested on Safari 14+
- [ ] Tested on Edge 90+
- [ ] Tested on Samsung Internet
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Touch interactions working on mobile
- [ ] Keyboard navigation working on desktop

### Performance
- [ ] Core Web Vitals passing (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized (< 200KB initial)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting implemented
- [ ] Caching strategy configured
- [ ] CDN configured for static assets

### Security
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] X-Frame-Options set
- [ ] CORS configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] CSRF protection enabled
- [ ] Secure cookies (HttpOnly, Secure, SameSite)

### Notifications
- [ ] Web Push API integrated
- [ ] VAPID keys generated
- [ ] Push subscription flow working
- [ ] Notification permissions requested
- [ ] Fallback to email/WhatsApp implemented
- [ ] Notification templates configured

### SEO
- [ ] Meta tags configured
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Structured data (JSON-LD)
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set

---

# 📝 SUMMARY

## What Changed

| Aspect | Before (Native Apps) | After (Web-First PWA) |
|--------|---------------------|----------------------|
| **Platforms** | Web + Android + iOS | Single web app (PWA) |
| **Codebase** | 3 separate (React Native/Flutter + Web) | 1 unified (Next.js) |
| **Deployment** | App stores + web hosting | Web hosting only (Vercel/Netlify) |
| **Updates** | App store review (1-7 days) | Instant (CDN deploy) |
| **Notifications** | FCM (Firebase) | Web Push API + fallback |
| **Installation** | App store download | "Add to Home Screen" |
| **Offline** | Native storage | Service Worker + IndexedDB |
| **Maps** | Native map SDKs | Mapbox GL JS / Leaflet |
| **Payments** | Native SDKs | Web SDK (Razorpay checkout.js) |
| **Biometric** | Native (Face ID, fingerprint) | WebAuthn (limited) |

## Advantages of Web-First Approach

✅ **Single codebase** — Maintain one app, not three
✅ **Instant updates** — No app store review delays
✅ **Lower development cost** — 60-70% less than native
✅ **Cross-platform** — Works on any device with a browser
✅ **SEO benefits** — Search engines can index your app
✅ **Shareable links** — Easy to share specific pages
✅ **No app store fees** — 0% commission (vs 15-30% app stores)
✅ **Easier testing** — Browser dev tools, no device fragmentation

## Trade-offs

⚠️ **Limited native features** — No deep system integration
⚠️ **Push notifications** — iOS requires PWA installation (iOS 16.4+)
⚠️ **Performance** — Slightly slower than native for complex animations
⚠️ **Offline support** — More limited than native apps
⚠️ **Hardware access** — Camera, sensors less seamless

---

**Next Steps:**
1. Set up Next.js project with PWA configuration
2. Implement responsive design system
3. Build core pages (Home, Restaurant, Cart, Checkout)
4. Integrate Web Push notifications
5. Test PWA installation on iOS and Android
6. Deploy to Vercel/Cloudflare Pages
