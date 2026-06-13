"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { Product } from "@/src/types/supabase";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";

export default function ProductDetailClient({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [mainImage, setMainImage] = useState(product.images?.[0] || "/placeholder-product.jpg");

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: mainImage,
      size: selectedSize as 'S' | 'M' | 'L' | 'XL',
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/collections" className="flex items-center gap-2 text-muted hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to Collections
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-bg border border-border overflow-hidden">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
              }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-20 h-24 border-2 overflow-hidden ${
                    mainImage === img ? "border-accent" : "border-border"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <span className="text-accent text-sm font-medium tracking-wider uppercase">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </span>
            <h1 className="font-display text-4xl font-bold text-primary mt-2">{product.title}</h1>
          </div>

          <p className="text-3xl font-bold text-primary">Rs. {product.price.toLocaleString()}</p>

          <p className="text-muted leading-relaxed">{product.description}</p>

          {/* Size Selector */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">Select Size</label>
            <div className="flex gap-3">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 text-sm font-medium border-2 transition-all ${
                    selectedSize === size
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-transparent text-primary hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">Quantity</label>
            <div className="flex items-center border border-border w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-bg transition-colors"
              >
                -
              </button>
              <span className="px-6 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-bg transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-3 py-4 text-sm font-semibold tracking-wider uppercase transition-all ${
              added
                ? "bg-success text-white"
                : isOutOfStock
                ? "bg-muted text-white cursor-not-allowed"
                : "bg-accent hover:bg-accent-dark text-white"
            }`}
          >
            {added ? (
              <>
                <Check size={18} /> Added to Cart
              </>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag size={18} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}