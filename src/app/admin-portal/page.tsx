"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingCart, Users, TrendingUp, Plus, Edit, Trash2, LogOut, AlertTriangle } from "lucide-react";
import { createClient } from "@/src/lib/supabase/Client";
import { Order, Product } from "@/src/types/supabase";
import { useRouter } from "next/navigation";

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const router = useRouter();

  // Check if Supabase env vars are available
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      setError("Supabase configuration missing. Please add environment variables.");
      setLoading(false);
      return;
    }
    
    setSupabaseReady(true);
  }, []);

  const supabase = supabaseReady ? createClient() : null;

  useEffect(() => {
    if (supabaseReady) {
      fetchData();
    }
  }, [supabaseReady]);

  const fetchData = async () => {
    if (!supabase) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setOrders(ordersData || []);
      setProducts(productsData || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data from Supabase");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    }
  };

  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;

  const stats = [
    { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, change: `+${pendingOrders} pending` },
    { label: "Products", value: products.length.toString(), icon: Package, change: "In catalog" },
    { label: "Total Revenue", value: `Rs. ${(totalRevenue / 1000000).toFixed(1)}M`, icon: TrendingUp, change: "All time" },
    { label: "Customers", value: "1,204", icon: Users, change: "Registered" },
  ];

  // Show error state if Supabase not configured
  if (error && !supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-error" size={40} />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary mb-3">Configuration Required</h1>
          <p className="text-muted mb-2">{error}</p>
          <div className="bg-surface border border-border p-4 rounded-lg mt-6 text-left">
            <p className="text-sm font-medium text-primary mb-2">Add these environment variables:</p>
            <code className="block bg-bg p-2 rounded text-xs text-accent mb-2">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
            </code>
            <code className="block bg-bg p-2 rounded text-xs text-accent">
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
            </code>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-3 bg-accent text-white text-sm font-semibold tracking-wider uppercase hover:bg-accent-dark transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/admin-portal/products/new')}
            className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 text-sm font-semibold transition-all"
          >
            <Plus size={16} /> Add Product
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 border border-border hover:border-error text-muted hover:text-error px-4 py-3 text-sm transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface border border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted text-sm">{stat.label}</p>
                <p className="font-display text-2xl font-bold text-primary mt-1">{stat.value}</p>
              </div>
              <div className="p-2 bg-bg text-accent">
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-success text-xs mt-3 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6">
        {["orders", "products"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-accent border-b-2 border-accent"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-surface border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl font-bold text-primary">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Area</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-muted">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-muted">{order.phone_number}</td>
                    <td className="px-6 py-4 text-sm text-muted">{order.area}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">Rs. {Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-medium uppercase tracking-wider px-3 py-1 border ${
                          order.order_status === "delivered" ? "bg-success/10 text-success border-success/20" :
                          order.order_status === "shipped" ? "bg-accent/10 text-accent-dark border-accent/20" :
                          order.order_status === "cancelled" ? "bg-error/10 text-error border-error/20" :
                          "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 text-muted hover:text-accent transition-colors">
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="bg-surface border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl font-bold text-primary">All Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Stock</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Sizes</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-bg border border-border overflow-hidden">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-primary">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">Rs. {product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${product.stock < 5 ? 'text-error' : 'text-success'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{product.sizes?.join(", ")}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-muted hover:text-accent transition-colors">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 text-muted hover:text-error transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}