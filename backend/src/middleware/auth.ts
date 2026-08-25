import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { makeSupabase } from "../lib/supabase";
import type { Env } from "../types/env";

// Attach the authenticated user to Hono context — protects any route that uses this middleware.
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: { userId: string; role: string };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new HTTPException(401, { message: "Missing token" });

  const token = authHeader.slice(7);
  const supabase = makeSupabase(c.env);

  // Verify JWT via Supabase auth.getUser — no extra secret needed
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new HTTPException(401, { message: "Invalid or expired token" });

  // Pull role from user_metadata (set during profile creation)
  c.set("userId", user.id);
  c.set("role", (user.user_metadata?.role as string) ?? "customer");
  await next();
});

// Role guard — usage: .use(requireRole("admin"))
export const requireRole = (...roles: string[]) =>
  createMiddleware<{ Variables: { role: string } }>(async (c, next) => {
    if (!roles.includes(c.get("role"))) throw new HTTPException(403, { message: "Forbidden" });
    await next();
  });
