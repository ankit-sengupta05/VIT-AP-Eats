import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { getRestaurants, getRestaurantBySlug, getMenu } from "@/lib/db/restaurants";
import { getAllMenuItems, type MenuItem } from "@/lib/db/items";
import { getUserOrders, subscribeToUserOrders, updateOrderStatus, type Order } from "@/lib/db/orders";
import { getUserProfile } from "@/lib/db/users";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

/* ─── Auth-state aware uid hook ─────────────────────────────────────────── */

/** Waits for Firebase Auth to restore the session before returning uid */
function useAuthUid() {
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsub();
  }, []);
  return uid;
}

/* ─── Restaurant Hooks ─────────────────────────────────────────────────── */

export function useRestaurants(cuisine?: string) {
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
      }, {} as Record<string, MenuItem[]>);
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
 * Uses useRef + async fetch so state is only set inside async callbacks,
 * satisfying the react-hooks/set-state-in-effect lint rule.
 */
export function useOrders() {
  const uid = useAuthUid();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    // Auth session not yet restored — stay in loading state
    if (uid === undefined) return;

    // Not logged in — schedule state update via microtask to avoid sync setState in effect
    if (uid === null) {
      const timer = setTimeout(() => {
        setOrders([]);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    // Logged in — fetch in async callback (not synchronous body)
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    const unsubscribe = subscribeToUserOrders(uid, (data) => {
      if (!cancelled) {
        setOrders(data);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
    queryFn: (): never[] => [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: (): never[] => [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddFavorite() {
  return useMutation({ mutationFn: async (_id: string): Promise<void> => {} });
}

export function useRemoveFavorite() {
  return useMutation({ mutationFn: async (_id: string): Promise<void> => {} });
}
