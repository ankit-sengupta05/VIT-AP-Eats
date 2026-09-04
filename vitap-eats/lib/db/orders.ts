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
  customerId?: string;
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

function mergeOrdersById(orders: Order[]): Order[] {
  const map = new Map<string, Order>();
  for (const order of orders) {
    if (!map.has(order.id)) map.set(order.id, order);
  }
  return [...map.values()];
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Promise<string> {
  if (!data.userId) {
    throw new Error("Customer userId is required to create an order.");
  }

  const ref = await addDoc(collection(db, "orders"), {
    ...data,
    userId: data.userId,
    customerId: data.userId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  // Fire-and-forget: notify admin app via FCM. Never blocks checkout.
  notifyAdmin({
    orderId:        ref.id,
    customerName:   data.userName,
    restaurantName: data.restaurantName,
    total:          data.total,
  }).catch((err) => console.warn("[FCM] Admin notify failed:", err));

  return ref.id;
}

/** Calls the Next.js API route which sends FCM push to admin devices. */
async function notifyAdmin(payload: {
  orderId: string;
  customerName: string;
  restaurantName: string;
  total: number;
}): Promise<void> {
  const secret = process.env.NEXT_PUBLIC_ADMIN_NOTIFY_SECRET ?? "";
  await fetch("/api/notify-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, secret }),
  });
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
  const normalizedUserId = userId.trim();
  const q1 = query(
    collection(db, "orders"),
    where("userId", "==", normalizedUserId)
  );
  const q2 = query(
    collection(db, "orders"),
    where("customerId", "==", normalizedUserId)
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const combined = mergeOrdersById([
    ...snap1.docs.map((d) => ({ id: d.id, ...d.data() } as Order)),
    ...snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Order)),
  ]);

  return combined.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

/** Realtime subscription to user's order history */
export function subscribeToUserOrders(
  userId: string,
  callback: (orders: Order[]) => void
): Unsubscribe {
  const normalizedUserId = userId.trim();

  const q1 = query(
    collection(db, "orders"),
    where("userId", "==", normalizedUserId)
  );
  const q2 = query(
    collection(db, "orders"),
    where("customerId", "==", normalizedUserId)
  );

  const userOrders = new Map<string, Order>();
  const customerOrders = new Map<string, Order>();

  const emit = () => {
    const merged = mergeOrdersById([
      ...userOrders.values(),
      ...customerOrders.values(),
    ]).sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
    callback(merged);
  };

  const unsub1 = onSnapshot(q1, (snap) => {
    userOrders.clear();
    for (const docSnap of snap.docs) {
      userOrders.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as Order);
    }
    emit();
  });

  const unsub2 = onSnapshot(q2, (snap) => {
    customerOrders.clear();
    for (const docSnap of snap.docs) {
      customerOrders.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as Order);
    }
    emit();
  });

  return () => {
    unsub1();
    unsub2();
  };
}
