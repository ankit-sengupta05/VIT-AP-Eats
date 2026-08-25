import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types/env";

// Creates a per-request Supabase client using the service role key.
// The service role key bypasses RLS — only use in Worker, never expose to client.
export const makeSupabase = (env: Env) =>
  createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
