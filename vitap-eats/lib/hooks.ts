import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/* ─── Restaurant Hooks ─────────────────────────────────────────────────── */

export function useRestaurants(cuisine?: string) {
  return useQuery({
    queryKey: ["restaurants", cuisine ?? "all"],
    queryFn: () => api.restaurants.list(cuisine),
    staleTime: 2 * 60 * 1000, // 2 min — restaurants don't change every second
  });
}

export function useRestaurant(slug: string) {
  return useQuery({
    queryKey: ["restaurant", slug],
    queryFn: () => api.restaurants.get(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

/* ─── Order Hooks ──────────────────────────────────────────────────────── */

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: api.orders.list,
    staleTime: 30_000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => api.orders.get(id),
    enabled: !!id,
    // Poll every 15 seconds while order is active (tracking page)
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const terminal = ["delivered", "cancelled"];
      return terminal.includes(status) ? false : 15_000;
    },
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.orders.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/* ─── Profile Hooks ────────────────────────────────────────────────────── */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry auth failures — user just isn't logged in
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: api.profile.addresses.list,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
