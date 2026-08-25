import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeSupabase } from "../lib/supabase";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types/env";

export const couponsRouter = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// POST /api/coupons/validate — validate a coupon and return the discount
couponsRouter.post(
  "/validate",
  authMiddleware,
  zValidator("json", z.object({ code: z.string(), order_subtotal: z.number().positive() })),
  async (c) => {
    const { code, order_subtotal } = c.req.valid("json");
    const userId = c.get("userId");
    const sb = makeSupabase(c.env);

    // 1. Find the coupon
    const { data: coupon, error } = await sb
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return c.json({ error: "Invalid or expired coupon code." }, 404);
    }

    // 2. Check validity window
    const now = new Date();
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return c.json({ error: "This coupon has expired." }, 400);
    }

    // 3. Check minimum order
    if (order_subtotal < coupon.min_order) {
      return c.json({ error: `Minimum order ₹${coupon.min_order} required for this coupon.` }, 400);
    }

    // 4. Check if already used by this user
    const { data: existingUse } = await sb
      .from("coupon_uses")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingUse) {
      return c.json({ error: "You have already used this coupon." }, 400);
    }

    // 5. Check global usage limit
    if (coupon.usage_limit !== null) {
      const { count } = await sb
        .from("coupon_uses")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id);

      if ((count ?? 0) >= coupon.usage_limit) {
        return c.json({ error: "This coupon has reached its usage limit." }, 400);
      }
    }

    // 6. Calculate discount
    let discount_amount = 0;
    if (coupon.discount_type === "flat") {
      discount_amount = coupon.discount_value;
    } else {
      // pct
      discount_amount = (order_subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount) {
        discount_amount = Math.min(discount_amount, coupon.max_discount);
      }
    }
    discount_amount = Math.round(discount_amount * 100) / 100;

    return c.json({
      data: {
        coupon_id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_amount,
      }
    });
  }
);
