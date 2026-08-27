import { NextResponse, type NextRequest } from "next/server";

/**
 * Route Protection via a lightweight Firebase-cookie check.
 *
 * Firebase Auth doesn't natively set cookies for server-side use,
 * so we rely on the client writing a "role" cookie after login.
 * (Set in useSession hook on auth state change.)
 *
 * For true server-enforced auth, use firebase-admin + a session cookie
 * minted via /api/sessionLogin. This version is suitable for a
 * client-rendered Next.js app deployed on Vercel.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const path = request.nextUrl.pathname;
  const role   = request.cookies.get("app_role")?.value;
  const uid    = request.cookies.get("app_uid")?.value;

  // 1. Unauthenticated → redirect to login for protected routes
  const protectedRoutes = ["/checkout", "/orders", "/profile", "/admin", "/partner"];
  const isProtected = protectedRoutes.some((p) => path.startsWith(p));

  if (!uid && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // 2. Role-based routing
  if (uid) {
    if (path.startsWith("/login") || path.startsWith("/signup")) {
      const target = role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/";
      return NextResponse.redirect(new URL(target, request.url));
    }
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/partner") && role !== "partner") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── Security Headers ──────────────────────────────────────────────────────
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
    // Firebase Storage + Unsplash + OSM tiles
    "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://images.unsplash.com https://*.tile.openstreetmap.org https://raw.githubusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Firebase Auth + Firestore + Analytics
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com https://api.razorpay.com",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
