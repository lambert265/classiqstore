import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  img: string;
  size: string;
  color: string;
  qty: number;
};

type CartStore = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number, size: string, color: string) => void;
  updateQty: (id: number, size: string, color: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,

      setOpen: (v) => set({ open: v }),

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.id === item.id && i.size === item.size && i.color === item.color
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id && i.size === item.size && i.color === item.color
                ? { ...i, qty: i.qty + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, qty: 1 }] });
        }
        set({ open: true });
      },

      removeItem: (id, size, color) =>
        set({ items: get().items.filter((i) => !(i.id === id && i.size === size && i.color === color)) }),

      updateQty: (id, size, color, qty) => {
        if (qty < 1) {
          get().removeItem(id, size, color);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id && i.size === size && i.color === color ? { ...i, qty } : i
          ),
        });
      },

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),

      count: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: "CLASSIQ-cart" }
  )
);
