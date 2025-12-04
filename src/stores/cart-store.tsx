import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tables } from "@/types/db";

type CartItem = Tables<"CartItem"> & {
  product?: Tables<"Product">;
  variant?: Tables<"ProductVariant">;
};

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id"> & { userId: number }) => Promise<void>;
  removeItem: (id: number, userId: number) => Promise<void>;
  updateItem: (id: number, quantity: number, userId: number) => Promise<void>;
  clearCart: (userId: number) => Promise<void>;
  syncCart: (userId: number) => Promise<void>;
  init: (userId: number | null) => Promise<void>;
  total: number;
  cartCount: number;
  isLoggedIn: boolean;
  requireLogin: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      cartCount: 0,
      isLoggedIn: false,
      requireLogin: () => {
        // We'll handle the login requirement in the components with toast
        return;
      },
      addItem: async (item) => {
        if (!item.userId) {
          throw new Error("User not logged in");
        }

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ item }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        await get().syncCart(item.userId);
      },
      removeItem: async (id, userId) => {
        if (!userId) {
          throw new Error("User not logged in");
        }

        console.log('Removing item:', { id, userId });
        const response = await fetch(`/api/cart?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Error removing item:', error);
          throw new Error(error.message || 'Failed to remove item');
        }

        console.log('Item removed successfully, syncing cart...');
        await get().syncCart(userId);
      },
      updateItem: async (id, quantity, userId) => {
        if (!userId) {
          throw new Error("User not logged in");
        }

        const response = await fetch("/api/cart", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, quantity }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        await get().syncCart(userId);
      },
      clearCart: async (userId) => {
        if (!userId) {
          throw new Error("User not logged in");
        }

        console.log('Clearing cart for user:', userId);
        const response = await fetch(`/api/cart?userId=${userId}&clearAll=true`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Error clearing cart:', error);
          throw new Error(error.message || 'Failed to clear cart');
        }

        console.log('Cart cleared successfully, syncing...');
        await get().syncCart(userId);
      },
      syncCart: async (userId) => {
        if (!userId) {
          set({ items: [], total: 0, cartCount: 0 });
          return;
        }

        console.log('Syncing cart for user:', userId);
        const response = await fetch(`/api/cart?userId=${userId}`, {
          method: "GET",
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Error syncing cart:', error);
          throw new Error(error.message || 'Failed to sync cart');
        }

        const items = await response.json();
        console.log('Cart items synced:', items);
        const total = items.reduce(
          (acc: number, item: CartItem) =>
            acc + (item.price || 0) * item.quantity,
          0
        );
        const cartCount = items.reduce(
          (acc: number, item: CartItem) => acc + item.quantity,
          0
        );

        set({ items, total, cartCount });
      },
      
      // Initialize cart store
      init: async (userId: number | null) => {
        if (userId) {
          await get().syncCart(userId);
        } else {
          set({ items: [], total: 0, cartCount: 0 });
        }
      },
    }),
    {
      name: "cart-store",
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      partialize: (state) => state,
    }
  )
);