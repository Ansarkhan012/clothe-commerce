"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";
import { ShoppingBag, Menu, X, Search, UserRound, Truck, CircleHelp } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/collections", label: "Collections" },
  { href: "/collections?category=Unstitched", label: "Unstitched" },
  { href: "/sale", label: "Sale" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function BrandLockup() {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/images/qurzaib-mark.png" alt="" width={64} height={64} className="h-14 w-14 object-contain sm:h-12 sm:w-12" priority />
      <span className="hidden sm:block leading-none">
        <span className="block font-display text-[21px] tracking-[0.13em] text-brand-green-dark">QURZAIB</span>
        <span className="mt-1 block text-[9px] tracking-[0.35em] text-accent">FABRICS</span>
      </span>
      <span className="sr-only">QurZaib Fabrics</span>
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-brand-cream/95 backdrop-blur-md">
      <div className="bg-brand-green-dark text-white">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-4 text-[10px] tracking-wide sm:px-6 lg:px-10">
          <span className="flex items-center gap-2"><Truck size={13} aria-hidden="true" /> Free Delivery on orders above PKR 5,000</span>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/track-order" className="hover:text-brand-gold">Track Order</Link>
            <Link href="/contact" className="flex items-center gap-1 hover:text-brand-gold"><CircleHelp size={12} /> Help</Link>
          </div>
        </div>
      </div>
      <nav aria-label="Primary navigation" className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <button onClick={() => setOpen(true)} className="p-2 lg:hidden" aria-label="Open navigation menu" aria-expanded={open}>
          <Menu size={23} />
        </button>
        <Link href="/" aria-label="QurZaib Fabrics home" className="shrink-0"><BrandLockup /></Link>
        <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {navLinks.map((link) => <Link key={link.href} href={link.href} className="border-b border-transparent py-2 text-[11px] font-medium tracking-wide text-brand-charcoal transition hover:border-brand-gold-dark hover:text-brand-green">{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-0.5 text-brand-green-dark">
          <Link href="/collections#catalog-search" aria-label="Search products" className="hidden p-2 transition hover:text-accent sm:block"><Search size={20} /></Link>
          <Link href="/admin-login" aria-label="Account" className="hidden p-2 transition hover:text-accent sm:block"><UserRound size={20} /></Link>
          <Link href="/cart" aria-label={`Shopping cart with ${cartCount} items`} className="relative p-2 transition hover:text-accent">
            <ShoppingBag size={21} />
            {cartCount > 0 && <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-brand-gold-dark px-1 text-[9px] font-bold text-white">{Math.min(cartCount, 99)}</span>}
          </Link>
        </div>
      </nav>

      {open && <div className="fixed inset-0 z-50 bg-black/35 lg:hidden" onClick={() => setOpen(false)}>
        <div className="h-full w-[min(88vw,360px)] bg-brand-cream p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-8 flex items-center justify-between"><BrandLockup /><button onClick={() => setOpen(false)} aria-label="Close navigation menu" className="p-2"><X /></button></div>
          <div className="flex flex-col">
            {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-border py-4 text-sm font-medium tracking-wide text-brand-green-dark">{link.label}</Link>)}
            <Link href="/track-order" onClick={() => setOpen(false)} className="mt-5 flex items-center gap-2 text-sm text-accent"><Truck size={17} /> Track Order</Link>
          </div>
        </div>
      </div>}
    </header>
  );
}
