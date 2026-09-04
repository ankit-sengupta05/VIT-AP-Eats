import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

/**
 * POST /api/notify-admin
 *
 * Body: {
 *   orderId: string;
 *   customerName: string;
 *   restaurantName: string;
 *   total: number;
 *   secret: string;  // matches ADMIN_NOTIFY_SECRET env var
 * }
 *
 * Sends an FCM push notification to all registered admin devices stored in
 * the `admin_fcm_tokens` Firestore collection.
 */

let adminApp: App;

function getAdminApp(): App {
  if (!adminApp) {
    // Prefer individual env vars (simpler Vercel setup), fall back to JSON blob
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : {
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID   || "vitap-eats",
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
          privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        };

    adminApp = getApps().find((a) => a.name === "admin-notify")
      ?? initializeApp({ credential: cert(serviceAccount) }, "admin-notify");
  }
  return adminApp;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Simple shared-secret auth (add ADMIN_NOTIFY_SECRET to Vercel env vars)
    const secret = process.env.ADMIN_NOTIFY_SECRET;
    if (secret && body.secret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, customerName, restaurantName, total } = body as {
      orderId:        string;
      customerName:   string;
      restaurantName: string;
      total:          number;
    };

    const app = getAdminApp();
    const db  = getFirestore(app);
    const msg = getMessaging(app);

    // ── Fetch all admin FCM tokens from Firestore ────────────────────────
    const tokenSnap = await db.collection("admin_fcm_tokens").get();
    const tokens: string[] = [];
    tokenSnap.forEach((doc) => {
      const token = doc.data()?.token as string | undefined;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) {
      return NextResponse.json({ sent: 0, message: "No admin devices registered" });
    }

    // ── Send multicast FCM message ───────────────────────────────────────
    const message = {
      tokens,
      notification: {
        title: `🆕 New Order — ₹${total}`,
        body:  `${customerName} ordered from ${restaurantName}`,
      },
      data: {
        orderId,
        screen: "orders",
      },
      android: {
        priority: "high" as const,
        notification: {
          channelId:    "new_orders",
          color:        "#FF6B35",
          priority:     "max" as const,
          defaultSound: "true",
          vibrateTimingsMillis: ["0", "400", "200", "400"],
        },
      },
    };

    const response = await msg.sendEachForMulticast(message);
    const failed   = response.responses.filter((r) => !r.success);

    // Clean up stale tokens (tokens that returned NOT_REGISTERED)
    const staleTokenUpdates = failed
      .filter((r) => r.error?.code === "messaging/registration-token-not-registered")
      .map((_, i) => {
        const token = tokens[i];
        return db
          .collection("admin_fcm_tokens")
          .where("token", "==", token)
          .get()
          .then((snap) =>
            Promise.all(snap.docs.map((d) => d.ref.delete()))
          );
      });

    await Promise.allSettled(staleTokenUpdates);

    return NextResponse.json({
      sent:   response.successCount,
      failed: response.failureCount,
    });
  } catch (err) {
    console.error("[notify-admin] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}
