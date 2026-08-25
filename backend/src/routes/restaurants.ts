import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeSupabase } from "../lib/supabase";
import type { Env } from "../types/env";

export const restaurantsRouter = new Hono<{ Bindings: Env }>();

// GET /api/restaurants — list all open restaurants with optional cuisine filter
restaurantsRouter.get("/", async (c) => {
  const { cuisine, page = "1" } = c.req.query();
  const limit = 20;
  const offset = (parseInt(page) - 1) * limit;

  const sb = makeSupabase(c.env);
  let query = sb
    .from("restaurants")
    .select("id, slug, name, cuisine, rating, delivery_time_min, delivery_fee, min_order, image_url, is_open, discount_label")
    .eq("is_open", true)
    .range(offset, offset + limit - 1)
    .order("rating", { ascending: false });

  if (cuisine) query = query.contains("cuisine", [cuisine]);

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

// GET /api/restaurants/:slug — single restaurant with menu
restaurantsRouter.get("/:slug", async (c) => {
  const { slug } = c.req.param();
  const sb = makeSupabase(c.env);

  const [{ data: restaurant, error: rErr }, { data: menu, error: mErr }] = await Promise.all([
    sb.from("restaurants").select("*").eq("slug", slug).single(),
    sb.from("menu_items")
      .select("id, name, description, price, image_url, is_veg, is_popular, category")
      .eq("restaurant_slug", slug)
      .eq("is_available", true)
      .order("category"),
  ]);

  if (rErr || !restaurant) return c.json({ error: "Not found" }, 404);
  if (mErr) return c.json({ error: mErr.message }, 500);

  // Group menu items by category on the server — saves the client doing it
  const grouped = (menu ?? []).reduce<Record<string, typeof menu>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category]!.push(item);
    return acc;
  }, {});

  return c.json({ data: { ...restaurant, menu: grouped } });
});
