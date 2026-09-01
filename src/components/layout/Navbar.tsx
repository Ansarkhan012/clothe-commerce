"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  UserRound,
  Truck,
  CircleHelp,
} from "lucide-react";

import { useCartStore } from "@/src/store/useCartStore";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/collections", label: "Collections" },
  { href: "/collections?category=Unstitched", label: "Unstitched" },
  { href: "/sale", label: "Sale" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Image
        src="/images/qurzaib-mark.png"
        alt=""
        width={56}
        height={56}
        priority
        className={`shrink-0 object-contain ${
          compact ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12"
        }`}
      />

      <span className="min-w-0 leading-none">
        <span className="block truncate font-display text-[17px] tracking-[0.11em] text-brand-green-dark sm:text-[20px]">
          QURZAIB
        </span>

        <span className="mt-1 block truncate text-[8px] tracking-[0.28em] text-accent sm:text-[9px]">
          FABRICS
        </span>
      </span>

      <span className="sr-only">QurZaib Fabrics</span>
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  const cart = useCartStore((state) => state.cart);

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-brand-cream/95 backdrop-blur-md">
      {/* Announcement Bar */}
      <div className="bg-brand-green-dark text-white">
        <div className="mx-auto flex min-h-8 max-w-[1440px] items-center justify-center px-3 py-1.5 text-center text-[9px] tracking-wide sm:justify-between sm:px-6 sm:text-[10px] lg:px-10">
          <span className="flex min-w-0 items-center justify-center gap-1.5">
            <Truck
              size={12}
              className="shrink-0"
              aria-hidden="true"
            />

            <span className="truncate">
              Free Delivery on orders above PKR 5,000
            </span>
          </span>

          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/track-order"
              className="transition hover:text-brand-gold"
            >
              Track Order
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-1 transition hover:text-brand-gold"
            >
              <CircleHelp size={12} aria-hidden="true" />
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between gap-2 px-3 sm:h-[74px] sm:px-6 lg:px-10"
      >
        {/* Mobile Menu */}
        <div className="flex min-w-[40px] items-center lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-md text-brand-green-dark transition hover:bg-brand-green-dark/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Brand */}
        <Link
          href="/"
          aria-label="QurZaib Fabrics home"
          className="min-w-0 shrink"
        >
          <BrandLockup />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap border-b border-transparent py-2 text-[11px] font-medium tracking-wide text-brand-charcoal transition hover:border-brand-gold-dark hover:text-brand-green"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center text-brand-green-dark">
          <Link
            href="/collections#catalog-search"
            aria-label="Search products"
            className="hidden h-10 w-10 place-items-center rounded-md transition hover:bg-brand-green-dark/5 hover:text-accent sm:grid"
          >
            <Search size={19} />
          </Link>

          <Link
            href="/admin-login"
            aria-label="Account"
            className="hidden h-10 w-10 place-items-center rounded-md transition hover:bg-brand-green-dark/5 hover:text-accent sm:grid"
          >
            <UserRound size={19} />
          </Link>

          <Link
            href="/cart"
            aria-label={`Shopping cart with ${cartCount} items`}
            className="relative grid h-10 w-10 place-items-center rounded-md transition hover:bg-brand-green-dark/5 hover:text-accent"
          >
            <ShoppingBag size={21} />

            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-brand-gold-dark px-1 text-[9px] font-bold leading-none text-white">
                {Math.min(cartCount, 99)}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-[1px]"
          />

          {/* Drawer */}
          <aside
            id="mobile-navigation"
            className="absolute left-0 top-0 flex h-full w-[min(86vw,340px)] max-w-full flex-col overflow-hidden bg-brand-cream shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex min-h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border px-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="min-w-0"
              >
                <BrandLockup compact />
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-brand-green-dark transition hover:bg-brand-green-dark/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Menu */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="px-4 py-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[48px] items-center border-b border-border/80 py-3 text-[13px] font-medium tracking-wide text-brand-green-dark transition hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Quick Actions */}
              <div className="border-t border-border px-4 py-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gray">
                  Customer Care
                </p>

                <div className="space-y-1">
                  <Link
                    href="/track-order"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-md px-2 text-sm text-brand-green-dark transition hover:bg-brand-green-dark/5"
                  >
                    <Truck
                      size={18}
                      className="shrink-0 text-accent"
                    />
                    Track Order
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-md px-2 text-sm text-brand-green-dark transition hover:bg-brand-green-dark/5"
                  >
                    <CircleHelp
                      size={18}
                      className="shrink-0 text-accent"
                    />
                    Help & Support
                  </Link>

                  <Link
                    href="/collections#catalog-search"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-md px-2 text-sm text-brand-green-dark transition hover:bg-brand-green-dark/5"
                  >
                    <Search
                      size={18}
                      className="shrink-0 text-accent"
                    />
                    Search Products
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="shrink-0 border-t border-border px-5 py-4">
              <p className="text-[10px] leading-relaxed text-brand-gray">
                Elegance Woven With Faith
              </p>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </header>
  );
}
