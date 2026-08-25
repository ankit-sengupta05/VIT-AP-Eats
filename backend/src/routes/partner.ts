import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeSupabase } from "../lib/supabase";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types/env";

export const partnerRouter = new Hono<{ Bindings: Env; Variables: { userId: string; role: string } }>();

// All partner routes require auth
partnerRouter.use("*", authMiddleware);

// ─── PATCH /api/partner/status — toggle online/offline ───────────────────────
partnerRouter.patch(
  "/status",
  zValidator("json", z.object({ is_online: z.boolean() })),
  async (c) => {
    const { is_online } = c.req.valid("json");
    const userId = c.get("userId");
    const sb = makeSupabase(c.env);

    const { data, error } = await sb
      .from("profiles")
      .update({ is_online, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("id, is_online")
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data });
  }
);

// ─── POST /api/partner/location — broadcast GPS position ─────────────────────
// Called every ~5s while partner is online. Upserts into delivery_partner_locations.
partnerRouter.post(
  "/location",
  zValidator("json", z.object({
    lat: z.number(),
    lng: z.number(),
    heading: z.number().optional(),
    speed: z.number().optional(),
  })),
  async (c) => {
    const body = c.req.valid("json");
    const userId = c.get("userId");
    const sb = makeSupabase(c.env);

    const { error } = await sb
      .from("delivery_partner_locations")
      .upsert({
        partner_id: userId,
        lat: body.lat,
        lng: body.lng,
        heading: body.heading ?? null,
        speed: body.speed ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "partner_id" });

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
  }
);

// ─── GET /api/partner/dashboard — stats + active order for dashboard ─────────
partnerRouter.get("/dashboard", async (c) => {
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  // 1. Profile (online status, today_earnings, total_deliveries, rating)
  const { data: profile } = await sb
    .from("profiles")
    .select("full_name, is_online, today_earnings, total_deliveries, rating, phone")
    .eq("id", userId)
    .single();

  // 2. Active order (any order assigned to this partner that is not terminal)
  const { data: activeOrder } = await sb
    .from("orders")
    .select(`
      id, status, partner_payout, delivery_address,
      restaurants(name, address, lat, lng),
      order_items(quantity, unit_price, menu_items(name))
    `)
    .eq("delivery_partner_id", userId)
    .not("status", "in", '("delivered","cancelled")')
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Count today's deliveries fresh from DB
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayDeliveries } = await sb
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("delivery_partner_id", userId)
    .eq("status", "delivered")
    .gte("delivered_at", today.toISOString());

  return c.json({
    data: {
      profile,
      active_order: activeOrder ?? null,
      today_deliveries: todayDeliveries ?? 0,
    }
  });
});

// ─── GET /api/partner/pending — check for an unaccepted order assigned to this partner ─
partnerRouter.get("/pending", async (c) => {
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data } = await sb
    .from("orders")
    .select(`
      id, status, partner_payout, delivery_address,
      restaurants(name, address, lat, lng),
      order_items(quantity, menu_items(name))
    `)
    .eq("delivery_partner_id", userId)
    .eq("status", "placed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return c.json({ data: data ?? null });
});

// ─── POST /api/partner/orders/:id/accept ────────────────────────────────────
partnerRouter.post("/orders/:id/accept", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("orders")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("delivery_partner_id", userId)
    .eq("status", "placed")
    .select("id, status")
    .single();

  if (error || !data) return c.json({ error: "Cannot accept this order" }, 400);
  return c.json({ data });
});

// ─── POST /api/partner/orders/:id/reject ────────────────────────────────────
// Removes the partner assignment — allows re-queueing for another partner
partnerRouter.post("/orders/:id/reject", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("orders")
    .update({ delivery_partner_id: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("delivery_partner_id", userId)
    .eq("status", "placed")
    .select("id")
    .single();

  if (error || !data) return c.json({ error: "Cannot reject this order" }, 400);
  return c.json({ ok: true });
});

// ─── POST /api/partner/orders/:id/advance ───────────────────────────────────
// Steps the order through: accepted→preparing→picked_up→on_the_way→delivered
const ADVANCE_MAP: Record<string, string> = {
  accepted:   "preparing",
  preparing:  "picked_up",
  picked_up:  "on_the_way",
  on_the_way: "delivered",
};

partnerRouter.post("/orders/:id/advance", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  // Get current status
  const { data: order } = await sb
    .from("orders")
    .select("status")
    .eq("id", id)
    .eq("delivery_partner_id", userId)
    .single();

  if (!order) return c.json({ error: "Order not found" }, 404);
  
  const nextStatus = ADVANCE_MAP[order.status];
  if (!nextStatus) return c.json({ error: `Order is already ${order.status}` }, 400);

  const updates: Record<string, any> = {
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  if (nextStatus === "picked_up")  updates.picked_up_at  = new Date().toISOString();
  if (nextStatus === "delivered") {
    updates.delivered_at = new Date().toISOString();
    // Increment partner's today_earnings and total_deliveries
    await sb.rpc("increment_partner_stats", { p_partner_id: userId });
  }

  const { data, error } = await sb
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) return c.json({ error: "Advance failed" }, 500);
  return c.json({ data });
});

// ─── GET /api/partner/earnings ───────────────────────────────────────────────
partnerRouter.get("/earnings", async (c) => {
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("orders")
    .select("id, partner_payout, delivered_at, restaurants(name)")
    .eq("delivery_partner_id", userId)
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false })
    .limit(50);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});
