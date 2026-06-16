"use client";

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
    { href: "/sale", label: "Festive Sale" },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header  className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${
    ">
     
      <div className="bg-neutral-950 text-white text-[10px] tracking-[0.25em] text-center py-2.5 px-4 uppercase font-medium border-b border-neutral-900">
        Free Delivery Across Pakistan On Orders Above <span className="text-amber-400 font-semibold">Rs. 5,000</span>
      </div>

      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Hamburguer Menu Trigger */}
          <button
            type="button"
            className="lg:hidden p-2 text-neutral-900 hover:text-amber-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>

          {/* 2. LOGO: LUXURY EDITORIAL TYPOGRAPHY */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-light tracking-[0.2em] text-neutral-950 uppercase font-serif">
              Zaisha <span className="text-amber-700 font-sans font-normal lowercase tracking-normal">&</span> Fabrics
            </h1>
          </Link>

          {/* 3. DESKTOP NAVIGATION: MINIMAL ARCHITECTURE */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium tracking-widest text-neutral-800 hover:text-amber-800 uppercase transition-colors duration-300 relative group py-2"
              >
                {link.label}
                {/* Thin Amber Slide Underline */}
                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-amber-700 transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </div>

          {/* 4. UTILITY ACTIONS HEADER ROW */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            
            {/* Track Order CTA */}
            <Link 
              href="/track-order" 
              className="p-2 text-neutral-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1.5"
              title="Track Your Order"
            >
              <Truck size={18} strokeWidth={1.5} />
              <span className="text-[10px] tracking-widest uppercase font-medium hidden xl:inline-block">Track</span>
            </Link>
            
            {/* Search Trigger */}
            <button type="button" className="p-2 text-neutral-700 hover:text-amber-800 transition-colors">
              <Search size={18} strokeWidth={1.5} />
            </button>
            
            {/* User Account Access */}
            <Link 
              href="/admin-login" 
              className="p-2 text-neutral-700 hover:text-amber-800 transition-colors hidden sm:inline-block"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            {/* Shopping Cart Bag with Accent Badge */}
            <Link
              href="/cart"
              className="p-2 text-neutral-900 hover:text-amber-800 transition-colors relative inline-block"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-amber-800 text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </nav>

      {/* 5. MOBILE FULL OVERLAY FLYOUT DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 ease-in-out">
          <div className="px-6 py-8 space-y-4 bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm tracking-widest font-medium text-neutral-900 hover:text-amber-800 uppercase py-3 border-b border-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Inline Track Link Inside Mobile Menu */}
            <Link
              href="/track-order"
              className="flex items-center gap-2.5 text-sm tracking-widest font-medium text-amber-800 py-3 pt-4 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Truck size={16} strokeWidth={1.5} /> TRACK YOUR ORDER
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}