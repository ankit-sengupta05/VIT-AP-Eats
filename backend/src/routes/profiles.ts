import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeSupabase } from "../lib/supabase";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types/env";

export const profilesRouter = new Hono<{ Bindings: Env; Variables: { userId: string; role: string } }>();

profilesRouter.use("*", authMiddleware);

// GET /api/profile — get current user's profile
profilesRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("profiles")
    .select("id, full_name, phone, role, avatar_url, created_at")
    .eq("id", userId)
    .single();

  if (error || !data) return c.json({ error: "Profile not found" }, 404);
  return c.json({ data });
});

const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(60).optional(),
  phone: z.string().regex(/^\+91[0-9]{10}$/).optional(),
  avatar_url: z.string().url().optional(),
});

// PATCH /api/profile — update profile fields
profilesRouter.patch("/", zValidator("json", UpdateProfileSchema), async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("profiles")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id, full_name, phone, avatar_url")
    .single();

  if (error || !data) return c.json({ error: error?.message ?? "Update failed" }, 500);
  return c.json({ data });
});

// GET /api/profile/addresses — list saved delivery addresses
profilesRouter.get("/addresses", async (c) => {
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("addresses")
    .select("id, label, line1, line2, lat, lng, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

// POST /api/profile/addresses — add a new address
profilesRouter.post("/addresses", zValidator("json", z.object({
  label: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  is_default: z.boolean().optional(),
})), async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");
  const sb = makeSupabase(c.env);

  // Clear previous default if setting new default
  if (body.is_default) {
    await sb.from("addresses").update({ is_default: false }).eq("user_id", userId);
  }

  const { data, error } = await sb
    .from("addresses")
    .insert({ ...body, user_id: userId })
    .select("id, label, line1")
    .single();

  if (error || !data) return c.json({ error: error?.message ?? "Failed" }, 500);
  return c.json({ data }, 201);
});
