import { create } from "zustand";

import type { CartItem, FirebaseUser, Product } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem | Product) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

interface UserState {
  user: FirebaseUser | null;
  token: string | null;
  setUser: (user: FirebaseUser | null, token?: string | null) => void;
}

interface ToastState {
  message: string;
  showToast: (message: string) => void;
  clearToast: () => void;
}

const getUnitPrice = (item: CartItem) =>
  Number(item.product.sale_price ?? item.product.price);

const toCartItem = (item: CartItem | Product): CartItem =>
  "product" in item ? item : { product: item, quantity: 1 };

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (input) =>
    set((state) => {
      const item = toCartItem(input);
      const existingItem = state.items.find(
        (cartItem) => cartItem.product.id === item.product.id,
      );

      if (!existingItem) {
        return { items: [...state.items, item] };
      }

      return {
        items: state.items.map((cartItem) =>
          cartItem.product.id === item.product.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + item.quantity,
              }
            : cartItem,
        ),
      };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),
  updateQty: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId)
          : state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item,
            ),
    })),
  clearCart: () => set({ items: [] }),
  totalPrice: () =>
    get().items.reduce(
      (total, item) => total + getUnitPrice(item) * item.quantity,
      0,
    ),
}));

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token = null) => set({ user, token }),
}));

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  showToast: (message) => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    set({ message });
    toastTimer = setTimeout(() => set({ message: "" }), 2600);
  },
  clearToast: () => set({ message: "" }),
}));
