// All keys from process.env — loaded from ../.env via dotenv-cli at runtime.
// NEVER hardcode values here. This file only reads from environment variables.

import { createClient } from "./supabase/client";

const BASE = process.env.NEXT_PUBLIC_API_URL;

if (!BASE && typeof window !== "undefined") {
  console.warn("[api] NEXT_PUBLIC_API_URL is not set — check your .env file");
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (typeof window !== "undefined") {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? `API error ${res.status}`);
  return json.data;
}

export const api = {
  restaurants: {
    list: (cuisine?: string, page = 1) => {
      const params = new URLSearchParams({ page: String(page) });
      if (cuisine && cuisine !== "all") params.set("cuisine", cuisine);
      return req<any[]>(`/api/restaurants?${params}`);
    },
    get: (slug: string) => req<any>(`/api/restaurants/${slug}`),
  },
  orders: {
    list: () => req<any[]>("/api/orders"),
    get: (id: string) => req<any>(`/api/orders/${id}`),
    create: (payload: unknown) =>
      req<{ id: string; status: string; total: number }>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateStatus: (id: string, status: string) =>
      req<any>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },
  profile: {
    get: () => req<any>("/api/profile"),
    update: (payload: unknown) =>
      req<any>("/api/profile", { method: "PATCH", body: JSON.stringify(payload) }),
    addresses: {
      list: () => req<any[]>("/api/profile/addresses"),
      add: (payload: unknown) =>
        req<any>("/api/profile/addresses", { method: "POST", body: JSON.stringify(payload) }),
    },
  },
};
