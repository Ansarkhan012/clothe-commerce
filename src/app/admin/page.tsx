import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, CircleDollarSign, Clock3, Package, ShoppingCart, Truck } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/admin";
import { productInventory } from "@/src/lib/product-commerce";

const money = (value: number) => `Rs. ${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
const badge = (status: string) => status === "delivered" ? "bg-[#2F6B4F]/10 text-[#2F6B4F]" : status === "cancelled" ? "bg-[#B44343]/10 text-[#B44343]" : "bg-[#C7A66A]/15 text-[#7A5B22]";

export default async function AdminDashboard() {
  const { serviceClient } = await requireAdmin();
  const [{ data: metricRows, error: metricsError }, { data: recentOrders, error: ordersError }, { data: lowStock, error: stockError }] = await Promise.all([
    serviceClient.rpc("get_admin_dashboard_metrics"),
    serviceClient.from("orders").select("id,public_order_id,customer_name,created_at,total_amount,payment_method,payment_status,order_status").order("created_at", { ascending: false }).limit(8),
    serviceClient.from("products").select("id,title,product_type,stock,category,images,variants:product_variants(stock_quantity,is_active)").eq("is_active", true).eq("status", "active").limit(500),
  ]);
  if (metricsError || ordersError || stockError) throw new Error("ADMIN_DASHBOARD_UNAVAILABLE");
  const metrics = metricRows?.[0] ?? { total_revenue: 0, orders_today: 0, total_orders: 0, pending_orders: 0, delivered_orders: 0, cancelled_orders: 0, average_order_value: 0, total_products: 0, low_stock_products: 0 };
  const lowStockProducts = (lowStock ?? []).map((product) => ({
    ...product,
    inventory: productInventory(product),
  })).filter((product) => product.inventory > 0 && product.inventory <= 5)
    .sort((a, b) => a.inventory - b.inventory)
    .slice(0, 8);
  const cards = [
    ["Total revenue", money(metrics.total_revenue), CircleDollarSign], ["Orders today", metrics.orders_today, Clock3], ["Total orders", metrics.total_orders, ShoppingCart],
    ["Pending orders", metrics.pending_orders, AlertTriangle], ["Products", metrics.total_products, Package], ["Low stock", metrics.low_stock_products, Boxes],
    ["Delivered", metrics.delivered_orders, Truck], ["Average order", money(metrics.average_order_value), CircleDollarSign],
  ] as const;

  return <main className="mx-auto max-w-[1500px] space-y-7"><div><p className="text-sm text-[#6B7280]">A live overview of store operations.</p></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <article key={label} className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-[#6B7280]">{label}</p><span className="grid h-9 w-9 place-items-center rounded-md bg-[#F6F7F9] text-[#9D7B3F]"><Icon size={18}/></span></div><p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p></article>)}</section>
    <div className="grid gap-6 xl:grid-cols-[1.6fr_.8fr]"><section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4"><h2 className="font-semibold">Recent orders</h2><Link href="/admin/orders" className="flex items-center gap-1 text-sm text-[#7A5B22]">View all <ArrowUpRight size={15}/></Link></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#F9FAFB] text-xs uppercase text-[#6B7280]"><tr>{["Order","Customer","Date","Total","Payment","Status",""].map((item) => <th key={item} className="px-5 py-3 font-medium">{item}</th>)}</tr></thead><tbody className="divide-y divide-[#E5E7EB]">{recentOrders?.map((order) => <tr key={order.id}><td className="px-5 py-4 font-mono text-xs font-semibold">{order.public_order_id}</td><td className="px-5 py-4">{order.customer_name}</td><td className="px-5 py-4 text-[#6B7280]">{new Date(order.created_at).toLocaleDateString("en-PK")}</td><td className="px-5 py-4 font-medium">{money(order.total_amount)}</td><td className="px-5 py-4 capitalize">{order.payment_method}<span className="block text-xs text-[#6B7280]">{order.payment_status}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${badge(order.order_status)}`}>{order.order_status.replaceAll("_", " ")}</span></td><td className="px-5 py-4"><Link href={`/admin/orders/${order.id}`} className="font-medium text-[#7A5B22]">Open</Link></td></tr>)}</tbody></table>{!recentOrders?.length && <p className="p-8 text-center text-sm text-[#6B7280]">No orders yet.</p>}</div></section>
      <section className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4"><h2 className="font-semibold">Low stock</h2><Link href="/admin/inventory" className="text-sm text-[#7A5B22]">Inventory</Link></div><div className="divide-y divide-[#E5E7EB]">{lowStockProducts.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium">{product.title}</p><p className="text-xs text-[#6B7280]">{product.category}</p></div><span className="rounded-full bg-[#B7791F]/10 px-2.5 py-1 text-xs font-semibold text-[#8A5A12]">{product.inventory} left</span></div>)}{!lowStockProducts.length && <p className="p-8 text-center text-sm text-[#6B7280]">No low-stock products.</p>}</div></section></div>
  </main>;
}
