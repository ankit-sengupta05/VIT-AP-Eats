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
  /** Returns true if the item was added. Returns false if the item is from a different restaurant — the UI must show a conflict dialog and call clearAndAdd() if confirmed. */
  add: (item: Omit<CartItem, "quantity">) => boolean;
  /** Clear the current cart and add the new item. Use after confirming restaurant conflict. */
  clearAndAdd: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
  /** Returns the restaurant name if the cart has items from a different restaurant, otherwise null */
  conflictingRestaurant: (restaurantId: string) => string | null;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add(item) {
        const { items } = get();
        // Conflict: cart already has items from a DIFFERENT restaurant
        if (items.length > 0 && items[0].restaurantId !== item.restaurantId) {
          return false; // UI must handle the conflict dialog
        }
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return { items: s.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
          }
          return { items: [...s.items, { ...item, quantity: 1 }] };
        });
        return true;
      },

      clearAndAdd(item) {
        set({ items: [{ ...item, quantity: 1 }] });
      },

      conflictingRestaurant(restaurantId) {
        const { items } = get();
        if (items.length > 0 && items[0].restaurantId !== restaurantId) {
          return items[0].restaurantName;
        }
        return null;
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
