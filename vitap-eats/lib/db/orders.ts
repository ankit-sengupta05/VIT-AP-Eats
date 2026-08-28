import {
  collection, addDoc, updateDoc, doc, serverTimestamp,
  onSnapshot, query, where, orderBy, type Unsubscribe, getDocs, type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  address: string;
  couponCode?: string;
  discount?: number;
  createdAt: Timestamp | null;
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Promise<string> {
  const ref = await addDoc(collection(db, "orders"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), { status });
}

/** Realtime order subscription for live tracking */
export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "orders", orderId), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({ id: snap.id, ...snap.data() } as Order);
  });
}

/** Subscribe to all orders for a restaurant (partner dashboard) */
export function subscribeToRestaurantOrders(
  restaurantId: string,
  callback: (orders: Order[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
}

/** Subscribe to all orders for admin */
export function subscribeToAllOrders(
  callback: (orders: Order[]) => void
): Unsubscribe {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
}

/** Get user's order history */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

/** Realtime subscription to user's order history */
export function subscribeToUserOrders(
  userId: string,
  callback: (orders: Order[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
}
