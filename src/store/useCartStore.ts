// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FabricUnit, ProductType } from '@/src/types/product';
import { sanitizePersistedCart } from '@/src/lib/cart-persistence';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  productType: ProductType;
  variantId?: string;
  sku?: string;
  size?: string;
  color?: string;
  pieces?: number;
  sellingUnit?: FabricUnit;
  quantity: number;
  stock?: number;
  quantityStep?: number;
  minimumQuantity?: number;
  lineKey: string;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (newItem) => set((state) => {
        // Karachi clothing logic: Check both ID AND Size. Same product with different size = different item!
        const existingIndex = state.cart.findIndex(
          (item) => item.lineKey === newItem.lineKey
        );

        if (existingIndex > -1) {
          const updatedCart = [...state.cart];
          const requested = updatedCart[existingIndex].quantity + newItem.quantity;
          updatedCart[existingIndex].quantity = newItem.stock === undefined ? requested : Math.min(requested, newItem.stock);
          return { cart: updatedCart };
        }
        return { cart: [...state.cart, newItem] };
      }),
      removeFromCart: (lineKey) => set((state) => ({
        cart: state.cart.filter((item) => item.lineKey !== lineKey)
      })),
      updateQuantity: (lineKey, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.lineKey === lineKey ? (() => {
            const minimum=item.minimumQuantity??1,step=item.quantityStep??1,maximum=item.stock??1000;
            const clamped=Math.max(minimum,Math.min(quantity,maximum));
            const normalized=minimum+Math.round((clamped-minimum)/step)*step;
            return {...item,quantity:Number(Math.min(maximum,normalized).toFixed(3))};
          })() : item
        )
      })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'karachi-apparel-cart-storage', // Key name in localStorage
      version: 3,
      migrate: (persisted) => ({ cart: sanitizePersistedCart((persisted as { cart?: unknown })?.cart) }),
      merge: (persisted, current) => ({
        ...current,
        cart: sanitizePersistedCart((persisted as { cart?: unknown })?.cart),
      }),
      skipHydration: true,
    }
  )
);
