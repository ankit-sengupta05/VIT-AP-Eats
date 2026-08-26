import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[proxy] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
      "Session refresh and route protection will not work until these are configured."
  );
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const role = user?.user_metadata?.role as string | undefined;

  // 1. Unauthenticated users trying to access protected routes
  const protectedRoutes = ["/checkout", "/orders", "/profile", "/admin", "/partner"];
  const isProtected = protectedRoutes.some(p => path.startsWith(p));
  
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // 2. Role-based routing
  if (user) {
    // If they go to /login or /signup while logged in, send them to their dashboard
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
  // Applied to every response; customise the CSP as your integrations evolve.
  const csp = [
    "default-src 'self'",
    // Scripts: self + Next.js inline scripts + Razorpay checkout
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
    // Styles: self + Google Fonts + Leaflet (inlined)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
    // Images: self + data URIs + Supabase Storage + Unsplash + OSM tiles + Leaflet CDN markers
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.tile.openstreetmap.org https://raw.githubusercontent.com https://cdnjs.cloudflare.com",
    // Fonts: self + Google Fonts + Leaflet CDN
    "font-src 'self' https://fonts.gstatic.com",
    // Connect: self + Supabase + our backend worker + Razorpay
    `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""} ${process.env.NEXT_PUBLIC_API_URL ?? ""} https://api.razorpay.com wss://*.supabase.co`,
    // Frames: Razorpay uses an iframe for 3DS/OTP
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    // Service worker must come from same origin
    "worker-src 'self' blob:",
    // Prevent framing of our pages by 3rd-parties
    "frame-ancestors 'none'",
  ].join("; ");

  supabaseResponse.headers.set("Content-Security-Policy", csp);
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  supabaseResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  supabaseResponse.headers.set("X-DNS-Prefetch-Control", "on");

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
