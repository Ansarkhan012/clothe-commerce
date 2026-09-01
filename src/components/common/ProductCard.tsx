"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";
import type { Product } from "@/src/types/supabase";

function formatPrice(value: number) { return `PKR ${Number(value).toLocaleString("en-PK")}`; }

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];
  const validSale = product.sale_price !== null && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price);
  const effectivePrice = validSale ? Number(product.sale_price) : Number(product.price);
  const outOfStock = product.stock <= 0;

  const add = () => {
    if (outOfStock || !primaryImage) return;
    addToCart({ id: product.id, title: product.title, price: Number(effectivePrice), image: primaryImage, size: selectedSize as "S" | "M" | "L" | "XL", quantity: 1, stock: product.stock });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return <article className="group flex min-w-0 flex-col bg-white text-brand-charcoal">
    <Link href={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-brand-cream-dark">
      {primaryImage && !imageFailed ? <>
        <Image src={primaryImage} alt={product.title} fill className={`object-cover transition duration-700 ${secondaryImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"}`} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" onError={() => setImageFailed(true)} />
        {secondaryImage && <Image src={secondaryImage} alt="" fill className="object-cover opacity-0 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />}
      </> : <span className="absolute inset-0 grid place-items-center"><ShoppingBag className="text-brand-green/35" /></span>}
      {validSale && <span className="absolute left-2 top-2 bg-brand-green-dark px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] text-white">SALE</span>}
      {outOfStock && <span className="absolute inset-x-0 bottom-0 bg-brand-charcoal/85 py-2 text-center text-[10px] font-semibold tracking-[0.18em] text-white">SOLD OUT</span>}
    </Link>
    <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
      <p className="text-[9px] uppercase tracking-[0.18em] text-accent">{product.category}</p>
      <Link href={`/product/${product.id}`} className="mt-1.5 line-clamp-2 min-h-10 text-xs font-normal leading-5 transition hover:text-accent sm:text-sm">{product.title}</Link>
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs"><strong className="font-semibold text-brand-green-dark">{formatPrice(Number(effectivePrice))}</strong>{validSale && <span className="text-[11px] text-muted line-through">{formatPrice(Number(product.price))}</span>}</div>
      {product.sizes?.length > 0 && !outOfStock && <div className="mt-3.5 flex flex-wrap gap-1.5 sm:gap-2" aria-label="Choose size">{product.sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`grid h-9 min-w-9 place-items-center border px-1.5 text-[10px] transition ${selectedSize === size ? "border-brand-green-dark bg-brand-green-dark text-white" : "border-border bg-white hover:border-brand-gold-dark"}`}>{size}</button>)}</div>}
      <button type="button" onClick={add} disabled={outOfStock || !primaryImage} className="mt-4 w-full border border-brand-green-dark bg-brand-green-dark px-3 py-2.5 text-[10px] font-semibold tracking-[0.14em] text-white transition hover:bg-brand-green disabled:cursor-not-allowed disabled:border-border disabled:bg-brand-cream-dark disabled:text-muted">{outOfStock ? "Sold Out" : added ? "Added to Cart" : "Add to Cart"}</button>
    </div>
  </article>;
}
