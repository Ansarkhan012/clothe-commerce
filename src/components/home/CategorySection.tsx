"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CategoryItem {
  name: string;
  slug: string;
  image_url: string | null;
}

export function CategorySection({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);
  const sync = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    setCanBack(node.scrollLeft > 2);
    setCanForward(node.scrollLeft + node.clientWidth < node.scrollWidth - 2);
  }, []);
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [sync, categories.length]);
  const move = (direction: number) =>
    rail.current?.scrollBy({
      left: direction * Math.max(240, rail.current.clientWidth * 0.72),
      behavior: "smooth",
    });
  if (!categories.length) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mb-9 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-accent">
            CURATED FOR YOU
          </p>
          <h2 className="mt-2 font-display text-3xl text-brand-green-dark sm:text-4xl">
            Shop by Category
          </h2>
        </div>
        <div className="flex gap-2" aria-label="Category carousel controls">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!canBack}
            aria-label="Previous categories"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white disabled:opacity-35"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={!canForward}
            aria-label="Next categories"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white disabled:opacity-35"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={rail}
        onScroll={sync}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 sm:gap-6"
      >
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/collections/${category.slug}`}
            className="group w-[42%] min-w-[42%] snap-start text-center sm:w-[28%] sm:min-w-[28%] lg:w-[16%] lg:min-w-[16%]"
          >
            <span className="relative mx-auto block aspect-square w-24 overflow-hidden rounded-full border border-brand-gold/35 bg-brand-cream-dark sm:w-full sm:max-w-36">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 96px, 144px"
                />
              ) : (
                <span
                  className="brand-pattern absolute inset-0 grid place-items-center border border-brand-gold/20 bg-brand-cream-dark text-2xl font-semibold text-brand-gold-dark"
                  aria-hidden="true"
                >
                  {category.name.trim().charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <span className="mt-3 block text-xs font-semibold tracking-wide text-brand-green-dark group-hover:text-accent">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
