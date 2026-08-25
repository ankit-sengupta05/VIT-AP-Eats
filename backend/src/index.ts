import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import { sentry } from "@hono/sentry";
import type { Env } from "./types/env";
import { restaurantsRouter } from "./routes/restaurants";
import { ordersRouter } from "./routes/orders";
import { profilesRouter } from "./routes/profiles";
import { favoritesRouter } from "./routes/favorites";
import { couponsRouter } from "./routes/coupons";
import { paymentsRouter } from "./routes/payments";
import { partnerRouter } from "./routes/partner";
import { adminRouter } from "./routes/admin";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ──────────────────────────────────────────────────────
app.use("*", sentry());
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://vitap-eats.pages.dev",  // production CF Pages URL
  ],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (c) =>
  c.json({ status: "ok", env: c.env.ENVIRONMENT, ts: new Date().toISOString() })
);

// ── Route groups ───────────────────────────────────────────────────────────
app.route("/api/restaurants", restaurantsRouter);
app.route("/api/orders",      ordersRouter);
app.route("/api/profile",     profilesRouter);
app.route("/api/favorites",   favoritesRouter);
app.route("/api/coupons",     couponsRouter);
app.route("/api/payments",    paymentsRouter);
app.route("/api/partner",     partnerRouter);
app.route("/api/admin",       adminRouter);

// ── Global error handler ───────────────────────────────────────────────────
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  
  console.error("[Worker Error]", err);
  const sentry = c.get("sentry");
  if (sentry) sentry.captureException(err);
  
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
