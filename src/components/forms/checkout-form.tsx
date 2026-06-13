


"use client";

import { useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";

export function CheckoutForm() {
  const { cart, clearCart } = useCartStore();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "cod", // cod or card
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Process order with Supabase
    alert("Order placed successfully!");
    clearCart();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">Full Name</label>
          <input
            required
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-2">Phone Number</label>
          <input
            required
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
            placeholder="03XX-XXXXXXX"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">Delivery Address</label>
        <textarea
          required
          rows={3}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none resize-none"
          placeholder="House #, Street, Area"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">City</label>
        <select
          required
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none"
        >
          <option value="">Select City</option>
          <option value="karachi">Karachi</option>
          <option value="lahore">Lahore</option>
          <option value="islamabad">Islamabad</option>
          <option value="rawalpindi">Rawalpindi</option>
          <option value="faisalabad">Faisalabad</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-3">Payment Method</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-border cursor-pointer hover:border-accent transition-colors bg-bg">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={formData.paymentMethod === "cod"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="accent-accent"
            />
            <div>
              <p className="font-medium text-primary">Cash on Delivery</p>
              <p className="text-xs text-muted">Pay when you receive</p>
            </div>
          </label>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex justify-between text-lg font-bold text-primary mb-6">
          <span>Total</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-dark text-white py-4 text-sm font-semibold tracking-wider uppercase transition-all"
        >
          Place Order
        </button>
      </div>
    </form>
  );
}