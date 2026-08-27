import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRestaurants, getRestaurantBySlug, getMenu } from "@/lib/db/restaurants";
import { getUserOrders, updateOrderStatus } from "@/lib/db/orders";
import { getUserProfile } from "@/lib/db/users";
import { auth } from "@/lib/firebase";

/* ─── Restaurant Hooks ─────────────────────────────────────────────────── */

export function useRestaurants(cuisine?: string, lat?: number, lng?: number) {
  return useQuery({
    queryKey: ["restaurants", cuisine ?? "all"],
    queryFn: () => getRestaurants(cuisine === "all" ? undefined : cuisine),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useRestaurant(slug: string) {
  return useQuery({
    queryKey: ["restaurant", slug],
    queryFn: async () => {
      const rest = await getRestaurantBySlug(slug);
      if (!rest) return null;
      const menuItems = await getMenu(rest.id);
      const menu = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, any[]>);
      return { ...rest, menu };
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

/* ─── Order Hooks ──────────────────────────────────────────────────────── */

export function useOrders() {
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["orders", uid],
    queryFn: () => (uid ? getUserOrders(uid) : []),
    enabled: !!uid,
    staleTime: 30_000,
  });
}

// NOTE: useOrder (single order subscription) is best handled via useEffect with onSnapshot directly in the component, rather than useQuery polling. See order/[id]/page.tsx.

export function useCancelOrder(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => updateOrderStatus(orderId, "cancelled"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/* ─── Profile Hooks ────────────────────────────────────────────────────── */

export function useProfile() {
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["profile", uid],
    queryFn: () => (uid ? getUserProfile(uid) : null),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}

// Address and Favorites are mocked/removed for simplicity in Firebase migration, but can be added as subcollections later.
export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddFavorite() {
  return useMutation({ mutationFn: async (id: any) => {} });
}

export function useRemoveFavorite() {
  return useMutation({ mutationFn: async (id: any) => {} });
}
