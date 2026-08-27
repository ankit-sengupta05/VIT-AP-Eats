<div align="center">
  <img src="./vitap-eats/public/icons/icon-512x512.png" width="120" height="120" alt="VIT-AP Eats Logo" />
  <h1>🍛 VIT-AP Eats</h1>
  <p><b>The campus food delivery platform built for VIT-AP University students.</b></p>
  <p><i>Order from your favourite canteen, track in real-time, straight to your hostel.</i></p>

  <br/>

  ![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase&logoColor=black)
  ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
  ![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa)
  ![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🚀 **Progressive Web App** | Installable on iOS & Android, works offline |
| 🔥 **Firebase Real-time** | Firestore `onSnapshot` for live order tracking |
| 🔐 **Firebase Auth** | Email/Password + Google SSO, role-based routing |
| 👑 **Admin Dashboard** | Full order management with WhatsApp confirmation |
| 🍽️ **Menu Management** | Toggle item availability, grouped by category |
| 📊 **Live Analytics** | Real-time revenue chart and top dishes from Firestore |
| 🛵 **Order Tracking** | Live status updates from restaurant → delivered |
| 💬 **WhatsApp Integration** | One-tap customer chat from admin order view |
| 📱 **Responsive Design** | Mobile-first glassmorphism UI |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VITAP Eats Stack                     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Next.js 16 (App Router / Turbopack)     │  │
│  │   Deployed on ▲ Vercel (Edge Network)            │  │
│  │                                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │  Customer   │  │   Admin /   │               │  │
│  │  │    Pages    │  │   Partner   │               │  │
│  │  └──────┬──────┘  └──────┬──────┘               │  │
│  │         │                │                      │  │
│  │         ▼                ▼                      │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │       Firebase Client SDK (Browser)     │    │  │
│  │  │  ┌────────────┐  ┌────────────────────┐ │    │  │
│  │  │  │  Firebase  │  │  Cloud Firestore   │ │    │  │
│  │  │  │    Auth    │  │  (Real-time DB)    │ │    │  │
│  │  │  └────────────┘  └────────────────────┘ │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action  →  React Component  →  lib/db/*.ts (Firestore SDK)
                                          │
                     ┌────────────────────┘
                     ▼
              Cloud Firestore
                     │
              onSnapshot listener  →  Real-time UI update
```

### Firestore Collections

| Collection | Description |
|---|---|
| `users` | User profiles & roles (`customer`, `partner`, `admin`) |
| `restaurants` | Restaurant info, hours, cuisine |
| `menu_items` | Dishes with price, category, availability |
| `orders` | Order docs with real-time status |

---

## 🖥️ Pages & Roles

| Route | Role | Description |
|---|---|---|
| `/` | Customer | Home: restaurant listing |
| `/restaurant/[slug]` | Customer | Menu, add to cart |
| `/cart` | Customer | Cart review + coupon |
| `/checkout` | Customer | Place order |
| `/order/[id]` | Customer | Live order tracking |
| `/orders` | Customer | Order history |
| `/login`, `/signup` | All | Firebase Auth |
| `/forgot-password` | All | Password reset email |
| `/admin` | Admin | Orders, Menu, Insights, Users |
| `/partner` | Partner | Delivery dashboard |
| `/partner/earnings` | Partner | Payout history |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Firebase project** (Firestore + Authentication enabled)
- **Vercel account** (for deployment)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/ankit-sengupta05/VIT-AP-Eats.git
cd VIT-AP-Eats/vitap-eats
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com), then:

1. Enable **Authentication** → Email/Password + Google
2. Enable **Firestore Database** → Start in production mode
3. Copy your project config keys

Create `.env.local` in `vitap-eats/`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth.token.role == "admin";
    }

    // Restaurants — public read, admin write
    match /restaurants/{id} {
      allow read: if true;
      allow write: if request.auth.token.role == "admin";
    }

    // Menu items — public read, admin/partner write
    match /menu_items/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders — authenticated users only
    match /orders/{id} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         request.auth.token.role in ["admin", "partner"]);
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

### 5. Set Admin Role (Custom Claims)

For the admin panel to work, set a custom claim on your admin user via Firebase Admin SDK or Cloud Functions:

```js
// Run once via Firebase Admin SDK
admin.auth().setCustomUserClaims(adminUid, { role: 'admin' });
```

### 6. Run Locally

```bash
npm run dev
```

App runs at **http://localhost:3000** 🚀

---

## 📦 Deployment (Vercel)

The app auto-deploys to Vercel on every push to `main` via the CI/CD pipeline in `.github/workflows/deploy.yml`.

### Manual Deploy

```bash
npm install -g vercel
vercel --prod
```

### Environment Variables on Vercel

Add all `NEXT_PUBLIC_FIREBASE_*` variables in:
**Vercel Dashboard → Project → Settings → Environment Variables**

---

## 📁 Project Structure

```
vitap-eats/
├── app/
│   ├── (customer)/        # Customer-facing routes
│   │   ├── page.tsx       # Home / restaurant listing
│   │   ├── restaurant/    # Restaurant menu page
│   │   ├── cart/          # Cart & checkout flow
│   │   ├── orders/        # Order history
│   │   └── order/[id]/    # Live order tracking
│   ├── admin/             # Admin dashboard (Orders, Menu, Insights)
│   ├── partner/           # Delivery partner dashboard
│   └── login/signup/      # Auth pages
│
├── lib/
│   ├── firebase.ts        # Firebase app initialization
│   ├── db/
│   │   ├── orders.ts      # Firestore order CRUD + subscriptions
│   │   ├── restaurants.ts # Restaurant + menu queries
│   │   ├── users.ts       # User profile management
│   │   └── items.ts       # Menu item management
│   ├── hooks.ts           # React Query hooks
│   └── store/cart.ts      # Zustand cart store
│
├── components/
│   ├── customer/          # CustomerHeader, RestaurantCard
│   └── ui/                # Reusable UI primitives
│
└── .github/workflows/
    └── deploy.yml         # Vercel CI/CD pipeline
```

---

## 🔧 Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 👨‍💻 Author

**Ankit Sengupta**
GitHub: [@ankit-sengupta05](https://github.com/ankit-sengupta05)

---

<div align="center">
  <p>Made with ❤️ for VIT-AP University</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
