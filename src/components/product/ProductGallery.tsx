"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const displayImages = images.length ? images : ["/images/home/hero-model.png"];
  const [selected, setSelected] = useState(0);

  return <section aria-label={`${title} image gallery`} className="min-w-0">
    <div className="relative aspect-[3/4] overflow-hidden bg-white">
      <Image
        key={displayImages[selected]}
        src={displayImages[selected]}
        alt={`${title}${displayImages.length > 1 ? ` — view ${selected + 1}` : ""}`}
        fill
        priority
        className="object-cover object-top motion-safe:animate-[fadeIn_.25s_ease-out]"
        sizes="(max-width: 1024px) 100vw, 58vw"
      />
    </div>
    {displayImages.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Product views">
      {displayImages.map((image, index) => <button
        key={`${image}-${index}`}
        type="button"
        onClick={() => setSelected(index)}
        aria-label={`Show ${title} view ${index + 1}`}
        aria-pressed={selected === index}
        className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden border-2 bg-white transition sm:w-20 ${selected === index ? "border-brand-gold-dark" : "border-transparent hover:border-brand-green/40"}`}
      >
        <Image src={image} alt="" fill className="object-cover object-top" sizes="80px" />
      </button>)}
    </div>}
  </section>;
}
