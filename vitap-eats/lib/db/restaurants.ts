import {
  collection, getDocs, getDoc, doc, query, where, orderBy, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  deliveryFee: number;
  imageUrl: string;
  isOpen: boolean;
  isVeg: boolean;
  partnerId: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isVeg: boolean;
}

export async function getRestaurants(cuisine?: string): Promise<Restaurant[]> {
  const col = collection(db, "restaurants");
  const q = cuisine
    ? query(col, where("cuisine", "==", cuisine), where("isOpen", "==", true))
    : query(col, where("isOpen", "==", true), orderBy("rating", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Restaurant));
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const q = query(collection(db, "restaurants"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Restaurant;
}

export async function getMenu(restaurantId: string): Promise<MenuItem[]> {
  const q = query(
    collection(db, "menu_items"),
    where("restaurantId", "==", restaurantId),
    where("isAvailable", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
}
