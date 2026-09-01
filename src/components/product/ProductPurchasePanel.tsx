"use client";

import Link from "next/link";
import { Check, Headphones, LockKeyhole, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";
import { businessConfig } from "@/src/config/business";
import { useCartStore } from "@/src/store/useCartStore";
import type { Product } from "@/src/types/supabase";

const formatPrice = (value: number) => `PKR ${Number(value).toLocaleString("en-PK")}`;

export function ProductPurchasePanel({ product }: { product: Product }) {
  const sizes = product.sizes ?? [];
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const outOfStock = product.stock <= 0;
  const validSale = product.sale_price !== null && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price);
  const currentPrice = validSale ? Number(product.sale_price) : Number(product.price);
  const discount = validSale ? Math.round((1 - Number(product.sale_price) / Number(product.price)) * 100) : null;

  function add() {
    if (outOfStock || !selectedSize) return;
    addToCart({ id: product.id, title: product.title, price: currentPrice,
      image: product.images?.[0] ?? "/images/home/hero-model.png",
      size: selectedSize as "S" | "M" | "L" | "XL", quantity, stock: product.stock });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return <section aria-label="Product purchasing information" className="min-w-0 lg:sticky lg:top-32">
    <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-brand-gold-dark">{product.category}</p>
    <h1 className="mt-3 font-display text-4xl font-normal leading-[1.08] text-brand-green-dark sm:text-5xl">{product.title}</h1>
    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
      <strong className="text-xl font-semibold text-brand-green-dark">{formatPrice(currentPrice)}</strong>
      {validSale && <span className="text-sm text-muted line-through">{formatPrice(Number(product.price))}</span>}
      {discount !== null && discount > 0 && <span className="border border-brand-gold/60 bg-brand-cream px-2 py-1 text-[10px] font-semibold text-brand-gold-dark">{discount}% OFF</span>}
    </div>
    <div className="mt-5 border-y border-border py-4 text-sm">
      <span className={`inline-flex items-center gap-2 font-medium ${outOfStock ? "text-error" : "text-brand-green"}`}><span className={`h-2 w-2 rounded-full ${outOfStock ? "bg-error" : "bg-brand-green"}`} />{outOfStock ? "Out of stock" : `${product.stock} available`}</span>
    </div>

    {sizes.length > 0 && <fieldset className="mt-7" disabled={outOfStock}>
      <legend className="text-xs font-semibold uppercase tracking-[.16em]">Select Size</legend>
      <div className="mt-3 flex flex-wrap gap-2">{sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`min-h-11 min-w-11 border px-3 text-xs font-medium uppercase transition ${selectedSize === size ? "border-brand-green-dark bg-brand-green-dark text-white" : "border-border bg-white hover:border-brand-gold-dark"}`}>{size}</button>)}</div>
    </fieldset>}

    <div className="mt-7">
      <p className="text-xs font-semibold uppercase tracking-[.16em]">Quantity</p>
      <div className="mt-3 inline-flex min-h-11 items-center border border-border bg-white">
        <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1 || outOfStock} aria-label="Decrease quantity" className="grid min-h-11 min-w-11 place-items-center disabled:opacity-35"><Minus size={15} /></button>
        <output aria-live="polite" className="min-w-11 text-center text-sm font-semibold">{quantity}</output>
        <button type="button" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} disabled={quantity >= product.stock || outOfStock} aria-label="Increase quantity" className="grid min-h-11 min-w-11 place-items-center disabled:opacity-35"><Plus size={15} /></button>
      </div>
    </div>

    <button type="button" onClick={add} disabled={outOfStock || !selectedSize} className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 border border-brand-green-dark bg-brand-green-dark px-5 text-xs font-semibold uppercase tracking-[.16em] text-white transition hover:bg-brand-green disabled:cursor-not-allowed disabled:border-border disabled:bg-brand-cream-dark disabled:text-muted">
      {added ? <><Check size={17} /> Added to Cart</> : outOfStock ? "Out of Stock" : <><ShoppingBag size={17} /> Add to Cart</>}
    </button>
    <p aria-live="polite" className="mt-2 min-h-5 text-center text-xs text-brand-green">{added ? `${quantity} item${quantity > 1 ? "s" : ""} added.` : ""}</p>

    <div className="mt-5 grid gap-3 border-y border-border py-5 text-xs text-brand-green-dark sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
      <span className="flex items-center gap-2"><LockKeyhole size={17} className="text-brand-gold-dark" /> Secure checkout</span>
      <span className="flex items-center gap-2"><Truck size={17} className="text-brand-gold-dark" /> Delivery across {businessConfig.country}</span>
      <span className="flex items-center gap-2"><Headphones size={17} className="text-brand-gold-dark" /> Customer support</span>
    </div>

    <div className="mt-3 divide-y divide-border border-b border-border">
      {product.description && <details className="group py-4"><summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[.14em]">Product Details <span className="float-right group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-7 text-muted">{product.description}</p></details>}
      <details className="group py-4"><summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[.14em]">Delivery Information <span className="float-right group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-7 text-muted">Delivery is available across {businessConfig.country}. Charges and the authoritative total are calculated at checkout. Delivery timing requires owner confirmation.</p></details>
      <details className="group py-4"><summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[.14em]">Return &amp; Exchange <span className="float-right group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-7 text-muted">Eligibility and timing are subject to the published policy and owner confirmation. <Link href="/return-exchange-policy" className="font-medium text-brand-green underline">Review the policy</Link> or contact support before returning an item.</p></details>
    </div>
  </section>;
}
