import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeSupabase } from "../lib/supabase";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types/env";

export const paymentsRouter = new Hono<{ Bindings: Env; Variables: { userId: string; role: string } }>();

paymentsRouter.use("*", authMiddleware);

const DELIVERY_FEE = 30;
const PLATFORM_FEE = 5;

// ─── POST /api/payments/create-order ────────────────────────────────────────
// Creates a Razorpay order server-side and returns the order_id + key_id
paymentsRouter.post(
  "/create-order",
  zValidator("json", z.object({
    restaurant_id: z.string().uuid(),
    items: z.array(z.object({
      menu_item_id: z.string().uuid(),
      quantity: z.number().int().min(1),
    })).min(1),
    coupon_code: z.string().optional(),
  })),
  async (c) => {
    const body = c.req.valid("json");
    const sb = makeSupabase(c.env);

    // Server-side price computation (never trust client prices)
    const { data: menuItems, error: miErr } = await sb
      .from("menu_items")
      .select("id, price")
      .in("id", body.items.map(i => i.menu_item_id));

    if (miErr || !menuItems) return c.json({ error: "Could not verify item prices" }, 400);

    const priceMap = Object.fromEntries(menuItems.map(m => [m.id, m.price]));
    const subtotal = body.items.reduce(
      (sum, i) => sum + (priceMap[i.menu_item_id] ?? 0) * i.quantity, 0
    );

    // Apply coupon if provided
    let discount = 0;
    let coupon_id: string | null = null;
    if (body.coupon_code) {
      const { data: coupon } = await sb
        .from("coupons")
        .select("id, discount_type, discount_value, max_discount, min_order")
        .eq("code", body.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon && subtotal >= coupon.min_order) {
        coupon_id = coupon.id;
        if (coupon.discount_type === "flat") {
          discount = coupon.discount_value;
        } else {
          discount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
        }
        discount = Math.round(discount * 100) / 100;
      }
    }

    const total = Math.max(0, subtotal + DELIVERY_FEE + PLATFORM_FEE - discount);
    const amountInPaise = Math.round(total * 100); // Razorpay uses smallest currency unit

    // Create Razorpay order via their REST API
    const razorpayCredentials = btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${razorpayCredentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { restaurant_id: body.restaurant_id },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.json() as any;
      return c.json({ error: err?.error?.description ?? "Payment gateway error" }, 502);
    }

    const rzpOrder = await rzpRes.json() as any;

    return c.json({
      data: {
        razorpay_order_id: rzpOrder.id,
        amount: amountInPaise,
        currency: "INR",
        key_id: c.env.RAZORPAY_KEY_ID,  // public key — safe to return
        // Bill breakdown for display
        bill: { subtotal, delivery_fee: DELIVERY_FEE, platform_fee: PLATFORM_FEE, discount, total },
      }
    });
  }
);

// ─── POST /api/payments/verify ───────────────────────────────────────────────
// Verifies Razorpay signature then creates the order atomically
paymentsRouter.post(
  "/verify",
  zValidator("json", z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    // Order details needed for actual order creation
    restaurant_id: z.string().uuid(),
    items: z.array(z.object({
      menu_item_id: z.string().uuid(),
      quantity: z.number().int().min(1),
    })).min(1),
    delivery_address: z.object({
      label: z.string(),
      line1: z.string(),
      lat: z.number(),
      lng: z.number(),
    }),
    coupon_code: z.string().optional(),
    payment_method: z.enum(["upi", "card", "cod"]),
  })),
  async (c) => {
    const body = c.req.valid("json");
    const userId = c.get("userId");
    const sb = makeSupabase(c.env);

    // 1. Verify HMAC-SHA256 signature (prevents tampering)
    const signatureBody = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(c.env.RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureBody));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedSignature !== body.razorpay_signature) {
      return c.json({ error: "Payment verification failed. Signature mismatch." }, 400);
    }

    // 2. Re-compute prices server-side (never trust client)
    const { data: menuItems } = await sb
      .from("menu_items")
      .select("id, price")
      .in("id", body.items.map(i => i.menu_item_id));

    const priceMap = Object.fromEntries((menuItems ?? []).map(m => [m.id, m.price]));
    const subtotal = body.items.reduce(
      (sum, i) => sum + (priceMap[i.menu_item_id] ?? 0) * i.quantity, 0
    );

    let discount = 0;
    if (body.coupon_code) {
      const { data: coupon } = await sb
        .from("coupons")
        .select("id, discount_type, discount_value, max_discount, min_order")
        .eq("code", body.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon && subtotal >= coupon.min_order) {
        if (coupon.discount_type === "flat") {
          discount = coupon.discount_value;
        } else {
          discount = Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount ?? Infinity);
        }
      }
    }

    const total = Math.max(0, subtotal + DELIVERY_FEE + PLATFORM_FEE - discount);

    // 3. Create order
    const { data: order, error: oErr } = await sb
      .from("orders")
      .insert({
        customer_id: userId,
        restaurant_id: body.restaurant_id,
        status: "placed",
        subtotal,
        discount,
        delivery_fee: DELIVERY_FEE,
        platform_fee: PLATFORM_FEE,
        total,
        delivery_address: body.delivery_address,
        payment_method: body.payment_method,
        coupon_code: body.coupon_code ?? null,
        razorpay_order_id: body.razorpay_order_id,
      })
      .select("id, status, total")
      .single();

    if (oErr || !order) return c.json({ error: oErr?.message ?? "Order creation failed" }, 500);

    // 4. Insert order items
    await sb.from("order_items").insert(
      body.items.map(i => ({
        order_id: order.id,
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        unit_price: priceMap[i.menu_item_id] ?? 0,
      }))
    );

    // 5. Record payment
    await sb.from("payments").insert({
      order_id: order.id,
      razorpay_order_id: body.razorpay_order_id,
      razorpay_payment_id: body.razorpay_payment_id,
      razorpay_signature: body.razorpay_signature,
      amount: Math.round(total * 100),
      status: "captured",
    });

    // 6. Record coupon use
    if (body.coupon_code) {
      const { data: coupon } = await sb
        .from("coupons").select("id").eq("code", body.coupon_code.toUpperCase()).maybeSingle();
      if (coupon) {
        await sb.from("coupon_uses").insert({
          coupon_id: coupon.id,
          user_id: userId,
          order_id: order.id,
        }).onConflict("coupon_id,user_id").ignoreDuplicates();
      }
    }

    return c.json({ data: order }, 201);
  }
);

// ─── POST /api/payments/calculate ───────────────────────────────────────────
// Returns bill breakdown without creating an order (used by checkout page)
paymentsRouter.post(
  "/calculate",
  zValidator("json", z.object({
    restaurant_id: z.string().uuid(),
    items: z.array(z.object({
      menu_item_id: z.string().uuid(),
      quantity: z.number().int().min(1),
    })).min(1),
    coupon_code: z.string().optional(),
  })),
  async (c) => {
    const body = c.req.valid("json");
    const sb = makeSupabase(c.env);

    const { data: menuItems } = await sb
      .from("menu_items")
      .select("id, price")
      .in("id", body.items.map(i => i.menu_item_id));

    const priceMap = Object.fromEntries((menuItems ?? []).map(m => [m.id, m.price]));
    const subtotal = body.items.reduce(
      (sum, i) => sum + (priceMap[i.menu_item_id] ?? 0) * i.quantity, 0
    );

    let discount = 0;
    let coupon_error: string | null = null;
    if (body.coupon_code) {
      const { data: coupon } = await sb
        .from("coupons")
        .select("discount_type, discount_value, max_discount, min_order")
        .eq("code", body.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (!coupon) {
        coupon_error = "Invalid coupon code.";
      } else if (subtotal < coupon.min_order) {
        coupon_error = `Minimum order ₹${coupon.min_order} required.`;
      } else {
        if (coupon.discount_type === "flat") {
          discount = coupon.discount_value;
        } else {
          discount = Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount ?? Infinity);
        }
      }
    }

    const total = Math.max(0, subtotal + DELIVERY_FEE + PLATFORM_FEE - discount);

    return c.json({
      data: { subtotal, delivery_fee: DELIVERY_FEE, platform_fee: PLATFORM_FEE, discount, total, coupon_error }
    });
  }
);
