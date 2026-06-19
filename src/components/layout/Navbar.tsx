"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";
import { ShoppingBag, Menu, X, Search, User, Truck } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/collections", label: "Collections" },
    { href: "/sale", label: "Festive Sale", accent: true },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">

      {/* Announcement Bar */}
      <div className="bg-neutral-950 text-white text-[10px] tracking-[0.22em] text-center py-2.5 px-4 uppercase">
        Free Delivery Across Pakistan On Orders Above{" "}
        <span className="text-amber-400 font-semibold">Rs. 5,000</span>
      </div>

      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Hamburger — mobile only, LEFT side */}
          <button
            type="button"
            className="lg:hidden p-2 -ml-1 text-neutral-900 hover:text-amber-800 transition-colors shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen
              ? <X size={22} strokeWidth={1.5} />
              : <Menu size={22} strokeWidth={1.5} />}
          </button>

          {/* Logo — center on mobile, left on desktop */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 shrink-0"
          >
            <Image
              src="/images/logo.png"
              alt="Zaisha's Fabrics"
              width={140}
              height={52}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 relative group py-2
                  ${link.accent
                    ? "text-amber-700 hover:text-amber-900"
                    : "text-neutral-800 hover:text-amber-800"
                  }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-amber-700 transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5 shrink-0">

            {/* Track — desktop only */}
            <Link
              href="/track-order"
              className="hidden xl:flex items-center gap-1.5 px-2 py-2 text-neutral-700 hover:text-amber-800 transition-colors"
              title="Track Your Order"
            >
              <Truck size={18} strokeWidth={1.5} />
              <span className="text-[10px] tracking-widest uppercase font-medium">Track</span>
            </Link>

            {/* Search */}
            <button
              type="button"
              className="p-2 text-neutral-700 hover:text-amber-800 transition-colors"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* Account — hidden on small mobile */}
            <Link
              href="/admin-login"
              className="hidden sm:flex p-2 text-neutral-700 hover:text-amber-800 transition-colors"
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-neutral-900 hover:text-amber-800 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-800 text-white text-[9px] font-bold w-[14px] h-[14px] rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-6 py-6 space-y-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-[11px] tracking-[0.18em] font-medium uppercase py-3.5 border-b border-gray-50 transition-colors
                  ${link.accent ? "text-amber-700" : "text-neutral-900 hover:text-amber-800"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track-order"
              className="flex items-center gap-2.5 text-[10px] tracking-[0.16em] font-semibold uppercase text-amber-800 py-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Truck size={15} strokeWidth={1.5} />
              Track Your Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}