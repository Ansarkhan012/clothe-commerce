"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, ExternalLink, FolderTree, Layers3, LogOut, Menu, Package, Palette, Plus, Settings, ShoppingCart, X } from "lucide-react";
import { createClient } from "@/src/lib/supabase/Client";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/collections", label: "Collections", icon: Layers3 },
  { href: "/admin/colors", label: "Colors", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function titleFor(pathname: string) {
  if (pathname.includes("/products/new")) return "Add product";
  if (pathname.includes("/products/") && pathname.endsWith("/edit")) return "Edit product";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/orders/")) return "Order details";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/inventory")) return "Inventory";
  if (pathname.startsWith("/admin/categories")) return "Categories";
  if (pathname.startsWith("/admin/collections")) return "Collections";
  if (pathname.startsWith("/admin/colors")) return "Colors";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Dashboard";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await createClient().auth.signOut();
    window.location.assign("/admin-login");
  }

  const sidebar = <aside className="flex h-full w-64 flex-col bg-[#111111] text-white">
    <div className="border-b border-white/10 px-6 py-6"><p className="text-lg font-semibold tracking-tight">Qurzaib Admin</p><p className="mt-1 text-xs text-white/45">Commerce operations</p></div>
    <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-5">{navigation.map(({ href, label, icon: Icon }) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition ${active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/7 hover:text-white"}`}><Icon size={18}/>{label}</Link>; })}</nav>
    <div className="space-y-1 border-t border-white/10 p-3"><Link href="/" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-white/65 hover:bg-white/7 hover:text-white"><ExternalLink size={18}/>View store</Link><button type="button" onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-white/65 hover:bg-white/7 hover:text-white"><LogOut size={18}/>Log out</button></div>
  </aside>;

  return <div className="min-h-screen bg-[#F6F7F9] text-[#1A1A1A]">
    <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45"/><div className="relative h-full w-64">{sidebar}<button type="button" onClick={() => setOpen(false)} aria-label="Close admin navigation" className="absolute right-3 top-4 grid h-9 w-9 place-items-center text-white"><X size={20}/></button></div></div>}
    <div className="lg:pl-64"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6"><div className="flex items-center gap-3"><button type="button" onClick={() => setOpen(true)} aria-label="Open admin navigation" className="grid h-10 w-10 place-items-center lg:hidden"><Menu size={21}/></button><h1 className="text-lg font-semibold">{titleFor(pathname)}</h1></div><Link href="/admin/products/new" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#1A1A1A] px-4 text-sm font-medium text-white"><Plus size={17}/><span className="hidden sm:inline">Add product</span></Link></header><div className="p-4 sm:p-6 lg:p-8">{children}</div></div>
  </div>;
}
