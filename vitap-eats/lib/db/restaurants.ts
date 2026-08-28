import {
  collection, getDocs, doc, query, where, orderBy, limit,
  addDoc, updateDoc, deleteDoc
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
  // Fetch all restaurants (no isOpen filter to avoid composite index requirement)
  // Filter by cuisine if specified, sort by rating
  const q = cuisine
    ? query(col, where("cuisine", "==", cuisine))
    : query(col, orderBy("rating", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Restaurant));
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const col = collection(db, "restaurants");
  const q = query(col, orderBy("name", "asc"));
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

export async function addRestaurant(data: Omit<Restaurant, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "restaurants"), data);
  return ref.id;
}

export async function updateRestaurant(id: string, data: Partial<Omit<Restaurant, "id">>): Promise<void> {
  await updateDoc(doc(db, "restaurants", id), data);
}

export async function deleteRestaurant(id: string): Promise<void> {
  await deleteDoc(doc(db, "restaurants", id));
}

