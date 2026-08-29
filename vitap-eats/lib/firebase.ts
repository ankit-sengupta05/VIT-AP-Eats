import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard: during CI/CD static build, env vars may not be present.
// Firebase is only needed client-side at runtime, not during pre-rendering.
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.projectId
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isConfigured) {
  // Prevent re-initialising on hot-reload in development
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as Record<string, string>);
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);
} else {
  // Safe no-op stubs so the app can still render on local/dev machines
  // without Firebase env vars while preserving the auth runtime hooks.
  app     = {} as FirebaseApp;
  auth    = {
    currentUser: null,
    onAuthStateChanged: () => () => undefined,
    signOut: async () => undefined,
  } as unknown as Auth;
  db      = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };
