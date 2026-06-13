"use client";

import { useCartStore } from "@/src/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const router = useRouter();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="text-muted mb-4" size={64} strokeWidth={1} />
        <h1 className="font-display text-3xl font-bold text-primary mb-2">Your Cart is Empty</h1>
        <p className="text-muted mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/new-arrivals"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-bold text-primary mb-2">Shopping Cart</h1>
      <p className="text-muted mb-8">{cart.length} item(s) in your cart</p>

      {checkoutError && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="flex gap-4 bg-surface p-4 border border-border rounded-sm"
            >
              <div className="relative w-24 h-32 shrink-0 bg-muted/10 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="text-sm text-muted mt-1">Size: {item.size}</p>
                  <p className="text-accent font-bold mt-1">Rs. {item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-bg transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="p-2 hover:bg-bg transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-muted hover:text-error transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-muted hover:text-error transition-colors underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border p-6 sticky top-24">
            <h2 className="font-display text-xl font-bold text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-accent">Add Rs. {5000 - subtotal} more for free shipping!</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-bold text-primary text-base">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full mt-6 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
            >
              {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
            </button>

            <Link
              href="/new-arrivals"
              className="block text-center mt-4 text-sm text-muted hover:text-primary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}