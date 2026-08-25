import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add(item) {
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          // Warn if adding from a different restaurant (handled in UI)
          if (existing) {
            return { items: s.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
          }
          return { items: [...s.items, { ...item, quantity: 1 }] };
        });
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      update: (id, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter((i) => i.id !== id)
            : s.items.map((i) => i.id === id ? { ...i, quantity: qty } : i),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "vitap-cart" }
  )
);
