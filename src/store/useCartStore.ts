// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  size: 'S' | 'M' | 'L' | 'XL';
  quantity: number;
  stock?: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: 'S' | 'M' | 'L' | 'XL') => void;
  updateQuantity: (id: string, size: 'S' | 'M' | 'L' | 'XL', quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (newItem) => set((state) => {
        // Karachi clothing logic: Check both ID AND Size. Same product with different size = different item!
        const existingIndex = state.cart.findIndex(
          (item) => item.id === newItem.id && item.size === newItem.size
        );

        if (existingIndex > -1) {
          const updatedCart = [...state.cart];
          const requested = updatedCart[existingIndex].quantity + newItem.quantity;
          updatedCart[existingIndex].quantity = newItem.stock === undefined ? requested : Math.min(requested, newItem.stock);
          return { cart: updatedCart };
        }
        return { cart: [...state.cart, newItem] };
      }),
      removeFromCart: (id, size) => set((state) => ({
        cart: state.cart.filter((item) => !(item.id === id && item.size === size))
      })),
      updateQuantity: (id, size, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === id && item.size === size ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock ?? 20)) } : item
        )
      })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'karachi-apparel-cart-storage', // Key name in localStorage
    }
  )
);
