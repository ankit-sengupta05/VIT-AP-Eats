import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/* ─── Restaurant Hooks ─────────────────────────────────────────────────── */

export function useRestaurants(cuisine?: string, lat?: number, lng?: number) {
  return useQuery({
    queryKey: ["restaurants", cuisine ?? "all", lat, lng],
    queryFn: () => api.restaurants.list(cuisine, 1, lat, lng),
    staleTime: 2 * 60 * 1000, // 2 min
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

export function useCancelOrder(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.orders.cancel(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", orderId] });
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

/* ─── Favorites Hooks ──────────────────────────────────────────────────── */

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: api.favorites.list,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.favorites.add,
    onMutate: async (restaurantId) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ["favorites"] });
      const previous = qc.getQueryData(["favorites"]);
      // Add a dummy entry so the UI reacts instantly
      qc.setQueryData(["favorites"], (old: any) => [...(old || []), { id: "temp", restaurant_id: restaurantId }]);
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) qc.setQueryData(["favorites"], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.favorites.remove,
    onMutate: async (restaurantId) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ["favorites"] });
      const previous = qc.getQueryData(["favorites"]);
      qc.setQueryData(["favorites"], (old: any) => (old || []).filter((f: any) => f.restaurant_id !== restaurantId && f.id !== restaurantId));
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) qc.setQueryData(["favorites"], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
