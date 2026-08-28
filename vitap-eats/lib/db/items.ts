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

export async function addMenuItem(
  data: Omit<MenuItem, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "menu_items"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id">>
): Promise<void> {
  await updateDoc(doc(db, "menu_items", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "menu_items", id));
}

export async function getMenuByRestaurant(restaurantId: string): Promise<MenuItem[]> {
  const q = query(collection(db, "menu_items"), where("restaurantId", "==", restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
}

export async function getAllMenuItems(category?: string): Promise<MenuItem[]> {
  let q = query(collection(db, "menu_items"));
  if (category && category !== "all") {
    q = query(collection(db, "menu_items"), where("category", "==", category));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
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
