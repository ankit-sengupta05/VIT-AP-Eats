# VIT-AP Eats — Flutter Admin App 🍛

A native **Android** admin panel for the [VIT-AP Eats](https://vit-ap-eats.vercel.app/) platform, built in Flutter. Connects directly to the same Firebase project as the web app.

---

## ✨ Features

| Screen | Capabilities |
|---|---|
| **Login** | Firebase Email/Password, admin-role validation via custom claims |
| **Orders (Live)** | Real-time stream, filter by status, update order lifecycle, admin notes, WhatsApp customer link |
| **Menu Management** | Browse by restaurant, toggle availability, add/edit/delete items |
| **Restaurants** | Toggle open/closed, edit details, add/delete restaurants |
| **Users** | View all users with role badges, search by name/email |
| **Insights** | Revenue chart, order status pie, top dishes leaderboard |
| **Push Notifications** | FCM — instant alert with sound + vibration when a new order is placed |

---

## 🔧 Prerequisites

| Tool | Min Version | Install |
|---|---|---|
| Flutter SDK | 3.22+ | https://flutter.dev/docs/get-started/install |
| Android Studio | 2023.3+ | https://developer.android.com/studio |
| Java JDK | 17+ | bundled with Android Studio |
| Firebase CLI | latest | `npm install -g firebase-tools` |
| FlutterFire CLI | latest | `dart pub global activate flutterfire_cli` |

---

## 🚀 Setup Steps

### Step 1 — Get the code

```bash
cd "c:\SDE Projects\VIT-AP Eats\admin-app"
```

### Step 2 — Register the Android app in Firebase

1. Open [Firebase Console → vitap-eats project](https://console.firebase.google.com/project/vitap-eats)
2. Go to **Project Settings → Your Apps → Add App → Android**
3. Set package name: `com.vitapeats.admin`
4. Download **`google-services.json`** and place it at:
   ```
   admin-app/android/app/google-services.json
   ```

### Step 3 — Update `firebase_options.dart`

Replace the placeholder `appId` in [`lib/firebase_options.dart`](./lib/firebase_options.dart):

```dart
// android section — replace with the appId from Firebase Console
appId: '1:651682895108:android:YOUR_ACTUAL_APP_ID',
```

Or run FlutterFire CLI to regenerate automatically:
```bash
flutterfire configure --project=vitap-eats --out=lib/firebase_options.dart
```

### Step 4 — Install Flutter dependencies

```bash
flutter pub get
```

### Step 5 — Run on a connected device / emulator

```bash
# List connected devices
flutter devices

# Run in debug mode
flutter run

# Run on a specific device
flutter run -d <device-id>
```

---

## 🔔 FCM Push Notifications Setup

Push notifications work via a **Next.js API route** (`/api/notify-admin`) in the web app. Follow these steps to enable it:

### 1. Generate a Firebase Service Account key

1. Firebase Console → Project Settings → **Service Accounts** tab
2. Click **Generate new private key** → Download the JSON file
3. **Do NOT commit this file to Git**

### 2. Add environment variables to Vercel

In Vercel Dashboard → `vitap-eats` project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `FIREBASE_ADMIN_PROJECT_ID` | `vitap-eats` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | From the service account JSON (`client_email`) |
| `FIREBASE_ADMIN_PRIVATE_KEY` | From the service account JSON (`private_key`) — include the full key with `\n` newlines |
| `ADMIN_NOTIFY_SECRET` | Any random secret string, e.g. `my-secret-123` |
| `NEXT_PUBLIC_ADMIN_NOTIFY_SECRET` | Same value as above |

> **Alternative**: Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the entire service account JSON as a single-line string.

### 3. Install firebase-admin in the web app

```bash
cd "c:\SDE Projects\VIT-AP Eats\vitap-eats"
npm install
```

### 4. Deploy the web app

```bash
# Auto-deploys on push to main, or manually:
vercel --prod
```

### 5. Verify notifications

1. Sign in to the Flutter admin app on your phone
2. The app saves your FCM device token to Firestore (`admin_fcm_tokens` collection)
3. Place a test order on [vit-ap-eats.vercel.app](https://vit-ap-eats.vercel.app/)
4. You should receive a push notification within ~2 seconds

---

## 📦 Build Release APK

```bash
# Clean build
flutter clean && flutter pub get

# Build release APK (unsigned — for sideloading)
flutter build apk --release

# Output location:
# admin-app/build/app/outputs/flutter-apk/app-release.apk
```

### Install directly on your phone (sideload)

```bash
# With phone connected via USB (USB debugging enabled):
adb install build/app/outputs/flutter-apk/app-release.apk
```

### Firebase App Distribution (recommended for testing)

```bash
# Install the Firebase App Distribution CLI plugin
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk \
  --app 1:651682895108:android:YOUR_APP_ID \
  --groups "admins"
```

---

## 📁 Project Structure

```
admin-app/
├── lib/
│   ├── main.dart                       # App entry + Firebase init + auth gate
│   ├── firebase_options.dart           # Firebase config (⚠ add Android appId)
│   ├── theme.dart                      # Dark theme, color tokens
│   │
│   ├── models/
│   │   ├── order.dart                  # Order + OrderItem + OrderStatus
│   │   ├── restaurant.dart             # Restaurant data model
│   │   ├── menu_item.dart              # MenuItem + variants
│   │   └── app_user.dart               # AppUser model
│   │
│   ├── services/
│   │   ├── auth_service.dart           # Firebase Auth + admin claim check
│   │   ├── orders_service.dart         # Firestore orders CRUD + streams
│   │   ├── restaurants_service.dart    # Firestore restaurants CRUD
│   │   ├── menu_service.dart           # Firestore menu CRUD + streams
│   │   ├── users_service.dart          # Firestore users stream
│   │   └── notification_service.dart   # FCM setup + foreground notifications
│   │
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── dashboard_screen.dart       # 5-tab scaffold + pending badge
│   │   ├── orders/
│   │   │   ├── orders_screen.dart      # Tab-filtered live order list
│   │   │   └── order_detail_screen.dart # Status stepper + actions + note
│   │   ├── menu/
│   │   │   ├── menu_screen.dart        # Category-grouped menu list
│   │   │   └── menu_item_form.dart     # Add/edit form
│   │   ├── restaurants/
│   │   │   ├── restaurants_screen.dart
│   │   │   └── restaurant_form.dart
│   │   ├── users/
│   │   │   └── users_screen.dart
│   │   └── insights/
│   │       └── insights_screen.dart    # Pie + Bar charts + top dishes
│   │
│   └── widgets/
│       └── status_badge.dart           # Color-coded order status pill
│
├── android/
│   ├── app/
│   │   ├── build.gradle                # Firebase BoM, FCM, minSdk 21
│   │   ├── google-services.json        # ⚠ YOU MUST ADD THIS (not in repo)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml     # FCM permissions + channels
│   │       ├── kotlin/com/vitapeats/admin/MainActivity.kt
│   │       └── res/values/colors.xml   # Notification accent color
│   ├── build.gradle                    # Google Services classpath
│   └── gradle.properties
│
└── pubspec.yaml                        # All Flutter dependencies
```

---

## 🎨 Design

- **Dark theme** — `#0A0E1A` background, `#FF6B35` orange accent
- **Google Fonts** — Poppins throughout
- **Glassmorphism cards** with subtle border glow
- **Animated login** with `animate_do`
- **Live badge** on Orders tab for pending count
- **Color-coded status pills** for every order state

---

## 🔐 Admin Access

Only users with the Firebase custom claim `role: 'admin'` can sign in. Set this via the Firebase Admin SDK once:

```js
// Run in a Node.js script or Firebase Functions shell
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims('YOUR_ADMIN_UID', { role: 'admin' });
```

You can find your UID in Firebase Console → Authentication → Users.

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `google-services.json not found` | Download from Firebase Console and place in `android/app/` |
| `Access denied` on login | Ensure the account has `role: 'admin'` custom claim |
| No push notifications | Check FCM token is saved in `admin_fcm_tokens` Firestore collection |
| Build fails: `JAVA_HOME not set` | Open Android Studio → SDK Manager → ensure JDK 17 is installed |
| `minSdkVersion` error | This app requires Android 5.0+ (API 21+) |

---

Made with ❤️ for VIT-AP University
