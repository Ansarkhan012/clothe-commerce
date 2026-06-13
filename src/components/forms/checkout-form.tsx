// // src/components/forms/checkout-form.tsx
// 'use client';

// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { CheckoutSchema, CheckoutInput, KarachiAreas } from '@/src/lib/validations/order';
// import { useCartStore } from '@/src/store/useCartStore';
// import { useState } from 'react';
// import Link from 'next/link';
// ;

// interface CheckoutFormProps {
//   cartItems: any[];
// }

// export default function CheckoutForm({ cartItems }: CheckoutFormProps) {
//   const clearCart = useCartStore((state) => state.clearCart);
//   const [loading, setLoading] = useState(false);
//   const [orderSuccess, setOrderSuccess] = useState(false);
//   const [serverError, setServerError] = useState('');

//   const { register, handleSubmit, formState: { errors } } = useForm<CheckoutInput>({
//     resolver: zodResolver(CheckoutSchema),
//   });

//   const onSubmit = async (data: CheckoutInput) => {
//     setLoading(true);
//     setServerError('');

//     // Backend payload preparing (including raw structure mapping)
//     const payload = {
//       ...data,
//       items: cartItems.map(item => ({
//         product_id: item.id,
//         size: item.size,
//         quantity: item.quantity
//       }))
//     };

//     try {
//       // API Route handle setup for 5-day speed code execution
//       const res = await fetch('/api/checkout', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (!result.success) {
//         throw new Error(result.message || 'Order failed');
//       }

//       clearCart();
//       setOrderSuccess(true);
//     } catch (err: any) {
//       setServerError(err.message || 'Kuch galat hogaya. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (orderSuccess) {
//     return (
//       <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200">
//         <h3 className="text-xl font-bold text-emerald-800">Shukriya! Order Placed! 🎉</h3>
//         <p className="text-sm text-emerald-700 mt-2">
//           Aapka order receive ho chuka hai. Humari team jald hi aapko call karke order confirm karegi.
//         </p>
//         <Link href="/" className="mt-4 inline-block bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-700">
//           Continue Shopping
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       {serverError && (
//         <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200 font-medium">
//           {serverError}
//         </div>
//       )}

//       <div>
//         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
//         <input 
//           {...register('customer_name')} 
//           type="text" 
//           placeholder="e.g., Ali Khan"
//           className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//         />
//         {errors.customer_name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.customer_name.message}</p>}
//       </div>

//       <div>
//         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Number</label>
//         <input 
//           {...register('phone_number')} 
//           type="text" 
//           placeholder="e.g., 03001234567"
//           className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//         />
//         {errors.phone_number && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone_number.message}</p>}
//       </div>

//       <div>
//         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Area in Karachi</label>
//         <select 
//           {...register('area')} 
//           className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//         >
//           <option value="">-- Apna Ilaqa Chunien --</option>
//           {KarachiAreas.map((area) => (
//             <option key={area} value={area}>{area}</option>
//           ))}
//         </select>
//         {errors.area && <p className="text-xs text-red-500 mt-1 font-medium">{errors.area.message}</p>}
//       </div>

//       <div>
//         <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Delivery Address</label>
//         <textarea 
//           {...register('delivery_address')} 
//           rows={3}
//           placeholder="House number, Street, Block, Sectors..."
//           className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
//         />
//         {errors.delivery_address && <p className="text-xs text-red-500 mt-1 font-medium">{errors.delivery_address.message}</p>}
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition disabled:bg-gray-200 disabled:text-gray-400 shadow-md"
//       >
//         {loading ? 'Processing Order...' : 'Confirm Cash on Delivery Order'}
//       </button>
//     </form>
//   );
// }



"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";

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