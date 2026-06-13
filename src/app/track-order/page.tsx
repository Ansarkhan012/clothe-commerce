"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/Client";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, User, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

const statusSteps = [
  { status: "pending", label: "Order Diya Gaya", icon: Clock },
  { status: "processing", label: "Taiyaari Ho Rahi Hai", icon: Package },
  { status: "shipped", label: "Raste Mein Hai", icon: Truck },
  { status: "delivered", label: "Pahunch Gaya", icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Order Diya Gaya",
  processing: "Taiyaari Ho Rahi Hai",
  shipped: "Raste Mein Hai",
  delivered: "Pahunch Gaya",
  cancelled: "Cancel Ho Gaya",
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    try {
      let query = supabase.from("orders").select("*");

      if (orderId) {
        query = query.ilike("id", `%${orderId}%`);
      }
      
      if (phoneNumber) {
        query = query.eq("phone_number", phoneNumber);
      }

      const { data, error: supabaseError } = await query
        .order("created_at", { ascending: false })
        .limit(1);

      if (supabaseError) throw supabaseError;

      if (!data || data.length === 0) {
        setError("Koi order nahi mila. Please check your Order ID ya phone number.");
        return;
      }

      setOrder(data[0]);
    } catch (err: any) {
      setError("Kuch galat ho gaya. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = (status: string) => {
    const index = statusSteps.findIndex((s) => s.status === status);
    return index === -1 ? 0 : index;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
          <Truck className="text-accent" size={28} />
        </div>
        <h1 className="font-display text-4xl font-bold text-primary mb-2">
          Order Track Karein
        </h1>
        <p className="text-muted">
          Apna Order ID ya phone number se apna order track karein
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-surface p-6 sm:p-8 border border-border rounded-lg mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none transition-colors"
              placeholder="e.g., 2901d797..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Phone Number <span className="text-muted text-xs">(optional)</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none transition-colors"
              placeholder="03XXXXXXXXX"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || (!orderId && !phoneNumber)}
          className="w-full sm:w-auto px-8 py-3 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white text-sm font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Dhoondh rahe hain..." : <><Search size={16} /> Order Dhoondhein</>}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6 flex items-center gap-2">
          <Search size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Order Found */}
      {order && (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-display text-xl font-bold text-primary">#{order.id.slice(0, 8)}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm ${statusColors[order.order_status] || statusColors.pending}`}>
                {statusLabels[order.order_status] || order.order_status}
              </span>
            </div>

            {/* Progress Tracker */}
            <div className="relative mt-8 mb-4">
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const currentStep = getCurrentStep(order.order_status);
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1 relative">
                      {/* Connecting Line */}
                      {index < statusSteps.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                          index < currentStep ? "bg-accent" : "bg-border"
                        }`} />
                      )}
                      {/* Icon */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "bg-accent border-accent text-white"
                          : "bg-bg border-border text-muted"
                      } ${isCurrent ? "ring-4 ring-accent/20" : ""}`}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-[10px] mt-2 text-center font-medium uppercase tracking-wider ${
                        isActive ? "text-primary" : "text-muted"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <User size={18} className="text-accent" /> Customer Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-muted">Name</p>
                    <p className="text-sm font-medium text-primary">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-muted">Phone</p>
                    <p className="text-sm font-medium text-primary">{order.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-muted">Address</p>
                    <p className="text-sm font-medium text-primary">{order.delivery_address}</p>
                    <p className="text-xs text-accent mt-1">{order.area}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Package size={18} className="text-accent" /> Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-muted">Order Date</p>
                    <p className="text-sm font-medium text-primary">
                      {new Date(order.created_at).toLocaleDateString('ur-PK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={16} className="text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-muted">Payment</p>
                    <p className="text-sm font-medium text-primary">Cash on Delivery (COD)</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Total Amount</span>
                    <span className="text-2xl font-bold text-accent">
                      Rs. {Number(order.total_amount).toLocaleString('ur-PK')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Package size={18} className="text-accent" /> Items Ordered
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-bg rounded-sm border border-border">
                  <div className="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center text-accent font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">{item.title || `Product #${item.product_id?.slice(0, 6)}`}</p>
                    <p className="text-xs text-muted">Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      Rs. {((item.price_at_time || 0) * item.quantity).toLocaleString('ur-PK')}
                    </p>
                    <p className="text-[10px] text-muted">Rs. {(item.price_at_time || 0).toLocaleString('ur-PK')} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Aur Shopping Karein
            </Link>
          </div>
        </div>
      )}

      {/* No search yet */}
      {!searched && !order && !error && (
        <div className="text-center py-16">
          <Package className="mx-auto text-muted mb-4" size={48} strokeWidth={1} />
          <p className="text-muted text-lg">Apna Order ID ya phone number dalein</p>
          <p className="text-muted text-sm mt-2">Order ID aapke confirmation message mein hai</p>
        </div>
      )}
    </div>
  );
}