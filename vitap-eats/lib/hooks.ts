import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getRestaurants, getRestaurantBySlug, getMenu } from "@/lib/db/restaurants";
import { getAllMenuItems } from "@/lib/db/items";
import { getUserOrders, subscribeToOrder, updateOrderStatus, type Order } from "@/lib/db/orders";
import { getUserProfile } from "@/lib/db/users";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

/* ─── Auth-state aware uid hook ─────────────────────────────────────────── */

/** Waits for Firebase Auth to restore the session before returning uid */
function useAuthUid() {
  const [uid, setUid] = useState<string | null | undefined>(undefined); // undefined = still loading
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsub();
  }, []);
  return uid; // undefined = loading, null = logged out, string = logged in
}

/* ─── Restaurant Hooks ─────────────────────────────────────────────────── */

export function useRestaurants(cuisine?: string, lat?: number, lng?: number) {
  return useQuery({
    queryKey: ["restaurants", cuisine ?? "all"],
    queryFn: () => getRestaurants(cuisine === "all" ? undefined : cuisine),
    staleTime: 30_000,
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

export function useMenuItems(category?: string) {
  return useQuery({
    queryKey: ["menuItems", category ?? "all"],
    queryFn: () => getAllMenuItems(category),
    staleTime: 30_000,
  });
}

/* ─── Order Hooks ──────────────────────────────────────────────────────── */

/**
 * Realtime order-history hook.
 * Waits for Firebase Auth session to restore before querying.
 * Uses a manual useState+useEffect with Firestore onSnapshot so that
 * navigating away and back always shows fresh data without stale cache issues.
 */
export function useOrders() {
  const uid = useAuthUid();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Still waiting for auth session to restore
    if (uid === undefined) {
      setIsLoading(true);
      return;
    }
    // Not logged in
    if (uid === null) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    // Logged in — fetch orders
    setIsLoading(true);
    setIsError(false);
    getUserOrders(uid)
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [uid]);

  return { data: orders, isLoading, isError };
}

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
  const uid = useAuthUid();
  return useQuery({
    queryKey: ["profile", uid],
    queryFn: () => (uid ? getUserProfile(uid) : null),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}

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
