import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { Env } from "../types/env";

/**
 * KV-based sliding-window rate limiter for Cloudflare Workers.
 *
 * Uses Cloudflare KV (RATE_LIMIT_KV binding) to store hit counts per key.
 * Falls back gracefully if the KV binding is not configured (dev only).
 *
 * @param limit  - max requests allowed in the window
 * @param windowSec - time window in seconds
 * @param keyFn  - function to derive the rate-limit key from the request
 */
export function rateLimiter(
  limit: number,
  windowSec: number,
  keyFn: (c: any) => string = (c) => c.req.header("CF-Connecting-IP") ?? "unknown"
) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const kv: KVNamespace | undefined = (c.env as any).RATE_LIMIT_KV;

    // If KV is not bound (e.g., local dev without wrangler KV), skip limiting.
    if (!kv) {
      await next();
      return;
    }

    const key = `rl:${keyFn(c)}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSec;

    // Get existing timestamps for this key
    const raw = await kv.get(key);
    let hits: number[] = raw ? JSON.parse(raw) : [];

    // Prune timestamps outside the window (sliding window)
    hits = hits.filter((t) => t > windowStart);

    if (hits.length >= limit) {
      throw new HTTPException(429, {
        message: `Too many requests. Please try again in ${windowSec} seconds.`,
      });
    }

    // Record this request
    hits.push(now);
    await kv.put(key, JSON.stringify(hits), { expirationTtl: windowSec + 10 });

    await next();
  });
}

/**
 * Pre-configured limiters for common cases.
 *   - auth:   10 attempts / 60s per IP
 *   - orders: 20 attempts / 60s per user
 */
export const authRateLimiter = rateLimiter(
  10,
  60,
  (c) => `auth:${c.req.header("CF-Connecting-IP") ?? "unknown"}`
);

export const orderRateLimiter = rateLimiter(
  20,
  60,
  (c) => `order:${c.get("userId") ?? c.req.header("CF-Connecting-IP") ?? "unknown"}`
);
