import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeSupabase } from "../lib/supabase";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types/env";

export const ordersRouter = new Hono<{ Bindings: Env; Variables: { userId: string; role: string } }>();

// All order routes require auth
ordersRouter.use("*", authMiddleware);

const PlaceOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().positive(),
  })).min(1),
  delivery_address: z.object({
    label: z.string(),
    line1: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  payment_method: z.enum(["upi", "card", "cod"]),
  coupon_code: z.string().optional(),
});

// POST /api/orders — place a new order
ordersRouter.post("/", zValidator("json", PlaceOrderSchema), async (c) => {
  const body = c.req.valid("json");
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  // Calculate subtotal from items (server-authoritative pricing)
  const itemIds = body.items.map((i) => i.menu_item_id);
  const { data: menuItems, error: miErr } = await sb
    .from("menu_items")
    .select("id, price")
    .in("id", itemIds);

  if (miErr || !menuItems) return c.json({ error: "Could not verify item prices" }, 400);

  const priceMap = Object.fromEntries(menuItems.map((m) => [m.id, m.price]));
  const subtotal = body.items.reduce((sum, i) => sum + (priceMap[i.menu_item_id] ?? 0) * i.quantity, 0);

  // Insert order
  const { data: order, error: oErr } = await sb
    .from("orders")
    .insert({
      customer_id: userId,
      restaurant_id: body.restaurant_id,
      status: "placed",
      subtotal,
      delivery_fee: 30,
      platform_fee: 5,
      total: subtotal + 30 + 5,
      delivery_address: body.delivery_address,
      payment_method: body.payment_method,
    })
    .select("id, status, total")
    .single();

  if (oErr || !order) return c.json({ error: oErr?.message ?? "Order failed" }, 500);

  // Insert order items
  const orderItems = body.items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menu_item_id,
    quantity: i.quantity,
    unit_price: priceMap[i.menu_item_id] ?? i.unit_price,
  }));

  await sb.from("order_items").insert(orderItems);

  return c.json({ data: order }, 201);
});

// GET /api/orders — list current user's orders
ordersRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("orders")
    .select("id, status, total, created_at, restaurants(name, image_url)")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

// GET /api/orders/:id — single order with tracking info
ordersRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("orders")
    .select(`
      id, status, total, subtotal, delivery_fee, platform_fee,
      created_at, delivery_address, payment_method,
      restaurants(name, address),
      order_items(quantity, unit_price, menu_items(name)),
      partner:delivery_partner_id(id, full_name, phone, rating)
    `)
    .eq("id", id)
    .eq("customer_id", userId)
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);
  return c.json({ data });
});

// PATCH /api/orders/:id/status — update order status (restaurant/admin/partner)
ordersRouter.patch("/:id/status", zValidator("json", z.object({
  status: z.enum(["accepted", "preparing", "ready", "picked_up", "on_the_way", "delivered", "cancelled"]),
})), async (c) => {
  const { id } = c.req.param();
  const { status } = c.req.valid("json");
  const sb = makeSupabase(c.env);

  const { data, error } = await sb
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) return c.json({ error: "Update failed" }, 500);
  return c.json({ data });
});
