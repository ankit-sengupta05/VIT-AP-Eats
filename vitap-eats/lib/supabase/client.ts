import { createBrowserClient } from "@supabase/ssr";

// Read once at module load. Using `??` fallbacks instead of `!` non-null
// assertions means this file can be imported (and even executed) during
// `next build`'s static prerendering pass without crashing the entire
// build if the env vars haven't been configured on the deploy platform yet.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only warn in the browser — during build/prerender this would just be
// noise, and it's not actionable there anyway.
if ((!supabaseUrl || !supabaseAnonKey) && typeof window !== "undefined") {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
      "Auth and data calls will fail until these are configured — see ENV_SETUP.md."
  );
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}
