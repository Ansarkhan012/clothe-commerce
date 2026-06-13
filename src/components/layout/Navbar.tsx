"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";
import { ShoppingBag, Menu, X, Search, User, Truck } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/collections", label: "Collections" },
    { href: "/sale", label: "Sale" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border">
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs text-center py-2 tracking-widest uppercase font-medium">
        ✨ Free Delivery on Orders Above Rs. 5,000 | Cash on Delivery Available
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-primary hover:text-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Zari <span className="text-accent">&</span> Taanka
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary hover:text-accent transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Track Order - NEW */}
            <Link 
              href="/track-order" 
              className="hidden sm:flex items-center gap-1.5 p-2 text-primary hover:text-accent transition-colors"
              title="Track Your Order"
            >
              <Truck size={18} />
              <span className="text-xs font-medium hidden xl:inline">Track Order</span>
            </Link>
            
            <button className="p-2 text-primary hover:text-accent transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            
            <Link 
              href="/admin-login" 
              className="p-2 text-primary hover:text-accent transition-colors hidden sm:block"
            >
              <User size={20} />
            </Link>

            <Link
              href="/cart"
              className="p-2 text-primary hover:text-accent transition-colors relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-border">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-lg font-display font-medium text-primary hover:text-accent transition-colors py-2 border-b border-border"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Track Order in Mobile Menu */}
            <Link
              href="/track-order"
              className="flex items-center gap-2 text-lg font-display font-medium text-accent py-2 border-b border-border"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Truck size={18} /> Track Your Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}