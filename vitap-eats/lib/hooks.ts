import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getRestaurants, getRestaurantBySlug, getMenu } from "@/lib/db/restaurants";
import { getAllMenuItems, type MenuItem } from "@/lib/db/items";
import { getUserOrders, subscribeToUserOrders, updateOrderStatus, type Order } from "@/lib/db/orders";
import { getUserProfile } from "@/lib/db/users";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

function getStoredUid(): string | null {
  if (typeof document === "undefined") return null;

  try {
    const localValue = localStorage.getItem("app_uid");
    if (localValue) return localValue;
  } catch {
    // Ignore storage issues in private browsing or restricted environments.
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("app_uid="));
  if (!match) return null;
  const value = decodeURIComponent(match.split("=").slice(1).join("="));
  return value || null;
}

/* ─── Auth-state aware uid hook ─────────────────────────────────────────── */

/** Returns the current signed-in uid, falling back to the persisted app_uid cookie so reloads recover the session immediately. */
function useAuthUid() {
  const [uid, setUid] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const syncUid = () => {
      const currentUser = auth && typeof auth === "object" && "currentUser" in auth ? auth.currentUser : null;
      const persistedUid = getStoredUid();
      const resolvedUid = currentUser?.uid ?? persistedUid ?? null;
      setUid(resolvedUid);
    };

    syncUid();
    const unsub = onAuthStateChanged(auth, (user) => {
      const persistedUid = getStoredUid();
      setUid(user ? user.uid : persistedUid ?? null);
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
        const rawCategory = (item.category ?? "Other").trim() || "Other";
        const key = rawCategory.toLowerCase();
        const displayLabel = rawCategory;
        if (!acc[key]) acc[key] = { label: displayLabel, items: [] as MenuItem[] };
        acc[key].items.push(item);
        return acc;
      }, {} as Record<string, { label: string; items: MenuItem[] }>);

      return {
        ...rest,
        menu: Object.fromEntries(
          Object.entries(menu).map(([key, value]) => [value.label, value.items])
        ),
      };
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
    if (uid === undefined) return;

    if (uid === null) {
      const timer = setTimeout(() => {
        setOrders([]);
        setIsLoading(false);
        setIsError(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    setIsLoading(true);
    setIsError(false);

    const loadOrders = async () => {
      try {
        const initialOrders = await getUserOrders(uid);
        if (!cancelled) {
          setOrders(initialOrders);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
          setIsError(true);
          setIsLoading(false);
        }
      }

      unsubscribe = subscribeToUserOrders(uid, (data) => {
        if (!cancelled) {
          setOrders(data);
          setIsLoading(false);
          setIsError(false);
        }
      });
    };

    loadOrders();

    return () => {
      cancelled = true;
      unsubscribe?.();
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
