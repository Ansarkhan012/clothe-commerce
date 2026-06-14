"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/src/store/useCartStore";
import { useState } from "react";
import { Product } from "@/src/types/supabase";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  // Default first size select karein, warna fallback "M"
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || "M"
  );
  const [imgError, setImgError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const primaryImage = product.images?.[0] || "/placeholder-product.jpg";
  const secondaryImage = product.images?.[1] || primaryImage;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: primaryImage,
      size: selectedSize as "S" | "M" | "L" | "XL",
      quantity: 1,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div className="group relative bg-white flex flex-col justify-between overflow-hidden transition-all duration-300">
      
      {/* 1. PRODUCT IMAGE CONTAINER */}
      <Link href={`/product/${product.id}`} className="block relative w-full aspect-[3/4] overflow-hidden bg-gray-50">
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
            <ShoppingBag size={24} strokeWidth={1.5} />
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Primary Image */}
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              priority
              className={`object-cover transition-transform duration-700 ease-out ${
                product.images?.length > 1 ? "group-hover:opacity-0" : ""
              }`}
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />

            {/* Hover Secondary Image */}
            {product.images?.length > 1 && (
              <Image
                src={secondaryImage}
                alt={`${product.title} Alternate`}
                fill
                className="object-cover absolute top-0 left-0 opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              />
            )}
          </div>
        )}

        {/* Minimal Sold Out Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[10px] tracking-widest font-medium px-2.5 py-1 uppercase">
            Sold Out
          </div>
        )}
      </Link>

      {/* 2. PRODUCT DETAILS & CONTENT */}
      <div className="pt-3 pb-2 px-1 flex flex-col flex-grow">
        
        {/* Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-normal text-gray-800 tracking-tight line-clamp-1 hover:text-black transition-colors uppercase">
            {product.title}
          </h3>
        </Link>

        {/* Minimal Price (Rs. format formatted for PK) */}
        <div className="mt-1 px-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            Rs.{product.price.toLocaleString("en-PK")}
          </span>
        </div>

        {/* 3. CLEAN & MINIMAL INLINE SIZES */}
        {product.sizes?.length > 0 && !isOutOfStock && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`w-7 h-7 flex items-center justify-center text-[11px] font-medium border rounded-full transition-all ${
                  selectedSize === size
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* 4. PREMIUM QUICK ADD TO BAG BUTTON */}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 text-xs tracking-widest uppercase font-medium border transition-all duration-300 ${
              isOutOfStock
                ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
                : addedToCart
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-transparent border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            {isOutOfStock ? "Sold Out" : addedToCart ? "Added To Bag" : "Add To Bag"}
          </button>
        </div>

      </div>
    </div>
  );
}