"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { Product } from "@/src/types/supabase";
import { ArrowLeft, ShoppingBag, Check, Heart, HelpCircle } from "lucide-react";

interface ProductDetailClientProps {
  product: Product;
}

// Production-ready dummy data for Khaadi-style recommended items
const SUGGESTED_PRODUCTS_MOCK = [
  { id: "rec-1", title: "FLORAL TALES EXPANDED KURTA", price: 4490, image: "/placeholder-product.jpg" },
  { id: "rec-2", title: "GEOMETRIC MONOCHROME VEST", price: 3990, image: "/placeholder-product.jpg" },
  { id: "rec-3", title: "TRADITIONAL BLOCK PRINT TOP", price: 5500, image: "/placeholder-product.jpg" },
  { id: "rec-4", title: "CLASSIC SHALWAR CHIKANKARI", price: 2990, image: "/placeholder-product.jpg" },
];

export default function ProductDetailClient({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "M");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  const isOutOfStock = product.stock <= 0;

  // Fallback images matching Khaadi's minimum 3-angle display standard
  const displayImages = product.images?.length > 0 
    ? product.images 
    : ["/placeholder-product.jpg", "/placeholder-product.jpg", "/placeholder-product.jpg"];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: displayImages[0],
      size: selectedSize as 'S' | 'M' | 'L' | 'XL',
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen text-black antialiasedSelection font-sans">
      
      {/* 1. TOP MINIMAL BREADCRUMB */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6">
        <Link href="/collections" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
          <ArrowLeft size={12} strokeWidth={2} /> Collections / Pret / Women
        </Link>
      </div>

      {/* 2. MAIN SPLIT KHAADI LAYOUT */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">
        
        {/* LEFT COLUMN: Khaadi-Style Long Vertical Image Stack (65% width on desktop) */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {displayImages.map((imgUrl, index) => (
              <div 
                key={index} 
                className={`relative aspect-[2/3] w-full bg-gray-50 overflow-hidden ${
                  index === 0 ? "sm:col-span-2 aspect-[3/4]" : "sm:col-span-1"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${product.title} view ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Sticky Information Panel (35% width on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 sm:space-y-8 lg:pl-4">
          
          {/* Title & Price Header */}
          <div className="space-y-2 border-b border-gray-100 pb-5">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-xl sm:text-2xl font-light tracking-wide uppercase text-gray-950 leading-tight">
                {product.title}
              </h1>
              <button className="text-gray-400 hover:text-black transition-colors pt-1">
                <Heart size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <p className="text-lg font-medium text-gray-950 mt-1">
              Rs. {product.price.toLocaleString("en-PK")}
            </p>
            <p className="text-[10px] text-gray-400 tracking-wider uppercase pt-1">
              Tax Included. Shipping calculated at checkout.
            </p>
          </div>

          {/* Size Selector Grid */}
          <div>
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-xs uppercase tracking-widest font-medium text-gray-900">
                Select Size: <span className="font-semibold">{selectedSize}</span>
              </span>
              <button className="text-xs text-gray-400 underline tracking-wider uppercase inline-flex items-center gap-1 hover:text-black">
                Size Guide <HelpCircle size={12} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[46px] h-11 px-3 text-xs tracking-wider uppercase border transition-all ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-transparent text-gray-800 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Action Counter */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-gray-900 mb-3">Quantity</label>
            <div className="flex items-center border border-gray-200 w-fit bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              >
                —
              </button>
              <span className="w-10 text-center font-medium text-xs">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Master Add To Bag CTA Button */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 text-xs tracking-widest uppercase font-medium border transition-all duration-300 ${
                added
                  ? "bg-emerald-700 border-emerald-700 text-white"
                  : isOutOfStock
                  ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black border-black text-white hover:bg-transparent hover:text-black"
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={14} /> Added To Bag
                </span>
              ) : isOutOfStock ? (
                "Sold Out"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingBag size={14} /> Add To Bag
                </span>
              )}
            </button>
          </div>

          {/* Product Deep Description Accordion */}
          <div className="border-t border-gray-100 pt-6 mt-4 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-gray-900">Product Details</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                {product.description || "Premium fabric designed tailored to match contemporary minimalist cuts, perfect for elevated daily wear."}
              </p>
            </div>
            <div className="text-[11px] space-y-1.5 text-gray-500 pt-2 border-t border-dashed border-gray-100">
              <p>• SKU: 2-{product.id?.slice(0, 5).toUpperCase() || "SKU-2026"}</p>
              <p>• Fabric: Premium Lawn / Cotton Blend</p>
              <p>• Care: Wash dark colors separately, do not bleach.</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. KHAADI-STYLE RECOMMENDATIONS (YOU MAY ALSO LIKE) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-24 pb-16 border-t border-gray-100 pt-16">
        <div className="mb-10 text-left">
          <h2 className="text-lg font-light tracking-widest uppercase text-gray-950">Complete The Look</h2>
          <p className="text-xs text-gray-400 mt-1">Handpicked pairings recommended just for you.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {SUGGESTED_PRODUCTS_MOCK.map((item) => (
            <div key={item.id} className="group flex flex-col bg-white overflow-hidden">
              <Link href={`/product/${item.id}`} className="block relative aspect-[2/3] w-full bg-gray-50 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </Link>
              
              <div className="pt-3 pb-1 text-left">
                <Link href={`/product/${item.id}`}>
                  <h3 className="text-[11px] font-normal tracking-wide text-gray-800 uppercase line-clamp-1 hover:text-black transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <span className="text-xs font-semibold text-gray-950 mt-1 block">
                  Rs. {item.price.toLocaleString("en-PK")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}