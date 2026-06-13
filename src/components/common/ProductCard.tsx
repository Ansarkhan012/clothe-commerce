"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye, Star, Truck } from "lucide-react";
import { useCartStore } from "@/src/store/useCartStore";
import { useState } from "react";
import { Product } from "@/src/types/supabase";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "M");
  const [imgError, setImgError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const imageUrl = product.images?.[0] || "/placeholder-product.jpg";
  const isOutOfStock = product.stock <= 0;
  const hasLowStock = product.stock > 0 && product.stock <= 3;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: imageUrl,
      size: selectedSize as 'S' | 'M' | 'L' | 'XL',
      quantity: 1,
    });

    // Show "Added" feedback
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-[#e8e2da] hover:shadow-lg hover:border-[#c9a96e] transition-all duration-300">
      
      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f0ea]">
          {imgError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto text-[#c9a96e] mb-2" size={32} />
                <span className="text-[#6b6560] text-sm"> tasweer dikh nahi rahi </span>
              </div>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          )}
          
          {/* Badges - Urdu/English mix */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <span className="bg-[#1a1a1a] text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wide">
                STOCK KHATAM
              </span>
            ) : hasLowStock ? (
              <span className="bg-[#d4453a] text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wide">
                SIRF {product.stock} BACHI HAIN
              </span>
            ) : (
              <span className="bg-[#3a7a3a] text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wide">
                MAUJOOD HAI
              </span>
            )}
          </div>

          {/* Quick Add Button - Appears on Hover */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className={`w-full py-2.5 text-xs font-bold tracking-wider uppercase rounded-sm flex items-center justify-center gap-2 transition-all ${
                  addedToCart 
                    ? "bg-[#3a7a3a] text-white" 
                    : "bg-[#c9a96e] text-white hover:bg-[#a8883f]"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Star size={14} fill="white" /> SHOPPING BAG MEIN DAL GAYA
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} /> BAG MEIN DALO
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        
        {/* Title - Clickable */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-display text-base sm:text-lg font-semibold text-[#1a1a1a] leading-snug mb-1 hover:text-[#c9a96e] transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-[#6b6560] mb-2 line-clamp-1">
          {product.description || "Premium Pakistani Fashion"}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-[#1a1a1a]">
            Rs. {product.price.toLocaleString('ur-PK')}
          </span>
          {product.stock > 0 && (
            <span className="text-[10px] text-[#6b6560]">
              (Free Delivery Rs. 5000+)
            </span>
          )}
        </div>

        {/* Size Selector */}
        {product.sizes && product.sizes.length > 0 && !isOutOfStock && (
          <div className="mb-3">
            <p className="text-[10px] text-[#6b6560] uppercase tracking-wider mb-1.5">
              Size Chuno:
            </p>
            <div className="flex gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`w-8 h-8 text-xs font-bold border-2 rounded-sm transition-all ${
                    selectedSize === size
                      ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                      : "bg-white text-[#1a1a1a] border-[#e8e2da] hover:border-[#c9a96e]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Main CTA - Big & Clear */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase rounded-sm flex items-center justify-center gap-1.5 transition-all ${
              isOutOfStock
                ? "bg-[#e8e2da] text-[#6b6560] cursor-not-allowed"
                : addedToCart
                ? "bg-[#3a7a3a] text-white"
                : "bg-[#1a1a1a] text-white hover:bg-[#c9a96e]"
            }`}
          >
            {isOutOfStock ? (
              "STOCK KHATAM"
            ) : addedToCart ? (
              <>
                <Star size={12} fill="white" /> DAL GAYA
              </>
            ) : (
              <>
                <ShoppingBag size={12} /> BAG MEIN DALO
              </>
            )}
          </button>

          {/* View Details */}
          <Link
            href={`/product/${product.id}`}
            className="px-3 py-2.5 border border-[#e8e2da] text-[#6b6560] hover:border-[#c9a96e] hover:text-[#c9a96e] rounded-sm transition-all"
            title="Mazeed Dekho"
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Trust Badge */}
        {!isOutOfStock && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#e8e2da]">
            <Truck size={12} className="text-[#3a7a3a]" />
            <span className="text-[10px] text-[#6b6560]">
              Karachi se 2-3 din mein delivery
            </span>
          </div>
        )}
      </div>
    </div>
  );
}