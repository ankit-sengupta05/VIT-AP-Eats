import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeSupabase } from "../lib/supabase";
import { authMiddleware, requireRole } from "../middleware/auth";
import type { Env } from "../types/env";

export const adminRouter = new Hono<{ Bindings: Env; Variables: { userId: string; role: string } }>();

adminRouter.use("*", authMiddleware, requireRole("admin"));

// ── Helper: write audit log ──────────────────────────────────────────────────
async function auditLog(
  sb: ReturnType<typeof makeSupabase>,
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  await sb.from("audit_logs").insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata: metadata ?? null,
  });
}

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
// Returns stats + recent orders + active partners
adminRouter.get("/dashboard", async (c) => {
  const sb = makeSupabase(c.env);

  // 1. Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayOrders } = await sb
    .from("orders")
    .select("total, status")
    .gte("created_at", today.toISOString());

  const orders = todayOrders ?? [];
  const revenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + (o.total ?? 0), 0);
  const totalOrders = orders.length;
  const cancelled = orders.filter(o => o.status === "cancelled").length;

  // 2. Active online partners
  const { count: activePartners } = await sb
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "partner")
    .eq("is_online", true);

  // 3. Live orders (last 50, non-terminal, sorted by newest)
  const { data: liveOrders } = await sb
    .from("orders")
    .select(`
      id, status, total, created_at, payment_method,
      profiles!customer_id(full_name),
      restaurants(name),
      order_items(quantity, menu_items(name))
    `)
    .not("status", "in", '("delivered","cancelled")')
    .order("created_at", { ascending: false })
    .limit(50);

  // 4. Partner list with online status + location
  const { data: partners } = await sb
    .from("profiles")
    .select("id, full_name, rating, is_online, today_earnings, total_deliveries, delivery_partner_locations(lat, lng, updated_at)")
    .eq("role", "partner")
    .order("is_online", { ascending: false });

  return c.json({
    data: {
      stats: { revenue, total_orders: totalOrders, cancelled, active_partners: activePartners ?? 0 },
      live_orders: liveOrders ?? [],
      partners: partners ?? [],
    }
  });
});

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
adminRouter.get("/orders", async (c) => {
  const { status, limit = "50", offset = "0" } = c.req.query();
  const sb = makeSupabase(c.env);

  let query = sb
    .from("orders")
    .select(`
      id, status, total, created_at, payment_method, coupon_code,
      profiles!customer_id(full_name, phone),
      restaurants(name),
      order_items(quantity, unit_price, menu_items(name)),
      partner:delivery_partner_id(full_name, phone)
    `)
    .order("created_at", { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, count });
});

// ─── PATCH /api/admin/orders/:id/status ──────────────────────────────────────
adminRouter.patch(
  "/orders/:id/status",
  zValidator("json", z.object({
    status: z.enum(["accepted", "preparing", "ready", "picked_up", "on_the_way", "delivered", "cancelled"]),
    reason: z.string().optional(),
  })),
  async (c) => {
    const { id } = c.req.param();
    const { status, reason } = c.req.valid("json");
    const userId = c.get("userId");
    const sb = makeSupabase(c.env);

    const { data, error } = await sb
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error || !data) return c.json({ error: "Update failed" }, 500);

    await auditLog(sb, userId, "order.status_override", "order", id, { new_status: status, reason });

    return c.json({ data });
  }
);

// ─── GET /api/admin/menu/:restaurantId ───────────────────────────────────────
adminRouter.get("/menu/:restaurantId", async (c) => {
  const { restaurantId } = c.req.param();
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("menu_items")
    .select("id, name, description, price, category, is_available, is_veg, image_url")
    .eq("restaurant_id", restaurantId)
    .order("category")
    .order("name");

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

// ─── POST /api/admin/menu/:restaurantId ──────────────────────────────────────
adminRouter.post(
  "/menu/:restaurantId",
  zValidator("json", z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    category: z.string().min(1),
    is_veg: z.boolean().default(false),
    image_url: z.string().url().optional(),
  })),
  async (c) => {
    const { restaurantId } = c.req.param();
    const body = c.req.valid("json");
    const userId = c.get("userId");
    const sb = makeSupabase(c.env);

    const { data, error } = await sb
      .from("menu_items")
      .insert({ ...body, restaurant_id: restaurantId })
      .select()
      .single();

    if (error || !data) return c.json({ error: error?.message ?? "Insert failed" }, 500);
    await auditLog(sb, userId, "menu.create", "menu_item", data.id, { name: body.name });
    return c.json({ data }, 201);
  }
);

// ─── PATCH /api/admin/menu/items/:itemId ─────────────────────────────────────
adminRouter.patch(
  "/menu/items/:itemId",
  zValidator("json", z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    category: z.string().optional(),
    is_veg: z.boolean().optional(),
    is_available: z.boolean().optional(),
    image_url: z.string().url().nullable().optional(),
  })),
  async (c) => {
    const { itemId } = c.req.param();
    const body = c.req.valid("json");
    const userId = c.get("userId");
    const sb = makeSupabase(c.env);

    const { data, error } = await sb
      .from("menu_items")
      .update(body)
      .eq("id", itemId)
      .select()
      .single();

    if (error || !data) return c.json({ error: "Update failed" }, 500);
    await auditLog(sb, userId, "menu.update", "menu_item", itemId, body as Record<string, unknown>);
    return c.json({ data });
  }
);

// ─── DELETE /api/admin/menu/items/:itemId ────────────────────────────────────
adminRouter.delete("/menu/items/:itemId", async (c) => {
  const { itemId } = c.req.param();
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { error } = await sb.from("menu_items").delete().eq("id", itemId);
  if (error) return c.json({ error: "Delete failed" }, 500);
  await auditLog(sb, userId, "menu.delete", "menu_item", itemId);
  return c.json({ ok: true });
});

// ─── GET /api/admin/insights ──────────────────────────────────────────────────
adminRouter.get("/insights", async (c) => {
  const sb = makeSupabase(c.env);

  const { data: dailyStats } = await sb
    .from("admin_daily_stats")
    .select("*")
    .limit(30);

  // Top dishes
  const { data: topDishes } = await sb
    .from("order_items")
    .select("menu_item_id, quantity, menu_items(name, restaurant_id, restaurants(name))")
    .limit(500);

  // Aggregate top dishes client-side (simpler than a complex SQL GROUP BY via PostgREST)
  const dishMap: Record<string, { name: string; restaurant: string; count: number }> = {};
  for (const item of topDishes ?? []) {
    const id = item.menu_item_id;
    const name = (item.menu_items as any)?.name ?? "Unknown";
    const restaurant = (item.menu_items as any)?.restaurants?.name ?? "";
    if (!dishMap[id]) dishMap[id] = { name, restaurant, count: 0 };
    dishMap[id].count += item.quantity;
  }
  const topDishList = Object.entries(dishMap)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return c.json({ data: { daily_stats: dailyStats ?? [], top_dishes: topDishList } });
});

// ─── GET /api/admin/restaurants ──────────────────────────────────────────────
adminRouter.get("/restaurants", async (c) => {
  const sb = makeSupabase(c.env);
  const { data, error } = await sb
    .from("restaurants")
    .select("id, name, address, cuisine_type, rating, is_open")
    .order("name");
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});
