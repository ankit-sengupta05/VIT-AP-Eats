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
    list: (cuisine?: string, page = 1, lat?: number, lng?: number) => {
      const params = new URLSearchParams({ page: String(page) });
      if (cuisine && cuisine !== "all") params.set("cuisine", cuisine);
      if (lat !== undefined && lng !== undefined) {
        params.set("lat", String(lat));
        params.set("lng", String(lng));
      }
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
    cancel: (id: string) => req<any>(`/api/orders/${id}/cancel`, { method: "POST" }),
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
  favorites: {
    list: () => req<any[]>("/api/favorites"),
    add: (restaurant_id: string) => req<any>("/api/favorites", { method: "POST", body: JSON.stringify({ restaurant_id }) }),
    remove: (restaurant_id: string) => req<any>(`/api/favorites/${restaurant_id}`, { method: "DELETE" }),
  },
  coupons: {
    validate: (code: string, order_subtotal: number) =>
      req<{ coupon_id: string; code: string; description: string; discount_amount: number }>(
        "/api/coupons/validate",
        { method: "POST", body: JSON.stringify({ code, order_subtotal }) }
      ),
  },
  payments: {
    calculate: (payload: { restaurant_id: string; items: { menu_item_id: string; quantity: number }[]; coupon_code?: string }) =>
      req<{ subtotal: number; delivery_fee: number; platform_fee: number; discount: number; total: number; coupon_error: string | null }>(
        "/api/payments/calculate",
        { method: "POST", body: JSON.stringify(payload) }
      ),
    createOrder: (payload: { restaurant_id: string; items: { menu_item_id: string; quantity: number }[]; coupon_code?: string }) =>
      req<{ razorpay_order_id: string; amount: number; currency: string; key_id: string; bill: any }>(
        "/api/payments/create-order",
        { method: "POST", body: JSON.stringify(payload) }
      ),
    verify: (payload: any) =>
      req<{ id: string; status: string; total: number }>(
        "/api/payments/verify",
        { method: "POST", body: JSON.stringify(payload) }
      ),
  },
  partner: {
    dashboard: () => req<any>("/api/partner/dashboard"),
    setStatus: (is_online: boolean) =>
      req<any>("/api/partner/status", { method: "PATCH", body: JSON.stringify({ is_online }) }),
    broadcastLocation: (payload: { lat: number; lng: number; heading?: number; speed?: number }) =>
      req<any>("/api/partner/location", { method: "POST", body: JSON.stringify(payload) }),
    getPending: () => req<any>("/api/partner/pending"),
    acceptOrder: (id: string) =>
      req<any>(`/api/partner/orders/${id}/accept`, { method: "POST" }),
    rejectOrder: (id: string) =>
      req<any>(`/api/partner/orders/${id}/reject`, { method: "POST" }),
    advanceOrder: (id: string) =>
      req<any>(`/api/partner/orders/${id}/advance`, { method: "POST" }),
    earnings: () => req<any[]>("/api/partner/earnings"),
  },
}
