import { Hono } from "hono";
import { makeSupabase } from "../lib/supabase";
import type { Env } from "../types/env";

export const favoritesRouter = new Hono<{ Bindings: Env }>();

// GET /api/favorites — list favorite restaurants for the logged-in user
favoritesRouter.get("/", async (c) => {
  const sb = makeSupabase(c.env);
  
  // RLS will automatically filter by the logged-in user (from the Authorization header)
  const { data, error } = await sb
    .from("favorites")
    .select("id, restaurant_id, restaurants(slug, name, cuisine, rating, delivery_time_min, delivery_fee, min_order, image_url, is_open)")
    .order("created_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  
  // Flatten the response so it looks like an array of restaurants
  const formatted = data.map((fav: any) => ({
    favorite_id: fav.id,
    ...fav.restaurants
  }));
  
  return c.json({ data: formatted });
});

// POST /api/favorites — add a restaurant to favorites
favoritesRouter.post("/", async (c) => {
  const { restaurant_id } = await c.req.json();
  if (!restaurant_id) return c.json({ error: "restaurant_id is required" }, 400);

  const sb = makeSupabase(c.env);
  
  // Get the user ID from the session to explicitly insert it
  const { data: { user }, error: userError } = await sb.auth.getUser();
  if (userError || !user) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await sb
    .from("favorites")
    .insert({ user_id: user.id, restaurant_id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return c.json({ data: { message: "Already favorited" } }, 200); // Unique violation
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// DELETE /api/favorites/:restaurant_id — remove a favorite
favoritesRouter.delete("/:restaurant_id", async (c) => {
  const { restaurant_id } = c.req.param();
  const sb = makeSupabase(c.env);
  
  const { data: { user }, error: userError } = await sb.auth.getUser();
  if (userError || !user) return c.json({ error: "Unauthorized" }, 401);

  const { error } = await sb
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurant_id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});
