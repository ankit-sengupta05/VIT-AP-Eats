import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import type { Env } from "./types/env";
import { restaurantsRouter } from "./routes/restaurants";
import { ordersRouter } from "./routes/orders";
import { profilesRouter } from "./routes/profiles";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ──────────────────────────────────────────────────────
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

// ── Global error handler ───────────────────────────────────────────────────
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error("[Worker Error]", err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
