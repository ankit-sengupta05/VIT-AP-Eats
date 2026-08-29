import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  query, where, getDocs, onSnapshot, type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface MenuItemVariant {
  label: string; // e.g. "Regular", "Medium", "Half Plate", "Full Plate"
  price: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number; // base/default price (used when no variants)
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isVeg: boolean;
  variants?: MenuItemVariant[]; // optional size/portion variants
}

/** Strips keys whose value is `undefined` — Firestore rejects them outright. */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function addMenuItem(
  data: Omit<MenuItem, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "menu_items"), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id">>
): Promise<void> {
  await updateDoc(doc(db, "menu_items", id), { ...stripUndefined(data), updatedAt: serverTimestamp() });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "menu_items", id));
}

export function normalizeCategory(value: string): string {
  return (value ?? "").trim().toLowerCase();
}

export async function getMenuByRestaurant(restaurantId: string): Promise<MenuItem[]> {
  const q = query(collection(db, "menu_items"), where("restaurantId", "==", restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
}

export async function getAllMenuItems(category?: string): Promise<MenuItem[]> {
  const snap = await getDocs(collection(db, "menu_items"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));

  if (!category || category === "all") return items;

  const targetCategory = normalizeCategory(category);
  return items.filter((item) => normalizeCategory(item.category ?? "") === targetCategory);
}

/** Live subscription to menu items (partner dashboard) */
export function subscribeToMenu(
  restaurantId: string,
  callback: (items: MenuItem[]) => void
): Unsubscribe {
  const q = query(collection(db, "menu_items"), where("restaurantId", "==", restaurantId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem)));
  });
}