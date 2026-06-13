"use client";

import { useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, AlertCircle, CheckCircle } from "lucide-react";

const areas = [
  "Karachi - Clifton",
  "Karachi - DHA",
  "Karachi - Gulshan",
  "Karachi - North Nazimabad",
  "Karachi - Saddar",
  "Karachi - Korangi",
  "Karachi - Malir",
  "Lahore - Gulberg",
  "Lahore - DHA",
  "Lahore - Model Town",
  "Islamabad - F-7",
  "Islamabad - G-10",
  "Rawalpindi - Saddar",
  "Faisalabad - Canal Road",
  "Other",
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    delivery_address: "",
    area: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      errors.customer_name = "Name must be at least 2 characters";
    }

    const phoneRegex = /^03[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone_number.trim())) {
      errors.phone_number = "Invalid format. Use: 03XXXXXXXXX (11 digits)";
    }

    if (!formData.area) {
      errors.area = "Please select an area";
    }

    if (!formData.delivery_address.trim() || formData.delivery_address.trim().length < 10) {
      errors.delivery_address = "Please enter complete address (min 10 chars)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        size: item.size,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const payload = {
        customer_name: formData.customer_name.trim(),
        phone_number: formData.phone_number.trim(),
        delivery_address: formData.delivery_address.trim(),
        area: formData.area,
        items: items,
      };

      console.log("📤 Sending:", payload);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📥 Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setOrderId(data.orderId);
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    router.push("/cart");
    return null;
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="mx-auto text-success mb-4" size={64} />
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Order Placed!</h1>
          <p className="text-muted mb-4">
            Thank you for your order. We will contact you shortly.
          </p>
          {orderId && <p className="text-sm text-muted mb-6">Order ID: {orderId}</p>}
          <button
            onClick={() => router.push("/")}
            className="bg-accent hover:bg-accent-dark text-white px-8 py-3 text-sm font-semibold tracking-wider uppercase transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-bold text-primary mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Order Items */}
        <div>
          <h2 className="font-display text-xl font-bold text-primary mb-6">Order Items ({cart.length})</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 bg-surface p-4 border border-border">
                <div className="relative w-20 h-24 shrink-0 bg-muted/10 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-primary">{item.title}</h3>
                  <p className="text-sm text-muted">Size: {item.size} | Qty: {item.quantity}</p>
                  <p className="text-accent font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-bg border border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Subtotal</span>
              <span className="text-primary">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Shipping</span>
              <span className="text-primary">{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span className="text-primary">Total</span>
              <span className="text-accent">Rs. {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div>
          <h2 className="font-display text-xl font-bold text-primary mb-6">Delivery Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-6 border border-border">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => {
                  setFormData({ ...formData, customer_name: e.target.value });
                  if (fieldErrors.customer_name) setFieldErrors({...fieldErrors, customer_name: ""});
                }}
                className={`w-full px-4 py-3 bg-bg border transition-colors focus:outline-none ${
                  fieldErrors.customer_name ? "border-error" : "border-border focus:border-accent"
                }`}
                placeholder="Enter your full name"
              />
              {fieldErrors.customer_name && (
                <p className="text-error text-xs mt-1">{fieldErrors.customer_name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setFormData({ ...formData, phone_number: value });
                  if (fieldErrors.phone_number) setFieldErrors({...fieldErrors, phone_number: ""});
                }}
                className={`w-full px-4 py-3 bg-bg border transition-colors focus:outline-none ${
                  fieldErrors.phone_number ? "border-error" : "border-border focus:border-accent"
                }`}
                placeholder="03XXXXXXXXX"
              />
              {fieldErrors.phone_number && (
                <p className="text-error text-xs mt-1">{fieldErrors.phone_number}</p>
              )}
              <p className="text-xs text-muted mt-1">Format: 03XXXXXXXXX (11 digits)</p>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Area *</label>
              <select
                value={formData.area}
                onChange={(e) => {
                  setFormData({ ...formData, area: e.target.value });
                  if (fieldErrors.area) setFieldErrors({...fieldErrors, area: ""});
                }}
                className={`w-full px-4 py-3 bg-bg border transition-colors focus:outline-none ${
                  fieldErrors.area ? "border-error" : "border-border focus:border-accent"
                }`}
              >
                <option value="">Select your area</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {fieldErrors.area && (
                <p className="text-error text-xs mt-1">{fieldErrors.area}</p>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Delivery Address *</label>
              <textarea
                rows={3}
                value={formData.delivery_address}
                onChange={(e) => {
                  setFormData({ ...formData, delivery_address: e.target.value });
                  if (fieldErrors.delivery_address) setFieldErrors({...fieldErrors, delivery_address: ""});
                }}
                className={`w-full px-4 py-3 bg-bg border transition-colors focus:outline-none resize-none ${
                  fieldErrors.delivery_address ? "border-error" : "border-border focus:border-accent"
                }`}
                placeholder="House #, Street, Landmark, etc."
              />
              {fieldErrors.delivery_address && (
                <p className="text-error text-xs mt-1">{fieldErrors.delivery_address}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white py-4 text-sm font-semibold tracking-wider uppercase transition-all"
            >
              {loading ? "Placing Order..." : "Place Order"}
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}